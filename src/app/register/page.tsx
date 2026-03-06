'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Step = 1 | 2 | 3 | 4 | 5
type AccountType = 'pro' | 'autoentrepreneur' | 'particulier'

interface Form {
  email: string; password: string; confirmPassword: string
  firstName: string; lastName: string; phone: string
  address: string; city: string; postalCode: string; country: string; birthDate: string
  accountType: AccountType; companyName: string; siret: string; vatNumber: string
  website: string; snapchat: string; instagram: string; tiktok: string
  yearsExperience: string; carsPerMonth: string
  iban: string; bic: string; bankName: string; accountHolder: string
  bio: string; specialties: string[]; acceptTerms: boolean; acceptMarketing: boolean
}

const INIT: Form = {
  email: '', password: '', confirmPassword: '',
  firstName: '', lastName: '', phone: '', address: '', city: '', postalCode: '', country: 'FR', birthDate: '',
  accountType: 'pro', companyName: '', siret: '', vatNumber: '',
  website: '', snapchat: '', instagram: '', tiktok: '', yearsExperience: '', carsPerMonth: '',
  iban: '', bic: '', bankName: '', accountHolder: '',
  bio: '', specialties: [], acceptTerms: false, acceptMarketing: false,
}

const SPECIALTIES = ['Berlines', 'SUV / 4x4', 'Sportives', 'Utilitaires', 'Cabriolets', 'Électriques', 'Hybrides', 'Luxe', 'Import', 'Motos']

