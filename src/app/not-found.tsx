import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 40% at 50% 30%, rgba(249,115,22,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }} className="page-enter">
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '120px', fontWeight: 800, lineHeight: 1, letterSpacing: '-4px', color: 'var(--brand)', opacity: 0.3, marginBottom: '-16px' }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>Page introuvable</h1>
        <p style={{ fontSize: '15px', color: 'var(--text2)', marginBottom: '32px', maxWidth: '320px' }}>Cette voiture n'existe pas ou le lien est invalide.</p>
        <Link href="/" className="btn-primary" style={{ width: 'auto', padding: '12px 28px', display: 'inline-flex' }}>
          Retour à l'accueil
        </Link>
      </div>
    </main>
  )
}
