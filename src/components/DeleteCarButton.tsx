'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' })
    if (res.ok) { router.push('/dashboard'); router.refresh() }
    else { setLoading(false); setConfirm(false) }
  }

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="btn-ghost" style={{ width: '100%', color: 'var(--text3)' }}>
        Supprimer cette annonce
      </button>
    )
  }

  return (
    <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '18px 20px' }}>
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)', textAlign: 'center', marginBottom: '16px' }}>Supprimer cette voiture ?</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setConfirm(false)} className="btn-ghost" style={{ flex: 1 }}>Annuler</button>
        <button onClick={handleDelete} disabled={loading} style={{ flex: 1, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Suppression...' : 'Confirmer'}
        </button>
      </div>
    </div>
  )
}
