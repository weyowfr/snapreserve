'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const FEATURES = [
  { text: 'Voitures illimitées à publier' },
  { text: 'Page publique avec lien unique par voiture' },
  { text: 'Paiement Stripe sécurisé intégré' },
  { text: 'Notifications email + SMS automatiques' },
  { text: 'Statut en temps réel pour les acheteurs' },
  { text: 'Preview optimisée pour Snapchat' },
]

const FAQ = [
  { q: 'Comment fonctionnent les 5% de frais ?', a: 'Sur chaque acompte encaissé, 5% reviennent à SnapReserve. Le détail est visible dans chaque email de confirmation. Exemple : acompte 500 € → tu reçois 475 €.' },
  { q: 'Puis-je annuler quand je veux ?', a: 'Oui, depuis Dashboard → Facturation → Gérer mon abonnement. L\'accès reste actif jusqu\'à la fin de la période payée.' },
  { q: 'Que se passe-t-il sans abonnement ?', a: 'Tu ne peux plus publier de nouvelles voitures. Les annonces existantes restent visibles mais les acheteurs ne peuvent pas réserver.' },
]

// Isolated component that uses useSearchParams (requires Suspense)
function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const subscribe = async () => {
    if (!user) { router.push('/register?redirect=/pricing'); return }
    setLoading(true)
    const res = await fetch('/api/create-checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)' }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </Link>
        {user
          ? <Link href="/dashboard" className="btn-ghost" style={{ width: 'auto', padding: '8px 14px', fontSize: '13px' }}>Dashboard →</Link>
          : <Link href="/login" className="btn-ghost" style={{ width: 'auto', padding: '8px 14px', fontSize: '13px' }}>Connexion</Link>
        }
      </nav>

      <div style={{ position: 'relative', zIndex: 5, maxWidth: '480px', margin: '0 auto', padding: '60px 24px 80px' }}>
        {canceled && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--text2)', marginBottom: '28px', textAlign: 'center' }}>
            Paiement annulé — pas de souci, tu peux réessayer.
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Tarification</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, marginBottom: '10px' }}>
            Un seul<br /><span style={{ color: 'var(--brand)' }}>forfait</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text2)' }}>Simple, transparent, sans surprise.</p>
        </div>

        {/* Pricing card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', position: 'relative' }}>
          {/* Top accent */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--brand), var(--brand2), var(--brand))' }} />

          {/* Price section */}
          <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--brand)' }} />
              <span className="section-label" style={{ letterSpacing: '2px', fontSize: '10px' }}>SnapReserve Pro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text2)', marginTop: '10px' }}>€</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '72px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px' }}>19</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--brand)', marginTop: '14px' }}>,99</span>
              <span style={{ fontSize: '13px', color: 'var(--text3)', alignSelf: 'flex-end', marginBottom: '6px', marginLeft: '4px' }}>/mois</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Sans engagement · Annulation à tout moment</p>
          </div>

          {/* Features */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0' }}>
                <div style={{ width: '20px', height: '20px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--green)', flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: '14px', color: 'var(--text2)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Fee info */}
          <div style={{ margin: '20px 32px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>+ 5% de frais de service</strong> par acompte encaissé.
              Pour un acompte de 500 €, tu reçois <strong style={{ color: 'var(--green)' }}>475 €</strong>.
            </p>
          </div>

          {/* CTA */}
          <div style={{ padding: '4px 32px 28px' }}>
            <button onClick={subscribe} disabled={loading} className="btn-primary" style={{ fontSize: '15px', padding: '14px' }}>
              {loading
                ? <><span className="spinner" />Redirection...</>
                : <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>{user ? 'Commencer pour 19,99€/mois' : 'Créer un compte et s\'abonner'}</>
              }
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Paiement sécurisé par Stripe · Annulation à tout moment
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '14px' }}>Questions fréquentes</p>
          {FAQ.map((f, i) => (
            <details key={i} style={{ border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '8px', overflow: 'hidden' }}>
              <summary style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none', userSelect: 'none' }}>
                {f.q}
                <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <p style={{ padding: '0 18px 14px', fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  )
}

// Suspense boundary required by Next.js for useSearchParams()
export default function PricingPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </main>
    }>
      <PricingContent />
    </Suspense>
  )
}
