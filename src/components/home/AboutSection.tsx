'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-16 bg-gray-100" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          À propos du Registre du Québec
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 text-lg leading-relaxed"
        >
          Le Registre des entreprises du Québec est l&apos;annuaire le plus complet des
          entreprises québécoises. Que vous cherchiez un restaurant à Montréal, un
          plombier à Québec, ou un notaire à Laval, notre répertoire vous permet de
          trouver rapidement les coordonnées et informations de plus de 600 000
          entreprises.
        </motion.p>
      </div>
    </section>
  )
}
