'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)
const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').substring(0,40)

const FUEL = ['Essence','Diesel','Hybride','Hybride rechargeable','Électrique','GPL']
const GEARBOX = ['Manuelle','Automatique','Semi-automatique']
const COLORS = ['Blanc','Noir','Gris','Argent','Bleu','Rouge','Vert','Beige','Marron','Orange','Jaune','Violet']

export default function AddCarPage() {
  const router = useRouter()
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '', description: '', price: '', deposit: '',
    mileage: '', year: '', fuel: '', gearbox: '', color: '', doors: '', brand: '', model: '',
  })

  useEffect(() => {
    const check = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data: seller } = await sb.from('sellers').select('subscription_status').eq('id', user.id).single()
      setHasSubscription(seller?.subscription_status === 'active' || seller?.subscription_status === 'trialing')
    }
    check()
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removePhoto = (i: number) => {
    setPhotos(p => p.filter((_,j) => j !== i))
    setPreviews(p => p.filter((_,j) => j !== i))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    if (!form.price || !form.deposit) { setError('Prix et acompte sont requis.'); setLoading(false); return }

    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      const photoUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Upload photo ${i+1}/${photos.length}...`)
        const file = photos[i]
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: ue } = await sb.storage.from('car-photos').upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (ue) throw ue
        const { data: urlData } = sb.storage.from('car-photos').getPublicUrl(fileName)
        photoUrls.push(urlData.publicUrl)
      }

      setUploadProgress('Enregistrement...')
      const slug = `${slugify(form.title)}-${nanoid()}`
      const { data: car, error: ce } = await sb.from('cars').insert({
        seller_id: user.id, slug, title: form.title, description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        deposit: Math.round(parseFloat(form.deposit) * 100),
        photos: photoUrls, status: 'available',
        mileage: form.mileage ? parseInt(form.mileage) : null,
        year: form.year ? parseInt(form.year) : null,
        fuel: form.fuel || null, gearbox: form.gearbox || null,
        color: form.color || null, doors: form.doors ? parseInt(form.doors) : null,
        brand: form.brand || null, model: form.model || null,
      }).select().single()
      if (ce) throw ce
      router.push(`/dashboard/cars/${car.id}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
      setLoading(false); setUploadProgress('')
    }
  }

  if (hasSubscription === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )

  if (!hasSubscription) return (
    <div className="page-enter" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ width: 64, height: 64, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>Abonnement requis</h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
        Abonne-toi à SnapReserve Pro pour publier des voitures et recevoir des réservations.
      </p>
      <Link href="/pricing" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', width: 'auto' }}>
        Voir les tarifs — 19,99 €/mois
      </Link>
    </div>
  )

  const I: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '12px 16px', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, outline: 'none' }
  const SEL: React.CSSProperties = { ...I, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2344445a' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer', appearance: 'none' as any }
  const LB: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' as any, color: 'var(--text3)', marginBottom: 7 }

  return (
    <div className="page-enter" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Publier une voiture</h1>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Photos ── */}
        <div className="card" style={{ padding: 20 }}>
          <label style={{ ...LB, marginBottom: 14 }}>Photos <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text3)' }}>— max 8</span></label>
          {previews.length === 0 ? (
            <label className="upload-zone">
              <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
              <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', marginBottom: 4 }}>Appuie pour ajouter des photos</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>JPG, PNG, WEBP — max 8 photos</p>
            </label>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8, marginBottom: 12 }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--surface3)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✕</button>
                    {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: 'var(--brand)', color: '#fff', padding: '2px 5px', borderRadius: 4 }}>Principale</span>}
                  </div>
                ))}
                {previews.length < 8 && (
                  <label style={{ aspectRatio: '1', borderRadius: 10, border: '1.5px dashed var(--border2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transition: 'all 0.18s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}>
                    +
                    <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Infos principales ── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ ...LB, marginBottom: 16, fontSize: 12 }}>Informations principales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={LB}>Titre *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="Toyota Corolla 2019 — 80 000 km" required style={I} className="form-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LB}>Marque</label>
                <input value={form.brand} onChange={set('brand')} placeholder="Toyota" style={I} className="form-input" />
              </div>
              <div>
                <label style={LB}>Modèle</label>
                <input value={form.model} onChange={set('model')} placeholder="Corolla" style={I} className="form-input" />
              </div>
            </div>
            <div>
              <label style={LB}>Description</label>
              <textarea value={form.description} onChange={set('description')} placeholder="Kilométrage, état, options, historique..." rows={4} style={{ ...I, resize: 'none' }} className="form-input" />
            </div>
          </div>
        </div>

        {/* ── Caractéristiques ── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ ...LB, marginBottom: 16, fontSize: 12 }}>Caractéristiques</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { k: 'year', label: 'Année', ph: '2019', type: 'number' },
              { k: 'mileage', label: 'Kilométrage (km)', ph: '80000', type: 'number' },
            ].map(({ k, label, ph, type }) => (
              <div key={k}>
                <label style={LB}>{label}</label>
                <input type={type} value={(form as any)[k]} onChange={set(k)} placeholder={ph} style={I} className="form-input" />
              </div>
            ))}
            <div>
              <label style={LB}>Carburant</label>
              <select value={form.fuel} onChange={set('fuel')} style={SEL}>
                <option value="">—</option>
                {FUEL.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={LB}>Boîte</label>
              <select value={form.gearbox} onChange={set('gearbox')} style={SEL}>
                <option value="">—</option>
                {GEARBOX.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={LB}>Couleur</label>
              <select value={form.color} onChange={set('color')} style={SEL}>
                <option value="">—</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LB}>Nb. portes</label>
              <select value={form.doors} onChange={set('doors')} style={SEL}>
                <option value="">—</option>
                {[2,3,4,5].map(d => <option key={d} value={d}>{d} portes</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Prix ── */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ ...LB, marginBottom: 16, fontSize: 12 }}>Prix</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LB}>Prix total (€) *</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="12000" required min="1" style={I} className="form-input" />
            </div>
            <div>
              <label style={LB}>Acompte (€) *</label>
              <input type="number" value={form.deposit} onChange={set('deposit')} placeholder="500" required min="1" style={I} className="form-input" />
            </div>
          </div>

          {form.deposit && parseFloat(form.deposit) > 0 && (
            <div style={{ background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.16)', borderRadius: 11, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <span style={{ flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                L'acheteur paiera <strong style={{ color: 'var(--text)' }}>{parseFloat(form.deposit).toLocaleString('fr-FR')} €</strong> pour réserver.
                Tu recevras <strong style={{ color: 'var(--green)' }}>{(parseFloat(form.deposit) * 0.95).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong> net (après 5% de frais).
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: 'var(--red)', display: 'flex', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
          {loading
            ? <><span className="spinner" />{uploadProgress || 'Publication...'}</>
            : <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Publier la voiture</>
          }
        </button>
      </form>

      <style>{`input:focus,select:focus,textarea:focus{border-color:rgba(249,115,22,0.5)!important;outline:none!important;box-shadow:0 0 0 3px rgba(249,115,22,0.07)!important}`}</style>
    </div>
  )
}
