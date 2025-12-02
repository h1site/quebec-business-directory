import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')          // Remove leading/trailing hyphens
    .substring(0, 100)
}

export function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Category slug translations (French -> English)
export const frToEnCategorySlug: Record<string, string> = {
  'services-professionnels': 'professional-services',
  'finance-assurance-et-juridique': 'finance-insurance-and-legal',
  'technologie': 'technology',
  'education-et-formation': 'education-and-training',
  'commerce-de-detail': 'retail',
  'construction-et-renovation': 'construction-and-renovation',
  'organismes-publics-et-communautaires': 'public-and-community-organizations',
  'sante-et-bien-etre': 'health-and-wellness',
  'automobile-et-transport': 'automobile-and-transportation',
  'industrie-fabrication-et-logistique': 'manufacturing-and-logistics',
  'construction': 'construction',
  'agriculture-et-environnement': 'agriculture-and-environment',
  'immobilier': 'real-estate',
  'technologie-et-informatique': 'technology-and-it',
  'restauration-et-alimentation': 'food-and-dining',
  'sports-et-loisirs': 'sports-and-recreation',
  'arts-medias-et-divertissement': 'arts-media-and-entertainment',
  'restauration': 'restaurants',
  'soins-a-domicile': 'home-care',
  'transport-et-logistique': 'transportation-and-logistics',
  'hebergement-et-tourisme': 'accommodation-and-tourism',
  'services-aux-entreprises': 'business-services',
  'services-personnels': 'personal-services',
  'services-financiers': 'financial-services',
  'energie-et-ressources-naturelles': 'energy-and-natural-resources',
  'telecommunications': 'telecommunications',
  'entreprise': 'business',
}

export const enToFrCategorySlug = Object.fromEntries(
  Object.entries(frToEnCategorySlug).map(([fr, en]) => [en, fr])
)

export function getCategorySlug(slug: string, targetLang: 'fr' | 'en'): string {
  if (targetLang === 'en') {
    return frToEnCategorySlug[slug] || slug
  }
  return enToFrCategorySlug[slug] || slug
}
