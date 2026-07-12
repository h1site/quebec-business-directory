'use client'

import { useEffect, useRef } from 'react'

/**
 * Bloc AdSense in-article (une pub, discrète, dans le contenu).
 * Le script loader adsbygoogle.js est chargé globalement dans layout.tsx.
 */
export default function AdUnit({ slot }: { slot: string }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      /* AdSense bloqué / pas prêt — sans gravité */
    }
  }, [])

  return (
    <div className="my-10 text-center">
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Publicité</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-8781698761921917"
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
      />
    </div>
  )
}
