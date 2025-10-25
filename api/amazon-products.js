// Amazon Associates - Version simple avec 4 produits fixes
// Utilise les liens courts Amazon fournis (tracking intégré)

const amazonProducts = [
  {
    title: 'Produit recommandé pour entrepreneurs',
    url: 'https://amzn.to/47GZ6RZ',
    image: 'https://m.media-amazon.com/images/I/71QKQ9mwV7L._SL1500_.jpg'
  },
  {
    title: 'Outil professionnel recommandé',
    url: 'https://amzn.to/4ohXHr1',
    image: 'https://m.media-amazon.com/images/I/81-QB7nDh4L._SL1500_.jpg'
  },
  {
    title: 'Ressource essentielle pour votre entreprise',
    url: 'https://amzn.to/4hszRWP',
    image: 'https://m.media-amazon.com/images/I/71FJuNc1b7L._SL1500_.jpg'
  },
  {
    title: 'Guide pratique pour professionnels',
    url: 'https://amzn.to/3J4Dm9r',
    image: 'https://m.media-amazon.com/images/I/71kJYu1fVcL._SL1500_.jpg'
  }
];

export default async function handler(req, res) {
  try {
    // Retourne toujours les mêmes 4 produits
    const products = amazonProducts.map(product => ({
      asin: null,
      title: product.title,
      image: product.image,
      price: null,
      rating: null,
      url: product.url,
      brand: null
    }));

    // Cache pour 24 heures (contenu statique)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).json({ products });

  } catch (error) {
    console.error('Amazon links error:', error);
    res.status(200).json({ products: [] });
  }
}
