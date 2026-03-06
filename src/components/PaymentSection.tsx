'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Car } from '@/lib/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ car, buyerName, buyerPhone, onBack }: { car: Car; buyerName: string; buyerPhone: string; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const depositF = (car.deposit / 100).toLocaleString('fr-FR')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true); setError('')
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/car/${car.slug}/success` },
    })
    if (stripeError) { setError(stripeError.message || 'Erreur de paiement.'); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '4px' }}>Réservation pour</p>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>{buyerName}</p>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{buyerPhone}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '4px' }}>À payer</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--brand)' }}>{depositF} €</p>
          </div>
        </div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--red)', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading || !stripe} className="btn-primary" style={{ marginBottom: '10px' }}>
        {loading ? <><span className="spinner" />Traitement...</> : `🔒 Payer ${depositF} € et réserver`}
      </button>
      <button type="button" onClick={onBack} style={{ width: '100%', background: 'none', border: 'none', fontSize: '13px', color: 'var(--text3)', cursor: 'pointer', padding: '8px' }}>
        ← Modifier mes informations
      </button>
    </form>
  )
}

export default function PaymentSection({ car }: { car: Car }) {
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const depositF = (car.deposit / 100).toLocaleString('fr-FR')

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carId: car.id, buyerName, buyerPhone, buyerEmail }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(res.status === 409 ? 'Cette voiture vient d\'être réservée par quelqu\'un d\'autre. 😢' : res.status === 403 ? 'Cette annonce est temporairement indisponible.' : data.error || 'Une erreur est survenue.')
      setLoading(false); return
    }
    setClientSecret(data.clientSecret); setStep('payment'); setLoading(false)
  }

  if (step === 'payment' && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{
        clientSecret,
        appearance: { theme: 'night', variables: { colorPrimary: '#f97316', colorBackground: '#161616', colorText: '#f5f5f5', colorDanger: '#ef4444', fontFamily: 'var(--font-body), sans-serif', borderRadius: '10px' } },
      }}>
        <CheckoutForm car={car} buyerName={buyerName} buyerPhone={buyerPhone} onBack={() => setStep('form')} />
      </Elements>
    )
  }

  return (
    <div>
      <div style={{ background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)', marginBottom: '4px' }}>⚡ Réserve maintenant</p>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
          Paye un acompte de <strong style={{ color: 'var(--text)' }}>{depositF} €</strong> pour bloquer cette voiture. Le premier à payer réserve.
        </p>
      </div>

      <form onSubmit={handleProceed} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">Ton prénom *</label>
          <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Mohamed" required className="form-input" />
        </div>
        <div>
          <label className="form-label">Ton téléphone *</label>
          <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+33 6 12 34 56 78" required className="form-input" />
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '5px' }}>Le vendeur te contactera sur ce numéro.</p>
        </div>
        <div>
          <label className="form-label">Email <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— pour recevoir la confirmation</span></label>
          <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="ton@email.com" className="form-input" />
        </div>

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <><span className="spinner" />Préparation...</> : `Réserver pour ${depositF} €`}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        Paiement sécurisé par Stripe
      </p>
    </div>
  )
}