const I = (s: React.CSSProperties = {}): React.CSSProperties => ({
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 11, padding: '12px 16px', color: 'var(--text)',
  fontFamily: 'inherit', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s', appearance: 'none' as any, ...s,
})
const LB = (): React.CSSProperties => ({ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' as any, color: 'var(--text3)', marginBottom: 7 })

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<Form>(INIT)
  const [errs, setErrs] = useState<Partial<Record<keyof Form, string>>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrs(v => ({ ...v, [k]: '' }))
  }

  const pwStrength = () => [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/].filter(r => r.test(form.password)).length

  const validate = (s: Step) => {
    const e: Partial<Record<keyof Form, string>> = {}
    if (s === 1) {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
      if (form.password.length < 8) e.password = 'Minimum 8 caractères'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Mots de passe différents'
    }
    if (s === 2) {
      if (!form.firstName) e.firstName = 'Requis'
      if (!form.lastName) e.lastName = 'Requis'
      if (!form.phone) e.phone = 'Requis'
      if (!form.birthDate) e.birthDate = 'Requis'
    }
    if (s === 3 && form.accountType !== 'particulier' && !form.companyName) e.companyName = 'Requis'
    if (s === 5 && !form.acceptTerms) e.acceptTerms = 'Vous devez accepter les CGU'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => (s + 1) as Step) }
  const back = () => setStep(s => (s - 1) as Step)

  const submit = async () => {
    if (!validate(5)) return
    setLoading(true); setGlobalError('')
    try {
      const sb = createClient()
      const { data, error } = await sb.auth.signUp({ email: form.email, password: form.password, options: { data: { name: `${form.firstName} ${form.lastName}` } } })
      if (error) throw error
      if (data.user) {
        const { error: ie } = await sb.from('sellers').insert({
          id: data.user.id, email: form.email,
          name: `${form.firstName} ${form.lastName}`,
          first_name: form.firstName, last_name: form.lastName,
          phone: form.phone, address: form.address, city: form.city,
          postal_code: form.postalCode, country: form.country, birth_date: form.birthDate || null,
          account_type: form.accountType, company_name: form.companyName,
          siret: form.siret.replace(/\s/g, ''), vat_number: form.vatNumber,
          website: form.website, snapchat_handle: form.snapchat,
          instagram_handle: form.instagram, tiktok_handle: form.tiktok,
          years_experience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
          cars_per_month: form.carsPerMonth ? parseInt(form.carsPerMonth) : null,
          iban: form.iban.replace(/\s/g, ''), bic: form.bic,
          bank_name: form.bankName, account_holder: form.accountHolder,
          bio: form.bio, specialties: form.specialties,
          accept_marketing: form.acceptMarketing, subscription_status: 'inactive',
        })
        if (ie) throw ie
        router.push('/dashboard')
      }
    } catch (e: any) { setGlobalError(e.message || 'Erreur'); setLoading(false) }
  }

  const STEPS = ['Compte', 'Identité', 'Activité', 'Paiement', 'Profil']
  const TITLES = [
    ['Crée ton accès', 'Email et mot de passe sécurisé'],
    ['Ton identité', 'Requis par la réglementation — jamais partagé'],
    ['Ton activité', 'Statut professionnel et présence en ligne'],
    ['Coordonnées bancaires', 'Chiffré AES-256 · Pour recevoir tes virements'],
    ['Profil public', 'Ce que les acheteurs verront'],
  ]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px 80px', fontFamily: 'inherit' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.013) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, textDecoration: 'none', color: 'var(--text)', letterSpacing: '-0.03em' }}>
            Snap<span style={{ color: 'var(--brand)' }}>Reserve</span>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Inscription vendeur professionnel</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = n < step; const active = n === step
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.3s', background: done ? 'var(--brand)' : active ? 'var(--brand)' : 'var(--surface3)', border: done || active ? 'none' : '1px solid var(--border)', color: done || active ? '#fff' : 'var(--text3)' }}>
                    {done ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> : n}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: active ? 'var(--brand)' : done ? 'var(--text3)' : 'var(--text3)', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: done ? 'var(--brand)' : 'var(--border)', margin: '0 6px', marginBottom: 22, transition: 'background 0.3s' }} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>{TITLES[step-1][0]}</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{TITLES[step-1][1]}</p>
          </div>

          <div style={{ padding: '24px 28px' }}>

            {/* ── STEP 1 ── */}
            {step === 1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={LB()}>Email *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="ton@email.com" style={{ ...I(), borderColor: errs.email ? 'rgba(239,68,68,0.5)' : undefined }} />
                {errs.email && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.email}</p>}
              </div>
              <div>
                <label style={LB()}>Mot de passe *</label>
                <input type="password" value={form.password} onChange={set('password')} placeholder="Minimum 8 caractères" style={{ ...I(), borderColor: errs.password ? 'rgba(239,68,68,0.5)' : undefined }} />
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => {
                        const s = pwStrength()
                        const c = s <= 1 ? '#ef4444' : s <= 2 ? '#f59e0b' : '#22c55e'
                        return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= s ? c : 'var(--border2)', transition: 'background 0.3s' }} />
                      })}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>{['', 'Faible','Moyen','Fort','Très fort'][pwStrength()]}</p>
                  </div>
                )}
                {errs.password && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.password}</p>}
              </div>
              <div>
                <label style={LB()}>Confirmer le mot de passe *</label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" style={{ ...I(), borderColor: errs.confirmPassword ? 'rgba(239,68,68,0.5)' : undefined }} />
                {errs.confirmPassword && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.confirmPassword}</p>}
              </div>
            </div>}

            {/* ── STEP 2 ── */}
            {step === 2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LB()}>Prénom *</label>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="Mohamed" style={{ ...I(), borderColor: errs.firstName ? 'rgba(239,68,68,0.5)' : undefined }} />
                  {errs.firstName && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.firstName}</p>}
                </div>
                <div>
                  <label style={LB()}>Nom *</label>
                  <input value={form.lastName} onChange={set('lastName')} placeholder="Dupont" style={{ ...I(), borderColor: errs.lastName ? 'rgba(239,68,68,0.5)' : undefined }} />
                  {errs.lastName && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.lastName}</p>}
                </div>
              </div>
              <div>
                <label style={LB()}>Téléphone *</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 12 34 56 78" style={{ ...I(), borderColor: errs.phone ? 'rgba(239,68,68,0.5)' : undefined }} />
                {errs.phone && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.phone}</p>}
              </div>
              <div>
                <label style={LB()}>Date de naissance *</label>
                <input type="date" value={form.birthDate} onChange={set('birthDate')} style={{ ...I(), borderColor: errs.birthDate ? 'rgba(239,68,68,0.5)' : undefined }} />
                {errs.birthDate && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.birthDate}</p>}
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Vérification d'identité — vous devez être majeur</p>
              </div>
              <div>
                <label style={LB()}>Adresse</label>
                <input value={form.address} onChange={set('address')} placeholder="12 rue de la Paix" style={I()} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                <div>
                  <label style={LB()}>Code postal</label>
                  <input value={form.postalCode} onChange={set('postalCode')} placeholder="75001" style={I()} />
                </div>
                <div>
                  <label style={LB()}>Ville</label>
                  <input value={form.city} onChange={set('city')} placeholder="Paris" style={I()} />
                </div>
              </div>
              <div>
                <label style={LB()}>Pays</label>
                <select value={form.country} onChange={set('country')} style={{ ...I(), backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2344445a' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer' }}>
                  {[['FR','🇫🇷 France'],['BE','🇧🇪 Belgique'],['CH','🇨🇭 Suisse'],['LU','🇱🇺 Luxembourg'],['MA','🇲🇦 Maroc'],['TN','🇹🇳 Tunisie'],['DZ','🇩🇿 Algérie']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>}

            {/* ── STEP 3 ── */}
            {step === 3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={LB()}>Type de compte *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {([['pro','🏢','Société'],['autoentrepreneur','🧑‍💼','Auto-entrepreneur'],['particulier','👤','Particulier']] as [AccountType,string,string][]).map(([v,emoji,label]) => (
                    <button key={v} type="button" onClick={() => setForm(f => ({ ...f, accountType: v }))}
                      style={{ padding: '14px 8px', background: form.accountType === v ? 'var(--brand-dim2)' : 'var(--surface2)', border: `1.5px solid ${form.accountType === v ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, color: form.accountType === v ? 'var(--brand)' : 'var(--text2)', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.accountType !== 'particulier' && <>
                <div>
                  <label style={LB()}>Raison sociale *</label>
                  <input value={form.companyName} onChange={set('companyName')} placeholder="Auto Mohamed SARL" style={{ ...I(), borderColor: errs.companyName ? 'rgba(239,68,68,0.5)' : undefined }} />
                  {errs.companyName && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errs.companyName}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={LB()}>SIRET</label>
                    <input value={form.siret} onChange={set('siret')} placeholder="123 456 789 12345" style={I()} />
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>14 chiffres</p>
                  </div>
                  <div>
                    <label style={LB()}>N° TVA</label>
                    <input value={form.vatNumber} onChange={set('vatNumber')} placeholder="FR12345678901" style={I()} />
                  </div>
                </div>
              </>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LB()}>Années d'expérience</label>
                  <select value={form.yearsExperience} onChange={set('yearsExperience')} style={{ ...I(), backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2344445a' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer' }}>
                    <option value="">—</option>
                    {["Moins d'1 an","1-2 ans","3-5 ans","5-10 ans","+10 ans"].map((v,i) => <option key={i} value={i}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LB()}>Voitures / mois</label>
                  <select value={form.carsPerMonth} onChange={set('carsPerMonth')} style={{ ...I(), backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2344445a' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer' }}>
                    <option value="">—</option>
                    {["1-5","6-15","16-30","30-50","+50"].map((v,i) => <option key={i} value={i}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
                <p style={{ ...LB(), marginBottom: 14 }}>Présence en ligne</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['snapchat','👻','ton_pseudo_snap'],['instagram','📸','@ton_instagram'],['tiktok','🎵','@ton_tiktok'],['website','🌐','https://ton-site.com']].map(([f,icon,ph]) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                      <input value={(form as any)[f]} onChange={set(f as keyof Form)} placeholder={ph} style={{ ...I(), flex: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>}

            {/* ── STEP 4 ── */}
            {step === 4 && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.16)', borderRadius: 12, padding: '13px 16px', display: 'flex', gap: 10 }}>
                <svg width="15" height="15" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--green)', display: 'block', marginBottom: 2 }}>Données chiffrées et sécurisées</strong>
                  Ton IBAN est chiffré (AES-256). Il ne sera jamais partagé avec des tiers et sert uniquement aux virements d'acomptes.
                </p>
              </div>
              <div>
                <label style={LB()}>Titulaire du compte</label>
                <input value={form.accountHolder} onChange={set('accountHolder')} placeholder="Mohamed DUPONT" style={I()} />
              </div>
              <div>
                <label style={LB()}>IBAN</label>
                <input value={form.iban} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" style={{ ...I(), letterSpacing: '0.05em', fontFamily: 'monospace' }}
                  onChange={e => { const v = e.target.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase().replace(/(.{4})/g,'$1 ').trim(); setForm(f => ({...f, iban: v})) }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LB()}>BIC / SWIFT</label>
                  <input value={form.bic} onChange={set('bic')} placeholder="BNPAFRPPXXX" style={{ ...I(), textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={LB()}>Banque</label>
                  <input value={form.bankName} onChange={set('bankName')} placeholder="BNP Paribas" style={I()} />
                </div>
              </div>
              <div style={{ background: 'var(--brand-dim)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 12, padding: '13px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                  💡 Les coordonnées bancaires sont <strong style={{ color: 'var(--text)' }}>optionnelles</strong> à l'inscription. Tu pourras les ajouter dans <strong style={{ color: 'var(--text)' }}>Dashboard → Profil</strong>.
                </p>
              </div>
            </div>}

            {/* ── STEP 5 ── */}
            {step === 5 && <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={LB()}>Bio / Présentation</label>
                <textarea value={form.bio} onChange={set('bio')} placeholder="Vendeur pro depuis 5 ans, spécialisé dans les berlines et SUV..." rows={3} style={{ ...I(), resize: 'vertical', minHeight: 80 }} />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Visible par tous les acheteurs</p>
              </div>

              <div>
                <label style={LB()}>Spécialités</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s] }))}
                      style={{ padding: '6px 14px', background: form.specialties.includes(s) ? 'var(--brand-dim2)' : 'var(--surface2)', border: `1px solid ${form.specialties.includes(s) ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 999, fontSize: 12, fontWeight: 500, color: form.specialties.includes(s) ? 'var(--brand)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { k: 'acceptTerms' as keyof Form, label: "J'accepte les Conditions Générales d'Utilisation", req: true },
                  { k: 'acceptMarketing' as keyof Form, label: 'Je souhaite recevoir les actualités et offres SnapReserve', req: false },
                ].map(({ k, label, req }) => (
                  <label key={k as string} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <div onClick={() => setForm(f => ({ ...f, [k]: !f[k] }))}
                      style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form[k] ? 'var(--brand)' : 'var(--border)'}`, background: form[k] ? 'var(--brand-dim2)' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                      {form[k] && <svg width="10" height="10" fill="none" stroke="var(--brand)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                      {label}{req && <span style={{ color: 'var(--brand)' }}> *</span>}
                    </span>
                  </label>
                ))}
                {errs.acceptTerms && <p style={{ fontSize: 11, color: 'var(--red)' }}>{errs.acceptTerms}</p>}
              </div>

              {globalError && (
                <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--red)' }}>{globalError}</div>
              )}
            </div>}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              {step > 1 && (
                <button type="button" onClick={back} className="btn btn-secondary" style={{ flex: 1 }}>← Retour</button>
              )}
              {step < 5 ? (
                <button type="button" onClick={next} className="btn btn-primary" style={{ flex: 2 }}>Continuer →</button>
              ) : (
                <button type="button" onClick={submit} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {loading ? <><span className="spinner" />Création...</> : '🎉 Créer mon compte'}
                </button>
              )}
            </div>

            {step === 4 && (
              <button type="button" onClick={() => setStep(5)} style={{ width: '100%', marginTop: 8, padding: 8, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                Passer — ajouter plus tard
              </button>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: 18, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--brand)', width: `${(step / 5) * 100}%`, transition: 'width 0.4s ease', borderRadius: 1 }} />
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
      <style>{`input:focus,select:focus,textarea:focus{border-color:rgba(249,115,22,0.5)!important;outline:none;box-shadow:0 0 0 3px rgba(249,115,22,0.07)!important}input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4);cursor:pointer}`}</style>
    </main>
  )
}
