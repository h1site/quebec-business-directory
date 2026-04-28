import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page non trouvée — 404',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <html lang="fr" className="dark">
      <body style={{ margin: 0, background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: 560, textAlign: 'center' }}>
            <h1 style={{ fontSize: '5rem', margin: 0, color: '#0ea5e9' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page non trouvée</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
              La page que vous cherchez n&apos;existe pas ou a été déplacée.
              Vous pouvez retourner à l&apos;accueil ou utiliser la recherche.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '0.75rem 1.5rem', background: '#0ea5e9', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
                Retour à l&apos;accueil
              </Link>
              <Link href="/recherche" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                Rechercher une entreprise
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
