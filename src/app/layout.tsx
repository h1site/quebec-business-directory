import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.GOOGLE_SITE_VERIFICATION ||
  ''

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://registreduquebec.com'),
  title: {
    default: 'Registre du Québec — Annuaire d\'entreprises',
    template: '%s | Registre du Québec',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logos/logo-favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/images/logos/logo-favicon.png',
  },
  description:
    'Trouvez parmi 7 000+ entreprises québécoises vérifiées. Coordonnées, avis Google et informations pour toutes les régions du Québec.',
  authors: [{ name: 'Registre du Québec' }],
  creator: 'Registre du Québec',
  publisher: 'Registre du Québec',
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    alternateLocale: 'en_CA',
    siteName: 'Registre du Québec',
    title: 'Registre du Québec — Annuaire d\'entreprises',
    description: 'Trouvez parmi 7 000+ entreprises québécoises vérifiées.',
    // Image OG générée dynamiquement via opengraph-image.tsx (format PNG)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Registre des entreprises du Québec',
    description: 'Plus de 7 000 entreprises québécoises vérifiées à découvrir',
  },
  // Pas de directive index/noindex forcée ici : l'indexation est pilotée par le
  // middleware (X-Robots-Tag). Les pages hors liste blanche reçoivent noindex ;
  // les pages piliers + blog restent indexables par défaut. On garde seulement
  // les préférences d'affichage de snippet pour les pages indexables.
  robots: {
    googleBot: {
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
    <html lang="fr" className="dark">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap-index.xml" />
        {/* Preconnect to critical 3rd parties */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Consent Mode v2 — défaut GRANTED (pas de bannière) → annonces
            personnalisées = CPM plus élevé (réplique pecheurquebec, RPM ~6 $).
            NOTE légale : la Loi 25 (CAI) impose en théorie l'opt-in explicite pour
            les cookies non essentiels. Restaurer une bannière si la CAI audite. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              security_storage: 'granted',
            });
          `}
        </Script>
        {/* Google Tag (gtag.js) - lazyOnload to reduce blocking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NF84WEBS49"
          strategy="lazyOnload"
        />
        <Script id="google-tag" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NF84WEBS49');
          `}
        </Script>
        {/* Google AdSense — placements manuels uniquement.
            Auto Ads (enable_page_level_ads) désactivées : au round 2 elles ont
            fait chuter le remplissage ~4× (0,37 → 0,096 annonce/pageview) en
            entrant en conflit avec les <ins> manuels. On garde le contrôle des
            zones high-RPM en manuel. */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8781698761921917"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {/* L'anchor AdSense natif réserve de la hauteur via une marge/padding bas
            en inline !important sur <body>. Cet observer la remet à 0 → aucun trou
            sous le footer (la pub ancrée flotte par-dessus). Active l'Anchor +
            la Vignette dans le dashboard AdSense pour profiter de ce format. */}
        <Script id="anchor-gap-fix" strategy="afterInteractive">
          {`(function(){
            function z(el){ if(!el) return;
              if(el.style.marginBottom!=='0px') el.style.setProperty('margin-bottom','0','important');
              if(el.style.paddingBottom!=='0px') el.style.setProperty('padding-bottom','0','important');
            }
            function reset(){ z(document.body); z(document.documentElement); }
            reset();
            try{
              var mo=new MutationObserver(reset);
              mo.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
              if(document.body) mo.observe(document.body,{attributes:true,attributeFilter:['style']});
            }catch(e){}
            window.addEventListener('load',reset);
          })();`}
        </Script>
      </head>
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased`}>
          {children}
      </body>
    </html>
  )
}
