import type { Metadata } from 'next'
import { Syne, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const plex = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FUTURESDESK — Binance USDT-M Dashboard',
  description: 'A personal dashboard for Binance USDT-M Futures: positions, PnL, funding, and account health.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${plex.variable}`}>
      <body className="min-h-screen bg-bg text-text">{children}</body>
    </html>
  )
}
