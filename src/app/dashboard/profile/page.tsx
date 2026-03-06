'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState({ total: 0, reserved: 0, totalNet: 0 })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      const { data: seller } = await supabase.from('sellers').select('*').eq('id', user.id).single()
      if (seller) { setName(seller.name || ''); setPhone(seller.phone || '') }
      const { data: cars } = await supabase.from('cars').select('status, deposit').eq('seller_id', user.id)
      if (cars) {
        const reserved = cars.filter(c => c.status === 'reserved')
        const totalNet = Math.round(reserved.reduce((s, c) => s + (c.deposit || 0), 0) * 0.95)
        setStats({ total: cars.length, reserved: reserved.length, totalNet })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSuccess(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('sellers').update({ name, phone }).eq('id', user!.id)
    setSaving(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" />
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: '520px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Compte</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>Mon profil</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'Voitures', value: stats.total, color: 'var(--brand)' },
          { label: 'Réservées', value: stats.reserved, color: 'var(--text)' },
          { label: 'Net encaissé', value: `${(stats.totalNet / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`, color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">Email</label>
            <input type="email" value={email} disabled className="form-input" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>L'email ne peut pas être modifié.</p>
          </div>
          <div>
            <label className="form-label">Prénom / Pseudo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ton prénom" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Téléphone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text3)' }}>— pour recevoir les SMS</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="form-input" />
          </div>
          {success && (
            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--green)' }}>
              ✅ Profil mis à jour !
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><span className="spinner" />Sauvegarde...</> : 'Sauvegarder les modifications'}
          </button>
        </form>
      </div>
    </div>
  )
}
