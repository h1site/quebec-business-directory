'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface HeroSectionProps {
  totalBusinesses: number
}

const quickSearches = [
  { icon: '🍔', label: 'Restaurants', query: 'restaurants' },
  { icon: '☕', label: 'Cafés', query: 'cafés' },
  { icon: '🔧', label: 'Plombiers', query: 'plombiers' },
  { icon: '✂️', label: 'Salons de coiffure', query: 'salon de coiffure' },
]

export default function HeroSection({ totalBusinesses }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
      }}
    >
      {/* Animated Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-blue-600/80"
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: '100%',
              opacity: 0
            }}
            animate={{
              y: '-20%',
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear'
            }}
            style={{ left: `${15 + i * 15}%` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg"
        >
          Trouvez les meilleures entreprises du Québec
        </motion.h1>

        {/* Beta Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-6"
        >
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wide"
          >
            Bêta
          </motion.span>
          <p className="text-white/95 text-sm font-medium">
            Version en développement - Vos commentaires sont les bienvenus!
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xl text-white/95 font-medium mb-8"
        >
          Plus de{' '}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="font-bold"
          >
            {totalBusinesses.toLocaleString('fr-CA')}
          </motion.span>
          {' '}entreprises québécoises
        </motion.p>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          action="/recherche"
          method="GET"
          className="bg-white rounded-lg shadow-2xl overflow-hidden mb-6"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1 text-left">
                Quoi?
              </label>
              <input
                type="text"
                name="q"
                placeholder="Restaurant, plombier, avocat..."
                className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
              />
            </div>
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1 text-left">
                Où?
              </label>
              <input
                type="text"
                name="ville"
                placeholder="Montréal, Québec, Laval..."
                className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 md:py-0 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </motion.button>
          </div>
        </motion.form>

        {/* Quick Search Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {quickSearches.map((item, index) => (
            <motion.div
              key={item.query}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
            >
              <Link
                href={`/recherche?q=${encodeURIComponent(item.query)}`}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/30 hover:border-white/50 transition-all hover:-translate-y-0.5"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Business CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 p-5 bg-gray-900/80 border border-white/20 rounded-lg backdrop-blur-sm max-w-xl mx-auto"
        >
          <p className="text-white text-sm mb-3 font-medium">
            Vous êtes propriétaire d&apos;une entreprise? Réclamez votre fiche gratuitement!
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/inscription"
              className="inline-block px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg"
            >
              Créer un compte gratuit
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
