'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Car } from '@/lib/types'

const STEPS = [
  { n: '01', title: 'Publie', desc: 'Photos, prix, acompte. Un lien unique est généré.' },
  { n: '02', title: 'Partage', desc: 'Colle le lien sur Snap. La preview s\'affiche dans le chat.' },
  { n: '03', title: 'Encaisse', desc: 'Le premier qui paye réserve. Les autres sont remboursés auto.' },
  { n: '04', title: 'Contacte', desc: 'Tu reçois le nom + numéro de l\'acheteur par SMS et email.' },
]

const PROOFS = [
  { quote: 'J\'ai vendu une Clio en 8 minutes. Le gars a vu le lien sur Snap, il a payé.', name: 'Sofiane', loc: 'Paris', stat: '41 ventes' },
  { quote: 'Avant 5 personnes disaient "je prends". Maintenant c\'est blindé, zéro conflit.', name: 'Karim', loc: 'Lyon', stat: '23 ventes' },
  { quote: 'Mes abonnés font confiance. Le lien est propre, le paiement est sécurisé.', name: 'Yacine', loc: 'Marseille', stat: '17 ventes' },
]

function AnimNum({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      let cur = 0
      const inc = Math.ceil(to / 50)
      const id = setInterval(() => {
        cur = Math.min(cur + inc, to)
        setV(cur)
        if (cur >= to) clearInterval(id)
      }, 24)
    }, { threshold: 0.6 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <b ref={ref}>{v.toLocaleString('fr-FR')}{suffix}</b>
}

function PublicCarCard({ car }: { car: Car }) {
  const price = (car.price / 100).toLocaleString('fr-FR')
  const deposit = (car.deposit / 100).toLocaleString('fr-FR')
  return (
    <Link href={`/car/${car.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#fff', border: '1.5px solid rgba(13,13,13,0.08)', borderRadius: '20px', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' }}
      className="car-public-card">
      <div style={{ aspectRatio: '16/10', background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', overflow: 'hidden', position: 'relative' }}>
        {car.photos?.[0]
          ? <img src={car.photos[0]} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🚗</div>
        }
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px' }}>
          ● DISPONIBLE
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        {(car as any).sellers?.name && (
          <p style={{ fontSize: '11px', color: 'rgba(13,13,13,0.4)', marginBottom: '4px', fontWeight: 500 }}>par {(car as any).sellers.name}</p>
        )}
        <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.3 }}>{car.title}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(13,13,13,0.4)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prix</p>
            <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '0.5px' }}>{price} €</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'rgba(13,13,13,0.4)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Acompte</p>
            <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '0.5px', color: '#f97316' }}>{deposit} €</p>
          </div>
        </div>
        <div style={{ marginTop: '14px', background: '#0d0d0d', color: '#f5f0e8', borderRadius: '10px', padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
          Réserver maintenant →
        </div>
      </div>
    </Link>
  )
}

export default function LandingClient({ cars }: { cars: Car[] }) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const id = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(id) }, [])

  return (
    <div style={{ background: '#f5f0e8', color: '#0d0d0d', fontFamily: '"DM Sans", system-ui, sans-serif', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #f97316; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f5f0e8; }
        ::-webkit-scrollbar-thumb { background: #0d0d0d; border-radius: 2px; }

        .hero-word { display: block; overflow: hidden; }
        .hero-word span {
          display: block;
          transform: translateY(${loaded ? '0' : '100%'});
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-word:nth-child(1) span { transition-delay: 0s; }
        .hero-word:nth-child(2) span { transition-delay: 0.08s; }
        .hero-word:nth-child(3) span { transition-delay: 0.16s; }

        .fade-in {
          opacity: ${loaded ? 1 : 0};
          transform: translateY(${loaded ? '0' : '16px'});
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-in-1 { transition-delay: 0.5s; }
        .fade-in-2 { transition-delay: 0.65s; }
        .fade-in-3 { transition-delay: 0.8s; }

        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 22s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .step-card { border: 1.5px solid #0d0d0d; border-radius: 20px; padding: 28px 24px; background: #f5f0e8; transition: background 0.2s, color 0.2s, transform 0.2s; }
        .step-card:hover { background: #0d0d0d; color: #f5f0e8; transform: translateY(-4px); }
        .step-card:hover .step-num { color: #f97316; }
        .step-card:hover .step-desc { color: rgba(245,240,232,0.6); }

        .proof-card { border: 1.5px solid rgba(13,13,13,0.1); border-radius: 20px; padding: 28px; background: #fff; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .proof-card:hover { border-color: #f97316; box-shadow: 0 12px 40px rgba(249,115,22,0.12); transform: translateY(-3px); }

        .car-public-card:hover { border-color: #f97316 !important; transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }

        .cta-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: #0d0d0d; color: #f5f0e8 !important; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; border: 2px solid #0d0d0d; border-radius: 100px; text-decoration: none; transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s; }
        .cta-btn:hover { background: #f97316; border-color: #f97316; color: #fff !important; transform: translateY(-2px); box-shadow: 0 16px 48px rgba(249,115,22,0.35); }

        .cta-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: transparent; color: #0d0d0d !important; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; border: 1.5px solid rgba(13,13,13,0.25); border-radius: 100px; text-decoration: none; transition: border-color 0.2s; }
        .cta-btn-ghost:hover { border-color: #0d0d0d; }

        .cta-btn-orange { display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; background: #f97316; color: #fff !important; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; border-radius: 100px; text-decoration: none; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .cta-btn-orange:hover { background: #fb923c; transform: translateY(-2px); box-shadow: 0 20px 60px rgba(249,115,22,0.4); }

        .cta-btn-outline-light { display: inline-flex; align-items: center; gap: 8px; padding: 16px 28px; border: 1.5px solid rgba(245,240,232,0.15); color: rgba(245,240,232,0.6) !important; font-weight: 500; font-size: 15px; border-radius: 100px; text-decoration: none; transition: border-color 0.2s, color 0.2s; }
        .cta-btn-outline-light:hover { border-color: rgba(245,240,232,0.35); color: #f5f0e8 !important; }

        .pricing-link { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px; background: #f97316; color: #fff !important; font-weight: 700; font-size: 15px; border-radius: 12px; text-decoration: none; transition: background 0.2s, transform 0.15s; }
        .pricing-link:hover { background: #fb923c; transform: translateY(-1px); }

        .feature-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1.5px solid rgba(13,13,13,0.08); border-radius: 12px; transition: border-color 0.2s, background 0.2s; }
        .feature-item:hover { border-color: #f97316; background: rgba(249,115,22,0.03); }

        .nav-link { font-size: 13px; font-weight: 500; color: rgba(13,13,13,0.5); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #0d0d0d; }

        .feature-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid rgba(13,13,13,0.12); border-radius: 100px; font-size: 12px; font-weight: 500; color: rgba(13,13,13,0.55); background: rgba(255,255,255,0.5); transition: border-color 0.2s, color 0.2s; }
        .feature-pill:hover { border-color: #f97316; color: #f97316; }

        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }

        @media (max-width: 768px) { .hide-mobile { display: none !important; } .show-mobile { display: flex !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(245,240,232,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(13,13,13,0.08)' }}>
        <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '2px' }}>SNAP<span style={{ color: '#f97316' }}>RESERVE</span></span>
        <div className="hide-mobile" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a href="#comment" className="nav-link">Comment ça marche</a>
          <Link href="/pricing" className="nav-link">Tarifs</Link>
          <Link href="/login" className="nav-link">Connexion</Link>
        </div>
        <Link href="/register" className="cta-btn hide-mobile" style={{ padding: '9px 22px', fontSize: '13px' }}>
          Commencer <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <Link href="/register" className="show-mobile cta-btn" style={{ padding: '8px 18px', fontSize: '13px' }}>Commencer →</Link>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vh,100px) clamp(24px,5vw,80px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '10%', width: 'clamp(280px,40vw,560px)', height: 'clamp(280px,40vw,560px)', borderRadius: '50%', border: '1px solid rgba(13,13,13,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '2%', top: '18%', width: 'clamp(180px,26vw,380px)', height: 'clamp(180px,26vw,380px)', borderRadius: '50%', border: '1px solid rgba(13,13,13,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '9%', top: '26%', width: 'clamp(100px,14vw,220px)', height: 'clamp(100px,14vw,220px)', borderRadius: '50%', background: '#f97316', opacity: 0.12, pointerEvents: 'none' }} />

        <div className="hide-mobile" style={{ position: 'absolute', right: 'clamp(40px,8vw,120px)', top: '50%', transform: 'translateY(-50%)', width: '260px', animation: 'float 4s ease-in-out infinite', opacity: loaded ? 1 : 0, transition: 'opacity 1s ease 1s' }}>
          <div style={{ background: '#fff', border: '1.5px solid rgba(13,13,13,0.1)', borderRadius: '20px', padding: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ width: '100%', aspectRatio: '16/10', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🚗</div>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>BMW Série 3 — 2019</p>
            <p style={{ fontSize: '12px', color: 'rgba(13,13,13,0.4)', marginBottom: '14px' }}>22 000 € · Acompte 1 000 €</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(34,197,94,0.2)' }}>● Disponible</span>
              <span style={{ fontSize: '11px', color: 'rgba(13,13,13,0.4)' }}>2 regardent</span>
            </div>
            <div style={{ background: '#0d0d0d', color: '#f5f0e8', borderRadius: '10px', padding: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>Réserver — 1 000 €</div>
          </div>
          <div style={{ position: 'absolute', top: '-14px', right: '-14px', background: '#f97316', color: '#fff', borderRadius: '12px', padding: '8px 12px', fontSize: '11px', fontWeight: 700, boxShadow: '0 8px 24px rgba(249,115,22,0.4)', whiteSpace: 'nowrap' }}>🔔 Réservée !</div>
        </div>

        <div className="fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '100px', padding: '6px 14px 6px 8px', width: 'fit-content', marginBottom: '28px' }}>
          <span style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f97316', letterSpacing: '0.5px' }}>Vendeurs Snapchat · 19,99€/mois</span>
        </div>

        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(72px,11vw,160px)', lineHeight: 0.9, letterSpacing: '1px', marginBottom: '28px', maxWidth: '700px' }}>
          <span className="hero-word"><span>FINI LES</span></span>
          <span className="hero-word"><span style={{ color: '#f97316' }}>CONFLITS</span></span>
          <span className="hero-word"><span>D'ACOMPTE</span></span>
        </h1>

        <p className="fade-in fade-in-1" style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'rgba(13,13,13,0.55)', lineHeight: 1.8, maxWidth: '420px', marginBottom: '36px', fontWeight: 300 }}>
          Publie ta voiture, partage le lien sur Snap.<br />
          <span style={{ color: '#0d0d0d', fontWeight: 500 }}>Le premier qui paye réserve</span> — les autres sont remboursés automatiquement.
        </p>

        <div className="fade-in fade-in-2" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '52px' }}>
          <Link href="/register" className="cta-btn">Créer mon compte <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
          <Link href="/pricing" className="cta-btn-ghost">Voir les tarifs</Link>
        </div>

        <div className="fade-in fade-in-3" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['⚡ Réservation instantanée', '🔒 Paiement Stripe', '📱 100% mobile', '📧 Notifs SMS + Email', '🔄 Remboursement auto'].map((t, i) => (
            <span key={i} className="feature-pill">{t}</span>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', borderTop: '1.5px solid #0d0d0d', borderBottom: '1.5px solid #0d0d0d', background: '#0d0d0d', padding: '16px 0' }}>
        <div className="ticker-track" style={{ display: 'flex', width: 'max-content', gap: '64px' }}>
          {Array(4).fill(['RÉSERVATION INSTANTANÉE', '✦', 'ZÉRO CONFLIT', '✦', 'PREMIER PAYÉ = RÉSERVÉ', '✦', 'REMBOURSEMENT AUTO', '✦', 'LIENS SNAPCHAT OPTIMISÉS', '✦', '100% MOBILE', '✦']).flat().map((t, i) => (
            <span key={i} style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', letterSpacing: '3px', color: t === '✦' ? '#f97316' : 'rgba(245,240,232,0.5)', whiteSpace: 'nowrap' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding: 'clamp(60px,8vh,100px) clamp(24px,5vw,80px)', borderBottom: '1.5px solid rgba(13,13,13,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(13,13,13,0.08)', border: '1.5px solid rgba(13,13,13,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
          {[
            { val: 0, suf: '', label: 'conflit garanti', sub: 'Le système est atomique', col: '#22c55e' },
            { val: 2, suf: ' min', label: 'pour publier', sub: 'Photos, prix, lien prêt', col: '#0d0d0d' },
            { val: 5, suf: '%', label: 'de frais seulement', sub: 'Tout le reste te revient', col: '#f97316' },
            { val: 100, suf: '%', label: 'automatisé', sub: 'Remboursements inclus', col: '#0d0d0d' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '36px 32px', background: '#f5f0e8' }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(48px,5vw,72px)', lineHeight: 1, color: s.col, marginBottom: '8px', letterSpacing: '1px' }}><AnimNum to={s.val} suffix={s.suf} /></div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: 'rgba(13,13,13,0.4)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment" style={{ padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,80px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(48px,6vw,80px)', letterSpacing: '2px', lineHeight: 1, flex: 1 }}>4 ÉTAPES,<br /><span style={{ color: '#f97316' }}>ZÉRO PRISE DE TÊTE</span></h2>
          <p style={{ fontSize: '15px', color: 'rgba(13,13,13,0.5)', maxWidth: '300px', lineHeight: 1.8, alignSelf: 'flex-end', fontWeight: 300 }}>De la publication à la réservation, tout est automatisé.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {STEPS.map((s, i) => (
            <div key={i} className="step-card">
              <span className="step-num" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', color: 'rgba(13,13,13,0.12)', lineHeight: 1, display: 'block', marginBottom: '16px', transition: 'color 0.2s' }}>{s.n}</span>
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', letterSpacing: '1px', marginBottom: '10px' }}>{s.title}</p>
              <p className="step-desc" style={{ fontSize: '13px', color: 'rgba(13,13,13,0.5)', lineHeight: 1.7, transition: 'color 0.2s' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPLIT */}
      <section style={{ borderTop: '1.5px solid rgba(13,13,13,0.08)', borderBottom: '1.5px solid rgba(13,13,13,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ background: '#0d0d0d', color: '#f5f0e8', padding: 'clamp(48px,6vw,80px) clamp(32px,5vw,72px)' }}>
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '24px' }}>POUR L'ACHETEUR</p>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,4vw,56px)', lineHeight: 1, marginBottom: '28px', letterSpacing: '1px' }}>UNE PAGE.<br />UN PAIEMENT.<br /><span style={{ color: '#f97316' }}>UNE RÉPONSE.</span></h3>
          <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.5)', lineHeight: 1.8, marginBottom: '32px', fontWeight: 300 }}>L'acheteur arrive sur la page, voit la voiture, paye l'acompte. Si c'est trop tard, il est remboursé en quelques secondes.</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Renault Clio — 2020</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '3px 8px', borderRadius: '100px' }}>● Disponible</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Prix</p>
                <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', letterSpacing: '1px' }}>8 500 €</p>
              </div>
              <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Acompte</p>
                <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', letterSpacing: '1px', color: '#f97316' }}>400 €</p>
              </div>
            </div>
            <div style={{ background: '#f97316', borderRadius: '10px', padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>🔒 Payer 400 € et réserver</div>
          </div>
        </div>
        <div style={{ background: '#fff', padding: 'clamp(48px,6vw,80px) clamp(32px,5vw,72px)' }}>
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '24px' }}>POUR LE VENDEUR</p>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,4vw,56px)', lineHeight: 1, marginBottom: '28px', letterSpacing: '1px' }}>TU PUBLIES.<br />TU PARTAGES.<br /><span style={{ color: '#f97316' }}>TU ENCAISSES.</span></h3>
          <p style={{ fontSize: '14px', color: 'rgba(13,13,13,0.5)', lineHeight: 1.8, marginBottom: '32px', fontWeight: 300 }}>En 2 minutes tu as un lien prêt à coller sur Snap. Tu reçois le nom et le numéro de l'acheteur par email et SMS dès que c'est payé.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[{ icon: '⚡', text: 'Lien unique par voiture, prêt en 2 min' }, { icon: '🔔', text: 'SMS + email dès la réservation' }, { icon: '📊', text: 'Dashboard avec toutes tes réservations' }, { icon: '💸', text: '5% de frais seulement — tout le reste pour toi' }].map((f, i) => (
              <div key={i} className="feature-item">
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOITURES EN LIGNE */}
      {cars.length > 0 && (
        <section style={{ padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,80px)', borderBottom: '1.5px solid rgba(13,13,13,0.08)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '48px' }}>
            <div>
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '12px' }}>EN CE MOMENT</p>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(42px,5.5vw,72px)', letterSpacing: '2px', lineHeight: 1 }}>
                VOITURES<br /><span style={{ color: '#f97316' }}>DISPONIBLES</span>
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '100px', padding: '8px 16px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', animation: 'float 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>{cars.length} voiture{cars.length > 1 ? 's' : ''} en ligne</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {cars.map(car => <PublicCarCard key={car.id} car={car} />)}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section style={{ padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,80px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(42px,5.5vw,72px)', letterSpacing: '2px', lineHeight: 1 }}>ILS VENDENT<br /><span style={{ color: '#f97316' }}>SANS CONFLIT</span></h2>
          <Link href="/register" className="cta-btn" style={{ flexShrink: 0 }}>Rejoindre <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {PROOFS.map((p, i) => (
            <div key={i} className="proof-card">
              <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>{[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f97316', fontSize: '14px' }}>★</span>)}</div>
              <p style={{ fontSize: '15px', color: 'rgba(13,13,13,0.7)', lineHeight: 1.8, marginBottom: '24px', fontWeight: 300, fontStyle: 'italic' }}>"{p.quote}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(13,13,13,0.07)', paddingTop: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{p.name} · <span style={{ fontWeight: 400, color: 'rgba(13,13,13,0.4)' }}>{p.loc}</span></p>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '14px', letterSpacing: '1px', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', padding: '4px 10px', borderRadius: '100px' }}>{p.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,80px)', background: '#0d0d0d', color: '#f5f0e8' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ flex: '1 1 280px' }}>
            <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '20px' }}>TARIFICATION</p>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(52px,6vw,88px)', lineHeight: 0.95, letterSpacing: '1px', marginBottom: '24px' }}>UN SEUL<br /><span style={{ color: '#f97316' }}>FORFAIT.</span><br />TOUT INCLUS.</h2>
            <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.8, maxWidth: '340px', fontWeight: 300 }}>Sans engagement, sans surprise. Annule quand tu veux depuis ton dashboard.</p>
          </div>
          <div style={{ flex: '0 1 380px' }}>
            <div style={{ border: '1.5px solid rgba(245,240,232,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c)' }} />
              <div style={{ padding: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 300, color: 'rgba(245,240,232,0.4)', marginTop: '10px' }}>€</span>
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '88px', lineHeight: 1, letterSpacing: '-2px' }}>19</span>
                  <div style={{ marginTop: '18px' }}>
                    <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: '#f97316' }}>,99</span>
                    <span style={{ display: 'block', fontSize: '12px', color: 'rgba(245,240,232,0.3)' }}>/mois</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.3)', marginBottom: '28px' }}>+ 5% de frais par acompte · Sans engagement</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {['Voitures illimitées', 'Paiements Stripe intégrés', 'Email + SMS automatiques', 'Statut temps réel', 'Liens Snapchat optimisés', 'Dashboard complet'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      <span style={{ fontSize: '13px', color: 'rgba(245,240,232,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
                  <span>💡</span>
                  <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.5)', lineHeight: 1.7 }}><strong style={{ color: 'rgba(245,240,232,0.8)' }}>5% de frais par acompte.</strong> 500€ → tu reçois <strong style={{ color: '#22c55e' }}>475€</strong>.</p>
                </div>
                <Link href="/register" className="pricing-link">Commencer maintenant <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: 'clamp(80px,10vh,120px) clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '16px' }}>FAQ</p>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,4.5vw,60px)', letterSpacing: '1px', lineHeight: 1, marginBottom: '48px' }}>LES QUESTIONS<br /><span style={{ color: '#f97316' }}>QU'ON NOUS POSE</span></h2>
          {[
            { q: 'Comment fonctionnent les 5% de frais ?', a: 'Sur chaque acompte encaissé, 5% reviennent à SnapReserve. Exemple : acompte 500€ → tu reçois 475€.' },
            { q: 'Que se passe-t-il si deux personnes paient en même temps ?', a: 'Le système est atomique. Le premier paiement validé réserve. Le second est remboursé automatiquement par Stripe.' },
            { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, depuis Dashboard → Facturation. L\'accès reste actif jusqu\'à la fin de la période payée.' },
            { q: 'Est-ce que ça marche depuis Snapchat ?', a: 'Parfaitement. Le lien génère une preview riche directement dans le chat Snapchat.' },
            { q: 'Que se passe-t-il sans abonnement ?', a: 'Tu ne peux plus publier. Les annonces existantes restent visibles mais les acheteurs ne peuvent pas réserver.' },
          ].map((f, i) => (
            <details key={i} style={{ borderBottom: '1.5px solid rgba(13,13,13,0.08)' }}>
              <summary style={{ padding: '20px 0', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', color: '#0d0d0d', listStyle: 'none' }}>
                {f.q}
                <span style={{ width: '28px', height: '28px', border: '1.5px solid rgba(13,13,13,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </span>
              </summary>
              <p style={{ fontSize: '14px', color: 'rgba(13,13,13,0.5)', lineHeight: 1.8, padding: '0 0 20px', fontWeight: 300 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '0 clamp(24px,5vw,80px) clamp(80px,10vh,120px)' }}>
        <div style={{ position: 'relative', background: '#0d0d0d', borderRadius: '28px', padding: 'clamp(52px,7vw,96px) clamp(32px,5vw,72px)', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(249,115,22,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <p style={{ position: 'relative', fontFamily: '"Bebas Neue", sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#f97316', marginBottom: '20px' }}>PRÊT ?</p>
          <h2 style={{ position: 'relative', fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(48px,6.5vw,96px)', lineHeight: 0.95, letterSpacing: '1px', color: '#f5f0e8', marginBottom: '20px' }}>VEND SANS CONFLIT,<br /><span style={{ color: '#f97316' }}>DÈS CE SOIR.</span></h2>
          <p style={{ position: 'relative', fontSize: '16px', color: 'rgba(245,240,232,0.4)', marginBottom: '40px', fontWeight: 300 }}>19,99€/mois — sans engagement — prêt en 2 minutes.</p>
          <div style={{ position: 'relative', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="cta-btn-orange">Créer mon compte gratuit <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
            <Link href="/pricing" className="cta-btn-outline-light">Voir les tarifs</Link>
          </div>
          <p style={{ position: 'relative', marginTop: '20px', fontSize: '12px', color: 'rgba(245,240,232,0.2)' }}>Aucune carte requise · Paiement sécurisé par Stripe</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1.5px solid rgba(13,13,13,0.08)', padding: '32px clamp(24px,5vw,80px)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', letterSpacing: '2px' }}>SNAP<span style={{ color: '#f97316' }}>RESERVE</span></span>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[{ href: '/pricing', l: 'Tarifs' }, { href: '/login', l: 'Connexion' }, { href: '/register', l: 'Inscription' }].map(({ href, l }) => (
            <Link key={href} href={href} className="nav-link">{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(13,13,13,0.3)' }}>© 2026 SnapReserve</p>
      </footer>
    </div>
  )
}
