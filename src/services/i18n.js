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
        dashboard: 'Tableau de bord',
        logout: 'Déconnexion',
        donate: 'Faire un don'
      },
      footer: {
        localSearches: 'Recherches locales populaires',
        popularLocations: 'Endroits populaires au Canada',
        languageToggle: 'English',
        copyrightYear: '© {{year}} Registre d\'entreprise du Québec.',
        copyrightRights: 'Tous droits réservés.',
        createdBy: 'Création de l\'agence web'
      },
      home: {
        popularCategoriesTitle: 'Explorez les catégories populaires',
        popularCitiesTitle: 'Villes les plus consultées',
        categoryDescription: 'Recherchez les meilleurs professionnels et entreprises en {{category}} partout au Québec.',
        cityDescription: 'Découvrez des entreprises locales, des services et des professionnels de confiance à {{city}}.',
        randomBusinessesTitle: 'Découvertes du jour',
        randomBusinessesSubtitle: 'Chaque jour, de nouvelles pépites à découvrir',
        reviews: 'avis',
        seeDetails: 'Voir les détails',
        discoverOthers: 'Découvrir d\'autres entreprises'
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
        clearFilters: 'Réinitialiser',
        // Search page specific translations
        searchPlaceholder: 'Nom d\'entreprise, service...',
        cityPlaceholder: 'Ville, région...',
        searchButton: 'Rechercher',
        searching: 'Recherche en cours...',
        clearAllFilters: 'Effacer tous les filtres',
        region: 'Région',
        mrc: 'MRC',
        subCategory: 'Sous-catégorie',
        allRegions: 'Toutes les régions',
        allMRCs: 'Toutes les MRC',
        allCities: 'Toutes les villes',
        allCategories: 'Toutes les catégories',
        allSubCategories: 'Toutes les sous-catégories',
        resultsCount: '<strong>{{displayed}}</strong> sur <strong>{{total}}</strong> résultat{{plural}} affiché{{plural}}',
        loadMore: 'Voir plus',
        loading: 'Chargement...',
        noResultsFound: 'Aucun résultat trouvé',
        noResultsMessage: 'Essayez de modifier vos critères de recherche.',
        welcomeTitle: 'Commencez votre recherche',
        welcomeMessage: 'Utilisez les filtres pour trouver des entreprises.',
        // Location prompt
        locationPromptTitle: 'Découvrez les entreprises près de vous',
        locationPromptSubtitle: 'Permettez-nous de détecter votre position pour afficher les entreprises de votre région automatiquement.',
        detectLocation: 'Détecter ma position',
        detectingLocation: 'Détection en cours...',
        useFiltersManually: 'Utiliser les filtres manuellement',
        locationNote: 'Vous pouvez aussi utiliser les filtres à gauche pour rechercher par région, ville ou catégorie.',
        locationErrorDenied: 'Vous avez refusé l\'accès à votre position. Vous pouvez toujours sélectionner votre région manuellement.',
        locationErrorUnavailable: 'Impossible de déterminer votre position. Veuillez sélectionner votre région manuellement.',
        locationErrorTimeout: 'La demande de localisation a expiré. Veuillez réessayer.',
        locationErrorGeneric: 'Erreur lors de la détection de votre position. Veuillez sélectionner votre région manuellement.'
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
        dashboard: 'Dashboard',
        logout: 'Sign out',
        donate: 'Donate'
      },
      footer: {
        localSearches: 'Popular local searches',
        popularLocations: 'Popular locations in Canada',
        languageToggle: 'Français',
        copyrightYear: '© {{year}} Quebec Business Directory.',
        copyrightRights: 'All rights reserved.',
        createdBy: 'Created by web agency'
      },
      home: {
        popularCategoriesTitle: 'Explore popular categories',
        popularCitiesTitle: 'Most viewed cities',
        categoryDescription: 'Find trusted professionals and businesses in {{category}} across Quebec.',
        randomBusinessesTitle: 'Today\'s Discoveries',
        randomBusinessesSubtitle: 'Every day, new gems to discover',
        reviews: 'reviews',
        seeDetails: 'See details',
        discoverOthers: 'Discover other businesses',
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
        clearFilters: 'Reset filters',
        // Search page specific translations
        searchPlaceholder: 'Business name, service...',
        cityPlaceholder: 'City, region...',
        searchButton: 'Search',
        searching: 'Searching...',
        clearAllFilters: 'Clear all filters',
        region: 'Region',
        mrc: 'RCM',
        subCategory: 'Subcategory',
        allRegions: 'All regions',
        allMRCs: 'All RCMs',
        allCities: 'All cities',
        allCategories: 'All categories',
        allSubCategories: 'All subcategories',
        resultsCount: '<strong>{{displayed}}</strong> of <strong>{{total}}</strong> result{{plural}} shown',
        loadMore: 'Load more',
        loading: 'Loading...',
        noResultsFound: 'No results found',
        noResultsMessage: 'Try modifying your search criteria.',
        welcomeTitle: 'Start your search',
        welcomeMessage: 'Use the filters to find businesses.',
        // Location prompt
        locationPromptTitle: 'Discover businesses near you',
        locationPromptSubtitle: 'Allow us to detect your location to automatically display businesses in your region.',
        detectLocation: 'Detect my location',
        detectingLocation: 'Detecting location...',
        useFiltersManually: 'Use filters manually',
        locationNote: 'You can also use the filters on the left to search by region, city or category.',
        locationErrorDenied: 'You denied access to your location. You can still manually select your region.',
        locationErrorUnavailable: 'Unable to determine your location. Please manually select your region.',
        locationErrorTimeout: 'Location request timed out. Please try again.',
        locationErrorGeneric: 'Error detecting your location. Please manually select your region.'
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
