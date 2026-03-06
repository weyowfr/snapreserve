import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function ReservationsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, cars!inner(id, title, slug, deposit, seller_id, photos)')
    .eq('cars.seller_id', user!.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const totalBrut = reservations?.reduce((s, r) => s + (r.cars?.deposit || 0), 0) || 0
  const totalNet = Math.round(totalBrut * 0.95)

  return (
    <div className="page-enter" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>Réservations</h1>
      </div>

      {/* Revenue summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Total acomptes</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--green)' }}>{(totalNet / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</p>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Net après frais 5%</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Réservations</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--brand)' }}>{reservations?.length || 0}</p>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>au total</p>
        </div>
      </div>

      {/* List */}
      {!reservations || reservations.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '52px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>Aucune réservation</p>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Les réservations payées apparaîtront ici</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {reservations.map((r: any, i: number) => (
            <div key={r.id} style={{ padding: '18px 20px', borderBottom: i < reservations.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Thumbnail */}
                <div style={{ width: '56px', height: '44px', borderRadius: '8px', background: 'var(--surface3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {r.cars?.photos?.[0] ? <img src={r.cars.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🚗'}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.cars?.title}</p>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)', flexShrink: 0, marginLeft: '10px' }}>
                      +{(Math.round((r.cars?.deposit || 0) * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                    {[
                      { label: 'Acheteur', value: r.buyer_name },
                      { label: 'Téléphone', value: r.buyer_phone, href: `tel:${r.buyer_phone}` },
                      { label: 'Email', value: r.buyer_email },
                      { label: 'Date', value: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    ].filter(f => f.value).map((field, j) => (
                      <div key={j}>
                        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '2px' }}>{field.label}</p>
                        {field.href ? (
                          <a href={field.href} style={{ fontSize: '12px', fontWeight: 500, color: 'var(--brand)', textDecoration: 'none' }}>{field.value}</a>
                        ) : (
                          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`tel:${r.buyer_phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      Appeler
                    </a>
                    <Link href={`/dashboard/cars/${r.car_id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', textDecoration: 'none' }}>
                      Voir l'annonce →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
