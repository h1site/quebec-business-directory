'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { toEnglishSlug, getCategoryIcon } from '@/lib/category-slugs'

interface Category {
  id: string
  slug: string
  label_en: string
}

interface CategoriesSectionENProps {
  categories: Category[]
}

export default function CategoriesSectionEN({ categories }: CategoriesSectionENProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-16 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 text-center mb-10"
        >
          Browse by Category
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const englishSlug = toEnglishSlug(category.slug)
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.5),
                }}
              >
                <Link
                  href={`/en/category/${englishSlug}`}
                  className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <motion.span
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {getCategoryIcon(category.slug)}
                  </motion.span>
                  <span className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                    {category.label_en}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
