'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function RealtimeStatus({ carId, initialStatus }: { carId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`car-status-${carId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cars', filter: `id=eq.${carId}` }, (payload) => {
        const newStatus = payload.new.status
        if (newStatus !== 'available') {
          setStatus(newStatus)
          setVisible(true)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [carId])

  if (!visible || status === 'available') return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      className="page-enter">
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', maxWidth: '340px', width: '100%' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--red)', marginBottom: '10px', letterSpacing: '-0.5px' }}>Réservée !</h2>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
          Cette voiture vient d'être réservée pendant que tu regardais. Ton paiement n'a pas été prélevé.
        </p>
        <button onClick={() => window.history.back()}
          style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          ← Retour
        </button>
      </div>
    </div>
  )
}
