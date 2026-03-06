'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const FEATURES = [
  { icon: '🚗', text: 'Voitures illimitées à publier' },
  { icon: '🔗', text: 'Page publique partageable par voiture' },
  { icon: '💳', text: 'Paiement Stripe sécurisé intégré' },
  { icon: '📱', text: 'Notifications email + SMS automatiques' },
  { icon: '⚡', text: 'Statut en temps réel pour les acheteurs' },
  { icon: '👻', text: 'Optimisé pour Snapchat & réseaux sociaux' },
  { icon: '📊', text: 'Dashboard complet avec analytics' },
  { icon: '🔒', text: 'IBAN chiffré pour virements directs' },
]

const FAQ = [
  { q: 'Comment fonctionnent les 5% de frais ?', a: 'Sur chaque acompte encaissé, 5% reviennent à SnapReserve pour couvrir les frais Stripe et l\'infrastructure. Pour un acompte de 500 €, tu reçois 475 €. Détail visible dans chaque email de confirmation.' },
  { q: 'Puis-je annuler à tout moment ?', a: 'Oui, depuis Dashboard → Facturation → Gérer mon abonnement. Géré par Stripe. L\'accès reste actif jusqu\'à la fin de la période payée.' },
  { q: 'Que se passe-t-il si je n\'ai pas d\'abonnement ?', a: 'Tu ne peux plus publier de nouvelles voitures. Les annonces existantes restent visibles mais les acheteurs ne peuvent plus réserver.' },
  { q: 'Les acheteurs ont-ils besoin d\'un compte ?', a: 'Non. Ils accèdent directement à la page de ta voiture via ton lien, renseignent leurs coordonnées et paient l\'acompte. Simple et rapide.' },
]

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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(249,115,22,0.08) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 60, borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, textDecoration: 'none', color: 'var(--text)', letterSpacing: '-0.03em' }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </Link>
        {user
          ? <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ width: 'auto' }}>Dashboard →</Link>
          : <Link href="/login" className="btn btn-ghost btn-sm" style={{ width: 'auto' }}>Connexion</Link>
        }
      </nav>

      <div style={{ position: 'relative', zIndex: 5, maxWidth: 500, margin: '0 auto', padding: '60px 24px 80px' }}>
        {canceled && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: 'var(--text2)', marginBottom: 28, textAlign: 'center' }}>
            Paiement annulé — pas de souci, tu peux réessayer quand tu veux.
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p className="eyebrow" style={{ marginBottom: 14 }}>Tarification</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,8vw,60px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 14 }}>
            Un seul<br /><span style={{ color: 'var(--brand)' }}>forfait.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6 }}>Simple, transparent, sans surprise.</p>
        </div>

        {/* Pricing card */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--brand), var(--brand2), var(--brand))' }} />

          {/* Price */}
          <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text2)', marginTop: 10 }}>€</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>19</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--brand)', marginTop: 14 }}>,99</span>
              <span style={{ fontSize: 13, color: 'var(--text3)', alignSelf: 'flex-end', marginBottom: 6, marginLeft: 4 }}>/mois</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Sans engagement · Annulation à tout moment</p>
          </div>

          {/* Features */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <div style={{ width: 22, height: 22, background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee info */}
          <div style={{ margin: '18px 28px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>+ 5% de frais de service</strong> par acompte encaissé.
              Acompte 500 € → tu reçois <strong style={{ color: 'var(--green)' }}>475 €</strong>.
            </p>
          </div>

          {/* CTA */}
          <div style={{ padding: '0 28px 26px' }}>
            <button onClick={subscribe} disabled={loading} className="btn btn-primary btn-lg">
              {loading
                ? <><span className="spinner" />Redirection...</>
                : <>{user ? 'Commencer pour 19,99 €/mois' : "Créer un compte et s'abonner"} →</>
              }
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Paiement sécurisé par Stripe
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>Questions fréquentes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ.map((f, i) => (
              <details key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, overflow: 'hidden' }}>
                <summary style={{ padding: '14px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', listStyle: 'none', gap: 12 }}>
                  <span>{f.q}</span>
                  <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p style={{ padding: '0 18px 16px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 24, height: 24 }} /></main>}>
      <PricingContent />
    </Suspense>
  )
}
