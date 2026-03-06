'use client'
import { useState } from 'react'

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${title} — SnapReserve`, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handle} className="btn-primary" style={{ gap: '8px' }}>
      {copied ? (
        <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Lien copié !</>
      ) : (
        <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>Partager sur Snapchat</>
      )}
    </button>
  )
}
