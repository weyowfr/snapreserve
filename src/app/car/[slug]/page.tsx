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
  const { data: car } = await supabase.from('cars').select('*, sellers(name)').eq('slug', params.slug).single()
  if (!car) notFound()

  const priceFormatted = (car.price / 100).toLocaleString('fr-FR')
  const depositFormatted = (car.deposit / 100).toLocaleString('fr-FR')
  const isReserved = car.status !== 'available'

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {!isReserved && <RealtimeStatus carId={car.id} initialStatus={car.status} />}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800 }}>
          Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
        </div>
        <span className={`badge ${isReserved ? 'badge-reserved' : 'badge-available'}`}>
          <span className="badge-dot" style={{ animation: isReserved ? 'none' : 'pulse-brand 1.5s infinite' }} />
          {isReserved ? 'Réservée' : 'Disponible'}
        </span>
      </nav>

      {/* Photos */}
      {car.photos?.length > 0 && (
        <div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '16px 20px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            {car.photos.map((photo: string, i: number) => (
              <div key={i} style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 'calc(100vw - 80px)', maxWidth: '400px', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface2)' }}>
                <img src={photo} alt={`${car.title} ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          {car.photos.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '-4px' }}>
              {car.photos.map((_: string, i: number) => (
                <div key={i} style={{ width: i === 0 ? '18px' : '5px', height: '3px', background: i === 0 ? 'var(--brand)' : 'var(--surface3)', borderRadius: '2px', transition: 'width 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
        {car.sellers?.name && (
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '4px' }}>Vendu par <strong style={{ color: 'var(--text2)' }}>{car.sellers.name}</strong></p>
        )}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '20px' }}>{car.title}</h1>

        {/* Price pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Prix</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>{priceFormatted} €</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '14px', padding: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Acompte</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--brand)' }}>{depositFormatted} €</p>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Description</p>
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{car.description}</p>
          </div>
        )}

        {/* Reservation or blocked */}
        {isReserved ? (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--red)', marginBottom: '8px' }}>Déjà réservée</h2>
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}>Quelqu'un a été plus rapide.<br />Cette voiture n'est plus disponible.</p>
          </div>
        ) : (
          <PaymentSection car={car} />
        )}
      </div>
    </main>
  )
}
