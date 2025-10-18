import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Fallback data when Supabase is not configured
const fallbackData = {
  mainCategories: [
    { id: '1', slug: 'commerce-de-detail', label_fr: 'Commerce de détail', label_en: 'Retail' },
    { id: '2', slug: 'services-professionnels', label_fr: 'Services professionnels', label_en: 'Professional Services' },
    { id: '3', slug: 'sante-et-bien-etre', label_fr: 'Santé et bien-être', label_en: 'Health & Wellness' },
    { id: '4', slug: 'restauration-et-alimentation', label_fr: 'Restauration et alimentation', label_en: 'Food & Beverage' }
  ],
  subCategories: [
    { id: '1', main_category_id: '1', slug: 'boutiques-de-vetements', label_fr: 'Boutiques de vêtements', label_en: 'Clothing Boutiques' },
    { id: '2', main_category_id: '1', slug: 'bijouteries', label_fr: 'Bijouteries', label_en: 'Jewellery Stores' }
  ],
  businessSizes: [
    { id: '1', key: 'travailleur-autonome', label_fr: 'Travailleur autonome', label_en: 'Sole Proprietor', position: 1 },
    { id: '2', key: 'pme', label_fr: 'Petite ou moyenne entreprise', label_en: 'SME', position: 2 },
    { id: '3', key: 'grande-entreprise', label_fr: 'Grande entreprise', label_en: 'Large Enterprise', position: 3 }
  ],
  serviceLanguages: [
    { id: '1', code: 'fr', label_fr: 'Français', label_en: 'French', position: 1 },
    { id: '2', code: 'en', label_fr: 'Anglais', label_en: 'English', position: 2 },
    { id: '3', code: 'fr-en', label_fr: 'Bilingue', label_en: 'Bilingual', position: 3 }
  ],
  serviceModes: [
    { id: '1', key: 'en-personne', label_fr: 'En personne', label_en: 'In-person', position: 1 },
    { id: '2', key: 'en-ligne', label_fr: 'En ligne', label_en: 'Online', position: 2 },
    { id: '3', key: 'a-domicile', label_fr: 'À domicile', label_en: 'At home', position: 3 },
    { id: '4', key: 'hybride', label_fr: 'Hybride', label_en: 'Hybrid', position: 4 }
  ],
  certifications: [
    { id: '1', key: 'ecoresponsable', label_fr: 'Écoresponsable', label_en: 'Eco-responsible' },
    { id: '2', key: 'iso9001', label_fr: 'ISO 9001', label_en: 'ISO 9001' },
    { id: '3', key: 'membre-association', label_fr: "Membre d'une association", label_en: 'Association Member' }
  ],
  accessibilityFeatures: [
    { id: '1', key: 'stationnement', label_fr: 'Stationnement sur place', label_en: 'On-site Parking' },
    { id: '2', key: 'mobilite-reduite', label_fr: 'Accès mobilité réduite', label_en: 'Accessible Entrance' },
    { id: '3', key: 'livraison', label_fr: 'Livraison', label_en: 'Delivery' },
    { id: '4', key: 'rampe', label_fr: "Rampe d'accès", label_en: 'Access Ramp' },
    { id: '5', key: 'ascenseur', label_fr: 'Ascenseur', label_en: 'Elevator' }
  ],
  paymentMethods: [
    { id: '1', key: 'argent', label_fr: 'Argent comptant', label_en: 'Cash' },
    { id: '2', key: 'debit', label_fr: 'Carte débit', label_en: 'Debit Card' },
    { id: '3', key: 'credit', label_fr: 'Carte de crédit', label_en: 'Credit Card' },
    { id: '4', key: 'virement', label_fr: 'Virement bancaire', label_en: 'Bank Transfer' },
    { id: '5', key: 'paiements-mobiles', label_fr: 'Paiements mobiles', label_en: 'Mobile Payments' }
  ]
};

export const getMainCategories = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.mainCategories, error: null };
  }

  const { data, error } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en, description_fr, description_en')
    .order('label_fr');

  return { data, error };
};

export const getSubCategories = async (mainCategoryId = null) => {
  if (!isSupabaseConfigured) {
    const filtered = mainCategoryId
      ? fallbackData.subCategories.filter((sc) => sc.main_category_id === mainCategoryId)
      : fallbackData.subCategories;
    return { data: filtered, error: null };
  }

  let query = supabase
    .from('sub_categories')
    .select('id, main_category_id, slug, label_fr, label_en, description_fr, description_en')
    .order('label_fr');

  if (mainCategoryId) {
    query = query.eq('main_category_id', mainCategoryId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getBusinessSizes = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.businessSizes, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_business_sizes')
    .select('id, key, label_fr, label_en, description_fr, description_en')
    .order('position');

  return { data, error };
};

export const getServiceLanguages = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.serviceLanguages, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_service_languages')
    .select('id, code, label_fr, label_en, description_fr, description_en')
    .order('position');

  return { data, error };
};

export const getServiceModes = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.serviceModes, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_service_modes')
    .select('id, key, label_fr, label_en, description_fr, description_en')
    .order('position');

  return { data, error };
};

export const getCertifications = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.certifications, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_certifications')
    .select('id, key, label_fr, label_en, description_fr, description_en')
    .order('label_fr');

  return { data, error };
};

export const getAccessibilityFeatures = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.accessibilityFeatures, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_accessibility_features')
    .select('id, key, label_fr, label_en, description_fr, description_en')
    .order('label_fr');

  return { data, error };
};

export const getPaymentMethods = async () => {
  if (!isSupabaseConfigured) {
    return { data: fallbackData.paymentMethods, error: null };
  }

  const { data, error } = await supabase
    .from('lookup_payment_methods')
    .select('id, key, label_fr, label_en, description_fr, description_en')
    .order('label_fr');

  return { data, error };
};
