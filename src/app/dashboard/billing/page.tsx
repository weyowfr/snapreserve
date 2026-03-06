'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase'

function BillingContent() {
  const searchParams = useSearchParams()
  const justSubscribed = searchParams.get('success') === 'true'

  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('sellers')
        .select('name, email, subscription_status, subscription_end, stripe_customer_id')
        .eq('id', user.id).single()
      setSeller(data); setLoading(false)
    }
    load()
  }, [])

  const handlePortal = async () => {
    setPortalLoading(true)
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  const handleSubscribe = async () => {
    setSubscribeLoading(true)
    const res = await fetch('/api/create-checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setSubscribeLoading(false)
  }

  const isActive = seller?.subscription_status === 'active' || seller?.subscription_status === 'trialing'
  const isPastDue = seller?.subscription_status === 'past_due'

  const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    active:   { label: 'Actif',              color: 'var(--green)',  bg: 'var(--green-dim)',       border: 'rgba(34,197,94,0.2)' },
    trialing: { label: 'Période d\'essai',   color: '#60a5fa',       bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.2)' },
    past_due: { label: 'Paiement en retard', color: 'var(--amber)',  bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)' },
    canceled: { label: 'Annulé',             color: 'var(--text3)',  bg: 'var(--surface3)',        border: 'var(--border)' },
    inactive: { label: 'Inactif',            color: 'var(--text3)',  bg: 'var(--surface3)',        border: 'var(--border)' },
  }
  const st = statusMap[seller?.subscription_status || 'inactive'] || statusMap.inactive

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" />
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: '520px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Compte</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>Facturation</h1>
      </div>

      {justSubscribed && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '24px' }}>🎉</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)', marginBottom: '2px' }}>Abonnement activé !</p>
            <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Bienvenue sur SnapReserve Pro. Tu peux publier des voitures.</p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>SnapReserve Pro</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.color, display: 'inline-block', animation: isActive ? 'pulse-brand 2s infinite' : 'none' }} />
            {st.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 800, lineHeight: 1 }}>19<span style={{ color: 'var(--brand)' }}>,99€</span></p>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>par mois · sans engagement</p>
          </div>
          {seller?.subscription_end && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '3px' }}>
                {isActive ? 'Renouvellement' : 'Fin le'}
              </p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>
                {new Date(seller.subscription_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Frais de service par acompte</p>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand)' }}>5%</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '5px' }}>Acompte 500 € → tu reçois 475 €</p>
        </div>

        {isActive || isPastDue ? (
          <button onClick={handlePortal} disabled={portalLoading} className="btn-primary">
            {portalLoading ? <><span className="spinner" />Chargement...</> : isPastDue ? '⚠️ Mettre à jour le paiement' : 'Gérer mon abonnement'}
          </button>
        ) : (
          <button onClick={handleSubscribe} disabled={subscribeLoading} className="btn-primary">
            {subscribeLoading ? <><span className="spinner" />Redirection...</> : '🚀 S\'abonner pour 19,99€/mois'}
          </button>
        )}
      </div>

      {isPastDue && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '4px' }}>⚠️ Paiement en retard</p>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>Le renouvellement a échoué. Mets à jour ta carte pour éviter la suspension.</p>
        </div>
      )}

      {!isActive && !isPastDue && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px' }}>Pas d'abonnement actif</p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px', lineHeight: 1.6 }}>Tes annonces restent conservées. Abonne-toi pour recevoir de nouvelles réservations.</p>
          <Link href="/pricing" style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Voir les tarifs →</Link>
        </div>
      )}

      {isActive && (
        <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '16px' }}>
          Géré de façon sécurisée par Stripe · Annulation à tout moment
        </p>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <span className="spinner" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
