'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Category {
  id: number
  slug: string
  label_fr: string
}

interface SubCategory {
  id: number
  slug: string
  label_fr: string
  main_category_id: number
}

interface Region {
  slug: string
  name: string
  code: string
}

interface MRC {
  slug: string
  name: string
}

// Quebec municipalities data structure
const quebecMunicipalities: Record<string, { name: string; code: string; slug: string; mrcs: Record<string, { name: string; cities: string[] }> }> = {
  '01-bas-saint-laurent': {
    name: 'Bas-Saint-Laurent',
    code: '01',
    slug: 'bas-saint-laurent',
    mrcs: {
      kamouraska: { name: 'Kamouraska', cities: ['Kamouraska', 'Saint-Pascal', 'La Pocatière', 'Saint-Alexandre-de-Kamouraska'] },
      'riviere-du-loup': { name: 'Rivière-du-Loup', cities: ['Rivière-du-Loup', 'Cacouna', 'L\'Isle-Verte', 'Notre-Dame-du-Portage'] },
      temiscouata: { name: 'Témiscouata', cities: ['Témiscouata-sur-le-Lac', 'Dégelis', 'Pohénégamook'] },
      'rimouski-neigette': { name: 'Rimouski-Neigette', cities: ['Rimouski', 'Le Bic', 'Saint-Fabien'] }
    }
  },
  '02-saguenay-lac-saint-jean': {
    name: 'Saguenay–Lac-Saint-Jean',
    code: '02',
    slug: 'saguenay-lac-saint-jean',
    mrcs: {
      'le-fjord-du-saguenay': { name: 'Le Fjord-du-Saguenay', cities: ['Saguenay', 'Chicoutimi', 'Jonquière', 'La Baie'] },
      'le-domaine-du-roy': { name: 'Le Domaine-du-Roy', cities: ['Roberval', 'Saint-Félicien', 'Chambord'] },
      'lac-saint-jean-est': { name: 'Lac-Saint-Jean-Est', cities: ['Alma', 'Métabetchouan–Lac-à-la-Croix'] }
    }
  },
  '03-capitale-nationale': {
    name: 'Capitale-Nationale',
    code: '03',
    slug: 'capitale-nationale',
    mrcs: {
      quebec: { name: 'Québec', cities: ['Québec', 'L\'Ancienne-Lorette', 'Saint-Augustin-de-Desmaures'] },
      portneuf: { name: 'Portneuf', cities: ['Pont-Rouge', 'Donnacona', 'Saint-Raymond', 'Neuville'] },
      'la-cote-de-beaupre': { name: 'La Côte-de-Beaupré', cities: ['Beaupré', 'Sainte-Anne-de-Beaupré', 'Château-Richer'] },
      charlevoix: { name: 'Charlevoix', cities: ['Baie-Saint-Paul', 'La Malbaie', 'Clermont'] },
      'la-jacques-cartier': { name: 'La Jacques-Cartier', cities: ['Lac-Beauport', 'Stoneham-et-Tewkesbury', 'Shannon'] }
    }
  },
  '04-mauricie': {
    name: 'Mauricie',
    code: '04',
    slug: 'mauricie',
    mrcs: {
      'trois-rivieres': { name: 'Trois-Rivières', cities: ['Trois-Rivières', 'Bécancour'] },
      shawinigan: { name: 'Shawinigan', cities: ['Shawinigan', 'Saint-Georges-de-Champlain'] },
      maskinonge: { name: 'Maskinongé', cities: ['Louiseville', 'Maskinongé'] }
    }
  },
  '05-estrie': {
    name: 'Estrie',
    code: '05',
    slug: 'estrie',
    mrcs: {
      sherbrooke: { name: 'Sherbrooke', cities: ['Sherbrooke', 'Fleurimont', 'Lennoxville'] },
      memphremagog: { name: 'Memphrémagog', cities: ['Magog', 'Orford', 'Eastman', 'North Hatley'] },
      coaticook: { name: 'Coaticook', cities: ['Coaticook', 'Compton', 'Waterville'] },
      'le-granit': { name: 'Le Granit', cities: ['Lac-Mégantic', 'Nantes'] }
    }
  },
  '06-montreal': {
    name: 'Montréal',
    code: '06',
    slug: 'montreal',
    mrcs: {
      montreal: { name: 'Montréal', cities: ['Montréal', 'Westmount', 'Mont-Royal', 'Côte-Saint-Luc', 'Hampstead', 'Dollard-des-Ormeaux', 'Dorval', 'Pointe-Claire', 'Kirkland', 'Beaconsfield', 'Baie-d\'Urfé', 'Sainte-Anne-de-Bellevue'] }
    }
  },
  '07-outaouais': {
    name: 'Outaouais',
    code: '07',
    slug: 'outaouais',
    mrcs: {
      gatineau: { name: 'Gatineau', cities: ['Gatineau', 'Hull', 'Aylmer', 'Buckingham'] },
      papineau: { name: 'Papineau', cities: ['Papineauville', 'Montebello', 'Thurso'] },
      'les-collines-de-loutaouais': { name: 'Les Collines-de-l\'Outaouais', cities: ['Chelsea', 'Cantley', 'Val-des-Monts'] }
    }
  },
  '08-abitibi-temiscamingue': {
    name: 'Abitibi-Témiscamingue',
    code: '08',
    slug: 'abitibi-temiscamingue',
    mrcs: {
      'rouyn-noranda': { name: 'Rouyn-Noranda', cities: ['Rouyn-Noranda'] },
      'vallee-de-lor': { name: 'Vallée-de-l\'Or', cities: ['Val-d\'Or', 'Malartic', 'Senneterre'] },
      abitibi: { name: 'Abitibi', cities: ['Amos', 'La Sarre'] }
    }
  },
  '09-cote-nord': {
    name: 'Côte-Nord',
    code: '09',
    slug: 'cote-nord',
    mrcs: {
      manicouagan: { name: 'Manicouagan', cities: ['Baie-Comeau', 'Forestville'] },
      'sept-rivieres-caniapiscau': { name: 'Sept-Rivières', cities: ['Sept-Îles', 'Port-Cartier'] }
    }
  },
  '10-nord-du-quebec': {
    name: 'Nord-du-Québec',
    code: '10',
    slug: 'nord-du-quebec',
    mrcs: {
      'eeyou-istchee': { name: 'Eeyou Istchee', cities: ['Chibougamau', 'Chapais', 'Matagami'] }
    }
  },
  '11-gaspesie-iles-de-la-madeleine': {
    name: 'Gaspésie–Îles-de-la-Madeleine',
    code: '11',
    slug: 'gaspesie-iles-de-la-madeleine',
    mrcs: {
      bonaventure: { name: 'Bonaventure', cities: ['Bonaventure', 'New Carlisle', 'Carleton-sur-Mer'] },
      'la-cote-de-gaspe': { name: 'La Côte-de-Gaspé', cities: ['Gaspé', 'Percé'] },
      'iles-de-la-madeleine': { name: 'Îles-de-la-Madeleine', cities: ['Les Îles-de-la-Madeleine', 'Cap-aux-Meules'] }
    }
  },
  '12-chaudiere-appalaches': {
    name: 'Chaudière-Appalaches',
    code: '12',
    slug: 'chaudiere-appalaches',
    mrcs: {
      levis: { name: 'Lévis', cities: ['Lévis'] },
      'beauce-sartigan': { name: 'Beauce-Sartigan', cities: ['Saint-Georges', 'Beauceville'] },
      'la-nouvelle-beauce': { name: 'La Nouvelle-Beauce', cities: ['Sainte-Marie', 'Saint-Joseph-de-Beauce'] },
      lotbiniere: { name: 'Lotbinière', cities: ['Laurier-Station', 'Sainte-Croix'] }
    }
  },
  '13-laval': {
    name: 'Laval',
    code: '13',
    slug: 'laval',
    mrcs: {
      laval: { name: 'Laval', cities: ['Laval', 'Chomedey', 'Sainte-Dorothée', 'Duvernay', 'Vimont', 'Auteuil', 'Fabreville'] }
    }
  },
  '14-lanaudiere': {
    name: 'Lanaudière',
    code: '14',
    slug: 'lanaudiere',
    mrcs: {
      'les-moulins': { name: 'Les Moulins', cities: ['Terrebonne', 'Mascouche'] },
      'lassomption': { name: 'L\'Assomption', cities: ['L\'Assomption', 'Repentigny', 'L\'Épiphanie'] },
      joliette: { name: 'Joliette', cities: ['Joliette', 'Notre-Dame-des-Prairies', 'Saint-Charles-Borromée'] },
      matawinie: { name: 'Matawinie', cities: ['Rawdon', 'Saint-Donat', 'Chertsey'] }
    }
  },
  '15-laurentides': {
    name: 'Laurentides',
    code: '15',
    slug: 'laurentides',
    mrcs: {
      'therese-de-blainville': { name: 'Thérèse-De Blainville', cities: ['Blainville', 'Boisbriand', 'Sainte-Thérèse', 'Rosemère'] },
      'deux-montagnes': { name: 'Deux-Montagnes', cities: ['Deux-Montagnes', 'Saint-Eustache', 'Oka'] },
      mirabel: { name: 'Mirabel', cities: ['Mirabel'] },
      'les-laurentides': { name: 'Les Laurentides', cities: ['Mont-Tremblant', 'Sainte-Agathe-des-Monts', 'Val-David'] },
      'les-pays-den-haut': { name: 'Les Pays-d\'en-Haut', cities: ['Saint-Sauveur', 'Sainte-Adèle', 'Morin-Heights'] }
    }
  },
  '16-monteregie': {
    name: 'Montérégie',
    code: '16',
    slug: 'monteregie',
    mrcs: {
      longueuil: { name: 'Agglomération de Longueuil', cities: ['Longueuil', 'Boucherville', 'Brossard', 'Saint-Bruno-de-Montarville', 'Saint-Lambert'] },
      'le-haut-richelieu': { name: 'Le Haut-Richelieu', cities: ['Saint-Jean-sur-Richelieu', 'Chambly', 'Carignan'] },
      roussillon: { name: 'Roussillon', cities: ['Candiac', 'Châteauguay', 'La Prairie', 'Delson', 'Saint-Constant'] },
      'vaudreuil-soulanges': { name: 'Vaudreuil-Soulanges', cities: ['Vaudreuil-Dorion', 'L\'Île-Perrot', 'Pincourt', 'Hudson'] },
      'les-maskoutains': { name: 'Les Maskoutains', cities: ['Saint-Hyacinthe', 'Saint-Pie'] },
      'la-haute-yamaska': { name: 'La Haute-Yamaska', cities: ['Granby', 'Bromont', 'Waterloo'] }
    }
  },
  '17-centre-du-quebec': {
    name: 'Centre-du-Québec',
    code: '17',
    slug: 'centre-du-quebec',
    mrcs: {
      drummond: { name: 'Drummond', cities: ['Drummondville', 'Saint-Cyrille-de-Wendover'] },
      arthabaska: { name: 'Arthabaska', cities: ['Victoriaville', 'Kingsey Falls', 'Warwick'] },
      'nicolet-yamaska': { name: 'Nicolet-Yamaska', cities: ['Nicolet', 'Pierreville'] }
    }
  }
}

