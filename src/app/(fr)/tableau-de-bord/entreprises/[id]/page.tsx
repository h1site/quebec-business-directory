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
  })

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

        const { data: businessData, error: fetchError } = await supabase
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
        })
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

    const updateData = {
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
