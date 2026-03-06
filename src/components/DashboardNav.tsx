'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV = [
  {
    href: '/dashboard',
    label: 'Accueil',
    exact: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  },
  {
    href: '/dashboard/reservations',
    label: 'Réservations',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  },
  {
    href: '/dashboard/add',
    label: 'Publier',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>,
    isCta: true,
  },
  {
    href: '/dashboard/profile',
    label: 'Profil',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  },
  {
    href: '/dashboard/billing',
    label: 'Forfait',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  },
]

interface Props {
  userId: string
  userEmail: string
  userName?: string
  avatarUrl?: string
  subscriptionStatus: string
}

export default function DashboardNav({ userId, userEmail, userName, avatarUrl, subscriptionStatus }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  const isPastDue = subscriptionStatus === 'past_due'

  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isHere = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const initials = (userName || userEmail || '?')[0].toUpperCase()

  return (
    <>
      {/* ══ SIDEBAR — desktop ══ */}
      <aside className="desktop-only" style={{
        width: 232, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '10px' }}>
            Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
          </Link>
          {isActive ? (
            <span className="badge badge-active" style={{ fontSize: '10px' }}>
              <span className="badge-dot" style={{ animation: 'pulse-dot 2s infinite' }} />
              Pro · Actif
            </span>
          ) : isPastDue ? (
            <span className="badge badge-amber" style={{ fontSize: '10px' }}>⚠ Paiement en retard</span>
          ) : (
            <Link href="/pricing" className="badge badge-pro" style={{ fontSize: '10px', textDecoration: 'none', cursor: 'pointer' }}>
              Activer Pro →
            </Link>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          <p style={{ padding: '10px 20px 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)' }}>Navigation</p>

          {NAV.slice(0, 2).map(item => (
            <Link key={item.href} href={item.href} className={`nav-item ${isHere(item.href, item.exact) ? 'active' : ''}`}>
              {item.icon}
              {item.label}
            </Link>
          ))}

          {isActive ? (
            <Link href="/dashboard/add" className={`nav-item ${isHere('/dashboard/add') ? 'active' : ''}`}
              style={{ marginTop: 4 }}>
              {NAV[2].icon}
              {NAV[2].label}
            </Link>
          ) : (
            <div className="nav-item" style={{ opacity: 0.35, cursor: 'default' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Publier
            </div>
          )}

          <p style={{ padding: '16px 20px 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)' }}>Compte</p>

          {NAV.slice(3).map(item => (
            <Link key={item.href} href={item.href} className={`nav-item ${isHere(item.href) ? 'active' : ''}`}>
              {item.icon}
              {item.label}
              {item.href === '/dashboard/billing' && !isActive && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, background: 'var(--brand)', borderRadius: '50%', flexShrink: 0 }} />
              )}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: avatarUrl ? 'transparent' : 'var(--brand-dim)',
              border: '1.5px solid rgba(249,115,22,0.2)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--brand)',
            }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || userEmail}</p>
              <p style={{ fontSize: '11px', color: 'var(--text3)' }}>Vendeur</p>
            </div>
            <button onClick={logout} title="Déconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 6, borderRadius: 8, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ══ TOP BAR — mobile ══ */}
      <nav className="mobile-only" style={{
        position: 'sticky', top: 0, zIndex: 60,
        background: 'rgba(7,7,10,0.95)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)', letterSpacing: '-0.03em' }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {isActive && (
            <Link href="/dashboard/add" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
              Ajouter
            </Link>
          )}
          {!isActive && (
            <Link href="/pricing" className="btn btn-sm" style={{ width: 'auto', background: 'var(--brand-dim)', color: 'var(--brand)', border: '1px solid rgba(249,115,22,0.2)' }}>
              S'abonner
            </Link>
          )}
        </div>
      </nav>

      {/* ══ BOTTOM NAV — mobile ══ */}
      <div className="bottom-nav mobile-only">
        <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
          {[NAV[0], NAV[1], NAV[2], NAV[3], NAV[4]].map((item) => {
            const active = isHere(item.href, item.exact)
            const blocked = item.isCta && !isActive
            return (
              <Link key={item.href} href={blocked ? '/pricing' : item.href}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '10px 4px 8px', gap: 4,
                  textDecoration: 'none',
                  color: active ? 'var(--brand)' : blocked ? 'var(--text3)' : 'var(--text3)',
                }}>
                {item.isCta ? (
                  <div style={{
                    width: 38, height: 34, borderRadius: 10,
                    background: isActive ? 'var(--brand)' : 'var(--surface3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? '#fff' : 'var(--text3)',
                  }}>
                    {item.icon}
                  </div>
                ) : (
                  <div style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</div>
                )}
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
