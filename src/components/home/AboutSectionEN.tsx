'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AboutSectionEN() {
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
          About the Quebec Business Registry
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 text-lg leading-relaxed"
        >
          The Quebec Business Registry is the most comprehensive directory of
          Quebec businesses. Whether you&apos;re looking for a restaurant in Montreal, a
          plumber in Quebec City, or a notary in Laval, our directory helps you
          quickly find contact information for over 600,000 businesses.
        </motion.p>
      </div>
    </section>
  )
}
