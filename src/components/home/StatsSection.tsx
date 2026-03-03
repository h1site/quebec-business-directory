'use client'

import { Box, Paper } from '@mui/material'

interface StatItemProps {
  value: string
  label: string
  icon: string
}

function StatItem({ value, label, icon }: StatItemProps) {
  return (
    <Box className="text-center animate-fade-in-up">
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 4, mb: 2, fontSize: '1.875rem', opacity: 0.15 }}>
        <Box sx={{ opacity: 1, position: 'absolute' }}>{icon}</Box>
      </Box>
      <Box className="relative" sx={{ mb: 2 }}>
        <Box sx={{ fontSize: '1.875rem' }}>{icon}</Box>
      </Box>
      <Box sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 800, color: 'primary.main', mb: 1 }}>
        {value}
      </Box>
      <Box sx={{ color: 'text.secondary' }}>{label}</Box>
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
          <StatItem icon="🏢" value="46 000+" label="Entreprises de qualité" />
          <StatItem icon="🗺️" value="17" label="Régions du Québec" />
          <StatItem icon="✨" value="100%" label="Gratuit" />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>
    </Paper>
  )
}
