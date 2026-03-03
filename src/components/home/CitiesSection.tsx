'use client'

import Link from 'next/link'
import { Card, CardActionArea, Box } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

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
  return (
    <section className="py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Villes populaires
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Trouvez des entreprises dans les plus grandes villes du Québec
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCities.map((city) => (
            <Card
              key={city.slug}
              sx={{
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              }}
              className="animate-fade-in-up"
            >
              <CardActionArea
                component={Link}
                href={`/ville/${city.slug}`}
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box className="flex items-center gap-3">
                  <Box sx={{ fontSize: '1.5rem' }}>🏙️</Box>
                  <Box sx={{ fontWeight: 500, color: 'text.primary' }}>{city.name}</Box>
                </Box>
                <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </CardActionArea>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
