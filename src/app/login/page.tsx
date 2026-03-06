'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }} className="page-enter">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, textDecoration: 'none', color: 'var(--text)', letterSpacing: '-0.03em', display: 'inline-block' }}>
            Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
          </Link>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text2)' }}>Connecte-toi à ton espace vendeur</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="field">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required className="form-input" autoComplete="email" />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="form-label" style={{ margin: 0 }}>Mot de passe</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>Mot de passe oublié ?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="form-input" autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4, display: 'flex' }}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--red)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Créer un compte vendeur</Link>
            </p>
          </div>
        </div>

        {/* Trust */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['🔒 SSL sécurisé', '⚡ Stripe', '🇫🇷 Données FR'].map((t, i) => (
            <span key={i} style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>{t}</span>
          ))}
        </div>
      </div>
    </main>
  )
}
