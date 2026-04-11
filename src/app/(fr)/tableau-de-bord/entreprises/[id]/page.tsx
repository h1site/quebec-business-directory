'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const CATEGORIES = [
  { slug: 'agriculture-et-environnement', label: 'Agriculture et environnement' },
  { slug: 'arts-medias-et-divertissement', label: 'Arts, médias et divertissement' },
  { slug: 'automobile-et-transport', label: 'Automobile et transport' },
  { slug: 'commerce-de-detail', label: 'Commerce de détail' },
  { slug: 'construction-et-renovation', label: 'Construction et rénovation' },
  { slug: 'education-et-formation', label: 'Éducation et formation' },
  { slug: 'finance-assurance-et-juridique', label: 'Finance, assurance et juridique' },
  { slug: 'immobilier', label: 'Immobilier' },
  { slug: 'industrie-fabrication-et-logistique', label: 'Industrie, fabrication et logistique' },
  { slug: 'maison-et-services-domestiques', label: 'Maison et services domestiques' },
  { slug: 'organismes-publics-et-communautaires', label: 'Organismes publics et communautaires' },
  { slug: 'restauration-et-alimentation', label: 'Restauration et alimentation' },
  { slug: 'sante-et-bien-etre', label: 'Santé et bien-être' },
  { slug: 'services-funeraires', label: 'Services funéraires' },
  { slug: 'services-professionnels', label: 'Services professionnels' },
  { slug: 'soins-a-domicile', label: 'Soins à domicile' },
  { slug: 'sports-et-loisirs', label: 'Sports et loisirs' },
  { slug: 'technologie-et-informatique', label: 'Technologie et informatique' },
  { slug: 'tourisme-et-hebergement', label: 'Tourisme et hébergement' },
]

const REGIONS = [
  'Montréal', 'Capitale-Nationale', 'Montérégie', 'Laval', 'Lanaudière',
  'Laurentides', 'Estrie', 'Outaouais', 'Mauricie', 'Saguenay-Lac-Saint-Jean',
  'Centre-du-Québec', 'Chaudière-Appalaches', 'Bas-Saint-Laurent',
  'Abitibi-Témiscamingue', 'Côte-Nord', 'Gaspésie-Îles-de-la-Madeleine', 'Nord-du-Québec'
]

interface Business {
  id: string
  name: string
  slug: string
  main_category_slug: string | null
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string
  postal_code: string | null
  region: string | null
  owner_id: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  logo_url: string | null
  images: string[] | null
  products_services: string | null
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }> | null
  company_size: string | null
  founded_year: number | null
}

