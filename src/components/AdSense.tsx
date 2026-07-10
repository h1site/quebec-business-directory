'use client'

import { useEffect, useRef, useState } from 'react'

const CLIENT = 'ca-pub-8781698761921917'

interface AdSenseProps {
  /**
   * Ad slot ID from Google AdSense
   * Create slots at: https://adsense.google.com
   */
  slot: string
  /**
   * Ad format
   * - 'auto': Responsive (recommended)
   * - 'fluid': Fills container (use with `layout`)
   * - 'rectangle': Fixed rectangle
   * - 'autorelaxed': Multiplex / matched-content style (related content)
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'autorelaxed'
  /** 'in-article' (within content) | 'in-feed' (between list items) */
  layout?: 'in-article' | 'in-feed'
  /** Layout key for in-feed ads (from AdSense dashboard) */
  layoutKey?: string
  /** Full-width responsive mode */
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
  /**
   * Conservé pour compatibilité mais IGNORÉ : on est viewability-first (tout en
   * lazy 350px). Les emplacements above-the-fold intersectent de toute façon dès
   * le chargement, donc ils se chargent immédiatement sans avoir besoin d'`eager`.
   */
  eager?: boolean | 'desktop'
  /** Sans carte blanche ni label — pour l'anchor / conteneurs à chrome propre. */
  bare?: boolean
  /** Afficher le label « Publicité » (défaut: true si pas `bare`). */
  label?: boolean
}

/**
 * Google AdSense — viewability-first (réplique de pecheurquebec, RPM ~6 $).
 *
 * L'annonce n'entre dans la file AdSense (push) que lorsque son emplacement
 * approche du viewport (rootMargin 350px). Les emplacements above-the-fold
 * intersectent dès le chargement → ils se chargent immédiatement ; ceux du bas
 * attendent le scroll. Résultat : la viewability (et donc l'eCPM) monte, sans
 * perdre les impressions above-the-fold sur les bounces.
 *
 * Par défaut, chaque annonce est enveloppée dans une carte blanche lisible sur
 * n'importe quel fond (thème sombre inclus) avec un label « Publicité ».
 */
export default function AdSense({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  responsive = true,
  className = '',
  style = {},
  bare = false,
  label,
}: AdSenseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const pushed = useRef(false)

  // Lazy-load pour la viewability : on n'observe qu'à 350px du viewport.
  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: '350px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible || pushed.current) return
    // Évite le double-push (StrictMode / re-render) : ne pousse pas si l'unité
    // a déjà été initialisée par AdSense.
    const insEl = ref.current?.querySelector('ins.adsbygoogle')
    if (insEl?.getAttribute('data-adsbygoogle-status')) {
      pushed.current = true
      return
    }
    pushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [visible])

  const baseStyle: React.CSSProperties = {
    display: 'block',
    textAlign: layout ? 'center' : undefined,
    ...style,
  }

  const ins = visible ? (
    <ins
      className="adsbygoogle"
      style={baseStyle}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-ad-layout-key={layoutKey}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  ) : null

  // Mode « nu » : pas de carte (l'appelant fournit son propre habillage).
  if (bare) {
    return (
      <div ref={ref} className={`adsense-container ${className}`}>
        {ins}
      </div>
    )
  }

  // Carte blanche : lisible sur N'IMPORTE QUEL fond (clair ET sombre), jamais
  // d'`<ins>` transparent sur du noir.
  const showLabel = label ?? true
  return (
    <div
      ref={ref}
      className={`adsense-container my-6 mx-auto w-full max-w-3xl text-center overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm px-3 py-4 ${className}`}
      aria-label="Publicité"
    >
      {showLabel && (
        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Publicité</div>
      )}
      {ins}
    </div>
  )
}

/**
 * Predefined AdSense components for common placements
 */

export function AdSenseLeaderboard({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense
      slot={slot}
      format="auto"
      responsive={true}
      className={className}
      style={{ minHeight: '90px' }}
    />
  )
}

export function AdSenseRectangle({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense
      slot={slot}
      format="rectangle"
      responsive={true}
      className={className}
      style={{ minHeight: '250px' }}
    />
  )
}

export function AdSenseInArticle({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense
      slot={slot}
      format="fluid"
      layout="in-article"
      className={className}
    />
  )
}

export function AdSenseInFeed({ slot, layoutKey, className }: { slot: string; layoutKey?: string; className?: string }) {
  return (
    <AdSense
      slot={slot}
      format="fluid"
      layout="in-feed"
      layoutKey={layoutKey || '-fb+5w+4e-db+86'}
      className={className}
    />
  )
}

/**
 * Native-style ad card dans une grille de résultats. La carte blanche + label
 * « Publicité » est maintenant fournie par <AdSense> lui-même.
 * (Le paramètre `eager` est conservé pour compat mais ignoré — viewability-first.)
 */
export function AdSenseInFeedCard({ slot }: { slot: string; eager?: boolean }) {
  return <AdSense slot={slot} format="auto" responsive={true} style={{ minHeight: '200px' }} />
}

export function AdSenseSidebar({ slot, sticky = true, className }: { slot: string; sticky?: boolean; className?: string }) {
  return (
    <div className={`${sticky ? 'sticky top-24' : ''} ${className || ''}`}>
      <AdSense
        slot={slot}
        format="auto"
        responsive={true}
        style={{ minHeight: '600px' }}
      />
    </div>
  )
}

/**
 * L'anchor (et la vignette) sont désormais gérés par les Auto Ads natifs
 * d'AdSense (dashboard → Anchor + Vignette activés, in-page désactivé).
 * L'ancien composant <AdSenseAnchor> manuel a été retiré pour éviter deux
 * ancres en conflit. Voir anchor-gap-fix dans layout.tsx.
 */
