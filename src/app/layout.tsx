import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.GOOGLE_SITE_VERIFICATION ||
  ''

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://registreduquebec.com'),
  title: {
    default: 'Registre des entreprises du Québec - Annuaire de plus de 600 000 entreprises',
    template: '%s | Registre du Québec',
  },
  description:
    'Trouvez facilement parmi plus de 600 000 entreprises québécoises. Annuaire complet avec coordonnées, avis Google et informations détaillées pour Montréal, Québec, Laval et toutes les régions du Québec.',
  authors: [{ name: 'Registre du Québec' }],
  creator: 'Registre du Québec',
  publisher: 'Registre du Québec',
  alternates: {
    canonical: 'https://registreduquebec.com',
    languages: {
      'fr-CA': 'https://registreduquebec.com',
      'en-CA': 'https://registreduquebec.com/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    alternateLocale: 'en_CA',
    siteName: 'Registre du Québec',
    title: 'Registre des entreprises du Québec - Plus de 600 000 entreprises',
    description: 'L\'annuaire le plus complet des entreprises québécoises. Trouvez coordonnées, avis et informations pour toutes les régions.',
    // Image OG générée dynamiquement via opengraph-image.tsx (format PNG)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Registre des entreprises du Québec',
    description: 'Plus de 600 000 entreprises québécoises à découvrir',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: googleVerification,
    other: {
      'msvalidate.01': '3BDF3C55AED4D0F84C471053DD0106CF',
    },
  },
  category: 'business',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NF84WEBS49"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NF84WEBS49');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
