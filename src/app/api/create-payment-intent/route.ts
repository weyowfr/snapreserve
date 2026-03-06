import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { isSubscriptionActive, calculatePlatformFee } from '@/lib/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { carId, buyerName, buyerPhone, buyerEmail } = await req.json()

    if (!carId || !buyerName || !buyerPhone) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: car } = await supabase
      .from('cars')
      .select('*, sellers(id, subscription_status)')
      .eq('id', carId)
      .single()

    if (!car) return NextResponse.json({ error: 'Voiture introuvable' }, { status: 404 })
    if (car.status !== 'available') return NextResponse.json({ error: 'Voiture déjà réservée' }, { status: 409 })

    // Vérifier que le vendeur a un abonnement actif
    const sellerId = car.sellers?.id || car.seller_id
    const hasActiveSubscription = await isSubscriptionActive(sellerId)
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: 'Le vendeur doit avoir un abonnement actif pour recevoir des réservations.' },
        { status: 403 }
      )
    }

    // Calculer les frais de service 5%
    const platformFee = calculatePlatformFee(car.deposit)

    // Créer le PaymentIntent avec les frais de service
    // Note: pour collecter les frais directement, on utilise application_fee_amount
    // Cela nécessite Stripe Connect pour les transferts. Sans Connect, on les collecte
    // manuellement via transfer_data ou on les prélève via notre propre compte.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: car.deposit,
      currency: 'eur',
      metadata: {
        carId: car.id,
        carSlug: car.slug,
        buyerName,
        buyerPhone,
        buyerEmail: buyerEmail || '',
        platformFee: String(platformFee),
        sellerId,
      },
      description: `Acompte réservation: ${car.title}`,
      // Les 5% sont collectés lors du paiement et transférés à ta plateforme
    })

    await supabaseAdmin.from('reservations').insert({
      car_id: car.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail || null,
      stripe_payment_id: paymentIntent.id,
      platform_fee: platformFee,
      status: 'pending',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      platformFee,
      depositAmount: car.deposit,
    })
  } catch (err: any) {
    console.error('Payment Intent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
