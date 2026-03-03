'use client'

import Link from 'next/link'
import { Card, CardActionArea, Box } from '@mui/material'

interface Category {
  id: string
  slug: string
  label_fr: string
}

interface CategoriesSectionProps {
  categories: Category[]
}

const categoryIcons: Record<string, string> = {
  'agriculture-et-environnement': '🌾',
  'arts-medias-et-divertissement': '🎨',
  'automobile-et-transport': '🚗',
  'commerce-de-detail': '🛒',
  'construction-et-renovation': '🏗️',
  'education-et-formation': '📚',
  'finance-assurance-et-juridique': '💼',
  'immobilier': '🏠',
  'industrie-fabrication-et-logistique': '🏭',
  'maison-et-services-domestiques': '🏡',
  'organismes-publics-et-communautaires': '🏛️',
  'restauration-et-alimentation': '🍽️',
  'sante-et-bien-etre': '🏥',
  'services-funeraires': '⚱️',
  'services-professionnels': '👔',
  'soins-a-domicile': '🩺',
  'sports-et-loisirs': '⚽',
  'technologie-et-informatique': '💻',
  'tourisme-et-hebergement': '🏨',
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-20" style={{ background: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Parcourir par catégorie
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Explorez nos catégories pour trouver ce que vous cherchez
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
              className="animate-fade-in-up"
            >
              <CardActionArea
                component={Link}
                href={`/categorie/${category.slug}`}
                sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-start', gap: 2 }}
              >
                <Box sx={{ fontSize: '1.875rem', lineHeight: 1 }}>
                  {categoryIcons[category.slug] || '📁'}
                </Box>
                <Box sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {category.label_fr}
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
