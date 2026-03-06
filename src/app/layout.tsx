import type { Metadata } from 'next'
import { Syne, Instrument_Sans } from 'next/font/google'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400','600','700','800'],
  variable: '--font-display',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'SnapReserve — Réservez votre voiture en premier',
  description: 'La plateforme de réservation pour vendeurs de voitures sur Snapchat. Publiez, partagez, le premier paiement réserve.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://snapreserve.vercel.app'),
  openGraph: { siteName: 'SnapReserve', type: 'website' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${syne.variable} ${instrumentSans.variable} font-body`}>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
