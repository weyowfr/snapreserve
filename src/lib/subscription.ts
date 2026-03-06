import { createClient } from '@supabase/supabase-js'

const SERVICE_FEE_PERCENT = 0.05 // 5%
const SUBSCRIPTION_PRICE_CENTS = 1999 // 19,99€

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Vérifie si un vendeur a un abonnement actif
 */
export async function isSubscriptionActive(sellerId: string): Promise<boolean> {
  const { data: seller } = await supabaseAdmin
    .from('sellers')
    .select('subscription_status, subscription_end')
    .eq('id', sellerId)
    .single()

  if (!seller) return false

  const active = seller.subscription_status === 'active' || seller.subscription_status === 'trialing'
  if (!active) return false

  // Vérifier que l'abonnement n'a pas expiré
  if (seller.subscription_end) {
    return new Date(seller.subscription_end) > new Date()
  }

  return true
}

/**
 * Calcule le montant des frais de service (5% de l'acompte)
 * Minimum 50 centimes pour que Stripe accepte
 */
export function calculatePlatformFee(depositCents: number): number {
  const fee = Math.round(depositCents * SERVICE_FEE_PERCENT)
  return Math.max(fee, 50) // minimum 50 centimes
}

export { SERVICE_FEE_PERCENT, SUBSCRIPTION_PRICE_CENTS }
