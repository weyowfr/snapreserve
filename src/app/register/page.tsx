'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum.'); setLoading(false); return }
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('sellers').insert({ id: data.user.id, email, name })
      router.push('/dashboard'); router.refresh()
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(249,115,22,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }} className="page-enter">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
            Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
          </Link>
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>Crée ton compte vendeur</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="form-label">Prénom / Pseudo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Mohamed" required className="form-input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required className="form-input" />
            </div>
            <div>
              <label className="form-label">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" required className="form-input" />
            </div>
            {error && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--red)' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '4px' }}>
              {loading ? <><span className="spinner" />Création...</> : 'Créer mon compte'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', marginTop: '20px' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
