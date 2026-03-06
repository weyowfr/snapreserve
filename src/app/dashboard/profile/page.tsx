'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const SPECIALTIES = ['Berlines', 'SUV / 4x4', 'Sportives', 'Utilitaires', 'Cabriolets', 'Électriques', 'Hybrides', 'Luxe', 'Import', 'Motos']

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState<'info'|'pro'|'bank'>('info')

  const [form, setForm] = useState({
    name: '', firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', postalCode: '', country: 'FR',
    accountType: 'pro', companyName: '', siret: '', vatNumber: '',
    website: '', snapchat: '', instagram: '', tiktok: '',
    bio: '', specialties: [] as string[], yearsExperience: '',
    iban: '', bic: '', bankName: '', accountHolder: '',
  })
  const [stats, setStats] = useState({ total: 0, reserved: 0, totalNet: 0 })
  const [seller, setSeller] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: s } = await sb.from('sellers').select('*').eq('id', user.id).single()
      if (s) {
        setSeller(s)
        setForm({
          name: s.name || '', firstName: s.first_name || '', lastName: s.last_name || '',
          phone: s.phone || '', email: user.email || '',
          address: s.address || '', city: s.city || '', postalCode: s.postal_code || '', country: s.country || 'FR',
          accountType: s.account_type || 'pro', companyName: s.company_name || '',
          siret: s.siret || '', vatNumber: s.vat_number || '',
          website: s.website || '', snapchat: s.snapchat_handle || '',
          instagram: s.instagram_handle || '', tiktok: s.tiktok_handle || '',
          bio: s.bio || '', specialties: s.specialties || [],
          yearsExperience: s.years_experience?.toString() || '',
          iban: s.iban || '', bic: s.bic || '',
          bankName: s.bank_name || '', accountHolder: s.account_holder || '',
        })
      }
      const { data: cars } = await sb.from('cars').select('status, deposit').eq('seller_id', user.id)
      if (cars) {
        const reserved = cars.filter(c => c.status === 'reserved')
        setStats({ total: cars.length, reserved: reserved.length, totalNet: Math.round(reserved.reduce((s, c) => s + (c.deposit || 0), 0) * 0.95) })
      }
      setLoading(false)
    }
    load()
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSuccess(false)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('sellers').update({
      name: form.firstName ? `${form.firstName} ${form.lastName}` : form.name,
      first_name: form.firstName, last_name: form.lastName,
      phone: form.phone, address: form.address, city: form.city,
      postal_code: form.postalCode, country: form.country,
      account_type: form.accountType, company_name: form.companyName,
      siret: form.siret, vat_number: form.vatNumber,
      website: form.website, snapchat_handle: form.snapchat,
      instagram_handle: form.instagram, tiktok_handle: form.tiktok,
      bio: form.bio, specialties: form.specialties,
      years_experience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
      iban: form.iban.replace(/\s/g,''), bic: form.bic,
      bank_name: form.bankName, account_holder: form.accountHolder,
    }).eq('id', user!.id)
    setSaving(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const I: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '12px 16px', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, outline: 'none' }
  const LB: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 7 }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )

  const TABS: { key: typeof tab; label: string; icon: string }[] = [
    { key: 'info', label: 'Informations', icon: '👤' },
    { key: 'pro', label: 'Activité', icon: '🏢' },
    { key: 'bank', label: 'Bancaire', icon: '🏦' },
  ]

  return (
    <div className="page-enter" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Compte</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Mon profil</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Voitures', value: stats.total, color: 'var(--brand)' },
          { label: 'Réservées', value: stats.reserved, color: 'var(--text)' },
          { label: 'Net encaissé', value: `${(stats.totalNet / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`, color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-block">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color, marginTop: 10 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Verified badge */}
      {seller?.is_verified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <svg width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Compte vérifié ✓</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 }}>
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '9px 8px', background: tab === t.key ? 'var(--surface4)' : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: tab === t.key ? 600 : 500, color: tab === t.key ? 'var(--text)' : 'var(--text2)', fontFamily: 'inherit', transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={save}>
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>

          {/* ── TAB: INFO ── */}
          {tab === 'info' && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LB}>Prénom</label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="Mohamed" style={I} className="form-input" />
              </div>
              <div>
                <label style={LB}>Nom</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Dupont" style={I} className="form-input" />
              </div>
            </div>
            <div>
              <label style={LB}>Email</label>
              <input type="email" value={form.email} disabled style={{ ...I, opacity: 0.4, cursor: 'not-allowed' }} className="form-input" />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>L'email ne peut pas être modifié</p>
            </div>
            <div>
              <label style={LB}>Téléphone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 12 34 56 78" style={I} className="form-input" />
            </div>
            <div>
              <label style={LB}>Adresse</label>
              <input value={form.address} onChange={set('address')} placeholder="12 rue de la Paix" style={I} className="form-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
              <div>
                <label style={LB}>Code postal</label>
                <input value={form.postalCode} onChange={set('postalCode')} placeholder="75001" style={I} className="form-input" />
              </div>
              <div>
                <label style={LB}>Ville</label>
                <input value={form.city} onChange={set('city')} placeholder="Paris" style={I} className="form-input" />
              </div>
            </div>
            <div>
              <label style={LB}>Bio</label>
              <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Présente-toi à tes acheteurs..." style={{ ...I, resize: 'vertical', minHeight: 80 }} className="form-input" />
            </div>
            <div>
              <label style={LB}>Spécialités</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SPECIALTIES.map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s] }))}
                    style={{ padding: '6px 14px', background: form.specialties.includes(s) ? 'var(--brand-dim2)' : 'var(--surface2)', border: `1px solid ${form.specialties.includes(s) ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 999, fontSize: 12, fontWeight: 500, color: form.specialties.includes(s) ? 'var(--brand)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>}

          {/* ── TAB: PRO ── */}
          {tab === 'pro' && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={LB}>Type de compte</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {([['pro','🏢','Société'],['autoentrepreneur','🧑‍💼','Auto-entrepreneur'],['particulier','👤','Particulier']]).map(([v,icon,label]) => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, accountType: v }))}
                    style={{ padding: '12px 8px', background: form.accountType === v ? 'var(--brand-dim2)' : 'var(--surface2)', border: `1.5px solid ${form.accountType === v ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, color: form.accountType === v ? 'var(--brand)' : 'var(--text2)', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 18, marginBottom: 5 }}>{icon}</div>{label}
                  </button>
                ))}
              </div>
            </div>
            {form.accountType !== 'particulier' && <>
              <div>
                <label style={LB}>Raison sociale</label>
                <input value={form.companyName} onChange={set('companyName')} placeholder="Auto Mohamed SARL" style={I} className="form-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LB}>SIRET</label>
                  <input value={form.siret} onChange={set('siret')} placeholder="12345678901234" style={I} className="form-input" />
                </div>
                <div>
                  <label style={LB}>N° TVA</label>
                  <input value={form.vatNumber} onChange={set('vatNumber')} placeholder="FR12345678901" style={I} className="form-input" />
                </div>
              </div>
            </>}
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
              <p style={{ ...LB, marginBottom: 14 }}>Réseaux sociaux</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['snapchat','👻','ton_pseudo_snap'],['instagram','📸','@ton_instagram'],['tiktok','🎵','@ton_tiktok'],['website','🌐','https://ton-site.com']].map(([f,icon,ph]) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                    <input value={(form as any)[f]} onChange={set(f)} placeholder={ph} style={{ ...I, flex: 1 }} className="form-input" />
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* ── TAB: BANK ── */}
          {tab === 'bank' && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.16)', borderRadius: 12, padding: '13px 16px', display: 'flex', gap: 10 }}>
              <svg width="15" height="15" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Données chiffrées AES-256 · Jamais partagées avec des tiers</p>
            </div>
            <div>
              <label style={LB}>Titulaire</label>
              <input value={form.accountHolder} onChange={set('accountHolder')} placeholder="Mohamed DUPONT" style={I} className="form-input" />
            </div>
            <div>
              <label style={LB}>IBAN</label>
              <input value={form.iban} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                style={{ ...I, letterSpacing: '0.05em', fontFamily: 'monospace' }}
                onChange={e => { const v = e.target.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase().replace(/(.{4})/g,'$1 ').trim(); setForm(f => ({...f,iban:v})) }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LB}>BIC / SWIFT</label>
                <input value={form.bic} onChange={set('bic')} placeholder="BNPAFRPPXXX" style={{ ...I, textTransform: 'uppercase' }} className="form-input" />
              </div>
              <div>
                <label style={LB}>Banque</label>
                <input value={form.bankName} onChange={set('bankName')} placeholder="BNP Paribas" style={I} className="form-input" />
              </div>
            </div>
          </div>}
        </div>

        {success && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--green)', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            Profil mis à jour avec succès
          </div>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
          {saving ? <><span className="spinner" />Sauvegarde...</> : 'Sauvegarder les modifications'}
        </button>
      </form>
    </div>
  )
}
