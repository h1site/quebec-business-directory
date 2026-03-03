'use client'

import { Card, CardContent, Box } from '@mui/material'

export default function AboutSection() {
  return (
    <section className="py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <Card
          elevation={2}
          className="animate-fade-in"
          sx={{ bgcolor: 'background.paper', p: { xs: 3, md: 5 } }}
        >
          <CardContent>
            <Box component="h2" sx={{ fontSize: '1.875rem', fontWeight: 700, color: 'text.primary', mb: 3 }}>
              À propos du Registre du Québec
            </Box>
            <Box sx={{ color: 'text.secondary', fontSize: '1.125rem', lineHeight: 1.8 }}>
              Le Registre des entreprises du Québec est l&apos;annuaire le plus complet des
              entreprises québécoises. Que vous cherchiez un restaurant à Montréal, un
              plombier à Québec, ou un notaire à Laval, notre répertoire vous permet de
              trouver rapidement les coordonnées et informations de plus de 46 000
              entreprises de qualité.
            </Box>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
