'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface StatItemProps {
  value: number
  suffix?: string
  label: string
  delay?: number
}

function AnimatedCounter({ value, suffix = '', delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const startTime = Date.now() + delay * 1000
      const endValue = value

      const animate = () => {
        const now = Date.now()
        if (now < startTime) {
          requestAnimationFrame(animate)
          return
        }

        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeOutQuart * endValue))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isInView, value, delay])

  return (
    <span ref={ref}>
      {count.toLocaleString('fr-CA')}{suffix}
    </span>
  )
}

function StatItem({ value, suffix = '', label, delay = 0 }: StatItemProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="text-4xl md:text-5xl font-bold mb-2">
        <AnimatedCounter value={value} suffix={suffix} delay={delay} />
      </div>
      <div className="text-blue-200">{label}</div>
    </motion.div>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section className="py-16 bg-blue-900 text-white overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <StatItem value={600000} suffix="+" label="Entreprises répertoriées" delay={0} />
          <StatItem value={17} label="Régions du Québec" delay={0.2} />
          <StatItem value={100} suffix="%" label="Gratuit" delay={0.4} />
        </motion.div>
      </div>

      {/* Animated background decoration */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : {}}
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
      </motion.div>
    </section>
  )
}