// Get all regions
const getAllRegions = (): Region[] => {
  return Object.entries(quebecMunicipalities).map(([slug, region]) => ({
    slug,
    name: region.name,
    code: region.code
  })).sort((a, b) => a.name.localeCompare(b.name))
}

// Get MRCs by region
const getMRCsByRegion = (regionSlug: string): MRC[] => {
  const region = quebecMunicipalities[regionSlug]
  if (!region) return []
  return Object.entries(region.mrcs).map(([slug, mrc]) => ({
    slug,
    name: mrc.name
  })).sort((a, b) => a.name.localeCompare(b.name))
}

// Get cities by MRC
const getCitiesByMRC = (regionSlug: string, mrcSlug: string): string[] => {
  const region = quebecMunicipalities[regionSlug]
  if (!region) return []
  const mrc = region.mrcs[mrcSlug]
  if (!mrc) return []
  return [...mrc.cities].sort()
}

const COMPANY_SIZES = [
  { id: '1-10', label: '1-10 employés' },
  { id: '11-50', label: '11-50 employés' },
  { id: '51-200', label: '51-200 employés' },
  { id: '201-500', label: '201-500 employés' },
  { id: '501+', label: '501+ employés' },
]

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

const MAX_IMAGES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AddBusinessPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({ type: null, message: null })

  // Categories from database
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    description: '',
    company_size: '',
    founded_year: '',

    // Step 2: Media
    logo: null as File | null,
    logo_preview: '',
    images: [] as File[],
    image_previews: [] as string[],

    // Step 3: Contact
    phone: '',
    email: '',
    website: '',
    show_phone: true,
    show_email: true,
    show_website: true,

    // Step 4: Address
    address: '',
    city: '',
    region: '',
    region_slug: '',
    mrc: '',
    mrc_slug: '',
    postal_code: '',
    show_address: true,

    // Step 5: Categories
    main_category_id: null as number | null,
    main_category_slug: '',
    subcategory_id: null as number | null,
    subcategory_slug: '',

    // Step 5: Business Hours
    show_hours: true,
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true },
    },

    // Step 7: Services
    services: [] as string[],
    services_input: '',
    no_services: false,

    // Step 8: Terms
    terms_accepted: false,
  })

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check auth
  useEffect(() => {
    if (!mounted) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
      }
      setCheckingAuth(false)
    })
  }, [mounted, supabase])

  // Fetch categories
  useEffect(() => {
    if (!mounted) return

    const fetchCategories = async () => {
      try {
        console.log('📂 Fetching categories...')
        const { data, error } = await supabase
          .from('main_categories')
          .select('id, slug, label_fr')
          .order('label_fr')

        console.log('📂 Categories result:', { data, error })

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [mounted, supabase])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!mounted) return

    const fetchSubcategories = async () => {
      console.log('🔍 Fetching subcategories for main_category_id:', formData.main_category_id)

      if (!formData.main_category_id) {
        setSubcategories([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('sub_categories')
          .select('id, slug, label_fr, main_category_id')
          .eq('main_category_id', formData.main_category_id)
          .order('label_fr')

        console.log('📦 Subcategories result:', { data, error })

        if (error) throw error
        setSubcategories(data || [])
      } catch (error) {
        console.error('Error fetching subcategories:', error)
        setSubcategories([])
      }
    }
    fetchSubcategories()
  }, [mounted, formData.main_category_id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value

    if (!value) {
      setFormData(prev => ({
        ...prev,
        main_category_id: null,
        main_category_slug: '',
        subcategory_id: null,
        subcategory_slug: ''
      }))
      return
    }

    const selectedId = parseInt(value)
    const selectedCategory = categories.find(cat => cat.id === selectedId)

    console.log('🏷️ Category change:', { value, selectedId, selectedCategory })

    setFormData(prev => ({
      ...prev,
      main_category_id: selectedId,
      main_category_slug: selectedCategory?.slug || '',
      subcategory_id: null,
      subcategory_slug: ''
    }))
  }

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value)
    const selectedSub = subcategories.find(sub => sub.id === selectedId)

    setFormData(prev => ({
      ...prev,
      subcategory_id: selectedId || null,
      subcategory_slug: selectedSub?.slug || ''
    }))
  }

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      alert('Le fichier est trop volumineux (max 5MB)')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        logo: file,
        logo_preview: reader.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null, logo_preview: '' }))
  }

  // Gallery upload
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentCount = formData.images.length

    if (currentCount + files.length > MAX_IMAGES) {
      alert(`Vous pouvez ajouter ${MAX_IMAGES - currentCount} images supplémentaires`)
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} est trop volumineux (max 5MB)`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newImages = [...formData.images]
    const newPreviews = [...formData.image_previews]

    let loaded = 0
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(file)
        newPreviews.push(reader.result as string)
        loaded++

        if (loaded === validFiles.length) {
          setFormData(prev => ({
            ...prev,
            images: newImages,
            image_previews: newPreviews
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      image_previews: prev.image_previews.filter((_, i) => i !== index)
    }))
  }

  // Address autocomplete
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, address: value }))

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(value)
      }, 500)
    } else {
      setAddressSuggestions([])
      setShowSuggestions(false)
    }
  }

  const searchAddress = async (query: string) => {
    setIsSearchingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&countrycodes=ca&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'QuebecBusinessDirectory/1.0' } }
      )
      const data = await response.json()
      setAddressSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch (error) {
      console.error('Error searching address:', error)
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const selectAddress = (suggestion: any) => {
    const addr = suggestion.address || {}
    const houseNumber = addr.house_number || ''
    const road = addr.road || ''
    const street = `${houseNumber} ${road}`.trim()
    const city = addr.city || addr.town || addr.village || addr.municipality || ''
    const postalCode = addr.postcode || ''

    let formattedPostal = postalCode.toUpperCase().replace(/\s/g, '')
    if (formattedPostal.length === 6) {
      formattedPostal = formattedPostal.slice(0, 3) + ' ' + formattedPostal.slice(3)
    }

    setFormData(prev => ({
      ...prev,
      address: street,
      city: city,
      postal_code: formattedPostal
    }))
    setShowSuggestions(false)
  }

  // Services management
  const addService = () => {
    if (formData.services_input.trim() && formData.services.length < 20) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, prev.services_input.trim()],
        services_input: ''
      }))
    }
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  // Region/MRC/City handlers
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionSlug = e.target.value
    const region = quebecMunicipalities[regionSlug]
    setFormData(prev => ({
      ...prev,
      region_slug: regionSlug,
      region: region?.name || '',
      mrc_slug: '',
      mrc: '',
      city: ''
    }))
  }

  const handleMRCChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mrcSlug = e.target.value
    const region = quebecMunicipalities[formData.region_slug]
    const mrc = region?.mrcs[mrcSlug]
    setFormData(prev => ({
      ...prev,
      mrc_slug: mrcSlug,
      mrc: mrc?.name || '',
      city: ''
    }))
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value
    setFormData(prev => ({
      ...prev,
      city: city
    }))
  }

  // Get available MRCs and cities based on selections
  const availableMRCs = formData.region_slug ? getMRCsByRegion(formData.region_slug) : []
  const availableCities = formData.region_slug && formData.mrc_slug
    ? getCitiesByMRC(formData.region_slug, formData.mrc_slug)
    : []

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 3) newErrors.name = 'Le nom doit contenir au moins 3 caractères'
        if (!formData.description.trim() || formData.description.length < 50) newErrors.description = 'La description doit contenir au moins 50 caractères'
        break
      case 2:
        if (!formData.logo_preview) newErrors.logo = 'Le logo est requis'
        break
      case 3:
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
        break
      case 4:
        if (!formData.region_slug) newErrors.region = 'La région est requise'
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'
        if (!formData.city.trim()) newErrors.city = 'La ville est requise'
        if (!formData.postal_code.trim()) newErrors.postal_code = 'Le code postal est requis'
        break
      case 5:
        // Hours are optional
        break
      case 6:
        if (!formData.main_category_id) newErrors.category = 'La catégorie est requise'
        break
      case 7:
        // Services are optional
        break
      case 8:
        if (!formData.terms_accepted) newErrors.terms = 'Vous devez accepter les conditions'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      router.push('/connexion?redirect=/entreprise/nouvelle')
      return
    }

    // Validate all steps
    for (let step = 1; step <= 8; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step)
        return
      }
    }

    setLoading(true)
    setStatus({ type: null, message: null })

    try {
      const slug = generateSlug(formData.name) + '-' + Date.now().toString(36)

      // Insert business
      const { data: business, error: insertError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          slug: slug,
          description: formData.description,
          main_category_slug: formData.main_category_slug,
          phone: formData.phone,
          email: formData.email,
          website: formData.website || null,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          region: formData.region || null,
          mrc: formData.mrc || null,
          province: 'QC',
          owner_id: userId,
          show_address: formData.show_address,
          data_source: 'user_created',
          is_claimed: true,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Upload logo
      if (formData.logo && business) {
        const logoFileName = `${business.id}/logo-${Date.now()}.${formData.logo.name.split('.').pop()}`
        const { error: logoError } = await supabase.storage
          .from('business-images')
          .upload(logoFileName, formData.logo)

        if (!logoError) {
          const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(logoFileName)

          await supabase
            .from('businesses')
            .update({ logo_url: publicUrl })
            .eq('id', business.id)
        }
      }

      // Upload gallery images
      if (formData.images.length > 0 && business) {
        const imageUrls: string[] = []
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i]
          const imageFileName = `${business.id}/image-${i}-${Date.now()}.${image.name.split('.').pop()}`

          const { error: imageError } = await supabase.storage
            .from('business-images')
            .upload(imageFileName, image)

          if (!imageError) {
            const { data: { publicUrl } } = supabase.storage
              .from('business-images')
              .getPublicUrl(imageFileName)
            imageUrls.push(publicUrl)
          }
        }

        if (imageUrls.length > 0) {
          await supabase
            .from('businesses')
            .update({ images: imageUrls })
            .eq('id', business.id)
        }
      }

      // Link category
      if (formData.subcategory_id && business) {
        await supabase
          .from('business_categories')
          .insert({
            business_id: business.id,
            sub_category_id: formData.subcategory_id,
            is_primary: true
          })
      }

      setStatus({ type: 'success', message: 'Votre entreprise a été créée avec succès!' })

      setTimeout(() => {
        const citySlug = generateSlug(formData.city)
        router.push(`/${formData.main_category_slug}/${citySlug}/${business.slug}`)
      }, 2000)

    } catch (error: any) {
      console.error('Submit error:', error)
      setStatus({ type: 'error', message: 'Une erreur est survenue. Veuillez réessayer.' })
      setLoading(false)
    }
  }

  const stepLabels = ['Infos', 'Photos', 'Contact', 'Adresse', 'Horaires', 'Catégorie', 'Services', 'Validation']

  const DAYS_FR: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  }

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      }
    }))
  }

  // Format phone for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-medium text-gray-900">Ajouter votre entreprise</h1>
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-2xl">
          ×
        </Link>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="bg-white p-6 lg:p-8 border-r border-gray-200 overflow-y-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className={`text-xs mt-1.5 text-center hidden sm:block ${
                  step === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {stepLabels[step - 1]}
                </span>
              </div>
            ))}
          </div>

          {/* Status Messages */}
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Informations de base</h2>
                  <p className="text-sm text-gray-500 mb-6">Commencez par les informations essentielles de votre entreprise</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nom de l&apos;entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="Ex: Restaurant Le Gourmet"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="Décrivez votre entreprise... (minimum 50 caractères)"
                  />
                  <div className="flex justify-between mt-1">
                    <span className={`text-sm ${formData.description.length < 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {formData.description.length}/500 caractères
                    </span>
                  </div>
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Taille de l&apos;entreprise</label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez...</option>
                      {COMPANY_SIZES.map(size => (
                        <option key={size.id} value={size.id}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Année de fondation</label>
                    <input
                      type="number"
                      name="founded_year"
                      value={formData.founded_year}
                      onChange={handleChange}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2015"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Media */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos</h2>
                  <p className="text-sm text-gray-500 mb-6">Ajoutez un logo et des photos de votre entreprise</p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Logo <span className="text-red-500">*</span>
                  </label>
                  {formData.logo_preview ? (
                    <div className="relative inline-block">
                      <img src={formData.logo_preview} alt="Logo" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <div className="text-center">
                        <div className="text-3xl mb-2">📷</div>
                        <p className="font-medium text-gray-700">Cliquez pour ajouter un logo</p>
                        <p className="text-sm text-gray-500">JPG, PNG (max 5MB)</p>
                      </div>
                    </label>
                  )}
                  {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                </div>

                {/* Gallery Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Galerie ({formData.images.length}/{MAX_IMAGES} photos)
                  </label>

                  {formData.image_previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {formData.image_previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length < MAX_IMAGES && (
                    <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
                      <div className="text-center">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="font-medium text-gray-700">Ajouter des photos</p>
                        <p className="text-sm text-gray-500">Jusqu&apos;à {MAX_IMAGES - formData.images.length} photos supplémentaires</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Coordonnées</h2>
                  <p className="text-sm text-gray-500 mb-6">Comment vos clients peuvent vous contacter</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="(514) 555-1234"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_phone"
                      checked={formData.show_phone}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Afficher le téléphone publiquement</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Courriel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="contact@entreprise.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_email"
                      checked={formData.show_email}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Afficher le courriel publiquement</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Site web</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.votresite.com"
                  />
                  {formData.website && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="show_website"
                        checked={formData.show_website}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Afficher le site web publiquement</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Address */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Adresse</h2>
                  <p className="text-sm text-gray-500 mb-6">Où est située votre entreprise</p>
                </div>

                {/* Region → MRC → City Cascading Dropdowns */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📍</span> Localisation
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Region */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Région administrative <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.region_slug}
                        onChange={handleRegionChange}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.region ? 'border-red-400' : 'border-gray-300'}`}
                      >
                        <option value="">Sélectionnez une région</option>
                        {getAllRegions().map(region => (
                          <option key={region.slug} value={region.slug}>{region.name}</option>
                        ))}
                      </select>
                      {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                    </div>

                    {/* MRC - shows when region is selected */}
                    {formData.region_slug && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          MRC <span className="text-gray-400 text-xs font-normal">(Municipalité régionale de comté)</span>
                        </label>
                        <select
                          value={formData.mrc_slug}
                          onChange={handleMRCChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionnez une MRC</option>
                          {availableMRCs.map(mrc => (
                            <option key={mrc.slug} value={mrc.slug}>{mrc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* City - shows when MRC is selected */}
                    {formData.mrc_slug && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.city}
                          onChange={handleCityChange}
                          className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                        >
                          <option value="">Sélectionnez une ville</option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Adresse civique <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleAddressChange}
                    autoComplete="off"
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="123 Rue Principale"
                  />
                  {isSearchingAddress && <div className="absolute right-3 top-10 text-gray-400 text-sm">Recherche...</div>}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => selectAddress(suggestion)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400">📍</span>
                            <span className="text-sm text-gray-700">{suggestion.display_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  <p className="text-xs text-gray-500 mt-1">Commencez à taper pour la saisie automatique</p>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.postal_code ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="H2X 1Y7"
                    maxLength={7}
                  />
                  {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_address"
                      checked={formData.show_address}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-blue-900 block">Afficher l&apos;adresse publiquement</span>
                      <span className="text-sm text-blue-700">Permet aux clients de trouver votre emplacement</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Business Hours */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Heures d&apos;ouverture</h2>
                  <p className="text-sm text-gray-500 mb-6">Indiquez vos heures d&apos;ouverture (optionnel)</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_hours"
                      checked={formData.show_hours}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-blue-900">Afficher les heures d&apos;ouverture</span>
                    </div>
                  </label>
                </div>

                {formData.show_hours && (
                  <div className="space-y-3">
                    {Object.entries(formData.hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-24 font-medium text-gray-900">{DAYS_FR[day]}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-600">Fermé</span>
                        </label>
                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                            />
                            <span className="text-gray-500">à</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Categories */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Catégorie</h2>
                  <p className="text-sm text-gray-500 mb-6">Dans quelle catégorie se trouve votre entreprise</p>
                </div>

                {loadingCategories ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Chargement des catégories...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Catégorie principale <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.main_category_id || ''}
                        onChange={handleCategoryChange}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label_fr}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    {formData.main_category_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Sous-catégorie <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
                        </label>
                        {subcategories.length > 0 ? (
                          <select
                            value={formData.subcategory_id || ''}
                            onChange={handleSubcategoryChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionnez une sous-catégorie</option>
                            {subcategories.map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.label_fr}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-gray-500 italic py-3">Aucune sous-catégorie disponible pour cette catégorie</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 7: Services */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Services offerts</h2>
                  <p className="text-sm text-gray-500 mb-6">Listez les services que vous offrez</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="no_services"
                      checked={formData.no_services}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Aucun service à lister</span>
                      <span className="text-sm text-gray-500 block">Cochez si vous ne souhaitez pas ajouter de services</span>
                    </div>
                  </label>
                </div>

                {!formData.no_services && (
                  <div>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        name="services_input"
                        value={formData.services_input}
                        onChange={handleChange}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Réparation de voiture"
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      >
                        Ajouter
                      </button>
                    </div>

                    {formData.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.services.map((service, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                          >
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {formData.services.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Ajoutez vos services un par un en appuyant sur &quot;Ajouter&quot;</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 8: Review & Submit */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Validation</h2>
                  <p className="text-sm text-gray-500 mb-6">Vérifiez vos informations et soumettez votre entreprise</p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Nom:</span> <span className="font-medium">{formData.name}</span></p>
                    <p><span className="text-gray-500">Catégorie:</span> <span className="font-medium">{categories.find(c => c.id === formData.main_category_id)?.label_fr}</span></p>
                    <p><span className="text-gray-500">Ville:</span> <span className="font-medium">{formData.city}, {formData.region}</span></p>
                    <p><span className="text-gray-500">Contact:</span> <span className="font-medium">{formData.phone} | {formData.email}</span></p>
                  </div>
                </div>

                {/* Terms */}
                <div className={`p-4 border rounded-lg ${errors.terms ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className={`font-medium block ${errors.terms ? 'text-red-900' : 'text-green-900'}`}>
                        J&apos;accepte les conditions d&apos;utilisation
                      </span>
                      <span className={`text-sm ${errors.terms ? 'text-red-700' : 'text-green-700'}`}>
                        Je confirme que les informations fournies sont exactes et que je suis autorisé à créer cette fiche entreprise.
                      </span>
                    </div>
                  </label>
                  {errors.terms && <p className="text-red-500 text-sm mt-2">{errors.terms}</p>}
                </div>

                {!isAuthenticated && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-semibold text-amber-900 mb-2">Connexion requise</h3>
                    <p className="text-sm text-amber-700 mb-3">Vous devez être connecté pour soumettre votre entreprise.</p>
                    <Link href="/connexion?redirect=/entreprise/nouvelle" className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                      Se connecter
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                  Précédent
                </button>
              ) : (
                <Link href="/" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                  Annuler
                </Link>
              )}

              {currentStep < 8 ? (
                <button type="button" onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isAuthenticated || !formData.terms_accepted}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création en cours...' : 'Créer mon entreprise'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Preview */}
        <div className="bg-gray-50 p-6 lg:p-8 hidden lg:block overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            {/* Preview Header */}
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Aperçu de votre fiche</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">En direct</span>
            </div>

            <div className="p-5">
              {/* Business Header */}
              <div className="flex gap-4 pb-5 border-b border-gray-100 mb-5">
                {formData.logo_preview ? (
                  <img src={formData.logo_preview} alt="Logo" className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-medium flex-shrink-0">
                    Logo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {formData.name || 'Nom de votre entreprise'}
                  </h1>
                  <div className="flex items-center gap-1 text-amber-400 my-1">
                    {'★★★★★'}
                    <span className="text-sm text-gray-500 ml-1">Nouveau</span>
                  </div>
                  {(formData.company_size || formData.founded_year) && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.company_size && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          👥 {COMPANY_SIZES.find(s => s.id === formData.company_size)?.label}
                        </span>
                      )}
                      {formData.founded_year && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          📅 Fondée en {formData.founded_year}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {((formData.phone && formData.show_phone) || (formData.email && formData.show_email) || (formData.website && formData.show_website) || (formData.address && formData.show_address)) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  {formData.phone && formData.show_phone && (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span>📞</span>
                      <span className="text-gray-900">{formatPhone(formData.phone)}</span>
                    </div>
                  )}
                  {formData.email && formData.show_email && (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span>✉️</span>
                      <span className="text-blue-600">{formData.email}</span>
                    </div>
                  )}
                  {formData.website && formData.show_website && (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span>🌐</span>
                      <span className="text-blue-600">{formData.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                  {formData.address && formData.show_address && (
                    <div className="flex items-center gap-3 py-2">
                      <span>📍</span>
                      <div>
                        <span className="text-gray-900 block">
                          {[formData.address, formData.city, formData.postal_code].filter(Boolean).join(', ')}
                        </span>
                        {formData.region && (
                          <span className="text-gray-500 text-sm">
                            {[formData.mrc, formData.region].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {formData.description && (
                <div className="mb-5">
                  <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}

              {/* Business Hours */}
              {formData.show_hours && (
                <div className="mb-5">
                  <h3 className="font-semibold text-gray-900 mb-2">Heures d&apos;ouverture</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(formData.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600">{DAYS_FR[day]}</span>
                        <span className="text-gray-900">
                          {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {formData.services.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, index) => (
                      <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {formData.image_previews.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.image_previews.slice(0, 6).map((preview, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {formData.image_previews.length > 6 && (
                      <div className="aspect-square rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold">
                        +{formData.image_previews.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!formData.name && !formData.description && !formData.phone && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3 opacity-50">👀</div>
                  <p className="text-gray-400">Commencez à remplir le formulaire pour voir l&apos;aperçu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
