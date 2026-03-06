'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40)
}

export default function AddCarPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [deposit, setDeposit] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSub = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: seller } = await supabase.from('sellers').select('subscription_status').eq('id', user.id).single()
      setHasSubscription(seller?.subscription_status === 'active' || seller?.subscription_status === 'trialing')
    }
    checkSub()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    if (!price || !deposit) { setError('Remplis tous les champs obligatoires.'); setLoading(false); return }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      const photoUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Upload photo ${i + 1}/${photos.length}...`)
        const file = photos[i]
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
        const { error: uploadError } = await supabase.storage.from('car-photos').upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('car-photos').getPublicUrl(fileName)
        photoUrls.push(urlData.publicUrl)
      }

      setUploadProgress('Enregistrement...')
      const slug = `${slugify(title)}-${nanoid()}`
      const { data: car, error: carError } = await supabase
        .from('cars')
        .insert({ seller_id: user.id, slug, title, description, price: Math.round(parseFloat(price) * 100), deposit: Math.round(parseFloat(deposit) * 100), photos: photoUrls, status: 'available' })
        .select().single()
      if (carError) throw carError
      router.push(`/dashboard/cars/${car.id}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
      setLoading(false); setUploadProgress('')
    }
  }

  if (hasSubscription === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <span className="spinner" />
    </div>
  )

  if (hasSubscription === false) return (
    <div className="page-enter" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
      <div style={{ width: '64px', height: '64px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '10px' }}>Abonnement requis</h2>
      <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.7, marginBottom: '28px' }}>
        Tu as besoin d'un abonnement actif pour publier des voitures.
      </p>
      <Link href="/pricing" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px' }}>
        Voir les tarifs — 19,99€/mois
      </Link>
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>Publier une voiture</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Photos */}
        <div>
          <label className="form-label">Photos <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(max 5)</span></label>
          {previews.length === 0 ? (
            <label className="upload-zone">
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>📸</div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text2)', marginBottom: '4px' }}>Appuie pour ajouter des photos</p>
              <p style={{ fontSize: '12px', color: 'var(--text3)' }}>JPG, PNG — max 5 photos</p>
            </label>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface3)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              <label style={{ fontSize: '13px', color: 'var(--brand)', cursor: 'pointer', fontWeight: 500 }}>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
                Changer les photos
              </label>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="form-label">Titre *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Toyota Corolla 2019" required className="form-input" />
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Kilométrage, état, options..." rows={4}
            className="form-input" style={{ resize: 'none' }} />
        </div>

        {/* Prices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label">Prix total (€) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="12000" required min="1" className="form-input" />
          </div>
          <div>
            <label className="form-label">Acompte (€) *</label>
            <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="500" required min="1" className="form-input" />
          </div>
        </div>

        {/* Deposit info */}
        {deposit && parseFloat(deposit) > 0 && (
          <div style={{ background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '10px' }}>
            <span style={{ flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
              L'acheteur paiera <strong style={{ color: 'var(--text)' }}>{parseFloat(deposit).toLocaleString('fr-FR')} €</strong> pour réserver.
              Tu recevras <strong style={{ color: 'var(--green)' }}>{(parseFloat(deposit) * 0.95).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong> net (après 5% de frais).
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '15px', padding: '14px' }}>
          {loading
            ? <><span className="spinner" />{uploadProgress || 'Publication...'}</>
            : <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Publier la voiture</>
          }
        </button>
      </form>
    </div>
  )
}
