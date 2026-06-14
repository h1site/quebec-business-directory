'use client'

import { useEffect, useRef, useState } from 'react'

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
  /**
   * Ad layout type
   * - 'in-article': For within article content
   * - 'in-feed': For between list items
   */
  layout?: 'in-article' | 'in-feed'
  /**
   * Layout key for in-feed ads
   * Get from AdSense dashboard
   */
  layoutKey?: string
  /**
   * Enable full-width responsive mode
   */
  responsive?: boolean
  /**
   * Custom CSS class
   */
  className?: string
  /**
   * Custom inline styles
   */
  style?: React.CSSProperties
  /**
   * Disable lazy-loading (load immediately). Use for above-the-fold ads only.
   */
  eager?: boolean
}

/**
 * Google AdSense component
 *
 * Lazy-loads ads via IntersectionObserver — the `<ins>` only enters the AdSense
 * queue when within 200px of the viewport. This raises viewability and prevents
 * unviewed impressions from dragging the eCPM down.
 *
 * Usage:
 * ```tsx
 * <AdSense slot="1234567890" />
 * <AdSense slot="1234567890" layout="in-article" />
 * <AdSense slot="1234567890" eager /> // above-the-fold
 * ```
 */
export default function AdSense({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  responsive = true,
  className = '',
  style = {},
  eager = false,
}: AdSenseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(eager)
  const pushed = useRef(false)

  useEffect(() => {
    if (eager || visible) return
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
      { rootMargin: '200px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [eager, visible])

  useEffect(() => {
    if (!visible || pushed.current) return
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

  return (
    <div ref={ref} className={`adsense-container ${className}`}>
      {visible && (
        <ins
          className="adsbygoogle"
          style={baseStyle}
          data-ad-client="ca-pub-8781698761921917"
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      )}
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
 * Native-style ad card that visually matches business listing cards.
 *
 * Drop it into the same grid as <Link>-based business cards on
 * recherche / ville / catégorie / region. Has a small "Publicité" label
 * (AdSense policy requires labelling) but otherwise blends in.
 */
export function AdSenseInFeedCard({ slot, eager = false }: { slot: string; eager?: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: 'var(--background-secondary)', borderColor: 'rgba(128,128,128,0.15)' }}
    >
      <div className="px-3 pt-2 text-xs uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground-muted)' }}>
        Publicité
      </div>
      <div className="px-3 pb-3" style={{ minHeight: '200px' }}>
        <AdSense slot={slot} format="auto" responsive={true} eager={eager} />
      </div>
    </div>
  )
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
 * Sticky bottom anchor ad — mobile only.
 *
 * High-RPM placement: always visible while scrolling, dismissible by user.
 * Hidden on screens >= 768px (sm:hidden equivalent via media query) because
 * desktop has the sticky sidebar already.
 */
export function AdSenseAnchor({ slot }: { slot: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      className="adsense-anchor md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#ffffff',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        padding: '4px 4px 6px',
      }}
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer la publicité"
        style={{
          position: 'absolute',
          top: -10,
          right: 8,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#333',
          color: '#fff',
          border: 'none',
          fontSize: 14,
          lineHeight: '22px',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
      <AdSense
        slot={slot}
        format="auto"
        responsive={true}
        eager
        style={{ minHeight: '50px', maxHeight: '100px' }}
      />
    </div>
  )
}
