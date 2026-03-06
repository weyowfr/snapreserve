import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Récupérer ou créer le customer Stripe
    const { data: seller } = await supabaseAdmin
      .from('sellers')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single()

    let customerId = seller?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: seller?.email || user.email!,
        name: seller?.name || '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabaseAdmin
        .from('sellers')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    // Créer la session Checkout Stripe pour l'abonnement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SnapReserve Pro',
              description: 'Abonnement mensuel — Publiez autant de voitures que vous voulez + 5% de frais par acompte',
              images: [],
            },
            unit_amount: 1999, // 19,99€
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      success_url: `${appUrl}/dashboard/billing?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      locale: 'fr',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
