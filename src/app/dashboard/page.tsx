import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import CarCard from '@/components/CarCard'
import { Car } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: seller } = await supabase.from('sellers').select('*').eq('id', user!.id).single()
  const { data: cars } = await supabase.from('cars').select('*').eq('seller_id', user!.id).order('created_at', { ascending: false })

  const reserved = cars?.filter(c => c.status === 'reserved').length || 0
  const totalDeposits = cars?.filter(c => c.status === 'reserved').reduce((s, c) => s + c.deposit, 0) || 0
  const isActive = seller?.subscription_status === 'active' || seller?.subscription_status === 'trialing'
  const isPastDue = seller?.subscription_status === 'past_due'

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '4px' }}>Bonjour 👋</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px' }}>{seller?.name || 'Vendeur'}</h1>
        </div>
        {isActive && (
          <Link href="/dashboard/add" className="btn-primary" style={{ width: 'auto', padding: '10px 18px', gap: '6px', display: 'none' }} id="desktop-add">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Ajouter une voiture
          </Link>
        )}
      </div>

      {/* Subscription banners */}
      {!isActive && !isPastDue && (
        <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-dim)')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '22px' }}>🚀</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand)', marginBottom: '2px' }}>Active ton abonnement Pro</p>
              <p style={{ fontSize: '12px', color: 'var(--text2)' }}>19,99€/mois — commence à vendre dès maintenant</p>
            </div>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--brand)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      )}

      {isPastDue && (
        <Link href="/dashboard/billing" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', textDecoration: 'none' }}>
          <span style={{ fontSize: '22px' }}>⚠️</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--amber)', marginBottom: '2px' }}>Paiement en retard</p>
            <p style={{ fontSize: '12px', color: 'var(--text2)' }}>Mets à jour ta carte pour continuer à recevoir des réservations</p>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--amber)" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'Voitures publiées', value: cars?.length || 0, color: 'var(--brand)', sub: `${(cars?.length || 0) - reserved} dispo · ${reserved} réservées` },
          { label: 'Acomptes encaissés', value: `${((totalDeposits * 0.95) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, color: 'var(--green)', sub: 'Net après frais 5%' },
          { label: 'Réservations', value: reserved, color: 'var(--text)', sub: 'ce mois-ci' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '10px' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.5px', color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Add car CTA */}
      {isActive ? (
        <Link href="/dashboard/add" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', textDecoration: 'none', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="var(--brand)" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Ajouter une voiture</p>
              <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Publie et partage en 2 minutes</p>
            </div>
          </div>
          <svg width="16" height="16" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </Link>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', opacity: 0.5 }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--surface3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text3)', marginBottom: '2px' }}>Ajouter une voiture</p>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Abonnement requis</p>
          </div>
        </div>
      )}

      {/* Cars list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)' }}>Mes voitures</p>
          {(cars?.length || 0) > 3 && <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'none' }}>Voir tout</Link>}
        </div>

        {!cars || cars.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚗</div>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>Aucune voiture publiée</p>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{isActive ? 'Ajoute ta première voiture pour commencer' : 'Active ton abonnement pour publier'}</p>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {cars.map((car: Car, i: number) => (
              <CarCard key={car.id} car={car} last={i === cars.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
