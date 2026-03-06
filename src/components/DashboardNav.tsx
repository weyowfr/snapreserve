'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Accueil', icon: (a: boolean) => <svg width="15" height="15" style={{opacity: a ? 1 : 0.6}} viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { href: '/dashboard/reservations', label: 'Réservations', icon: (a: boolean) => <svg width="15" height="15" style={{opacity: a ? 1 : 0.6}} viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
  { href: '/dashboard/profile', label: 'Profil', icon: (a: boolean) => <svg width="15" height="15" style={{opacity: a ? 1 : 0.6}} viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  { href: '/dashboard/billing', label: 'Forfait', icon: (a: boolean) => <svg width="15" height="15" style={{opacity: a ? 1 : 0.6}} viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
]

export default function DashboardNav({ userId, userEmail, subscriptionStatus }: { userId: string; userEmail: string; subscriptionStatus: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  const isPastDue = subscriptionStatus === 'past_due'

  const logout = async () => {
    await createClient().auth.signOut()
    router.push('/'); router.refresh()
  }

  return (
    <>
      {/* ── Sidebar desktop (hidden on mobile) ── */}
      <aside style={{ width: '220px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }} className="hidden-mobile">
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)', display: 'block', marginBottom: '10px' }}>
            Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
          </Link>
          {isActive ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '100px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ width: '5px', height: '5px', background: 'var(--green)', borderRadius: '50%', animation: 'pulse-brand 2s infinite', display: 'inline-block' }} /> Pro · Actif
            </span>
          ) : isPastDue ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '100px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--amber)' }}>
              ⚠️ Paiement en retard
            </span>
          ) : (
            <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '100px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>
              S'abonner →
            </Link>
          )}
        </div>

        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 20px', marginBottom: '6px' }}>Navigation</div>

        {NAV_ITEMS.slice(0,2).map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}>
            {item.icon(pathname === item.href)}
            {item.label}
          </Link>
        ))}

        {isActive && (
          <Link href="/dashboard/add" className={`sidebar-link ${pathname === '/dashboard/add' ? 'active' : ''}`}>
            <svg width="15" height="15" style={{opacity: 0.7}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
            Publier une voiture
          </Link>
        )}

        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 20px', marginTop: '16px', marginBottom: '6px' }}>Compte</div>

        {NAV_ITEMS.slice(2).map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}>
            {item.icon(pathname === item.href)}
            {item.label}
            {item.href === '/dashboard/billing' && !isActive && (
              <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--brand)', borderRadius: '50%' }} />
            )}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
              {(userEmail?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Vendeur</div>
            </div>
            <button onClick={logout} title="Déconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Top bar mobile ── */}
      <nav style={{ display: 'none', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between' }} className="show-mobile">
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, textDecoration: 'none', color: 'var(--text)' }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isActive && (
            <Link href="/dashboard/add" className="btn-primary" style={{ width: 'auto', fontSize: '13px', padding: '8px 16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
              Ajouter
            </Link>
          )}
          {!isActive && <Link href="/pricing" className="btn-primary" style={{ width: 'auto', fontSize: '12px', padding: '7px 12px' }}>S'abonner</Link>}
        </div>
      </nav>

      {/* ── Bottom tab bar mobile ── */}
      <div className="bottom-nav show-mobile">
        <div style={{ display: 'flex', maxWidth: '500px', margin: '0 auto' }}>
          {[
            ...NAV_ITEMS.slice(0, 2),
            { href: '/dashboard/add', label: 'Publier', icon: (_: boolean) => (
              <div style={{ width: '40px', height: '36px', background: isActive ? 'var(--brand)' : 'var(--surface3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'var(--text3)'} strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
              </div>
            )},
            ...NAV_ITEMS.slice(2),
          ].map((item) => {
            const isHere = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', gap: '4px', textDecoration: 'none', color: isHere ? 'var(--brand)' : 'var(--text3)' }}>
                {item.icon(isHere)}
                <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; flex-direction: column; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </>
  )
}
