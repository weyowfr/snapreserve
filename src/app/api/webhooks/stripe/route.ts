import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendSellerReservationEmail, sendBuyerConfirmationEmail, sendBuyerMissedEmail } from '@/lib/email'
import { sendSellerSMS, sendBuyerConfirmationSMS, sendBuyerMissedSMS } from '@/lib/sms'
import { calculatePlatformFee } from '@/lib/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  // ─── ABONNEMENT : créé ou activé ─────────────────────────────────────────
  if (event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const status = subscription.status // 'active' | 'trialing' | 'past_due' | 'canceled' etc.
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

    await supabaseAdmin
      .from('sellers')
      .update({
        subscription_id: subscription.id,
        subscription_status: ['active', 'trialing'].includes(status) ? status : 'inactive',
        subscription_end: currentPeriodEnd,
      })
      .eq('stripe_customer_id', customerId)

    console.log(`📋 Abonnement ${status} pour customer ${customerId}`)
  }

  // ─── ABONNEMENT : supprimé/annulé ─────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await supabaseAdmin
      .from('sellers')
      .update({
        subscription_status: 'canceled',
        subscription_end: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)

    console.log(`❌ Abonnement annulé pour customer ${customerId}`)
  }

  // ─── PAIEMENT ACOMPTE : réussi ───────────────────────────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Ignorer les paiements liés aux abonnements (ils ont des invoice_id)
    if (paymentIntent.invoice) {
      return NextResponse.json({ received: true })
    }

    const { carId, buyerName, buyerPhone, buyerEmail } = paymentIntent.metadata

    try {
      const { data: car } = await supabaseAdmin
        .from('cars')
        .select('*, sellers(name, email, phone, subscription_status)')
        .eq('id', carId)
        .single()

      if (!car || car.status !== 'available') {
        await stripe.refunds.create({ payment_intent: paymentIntent.id })
        await Promise.allSettled([
          sendBuyerMissedEmail({ buyerEmail, buyerName, carTitle: car?.title || 'la voiture' }),
          sendBuyerMissedSMS({ buyerPhone, carTitle: car?.title || 'la voiture' }),
        ])
        return NextResponse.json({ message: 'Déjà réservée, remboursement initié' })
      }

      // Mise à jour atomique
      const { error: updateError } = await supabaseAdmin
        .from('cars')
        .update({ status: 'reserved' })
        .eq('id', carId)
        .eq('status', 'available')

      if (updateError) {
        await stripe.refunds.create({ payment_intent: paymentIntent.id })
        await Promise.allSettled([
          sendBuyerMissedEmail({ buyerEmail, buyerName, carTitle: car.title }),
          sendBuyerMissedSMS({ buyerPhone, carTitle: car.title }),
        ])
        return NextResponse.json({ message: 'Conflict, remboursé' })
      }

      // Calculer les frais de service (5%)
      const platformFee = calculatePlatformFee(car.deposit)

      // Confirmer la réservation avec les frais
      await supabaseAdmin
        .from('reservations')
        .update({ status: 'paid', platform_fee: platformFee })
        .eq('stripe_payment_id', paymentIntent.id)

      // Marquer les ratés
      const { data: failedReservations } = await supabaseAdmin
        .from('reservations')
        .update({ status: 'failed' })
        .eq('car_id', carId)
        .eq('status', 'pending')
        .neq('stripe_payment_id', paymentIntent.id)
        .select('buyer_name, buyer_phone, buyer_email')

      const seller = car.sellers

      // Notifications
      await Promise.allSettled([
        sendSellerReservationEmail({
          sellerEmail: seller.email,
          sellerName: seller.name,
          carTitle: car.title,
          carSlug: car.slug,
          buyerName,
          buyerPhone,
          depositAmount: car.deposit,
          platformFee,
        }),
        sendSellerSMS({
          sellerPhone: seller.phone || '',
          carTitle: car.title,
          buyerName,
          buyerPhone,
          depositAmount: car.deposit,
        }),
        sendBuyerConfirmationEmail({
          buyerEmail,
          buyerName,
          carTitle: car.title,
          carSlug: car.slug,
          depositAmount: car.deposit,
          sellerName: seller.name,
        }),
        sendBuyerConfirmationSMS({
          buyerPhone,
          carTitle: car.title,
          sellerName: seller.name,
          depositAmount: car.deposit,
        }),
      ])

      if (failedReservations?.length) {
        await Promise.allSettled(
          failedReservations.map((r: any) =>
            Promise.allSettled([
              sendBuyerMissedEmail({ buyerEmail: r.buyer_email, buyerName: r.buyer_name, carTitle: car.title }),
              sendBuyerMissedSMS({ buyerPhone: r.buyer_phone, carTitle: car.title }),
            ])
          )
        )
      }

      console.log(`✅ Voiture ${carId} réservée — frais plateforme: ${platformFee / 100}€`)
    } catch (err) {
      console.error('Webhook reservation error:', err)
    }
  }

  // ─── PAIEMENT ACOMPTE : échoué ───────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    if (!paymentIntent.invoice) {
      await supabaseAdmin
        .from('reservations')
        .update({ status: 'failed' })
        .eq('stripe_payment_id', paymentIntent.id)
    }
  }

  // ─── FACTURE ABONNEMENT : paiement échoué ────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    await supabaseAdmin
      .from('sellers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_customer_id', customerId)
    console.log(`⚠️ Paiement abonnement échoué pour ${customerId}`)
  }

  return NextResponse.json({ received: true })
}
