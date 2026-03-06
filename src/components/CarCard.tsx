'use client'
import Link from 'next/link'
import { Car } from '@/lib/types'

export default function CarCard({ car, last = false }: { car: Car; last?: boolean }) {
  const price = (car.price / 100).toLocaleString('fr-FR')
  const deposit = (car.deposit / 100).toLocaleString('fr-FR')

  return (
    <Link href={`/dashboard/cars/${car.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: last ? 'none' : '1px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ width: '52px', height: '40px', borderRadius: '8px', background: 'var(--surface3)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
        {car.photos?.[0] ? <img src={car.photos[0]} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🚗'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{car.title}</p>
        <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{price} € · Acompte {deposit} €</p>
      </div>
      <span className={`badge ${car.status === 'available' ? 'badge-available' : 'badge-reserved'}`}>
        <span className="badge-dot" />
        {car.status === 'available' ? 'Disponible' : 'Réservée'}
      </span>
      <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </Link>
  )
}

