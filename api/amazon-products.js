import paapi from 'amazon-paapi';

// Configuration Amazon Product Advertising API
const commonParameters = {
  AccessKey: process.env.AMAZON_ACCESS_KEY,
  SecretKey: process.env.AMAZON_SECRET_KEY,
  PartnerTag: process.env.AMAZON_ASSOCIATE_TAG || 'h1site0d-20',
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.ca'
};

// Mapping catégories → mots-clés Amazon
const categoryKeywords = {
  // Alimentation & Restauration
  'restaurants': 'cookbooks kitchen tools',
  'cafes-et-salons-de-the': 'coffee makers espresso',
  'boulangeries-et-patisseries': 'baking supplies cookbooks',
  'bars-et-pubs': 'bar tools cocktail books',
  'traiteurs': 'catering supplies cookbooks',

  // Commerce de détail
  'alimentation': 'kitchen storage food containers',
  'vetements-et-accessoires': 'fashion accessories',
  'electromenagers-et-electronique': 'electronics gadgets',
  'librairies-et-papeteries': 'books stationery office supplies',
  'pharmacies': 'health wellness',
  'meubles-et-decoration': 'home decor furniture',

  // Services professionnels
  'comptabilite-et-finance': 'accounting books business finance',
  'services-juridiques': 'legal books business law',
  'agences-immobilieres': 'real estate books investing',
  'architectes': 'architecture books design tools',
  'ingenieurs': 'engineering books technical tools',

  // Construction & Rénovation
  'entrepreneurs-generaux': 'power tools construction equipment',
  'plomberie': 'plumbing tools repair guides',
  'electricite': 'electrical tools safety equipment',
  'chauffage-et-climatisation': 'hvac tools thermostats',
  'peinture-et-decoration': 'painting supplies color guides',
  'menuiserie-et-ebenisterie': 'woodworking tools carpentry books',

  // Santé & Bien-être
  'cliniques-medicales': 'medical supplies health books',
  'dentistes': 'dental care oral hygiene',
  'optometristes': 'eye care vision health',
  'chiropraticiens': 'chiropractic books wellness',
  'massotherapie': 'massage tools wellness books',
  'psychologues': 'psychology books mental health',

  // Beauté & Soins personnels
  'salons-de-coiffure': 'hair styling tools professional products',
  'spas-et-esthetique': 'spa products beauty tools',
  'barbiers': 'barber tools grooming',

  // Automobile
  'garages-et-reparation-automobile': 'automotive tools car repair guides',
  'concessionnaires-automobiles': 'car accessories maintenance',
  'lave-autos': 'car cleaning products detailing',

  // Services aux entreprises
  'agences-de-marketing': 'marketing books business growth',
  'agences-de-publicite': 'advertising books creative tools',
  'consultants-en-gestion': 'business management books',
  'services-informatiques': 'technology books it tools',
  'developpement-web': 'web development books programming',

  // Éducation
  'ecoles-primaires-et-secondaires': 'educational books learning tools',
  'garderies-et-services-de-garde': 'childcare books educational toys',
  'formation-professionnelle': 'professional development books',

  // Divertissement
  'salles-de-spectacle': 'entertainment books event planning',
  'cinemas': 'movies blu-ray entertainment',
  'centres-sportifs': 'fitness equipment sports gear',

  // Défaut
  'default': 'business books entrepreneurship'
};

export default async function handler(req, res) {
  try {
    const { category, keywords } = req.query;

    // Validation
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY) {
      return res.status(500).json({
        error: 'Amazon API credentials not configured',
        products: []
      });
    }

    // Déterminer les mots-clés de recherche
    let searchKeywords = keywords || categoryKeywords[category] || categoryKeywords['default'];

    // Paramètres de recherche
    const requestParameters = {
      Keywords: searchKeywords,
      SearchIndex: 'All',
      ItemCount: 4,
      Resources: [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ContentInfo',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'CustomerReviews.StarRating'
      ]
    };

    // Recherche Amazon
    const data = await paapi.SearchItems(commonParameters, requestParameters);

    // Vérifier si des produits ont été trouvés
    if (!data || !data.SearchResult || !data.SearchResult.Items) {
      return res.status(200).json({ products: [] });
    }

    // Formatter les produits pour le frontend
    const products = data.SearchResult.Items.map(item => {
      const price = item.Offers?.Listings?.[0]?.Price;
      const image = item.Images?.Primary?.Medium;

      return {
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Produit',
        image: image?.URL || null,
        price: price?.DisplayAmount || null,
        rating: item.CustomerReviews?.StarRating?.Value || null,
        url: item.DetailPageURL,
        brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || null
      };
    });

    // Cache pour 1 heure (les produits ne changent pas souvent)
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).json({ products });

  } catch (error) {
    console.error('Amazon API Error:', error);

    // Ne pas exposer les erreurs détaillées au client
    res.status(200).json({
      products: [],
      error: 'Unable to fetch products at this time'
    });
  }
}
