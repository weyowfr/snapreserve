'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const FEATURES = [
  'Voitures illimitées à publier',
  'Lien unique partageable par voiture',
  'Paiement Stripe sécurisé intégré',
  'Notifications email + SMS automatiques',
  'Statut en temps réel pour les acheteurs',
  'Support prioritaire',
]

function BillingContent() {
  const searchParams = useSearchParams()
  const justSubscribed = searchParams.get('success') === 'true'
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data } = await sb.from('sellers').select('name, email, subscription_status, subscription_end, stripe_customer_id').eq('id', user.id).single()
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

  const STATUS: Record<string, { label: string; badgeClass: string }> = {
    active:   { label: 'Actif',              badgeClass: 'badge-active' },
    trialing: { label: "Période d'essai",    badgeClass: 'badge-pro' },
    past_due: { label: 'Paiement en retard', badgeClass: 'badge-amber' },
    canceled: { label: 'Annulé',             badgeClass: 'badge-inactive' },
    inactive: { label: 'Inactif',            badgeClass: 'badge-inactive' },
  }
  const st = STATUS[seller?.subscription_status || 'inactive'] || STATUS.inactive

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Compte</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Facturation</h1>
      </div>

      {/* Success banner */}
      {justSubscribed && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>🎉</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>Abonnement activé !</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Bienvenue sur SnapReserve Pro — tu peux publier des voitures.</p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
        {/* Top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--brand), var(--brand2))' }} />

        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(249,115,22,0.03) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 6 }}>SnapReserve Pro</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>19</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--brand)', marginBottom: 4 }}>,99€</span>
                <span style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6, marginLeft: 4 }}>/mois</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Sans engagement · Annulation à tout moment</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${st.badgeClass}`}>
                <span className="badge-dot" style={{ animation: isActive ? 'pulse-dot 2s infinite' : 'none' }} />
                {st.label}
              </span>
              {seller?.subscription_end && (
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                  {isActive ? 'Renouvellement le' : 'Fin le'}<br />
                  <strong style={{ color: 'var(--text2)' }}>{new Date(seller.subscription_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Fee info */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Frais de service par acompte</p>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--brand)' }}>5%</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Exemple : acompte 500 € → tu reçois 475 €</p>
        </div>

        {/* Features */}
        <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
              <div style={{ width: 20, height: 20, background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" fill="none" stroke="var(--green)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '20px 28px' }}>
          {isPastDue && (
            <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 11, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>⚠️ Paiement en retard</p>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Mets à jour ta carte pour éviter la suspension de ton compte.</p>
            </div>
          )}

          {isActive || isPastDue ? (
            <button onClick={handlePortal} disabled={portalLoading} className="btn btn-primary btn-lg">
              {portalLoading ? <><span className="spinner" />Chargement...</> : isPastDue ? '⚠️ Mettre à jour le paiement' : 'Gérer mon abonnement'}
            </button>
          ) : (
            <button onClick={handleSubscribe} disabled={subscribeLoading} className="btn btn-primary btn-lg">
              {subscribeLoading ? <><span className="spinner" />Redirection...</> : "🚀 S'abonner pour 19,99 €/mois"}
            </button>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>

      {!isActive && !isPastDue && (
        <div className="card-sm" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            Tes annonces existantes sont conservées. Abonne-toi pour recevoir de nouvelles réservations.
          </p>
          <Link href="/pricing" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>Voir les détails →</Link>
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><span className="spinner" style={{ width: 24, height: 24 }} /></div>}>
      <BillingContent />
    </Suspense>
  )
}
