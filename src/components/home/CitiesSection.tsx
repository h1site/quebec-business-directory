'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const popularCities = [
  { name: 'Montréal', slug: 'montreal' },
  { name: 'Québec', slug: 'quebec' },
  { name: 'Laval', slug: 'laval' },
  { name: 'Gatineau', slug: 'gatineau' },
  { name: 'Longueuil', slug: 'longueuil' },
  { name: 'Sherbrooke', slug: 'sherbrooke' },
  { name: 'Saguenay', slug: 'saguenay' },
  { name: 'Lévis', slug: 'levis' },
  { name: 'Trois-Rivières', slug: 'trois-rivieres' },
  { name: 'Terrebonne', slug: 'terrebonne' },
  { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
  { name: 'Repentigny', slug: 'repentigny' },
]

export default function CitiesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Villes populaires
          </h2>
          <p className="text-gray-600">
            Trouvez des entreprises dans les plus grandes villes du Québec
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCities.map((city, index) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.4),
              }}
            >
              <Link
                href={`/ville/${city.slug}`}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 p-4 rounded-lg transition-all group hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="text-2xl"
                    whileHover={{ scale: 1.2 }}
                  >
                    🏙️
                  </motion.span>
                  <span className="font-medium text-gray-900">{city.name}</span>
                </div>
                <motion.span
                  className="text-blue-600"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
