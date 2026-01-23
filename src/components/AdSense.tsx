'use client'

import { useEffect } from 'react'

interface AdSenseProps {
  /**
   * Ad slot ID from Google AdSense
   * Create slots at: https://adsense.google.com
   */
  slot: string
  /**
   * Ad format
   * - 'auto': Responsive (recommended)
   * - 'fluid': Fills container
   * - 'rectangle': Fixed rectangle
   */
  format?: 'auto' | 'fluid' | 'rectangle'
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
}

/**
 * Google AdSense component
 *
 * Usage:
 * ```tsx
 * <AdSense slot="1234567890" />
 * <AdSense slot="1234567890" layout="in-article" />
 * <AdSense slot="1234567890" layout="in-feed" layoutKey="-fb+5w+4e-db+86" />
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
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Base styles
  const baseStyle: React.CSSProperties = {
    display: 'block',
    textAlign: layout ? 'center' : undefined,
    ...style,
  }

  return (
    <div className={`adsense-container ${className}`}>
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