export default function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [business, setBusiness] = useState<Business | null>(null)

  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    services: '',
    company_size: '',
    founded_year: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: true },
    sunday: { open: '10:00', close: '16:00', closed: true },
  })
  const [showHours, setShowHours] = useState(false)

  const dayLabels: Record<string, string> = {
    monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
    thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/connexion')
          return
        }

        const admin = session.user.email === 'info@h1site.com'
        setIsAdmin(admin)

        let businessData = null

        if (admin) {
          // Admin: fetch via API route (bypasses RLS)
          const res = await fetch(`/api/admin/business/${id}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (res.ok) {
            businessData = await res.json()
          } else {
            const { error: msg } = await res.json()
            setError(`Erreur de chargement: ${msg}`)
            setLoading(false)
            return
          }
        } else {
          // Regular user: fetch via Supabase client (RLS)
          const { data, error: fetchError } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', id)
            .single()

          if (fetchError) {
            console.error('Supabase fetch error:', fetchError)
            setError(`Erreur de chargement: ${fetchError.message}`)
            setLoading(false)
            return
          }
          businessData = data
        }

        if (!businessData) {
          router.push('/tableau-de-bord/entreprises')
          return
        }

        // Check ownership for non-admin users
        if (!admin && businessData.owner_id !== session.user.id) {
          router.push('/tableau-de-bord/entreprises')
          return
        }

        setBusiness(businessData)
        setFormData({
          name: businessData.name || '',
          category: businessData.main_category_slug || '',
          description: businessData.description || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
          website: businessData.website || '',
          address: businessData.address || '',
          city: businessData.city || '',
          postalCode: businessData.postal_code || '',
          region: businessData.region || '',
          facebook_url: businessData.facebook_url || '',
          instagram_url: businessData.instagram_url || '',
          linkedin_url: businessData.linkedin_url || '',
          services: businessData.products_services || '',
          company_size: businessData.company_size || '',
          founded_year: businessData.founded_year?.toString() || '',
        })
        if (businessData.logo_url) setLogoPreview(businessData.logo_url)
        if (businessData.images) setPhotos(businessData.images)
        if (businessData.opening_hours && Object.keys(businessData.opening_hours).length > 0) {
          setShowHours(true)
          setHours(prev => {
            const merged = { ...prev }
            for (const [day, val] of Object.entries(businessData.opening_hours || {})) {
              const v = val as { open?: string; close?: string; closed?: boolean }
              merged[day] = { open: v.open || '09:00', close: v.close || '17:00', closed: v.closed || false }
            }
            return merged
          })
        }
        setLoading(false)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Erreur inattendue lors du chargement.')
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [id, router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (!formData.name || !formData.category || !formData.city) {
      setError('Veuillez remplir les champs obligatoires (nom, catégorie, ville)')
      setSaving(false)
      return
    }

    const updateData: Record<string, unknown> = {
      name: formData.name,
      main_category_slug: formData.category,
      description: formData.description || null,
      phone: formData.phone || null,
      email: formData.email || null,
      website: formData.website || null,
      address: formData.address || null,
      city: formData.city,
      postal_code: formData.postalCode || null,
      region: formData.region || null,
      facebook_url: formData.facebook_url || null,
      instagram_url: formData.instagram_url || null,
      linkedin_url: formData.linkedin_url || null,
      products_services: formData.services || null,
      company_size: formData.company_size || null,
      founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
      opening_hours: showHours ? hours : null,
    }

    // Upload logo if changed
    if (logoFile && business) {
      const logoFileName = `${business.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`
      const { error: logoError } = await supabase.storage
        .from('business-images')
        .upload(logoFileName, logoFile)

      if (!logoError) {
        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(logoFileName)
        updateData.logo_url = publicUrl
      }
    }

    // Upload new photos
    if (newPhotos.length > 0 && business) {
      const allUrls = [...photos]
      for (const photo of newPhotos) {
        const fileName = `${business.id}/photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${photo.name.split('.').pop()}`
        const { error: photoErr } = await supabase.storage.from('business-images').upload(fileName, photo)
        if (!photoErr) {
          const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(fileName)
          allUrls.push(publicUrl)
        }
      }
      updateData.images = allUrls
    }

    try {
      if (isAdmin) {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`/api/admin/business/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(updateData),
        })
        if (!res.ok) {
          const { error: msg } = await res.json()
          setError(msg || 'Une erreur est survenue lors de la mise à jour.')
          setSaving(false)
          return
        }
      } else {
        const { error: updateError } = await supabase
          .from('businesses')
          .update(updateData)
          .eq('id', id)

        if (updateError) {
          console.error('Update error:', updateError)
          setError('Une erreur est survenue lors de la mise à jour.')
          setSaving(false)
          return
        }
      }

      setSuccess('Entreprise mise à jour avec succes!')
      setSaving(false)
    } catch (err) {
      console.error('Error:', err)
      setError('Une erreur est survenue. Veuillez reessayer.')
      setSaving(false)
    }
  }

  if (loading && !error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error && !business) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/tableau-de-bord/entreprises"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-4"
        >
          ← Retour à mes entreprises
        </Link>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    )
  }

  if (!business) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tableau-de-bord/entreprises"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-4"
        >
          ← Retour à mes entreprises
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Modifier l&apos;entreprise</h1>
        <p className="text-gray-600 mt-1">{business.name}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Informations de base
            </h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l&apos;entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une catégorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 resize-none"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Coordonnées
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Courriel
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Adresse
            </h2>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Région administrative
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une région</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Logo
            </h2>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-lg object-contain border border-gray-200" />
              )}
              <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoFile(file)
                      setLogoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
                {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
              </label>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Réseaux sociaux
            </h2>
            <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                id="facebook_url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/votrepage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                id="instagram_url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/votrepage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/votrepage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Services
            </h2>
            <div>
              <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-1">
                Services offerts <span className="text-gray-400 text-xs">(un par ligne)</span>
              </label>
              <textarea
                id="services"
                name="services"
                value={formData.services}
                onChange={handleChange}
                rows={5}
                placeholder="Consultation&#10;Installation&#10;Réparation&#10;Entretien"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Photos
            </h2>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setNewPhotos(prev => [...prev, ...Array.from(e.target.files!)])
                }}
              />
              <span className="text-sm text-gray-700">+ Ajouter des photos</span>
            </label>
            {newPhotos.length > 0 && (
              <p className="text-sm text-green-600">{newPhotos.length} nouvelle(s) photo(s) à envoyer</p>
            )}
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Heures d&apos;ouverture
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHours}
                onChange={() => setShowHours(!showHours)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Afficher les heures d&apos;ouverture</span>
            </label>
            {showHours && (
              <div className="space-y-2">
                {Object.entries(hours).map(([day, val]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium text-gray-700">{dayLabels[day]}</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={val.closed}
                        onChange={() => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }))}
                        className="w-4 h-4 rounded border-gray-300 text-red-600"
                      />
                      <span className="text-xs text-gray-500">Fermé</span>
                    </label>
                    {!val.closed && (
                      <>
                        <input
                          type="time"
                          value={val.open}
                          onChange={(e) => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                          className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                        />
                        <span className="text-gray-400">à</span>
                        <input
                          type="time"
                          value={val.close}
                          onChange={(e) => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                          className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Informations supplémentaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                <select
                  id="company_size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Non spécifié</option>
                  <option value="1-5">1-5 employés</option>
                  <option value="6-25">6-25 employés</option>
                  <option value="26-100">26-100 employés</option>
                  <option value="101-500">101-500 employés</option>
                  <option value="500+">500+ employés</option>
                </select>
              </div>
              <div>
                <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">Année de fondation</label>
                <input
                  type="number"
                  id="founded_year"
                  name="founded_year"
                  value={formData.founded_year}
                  onChange={handleChange}
                  placeholder="2020"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/tableau-de-bord/entreprises"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
