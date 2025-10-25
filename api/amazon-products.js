// Amazon Associates - Version simple avec 4 produits fixes
// Utilise les liens courts Amazon fournis (tracking intégré)

const amazonProducts = [
  {
    title: 'Souffleuse à neige sans fil',
    url: 'https://amzn.to/47GZ6RZ',
    image: 'https://m.media-amazon.com/images/I/71PToFWuzFL._AC_SY300_SX300_QL70_ML2_.jpg'
  },
  {
    title: 'BENFEI Hub USB C 5 en 1',
    url: 'https://amzn.to/4ohXHr1',
    image: 'https://m.media-amazon.com/images/I/615tvY-j9sL._AC_SY300_SX300_QL70_ML2_.jpg'
  },
  {
    title: 'Étagère de rangement en métal',
    url: 'https://amzn.to/4hszRWP',
    image: 'https://m.media-amazon.com/images/I/71TNnLfi2mL._AC_SY879_.jpg'
  },
  {
    title: 'Dell Moniteur S2725HS 27"',
    url: 'https://amzn.to/3J4Dm9r',
    image: 'https://m.media-amazon.com/images/I/71Cn8N4oo4L._AC_SX679_.jpg'
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
