import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function ReservationsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, cars!inner(id, title, slug, deposit, photos, seller_id)')
    .eq('cars.seller_id', user!.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const totalBrut = reservations?.reduce((s, r) => s + (r.cars?.deposit || 0), 0) || 0
  const totalNet = Math.round(totalBrut * 0.95)
  const count = reservations?.length || 0

  return (
    <div className="page-enter" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Réservations</h1>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total net', value: `${(totalNet / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, sub: 'Après frais 5%', color: 'var(--green)' },
          { label: 'Réservations', value: count, sub: 'payées au total', color: 'var(--brand)' },
          { label: 'Brut encaissé', value: `${(totalBrut / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, sub: 'Avant frais', color: 'var(--text)' },
        ].map((s, i) => (
          <div key={i} className="stat-block">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color, marginTop: 10 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── List ── */}
      {count === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '52px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Aucune réservation</p>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Les réservations payées apparaissent ici en temps réel</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservations!.map((r: any) => {
            const net = (Math.round((r.cars?.deposit || 0) * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
            return (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.18s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 58, height: 46, borderRadius: 10, background: 'var(--surface3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {r.cars?.photos?.[0] ? <img src={r.cars.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🚗'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 12 }}>{r.cars?.title}</p>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>+{net} €</span>
                      </div>

                      {/* Buyer info grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px' }}>
                        {[
                          { label: 'Acheteur', value: r.buyer_name },
                          { label: 'Téléphone', value: r.buyer_phone, href: `tel:${r.buyer_phone}` },
                          { label: 'Email', value: r.buyer_email },
                          { label: 'Date', value: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        ].filter(f => f.value).map((field, j) => (
                          <div key={j}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>{field.label}</p>
                            {field.href
                              ? <a href={field.href} style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand)', textDecoration: 'none' }}>{field.value}</a>
                              : <p style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.value}</p>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
                  <a href={`tel:${r.buyer_phone}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none', transition: 'background 0.15s' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    Appeler
                  </a>
                  {r.buyer_email && (
                    <a href={`mailto:${r.buyer_email}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      Email
                    </a>
                  )}
                  <Link href={`/dashboard/cars/${r.car_id}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none' }}>
                    Annonce →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
