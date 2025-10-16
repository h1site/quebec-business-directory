import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      hero: {
        title: 'Trouvez les meilleurs professionnels près de chez vous',
        subtitle:
          'Parcourez des milliers d\'entreprises locales du Québec pour des services fiables et de qualité.',
        whatPlaceholder: 'Que recherchez-vous?',
        wherePlaceholder: 'Où?',
        searchButton: 'Rechercher'
      },
      navigation: {
        home: 'Accueil',
        search: 'Recherche',
        addListing: 'Ajouter une entreprise',
        login: 'Connexion',
        register: 'Créer un compte',
        dashboard: 'Tableau de bord'
      },
      footer: {
        localSearches: 'Recherches locales populaires',
        popularLocations: 'Endroits populaires au Canada',
        languageToggle: 'English'
      },
      home: {
        popularCategoriesTitle: 'Explorez les catégories populaires',
        popularCitiesTitle: 'Villes les plus consultées',
        categoryDescription: 'Recherchez les meilleurs professionnels et entreprises en {{category}} partout au Québec.',
        cityDescription: 'Découvrez des entreprises locales, des services et des professionnels de confiance à {{city}}.'
      },
      auth: {
        email: 'Courriel',
        password: 'Mot de passe',
        confirmPassword: 'Confirmez le mot de passe',
        loginTitle: 'Connexion',
        registerTitle: 'Créer un compte',
        submit: 'Soumettre'
      },
      dashboard: {
        createTitle: 'Créer une fiche d\'entreprise',
        businessName: 'Nom de l\'entreprise',
        description: 'Description',
        phone: 'Téléphone',
        email: 'Courriel',
        website: 'Site web',
        address: 'Adresse',
        city: 'Ville',
        postalCode: 'Code postal',
        categories: 'Catégories',
        productsServices: 'Produits et services',
        submit: 'Soumettre la fiche'
      },
      search: {
        resultsTitle: 'Résultats de recherche',
        noResults: 'Aucun résultat trouvé. Essayez d\'ajuster vos filtres.',
        filters: 'Filtres',
        telephone: 'Téléphone',
        category: 'Catégorie',
        city: 'Ville',
        distance: 'Distance',
        applyFilters: 'Appliquer les filtres',
        clearFilters: 'Réinitialiser'
      }
    }
  },
  en: {
    translation: {
      hero: {
        title: 'Find the best professionals near you',
        subtitle:
          'Browse thousands of Quebec-based local businesses for reliable, high-quality services.',
        whatPlaceholder: 'What are you looking for?',
        wherePlaceholder: 'Where?',
        searchButton: 'Search'
      },
      navigation: {
        home: 'Home',
        search: 'Search',
        addListing: 'Add a business',
        login: 'Sign in',
        register: 'Create account',
        dashboard: 'Dashboard'
      },
      footer: {
        localSearches: 'Popular local searches',
        popularLocations: 'Popular locations in Canada',
        languageToggle: 'Français'
      },
      home: {
        popularCategoriesTitle: 'Explore popular categories',
        popularCitiesTitle: 'Most viewed cities',
        categoryDescription: 'Find trusted professionals and businesses in {{category}} across Quebec.',
        cityDescription: 'Discover local businesses, services and trusted professionals in {{city}}.'
      },
      auth: {
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        loginTitle: 'Sign in',
        registerTitle: 'Create an account',
        submit: 'Submit'
      },
      dashboard: {
        createTitle: 'Create a business listing',
        businessName: 'Business name',
        description: 'Description',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
        address: 'Address',
        city: 'City',
        postalCode: 'Postal code',
        categories: 'Categories',
        productsServices: 'Products and services',
        submit: 'Submit listing'
      },
      search: {
        resultsTitle: 'Search results',
        noResults: 'No results found. Try adjusting your filters.',
        filters: 'Filters',
        telephone: 'Telephone',
        category: 'Category',
        city: 'City',
        distance: 'Distance',
        applyFilters: 'Apply filters',
        clearFilters: 'Reset filters'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
