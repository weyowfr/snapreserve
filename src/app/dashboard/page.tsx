import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Car } from '@/lib/types'

function CarRow({ car, last }: { car: Car; last: boolean }) {
  const price = (car.price / 100).toLocaleString('fr-FR')
  const deposit = (car.deposit / 100).toLocaleString('fr-FR')
  return (
    <Link href={`/dashboard/cars/${car.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: last ? 'none' : '1px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ width: 54, height: 42, borderRadius: 9, background: 'var(--surface3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {car.photos?.[0] ? <img src={car.photos[0]} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🚗'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{car.title}</p>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{price} € · Acompte {deposit} €</p>
      </div>
      <span className={`badge ${car.status === 'available' ? 'badge-available' : 'badge-reserved'}`}>
        <span className="badge-dot" />
        {car.status === 'available' ? 'Dispo' : 'Réservée'}
      </span>
      <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: seller } = await supabase.from('sellers').select('*').eq('id', user!.id).single()
  const { data: cars } = await supabase.from('cars').select('*').eq('seller_id', user!.id).order('created_at', { ascending: false })
  const { data: reservations } = await supabase.from('reservations').select('*, cars!inner(seller_id)').eq('cars.seller_id', user!.id).eq('status', 'paid')

  const reserved = cars?.filter(c => c.status === 'reserved').length || 0
  const available = cars?.filter(c => c.status === 'available').length || 0
  const totalDeposits = cars?.filter(c => c.status === 'reserved').reduce((s, c) => s + c.deposit, 0) || 0
  const isActive = seller?.subscription_status === 'active' || seller?.subscription_status === 'trialing'
  const isPastDue = seller?.subscription_status === 'past_due'
  const firstName = seller?.first_name || seller?.name?.split(' ')[0] || 'Vendeur'

  return (
    <div className="page-enter">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 3 }}>Bonjour 👋</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{firstName}</h1>
        </div>
        {isActive && (
          <Link href="/dashboard/add" className="btn btn-primary desktop-only" style={{ width: 'auto' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Ajouter une voiture
          </Link>
        )}
      </div>

      {/* ── Banners ── */}
      {!isActive && !isPastDue && (
        <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: 'var(--brand-dim2)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚀</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 2 }}>Active ton abonnement Pro</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>19,99 €/mois · publie des voitures et reçois des réservations</p>
            </div>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--brand)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      )}
      {isPastDue && (
        <Link href="/dashboard/billing" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', marginBottom: 2 }}>Paiement en retard</p>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>Mets à jour ta carte pour éviter la suspension</p>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--amber)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Voitures publiées', value: cars?.length || 0, sub: `${available} dispo · ${reserved} réservées`, color: 'var(--brand)' },
          { label: 'Acomptes nets', value: `${((totalDeposits * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, sub: 'Après frais 5%', color: 'var(--green)' },
          { label: 'Réservations', value: reservations?.length || 0, sub: 'total', color: 'var(--text)' },
        ].map((s, i) => (
          <div key={i} className="stat-block">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color, marginTop: 10 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick add ── */}
      {isActive ? (
        <Link href="/dashboard/add"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '15px 20px', marginBottom: 24, textDecoration: 'none', transition: 'border-color 0.18s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="var(--brand)" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Publier une voiture</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Prêt à recevoir des réservations en 2 minutes</p>
            </div>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '15px 20px', marginBottom: 24, opacity: 0.45 }}>
          <div style={{ width: 40, height: 40, background: 'var(--surface3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text3)', marginBottom: 2 }}>Publier une voiture</p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Abonnement Pro requis</p>
          </div>
        </div>
      )}

      {/* ── Cars list ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)' }}>Mes annonces</p>
          {(cars?.length || 0) > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{cars?.length} voiture{(cars?.length || 0) > 1 ? 's' : ''}</span>
          )}
        </div>

        {!cars || cars.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚗</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Aucune voiture publiée</p>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{isActive ? 'Publie ta première voiture pour commencer' : 'Active ton abonnement pour publier'}</p>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {cars.map((car: Car, i: number) => (
              <CarRow key={car.id} car={car} last={i === cars.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
