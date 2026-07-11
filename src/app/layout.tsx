import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://registreduquebec.com'),
  title: {
    default: 'Registre du Québec — Guides pour entrepreneurs',
    template: '%s | Registre du Québec',
  },
  description:
    'Guides pratiques pour créer, financer et reprendre une entreprise au Québec : financement, repreneuriat et défis des PME en 2026.',
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: 'Registre du Québec',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <header className="border-b border-zinc-200">
          <div className="mx-auto max-w-3xl px-5 py-4">
            <Link href="/" className="font-semibold tracking-tight text-zinc-900 no-underline">
              Registre du Québec
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 mt-16">
          <div className="mx-auto max-w-3xl px-5 py-8 text-sm text-zinc-500">
            © 2026 Registre du Québec — Guides pour entrepreneurs québécois.
          </div>
        </footer>
      </body>
    </html>
  )
}
