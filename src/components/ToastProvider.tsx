'use client'
import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border2)',
          borderRadius: '12px',
          fontSize: '13px',
          fontFamily: 'var(--font-body), sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        },
        success: { iconTheme: { primary: 'var(--green)', secondary: 'transparent' } },
        error: { iconTheme: { primary: 'var(--red)', secondary: 'transparent' } },
      }}
    />
  )
}
