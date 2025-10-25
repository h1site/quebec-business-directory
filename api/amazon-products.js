// Amazon Associates - Version simple avec liens directs (sans PA-API)
// Cette version génère des liens de recherche Amazon avec votre tag d'affiliation

const ASSOCIATE_TAG = 'h1site0d-20';

// Mapping catégories → produits recommandés manuellement
const categoryProducts = {
  'agences-de-marketing': [
    { asin: 'B08R6Q6QJC', title: 'Marketing 5.0: Technology for Humanity', keywords: 'marketing digital' },
    { asin: 'B00DMCV88K', title: 'The Lean Startup', keywords: 'startup entrepreneurship' },
    { asin: 'B07FK1MPKZ', title: 'Building a StoryBrand', keywords: 'brand marketing' },
    { asin: 'B08Z788MYZ', title: 'Digital Marketing Strategy', keywords: 'digital strategy' }
  ],
  'restaurants': [
    { asin: 'B07WMLQ26P', title: 'Professional Chef Knife Set', keywords: 'kitchen knives' },
    { asin: 'B01K0W8LTE', title: 'Restaurant Recipe Notebook', keywords: 'recipe book' },
    { asin: 'B08L7TQYNC', title: 'Commercial Food Processor', keywords: 'food processor' },
    { asin: 'B07Y3GSDV1', title: 'Professional Cooking', keywords: 'cooking books' }
  ],
  'plomberie': [
    { asin: 'B07VPBKLRG', title: 'Plumbing Tool Kit', keywords: 'plumbing tools' },
    { asin: 'B08F56GZNH', title: 'Pipe Wrench Set', keywords: 'pipe wrench' },
    { asin: 'B089Y7TD7M', title: 'Plumbers Handbook', keywords: 'plumbing guide' },
    { asin: 'B07K214WCL', title: 'Leak Detection Tools', keywords: 'leak detector' }
  ],
  'salons-de-coiffure': [
    { asin: 'B08RNJX5V7', title: 'Professional Hair Cutting Scissors', keywords: 'hair scissors' },
    { asin: 'B08PP8Y3R8', title: 'Salon Hair Dryer', keywords: 'professional hair dryer' },
    { asin: 'B07YQWGVTM', title: 'Hair Styling Products Set', keywords: 'hair styling' },
    { asin: 'B08C7G9KYN', title: 'Hairdressing Techniques Book', keywords: 'hairstyling book' }
  ],
  'default': [
    { asin: 'B08R6Q6QJC', title: 'Good to Great', keywords: 'business books' },
    { asin: 'B00DMCV88K', title: 'The Lean Startup', keywords: 'entrepreneurship' },
    { asin: 'B07FK1MPKZ', title: 'Start with Why', keywords: 'leadership books' },
    { asin: 'B08Z788MYZ', title: 'The E-Myth Revisited', keywords: 'small business' }
  ]
};

// Générer une URL de recherche Amazon avec tag d'affiliation
function generateAmazonSearchUrl(keywords) {
  const baseUrl = 'https://www.amazon.ca/s';
  const params = new URLSearchParams({
    k: keywords,
    tag: ASSOCIATE_TAG
  });
  return `${baseUrl}?${params.toString()}`;
}

// Générer une URL de produit Amazon avec tag d'affiliation
function generateAmazonProductUrl(asin) {
  return `https://www.amazon.ca/dp/${asin}?tag=${ASSOCIATE_TAG}`;
}

export default async function handler(req, res) {
  try {
    const { category } = req.query;

    // Sélectionner les produits pour cette catégorie
    const products = categoryProducts[category] || categoryProducts['default'];

    // Formatter les produits pour le frontend
    const formattedProducts = products.map(product => ({
      asin: product.asin,
      title: product.title,
      image: null, // Pas d'image sans API
      price: null,  // Pas de prix sans API
      rating: null, // Pas de note sans API
      url: generateAmazonProductUrl(product.asin),
      brand: null
    }));

    // Cache pour 24 heures (contenu statique)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).json({ products: formattedProducts });

  } catch (error) {
    console.error('Amazon Simple Links Error:', error);
    res.status(200).json({ products: [] });
  }
}
