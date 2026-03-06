import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PaymentSection from '@/components/PaymentSection'
import RealtimeStatus from '@/components/RealtimeStatus'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: car } = await supabase.from('cars').select('title, description, price, deposit, photos, sellers(name)').eq('slug', params.slug).single()
  if (!car) return { title: 'Voiture introuvable — SnapReserve' }
  const price = (car.price / 100).toLocaleString('fr-FR')
  const deposit = (car.deposit / 100).toLocaleString('fr-FR')
  const image = car.photos?.[0] || ''
  return {
    title: `${car.title} — SnapReserve`,
    description: `${car.description || ''} · Prix: ${price}€ · Acompte: ${deposit}€`.trim(),
    openGraph: { title: `🚗 ${car.title} — ${price}€`, description: `Réservez en premier pour ${deposit}€ d'acompte`, images: image ? [{ url: image, width: 1200, height: 630, alt: car.title }] : [], type: 'website' },
    twitter: { card: 'summary_large_image', title: `🚗 ${car.title} — ${price}€`, description: `Réservez pour ${deposit}€ d'acompte`, images: image ? [image] : [] },
  }
}

export default async function PublicCarPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: car } = await supabase
    .from('cars')
    .select('*, sellers(name, phone, snapchat_handle, instagram_handle, tiktok_handle, avatar_url, is_verified, bio, specialties, account_type)')
    .eq('slug', params.slug)
    .single()
  if (!car) notFound()

  const priceF = (car.price / 100).toLocaleString('fr-FR')
  const depositF = (car.deposit / 100).toLocaleString('fr-FR')
  const isReserved = car.status !== 'available'
  const seller = car.sellers as any

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {!isReserved && <RealtimeStatus carId={car.id} initialStatus={car.status} />}

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, background: 'rgba(7,7,10,0.94)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </div>
        <span className={`badge ${isReserved ? 'badge-reserved' : 'badge-available'}`}>
          <span className="badge-dot" style={{ animation: isReserved ? 'none' : 'pulse-dot 1.5s infinite' }} />
          {isReserved ? 'Déjà réservée' : 'Disponible'}
        </span>
      </nav>

      {/* ── Photo gallery ── */}
      {car.photos?.length > 0 && (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 8, padding: '16px 20px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as any}>
            {car.photos.map((photo: string, i: number) => (
              <div key={i} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 'min(calc(100vw - 80px), 420px)', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', background: 'var(--surface2)' }}>
                <img src={photo} alt={`${car.title} ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
          {car.photos.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, paddingBottom: 4 }}>
              {car.photos.map((_: string, i: number) => (
                <div key={i} style={{ width: i === 0 ? 16 : 5, height: 3, background: i === 0 ? 'var(--brand)' : 'var(--surface4)', borderRadius: 2, transition: 'width 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: '20px', maxWidth: 520, margin: '0 auto', paddingBottom: 60 }}>

        {/* Seller chip */}
        {seller && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface3)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              {seller.avatar_url ? <img src={seller.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '👤'}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Vendu par <strong style={{ color: 'var(--text)' }}>{seller.name}</strong>
              {seller.is_verified && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Vérifié</span>}
            </span>
          </div>
        )}

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,6vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>{car.title}</h1>

        {/* Price cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div className="card-sm" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Prix total</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{priceF} €</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Acompte</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--brand)' }}>{depositF} €</p>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="card-sm" style={{ padding: '16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Description</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{car.description}</p>
          </div>
        )}

        {/* Seller social links */}
        {seller && (seller.snapchat_handle || seller.instagram_handle || seller.tiktok_handle) && (
          <div className="card-sm" style={{ padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Contact vendeur</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {seller.snapchat_handle && (
                <a href={`https://snapchat.com/add/${seller.snapchat_handle}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,252,0,0.08)', border: '1px solid rgba(255,252,0,0.12)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#fffc00', textDecoration: 'none' }}>
                  👻 {seller.snapchat_handle}
                </a>
              )}
              {seller.instagram_handle && (
                <a href={`https://instagram.com/${seller.instagram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.14)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#e1306c', textDecoration: 'none' }}>
                  📸 {seller.instagram_handle}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Payment or blocked */}
        {isReserved ? (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--red)', marginBottom: 10 }}>Déjà réservée</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>Quelqu'un a été plus rapide.<br />Cette voiture n'est plus disponible.</p>
          </div>
        ) : (
          <PaymentSection car={car} />
        )}
      </div>
    </main>
  )
}
