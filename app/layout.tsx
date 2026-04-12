import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SplashGate } from '@/components/ui/SplashGate'
import { PWAProvider } from '@/components/ui/PWAProvider'

/* ============================================================
   Root layout — server component. Exports metadata for SEO +
   PWA, renders <html> + <body>, wraps children in SplashGate
   (client-side cinematic intro) and PWAProvider (service
   worker registration).
   ============================================================ */

export const metadata: Metadata = {
  title: {
    default: 'Trepid — Discipline Engine',
    template: '%s | Trepid',
  },
  description:
    'Real-time behavioral discipline enforcement for forex traders. Your rules, enforced automatically.',
  keywords: ['forex', 'trading', 'discipline', 'risk management', 'prop firm'],
  authors: [{ name: 'Trepid' }],
  creator: 'Trepid',

  /* PWA */
  applicationName: 'Trepid',
  manifest: '/manifest.json',

  /* Apple Web App */
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trepid',
  },

  /* Open Graph */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Trepid — Discipline Engine',
    description:
      'Real-time behavioral discipline enforcement for forex traders.',
    siteName: 'Trepid',
  },

  /* Twitter */
  twitter: {
    card: 'summary_large_image',
    title: 'Trepid — Discipline Engine',
    description:
      'Real-time behavioral discipline enforcement for forex traders.',
  },

  /* Misc */
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ background: '#000000' }}>
      <head>
        {/* Standard PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Apple-specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Trepid" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />

        {/* Splash video preload */}
        <link rel="preload" href="/splash-video.mp4" as="video" type="video/mp4" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-96x96.png"
        />
      </head>
      <body className="bg-black" style={{ background: '#000000' }}>
        {/* PWA service worker registration */}
        <PWAProvider />

        {/* Cinematic splash intro (once per session) + app content */}
        <SplashGate>{children}</SplashGate>
      </body>
    </html>
  )
}
