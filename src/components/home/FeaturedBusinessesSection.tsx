'use client'

import Link from 'next/link'
import { Card, CardContent, CardActionArea, Box, Button, Rating, Chip } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface Business {
  id: string
  name: string
  slug: string
  city: string | null
  google_rating: number | null
  google_reviews_count: number | null
  ai_description: string | null
  main_category_slug: string | null
}

interface FeaturedBusinessesSectionProps {
  businesses: Business[]
}

export default function FeaturedBusinessesSection({ businesses }: FeaturedBusinessesSectionProps) {
  if (!businesses || businesses.length === 0) return null

  return (
    <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Entreprises à découvrir
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Des entreprises québécoises sélectionnées avec des informations détaillées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card
              key={business.id}
              sx={{
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
              className="animate-fade-in-up"
            >
              <CardActionArea
                component={Link}
                href={`/entreprise/${business.slug}`}
                sx={{ p: 0 }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box className="flex items-start justify-between mb-2">
                    <Box sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.125rem', lineHeight: 1.3 }} className="line-clamp-2">
                      {business.name}
                    </Box>
                    {business.google_rating && (
                      <Chip
                        icon={<span>★</span>}
                        label={business.google_rating}
                        size="small"
                        sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600, ml: 1, flexShrink: 0 }}
                      />
                    )}
                  </Box>

                  {business.google_rating && (
                    <Rating
                      value={business.google_rating}
                      readOnly
                      precision={0.5}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}

                  {business.city && (
                    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16 }} /> {business.city}
                    </Box>
                  )}

                  {business.ai_description && (
                    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }} className="line-clamp-3">
                      {business.ai_description}
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}>
                    Voir la fiche
                    <ChevronRightIcon sx={{ fontSize: 18, ml: 0.5 }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            component={Link}
            href="/recherche"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(to right, #0ea5e9, #06b6d4)',
              '&:hover': { background: 'linear-gradient(to right, #38bdf8, #22d3ee)', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(14,165,233,0.25)' },
              transition: 'all 0.2s ease',
            }}
          >
            Voir toutes les entreprises
          </Button>
        </div>
      </div>
    </section>
  )
}
