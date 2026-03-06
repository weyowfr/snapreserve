import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(34,197,94,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '360px', width: '100%' }} className="page-enter">
        <div style={{ width: '72px', height: '72px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="32" height="32" fill="none" stroke="var(--green)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 800, letterSpacing: '-1px', color: 'var(--green)', marginBottom: '12px' }}>Réservée !</h1>
        <p style={{ fontSize: '16px', color: 'var(--text2)', marginBottom: '6px' }}>Tu as réservé cette voiture en premier 🎉</p>
        <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '32px', lineHeight: 1.7 }}>Ton acompte a bien été encaissé. Le vendeur va te contacter très rapidement pour finaliser la vente.</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
          {['✅ Paiement sécurisé via Stripe', '📱 Le vendeur a tes coordonnées', '🔒 La voiture est bloquée pour toi'].map((t, i) => (
            <p key={i} style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: i < 2 ? '10px' : 0 }}>{t}</p>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>Retour à l'accueil</Link>
      </div>
    </main>
  )
}
