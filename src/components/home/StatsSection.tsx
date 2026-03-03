'use client'

import { Box, Paper } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import MapIcon from '@mui/icons-material/Map'
import StarIcon from '@mui/icons-material/Star'
import type { SvgIconComponent } from '@mui/icons-material'

interface StatItemProps {
  value: string
  label: string
  Icon: SvgIconComponent
}

function StatItem({ value, label, Icon }: StatItemProps) {
  return (
    <Box className="text-center animate-fade-in-up" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 64, height: 64,
        bgcolor: 'primary.main',
        borderRadius: 4,
        opacity: 0.9,
      }}>
        <Icon sx={{ fontSize: 32, color: '#fff' }} />
      </Box>
      <Box sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
        {value}
      </Box>
      <Box sx={{ color: 'text.secondary', fontSize: '1rem' }}>{label}</Box>
    </Box>
  )
}

export default function StatsSection() {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        py: 10,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <StatItem Icon={BusinessIcon} value="46 000+" label="Entreprises de qualité" />
          <StatItem Icon={MapIcon} value="17" label="Régions du Québec" />
          <StatItem Icon={StarIcon} value="100%" label="Gratuit" />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>
    </Paper>
  )
}
