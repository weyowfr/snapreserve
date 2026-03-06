import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'
import DeleteCarButton from '@/components/DeleteCarButton'

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: car } = await supabase.from('cars').select('*').eq('id', params.id).eq('seller_id', user!.id).single()
  if (!car) notFound()

  const { data: reservation } = await supabase
    .from('reservations').select('*').eq('car_id', car.id).eq('status', 'paid').single()

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/car/${car.slug}`
  const priceF = (car.price / 100).toLocaleString('fr-FR')
  const depositF = (car.deposit / 100).toLocaleString('fr-FR')
  const netF = ((car.deposit * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  return (
    <div className="page-enter" style={{ maxWidth: '600px' }}>
      {/* Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ width: '36px', height: '36px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none', color: 'var(--text2)' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.title}</h1>
        <span className={`badge ${car.status === 'available' ? 'badge-available' : 'badge-reserved'}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <span className="badge-dot" />
          {car.status === 'available' ? 'Disponible' : 'Réservée'}
        </span>
      </div>

      {/* Photo */}
      {car.photos?.length > 0 && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', aspectRatio: '16/9', background: 'var(--surface2)' }}>
          <img src={car.photos[0]} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Prix total</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>{priceF} €</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '14px', padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Acompte</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--brand)' }}>{depositF} €</p>
          <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>Tu reçois {netF} € (net)</p>
        </div>
      </div>

      {/* Reservation info */}
      {reservation && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '14px' }}>✅ Réservé par</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Nom', value: reservation.buyer_name },
              { label: 'Téléphone', value: reservation.buyer_phone, href: `tel:${reservation.buyer_phone}` },
              { label: 'Email', value: reservation.buyer_email, href: `mailto:${reservation.buyer_email}` },
              { label: 'Acompte reçu (net)', value: `${((reservation.platform_fee ? car.deposit - reservation.platform_fee : car.deposit * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, highlight: true },
            ].filter(r => r.value).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{row.label}</span>
                {row.href ? (
                  <a href={row.href} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>{row.value}</a>
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: row.highlight ? 'var(--green)' : 'var(--text)' }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share link */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '12px' }}>Lien à partager sur Snapchat</p>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', overflow: 'hidden' }}>
          <p style={{ fontSize: '12px', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publicUrl}</p>
        </div>
        <ShareButton url={publicUrl} title={car.title} />
      </div>

      {car.status === 'available' && <DeleteCarButton carId={car.id} />}
    </div>
  )
}
