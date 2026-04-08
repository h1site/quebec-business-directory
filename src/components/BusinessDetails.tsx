'use client'

import type { Business } from '@/types/business'
import Link from 'next/link'
import Image from 'next/image'
import { generateSlug } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  IconButton,
} from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LanguageIcon from '@mui/icons-material/Language'
import NavigationIcon from '@mui/icons-material/Navigation'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'
import FacebookIcon from '@mui/icons-material/Facebook'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ShareIcon from '@mui/icons-material/Share'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { categoryLabels } from '@/lib/category-labels'
import ClaimButton from '@/components/ClaimButton'
import AdSense from '@/components/AdSense'

interface Props {
  business: Business
  cityBusinesses?: Business[]
  categoryBusinesses?: Business[]
}

const dayNames: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

function ensureProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}

function addUtm(url: string): string {
  try {
    const u = new URL(ensureProtocol(url))
    u.searchParams.set('utm_source', 'registreduquebec')
    u.searchParams.set('utm_medium', 'referral')
    u.searchParams.set('utm_campaign', 'fiche-entreprise')
    return u.toString()
  } catch {
    return ensureProtocol(url)
  }
}

export default function BusinessDetails({ business, cityBusinesses = [] }: Props) {
  const citySlug = generateSlug(business.city || '')

  const displayAddress = business.verified_address || null
  const displayPhone = business.verified_phone || null
  const displayEmail = business.verified_email || null
  const displayCity = business.verified_city || business.city
  const displayPostalCode = business.verified_postal_code || business.postal_code

  const hasContactInfo = displayPhone || displayEmail || business.website || displayAddress
  const hasSocialMedia = business.facebook_url || business.instagram_url || business.linkedin_url
  const hasOpeningHours = business.opening_hours && Object.keys(business.opening_hours).length > 0

  return (
    <>
      <Header />

      <main className="min-h-screen pt-16" style={{ background: 'var(--background)' }}>
        {/* Hero Section */}
        <Box
          component="section"
          sx={{ position: 'relative', bgcolor: 'background.paper', py: 4, overflow: 'hidden' }}
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <Box component="nav" sx={{ fontSize: '0.875rem', mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexWrap: 'wrap' }}>
              <Link href="/" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Accueil</Link>
              <span>›</span>
              <Link href="/recherche" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Entreprises</Link>
              <span>›</span>
              <Link href={`/ville/${citySlug}`} className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>{business.city}</Link>
              <span>›</span>
              <Box component="span" sx={{ color: 'text.primary' }}>{business.name}</Box>
            </Box>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <Box sx={{ width: 128, height: 128, borderRadius: 3, bgcolor: 'action.hover', p: 1, flexShrink: 0, border: '1px solid', borderColor: 'divider' }}>
                <img
                  src={business.logo_url || '/images/logos/logo.webp'}
                  alt={business.logo_url
                    ? `Logo de ${business.name}`
                    : `${business.name} - Entreprise enregistrée au Registre du Québec à ${business.city || 'Québec'}`}
                  className={`w-full h-full object-contain ${!business.logo_url ? 'brightness-0 invert dark:brightness-0 dark:invert' : ''}`}
                />
              </Box>

              <div className="flex-1">
                <Box component="h1" sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {business.name}
                </Box>

                <div className="flex flex-wrap items-center gap-3">
                  <Chip
                    icon={<LocationOnIcon />}
                    label={`${business.city}, ${business.region || 'Québec'}`}
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: 'divider' }}
                  />

                  {business.google_rating && (
                    <Chip
                      icon={<StarIcon sx={{ color: '#f59e0b !important' }} />}
                      label={
                        <Box className="flex items-center gap-1">
                          <Box component="span" sx={{ fontWeight: 700 }}>{business.google_rating}</Box>
                          {business.google_reviews_count && (
                            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>({business.google_reviews_count} avis)</Box>
                          )}
                        </Box>
                      }
                      sx={{ bgcolor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}
                      variant="outlined"
                      size="small"
                    />
                  )}

                  {business.main_category_slug && (
                    <Chip
                      component={Link}
                      href={`/categorie/${business.main_category_slug}`}
                      label={categoryLabels[business.main_category_slug] || business.main_category_slug}
                      clickable
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {displayPhone && (
                    <Button
                      component="a"
                      href={`tel:${displayPhone}`}
                      variant="contained"
                      startIcon={<PhoneIcon />}
                      size="small"
                      sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#22c55e' } }}
                    >
                      Appeler
                    </Button>
                  )}
                  {displayEmail && (
                    <Button
                      component="a"
                      href={`mailto:${displayEmail}`}
                      variant="contained"
                      startIcon={<EmailIcon />}
                      size="small"
                      sx={{ bgcolor: '#9333ea', '&:hover': { bgcolor: '#a855f7' } }}
                    >
                      Courriel
                    </Button>
                  )}
                  {business.website && (
                    <Button
                      component="a"
                      href={addUtm(business.website)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      variant="contained"
                      startIcon={<LanguageIcon />}
                      size="small"
                      color="primary"
                    >
                      Site web
                    </Button>
                  )}
                  {(business.latitude && business.longitude) && (
                    <Button
                      component="a"
                      href={`https://waze.com/ul?ll=${business.latitude},${business.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      variant="contained"
                      startIcon={<NavigationIcon />}
                      size="small"
                      sx={{ bgcolor: '#33ccff', color: '#000', '&:hover': { bgcolor: '#00b8f5' } }}
                    >
                      Itinéraire
                    </Button>
                  )}
                  <ClaimButton
                    businessId={business.id}
                    businessSlug={business.slug}
                    isClaimed={business.is_claimed}
                    claimStatus={business.claim_status}
                    ownerIdExists={!!business.owner_id}
                    inline
                  />
                </div>
              </div>
            </div>
          </div>
        </Box>

        {/* Main Content */}
        <section className="py-8" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>À propos</Box>
                    {business.ai_description ? (
                      <Box sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {business.ai_description}
                      </Box>
                    ) : business.description ? (
                      <Box sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {business.description}
                      </Box>
                    ) : (
                      <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Aucune description disponible pour cette entreprise.
                      </Box>
                    )}

                    {business.ai_services && business.ai_services.length > 0 && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Box component="h3" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>Services</Box>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {business.ai_services.map((service, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                              <Box component="span" sx={{ color: 'text.secondary' }}>{service}</Box>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {!business.ai_services && business.products_services && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Box component="h3" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>Produits et services</Box>
                        <ul className="list-disc list-inside space-y-1">
                          {business.products_services.split('\n').filter(Boolean).map((service, i) => (
                            <li key={i} style={{ color: 'var(--foreground-muted)' }}>{service.trim()}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Ad - In Article */}
                <div className="my-4">
                  <AdSense slot="2234567892" format="fluid" layout="in-article" />
                </div>

                {/* Gallery */}
                {business.gallery_images && business.gallery_images.length > 0 && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Photos</Box>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {business.gallery_images.map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden">
                            <img src={img} alt={`${business.name} - Photo ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Google Reviews */}
                {business.google_reviews && Array.isArray(business.google_reviews) && business.google_reviews.length > 0 && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box className="flex items-center justify-between mb-4">
                        <Box component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>Avis Google</Box>
                        {business.google_rating && (
                          <Box className="flex items-center gap-2">
                            <Rating value={business.google_rating} readOnly precision={0.5} size="small" />
                            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{business.google_rating}</Box>
                            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>({business.google_reviews_count} avis)</Box>
                          </Box>
                        )}
                      </Box>
                      <div className="space-y-4">
                        {(business.google_reviews as Array<{text?: string; rating?: number; author_name?: string; relative_time_description?: string}>).filter(r => r.text).map((review, i) => (
                          <Box key={i} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                            <Box className="flex items-center justify-between mb-2">
                              <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{review.author_name || 'Anonyme'}</Box>
                              <Box className="flex items-center gap-2">
                                <Rating value={review.rating || 0} readOnly size="small" />
                                {review.relative_time_description && (
                                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{review.relative_time_description}</Box>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>{review.text}</Box>
                          </Box>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* FAQ Section */}
                <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box component="h2" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Questions fréquentes</Box>
                    <div className="space-y-2">
                      <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 500, color: 'text.primary' }}>
                          Comment contacter {business.name} ?
                        </AccordionSummary>
                        <AccordionDetails sx={{ color: 'text.secondary' }}>
                          <Box className="space-y-2">
                            <p>
                              {business.name} est situé à {displayAddress || business.city || 'Québec'}
                              {displayCity && displayAddress ? `, ${displayCity}` : ''}
                              {business.region && `, dans la région de ${business.region}`}
                              {business.mrc && ` (MRC ${business.mrc})`}
                              {displayPostalCode && `, ${displayPostalCode}`}.
                            </p>
                            {displayPhone && <p>Téléphone : {displayPhone}</p>}
                            {displayEmail && <p>Courriel : {displayEmail}</p>}
                            {business.website && <p>Site web : {business.website.replace(/^https?:\/\//, '').replace(/\/+$/, '')}</p>}
                          </Box>
                        </AccordionDetails>
                      </Accordion>

                      {business.main_category_slug && (
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Dans quel domaine {business.name} se spécialise ?
                          </AccordionSummary>
                          <AccordionDetails sx={{ color: 'text.secondary' }}>
                            <Box className="space-y-2">
                              <p>
                                {business.name} oeuvre dans le domaine «{' '}
                                {categoryLabels[business.main_category_slug] || business.main_category_slug} » à {business.city || 'au Québec'}.
                              </p>
                              {(business.ai_services && business.ai_services.length > 0) ? (
                                <p>Parmi ses services : {business.ai_services.slice(0, 5).join(', ')}.</p>
                              ) : business.products_services ? (
                                <p>Parmi ses services : {business.products_services.split('\n').filter(Boolean).slice(0, 5).join(', ')}.</p>
                              ) : null}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {business.google_rating && (
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Quelle est la réputation de {business.name} ?
                          </AccordionSummary>
                          <AccordionDetails sx={{ color: 'text.secondary' }}>
                            {business.name} a une note de {business.google_rating}/5 sur Google
                            {business.google_reviews_count > 0 && `, basée sur ${business.google_reviews_count} avis de clients`}.
                            {business.google_rating >= 4 && ' Cette note élevée témoigne de la satisfaction de sa clientèle.'}
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {hasOpeningHours && (
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Quelles sont les heures d&apos;ouverture de {business.name} ?
                          </AccordionSummary>
                          <AccordionDetails sx={{ color: 'text.secondary' }}>
                            Consultez les heures d&apos;ouverture dans la section &quot;Heures d&apos;ouverture&quot; sur cette page.
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                {hasContactInfo && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Coordonnées</Box>
                      <div className="space-y-4">
                        {displayAddress && (
                          <Box className="flex items-start gap-3">
                            <LocationOnIcon sx={{ color: 'text.secondary', mt: 0.25, fontSize: 20 }} />
                            <Box>
                              <Box sx={{ color: 'text.primary' }}>{displayAddress}</Box>
                              {displayCity && (
                                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                  {displayCity}{displayPostalCode && `, ${displayPostalCode}`}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                        {displayPhone && (
                          <Box className="flex items-center gap-3">
                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <a href={`tel:${displayPhone}`} className="text-sky-500 hover:text-sky-400">{displayPhone}</a>
                          </Box>
                        )}
                        {displayEmail && (
                          <Box className="flex items-center gap-3">
                            <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <a href={`mailto:${displayEmail}`} className="text-sky-500 hover:text-sky-400 truncate">{displayEmail}</a>
                          </Box>
                        )}
                        {business.website && (
                          <Box className="flex items-center gap-3">
                            <LanguageIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <a href={addUtm(business.website)} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-500 hover:text-sky-400 truncate">
                              {business.website.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
                            </a>
                          </Box>
                        )}
                        {business.neq && (
                          <>
                            <Divider />
                            <Box className="flex items-center gap-3">
                              <Box sx={{ fontSize: '1.25rem' }}>🏛️</Box>
                              <Box>
                                <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>NEQ: </Box>
                                <Box component="span" sx={{ color: 'text.primary' }}>{business.neq}</Box>
                              </Box>
                            </Box>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Map */}
                {(business.latitude && business.longitude) && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Localisation</Box>
                      <div className="rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="250"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(business.longitude) - 0.01}%2C${Number(business.latitude) - 0.01}%2C${Number(business.longitude) + 0.01}%2C${Number(business.latitude) + 0.01}&layer=mapnik&marker=${business.latitude}%2C${business.longitude}`}
                        />
                      </div>
                      <Button
                        component="a"
                        href={`https://www.openstreetmap.org/?mlat=${business.latitude}&mlon=${business.longitude}#map=16/${business.latitude}/${business.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        size="small"
                        sx={{ mt: 1.5, color: 'primary.main' }}
                      >
                        Voir sur OpenStreetMap
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Official Source */}
                <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Source officielle</Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1.5 }}>
                      Cette fiche est basée sur les informations du Registre des entreprises du Quebec.
                    </Box>
                    <Button
                      component="a"
                      href="https://www.registreentreprises.gouv.qc.ca/reqna/gr/gr03/gr03a71.rechercheregistre.mvc/gr03a71?choixdomaine=RegistreEntreprisesQuebec"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      Consulter le registre
                    </Button>
                  </CardContent>
                </Card>

                {/* Opening Hours */}
                {hasOpeningHours && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Heures d&apos;ouverture</Box>
                      <div className="space-y-0">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                          const hours = business.opening_hours?.[day]
                          if (!hours) return null
                          return (
                            <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                              <Box sx={{ fontWeight: 500, color: 'text.primary' }}>{dayNames[day]}</Box>
                              <Box sx={{ color: 'text.secondary' }}>
                                {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                              </Box>
                            </Box>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Media */}
                {hasSocialMedia && (
                  <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Réseaux sociaux</Box>
                      <div className="flex flex-wrap gap-2">
                        {business.facebook_url && (
                          <IconButton
                            component="a"
                            href={business.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            sx={{ bgcolor: '#1877f2', color: 'white', '&:hover': { bgcolor: '#1565d8' } }}
                          >
                            <FacebookIcon />
                          </IconButton>
                        )}
                        {business.instagram_url && (
                          <IconButton
                            component="a"
                            href={business.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            sx={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', color: 'white', '&:hover': { opacity: 0.9 } }}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </IconButton>
                        )}
                        {business.linkedin_url && (
                          <IconButton
                            component="a"
                            href={business.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            sx={{ bgcolor: '#0077b5', color: 'white', '&:hover': { bgcolor: '#006699' } }}
                          >
                            <LinkedInIcon />
                          </IconButton>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Share */}
                <Card elevation={2} sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 2 }}>Partager</Box>
                    <div className="flex gap-2">
                      <Button
                        component="a"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://registreduquebec.com/entreprise/${business.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        variant="contained"
                        fullWidth
                        size="small"
                        sx={{ bgcolor: '#1877f2', '&:hover': { bgcolor: '#1565d8' } }}
                      >
                        Facebook
                      </Button>
                      <Button
                        component="a"
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://registreduquebec.com/entreprise/${business.slug}`)}&text=${encodeURIComponent(`Découvrez ${business.name} à ${business.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        variant="contained"
                        fullWidth
                        size="small"
                        sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
                      >
                        X
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Ad - Sidebar Sticky */}
                <div className="sticky top-24">
                  <AdSense slot="2234567891" format="auto" responsive={true} style={{ minHeight: '600px' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad - Leaderboard before recommendations */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="2234567893" format="auto" responsive={true} style={{ minHeight: '90px' }} />
        </div>

        {/* City Businesses */}
        {cityBusinesses.length > 0 && business.city && (
          <Box component="section" sx={{ py: 4, bgcolor: 'background.paper' }}>
            <div className="max-w-6xl mx-auto px-4">
              <Box component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', mb: 1 }}>
                <Link href={`/ville/${citySlug}`} className="hover:text-sky-400 transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Entreprises à {business.city}
                </Link>
              </Box>
              <Box sx={{ color: 'text.secondary', mb: 3 }}>Autres entreprises dans cette ville</Box>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cityBusinesses.map((biz) => (
                  <Card
                    key={biz.id}
                    sx={{ bgcolor: 'action.hover', transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}
                  >
                    <CardContent component={Link} href={`/entreprise/${biz.slug}`} sx={{ p: 3, display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }} className="line-clamp-2">{biz.name}</Box>
                      {biz.main_category_slug && (
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{categoryLabels[biz.main_category_slug] || biz.main_category_slug}</Box>
                      )}
                      {biz.google_rating && (
                        <Box className="flex items-center gap-1 mt-1">
                          <Rating value={biz.google_rating} readOnly size="small" precision={0.5} />
                          <Box component="span" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.875rem' }}>{biz.google_rating}</Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                component={Link}
                href={`/ville/${citySlug}`}
                size="small"
                sx={{ mt: 2, color: 'primary.main' }}
              >
                Voir toutes les entreprises à {business.city} →
              </Button>
            </div>
          </Box>
        )}

      </main>

      <Footer />
    </>
  )
}
