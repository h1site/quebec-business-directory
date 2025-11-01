/**
 * Blog Article: 10 Recommandations de Restaurants à Montréal
 * Bilingual content (French/English)
 */

export const top10RestaurantsMontreal = {
  id: 'top-10-restaurants-montreal',
  slug: 'top-10-restaurants-montreal',
  publishedDate: '2025-11-01',
  lastUpdated: '2025-11-01',
  author: 'Registre du Québec',

  // SEO metadata
  seo: {
    fr: {
      title: '10 Recommandations de Restaurants à Montréal 2025 | Guide Complet',
      description: 'Découvrez 10 recommandations de restaurants à Montréal : du bistro élégant au steak frites, avec prix, spécialités et adresses. Guide complet 2025.',
      keywords: 'restaurants Montréal, recommandations restaurants Montréal, où manger Montréal, gastronomie Montréal, restaurants Montréal 2025'
    },
    en: {
      title: '10 Restaurant Recommendations in Montreal 2025 | Complete Guide',
      description: 'Discover 10 restaurant recommendations in Montreal: from elegant bistros to steak frites, with prices, specialties and addresses. Complete 2025 guide.',
      keywords: 'Montreal restaurants, restaurant recommendations Montreal, where to eat Montreal, Montreal gastronomy, Montreal restaurants 2025'
    }
  },

  // Hero image
  heroImage: {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    alt: {
      fr: 'Table de restaurant avec plats gastronomiques variés et verres de vin',
      en: 'Restaurant table with various gourmet dishes and wine glasses'
    }
  },

  // Article title (H1)
  title: {
    fr: '10 Recommandations de Restaurants à Montréal en 2025',
    en: '10 Restaurant Recommendations in Montreal in 2025'
  },

  // Intro text
  intro: {
    fr: '<p>Montréal est une <strong>capitale gastronomique</strong> reconnue mondialement. Des bistrots élégants aux adresses culte, découvrez nos 10 recommandations de restaurants qui définissent la scène culinaire montréalaise en 2025.</p><p><strong>Barème prix (indicatif)</strong> : <strong>$</strong> &lt; 15$ | <strong>$$</strong> 15–30$ | <strong>$$$</strong> 30–60$ | <strong>$$$$</strong> 60$+</p>',
    en: '<p>Montreal is a <strong>world-renowned gastronomic capital</strong>. From elegant bistros to cult addresses, discover our 10 restaurant recommendations defining Montreal\'s culinary scene in 2025.</p><p><strong>Price range (indicative)</strong>: <strong>$</strong> &lt; $15 | <strong>$$</strong> $15–30 | <strong>$$$</strong> $30–60 | <strong>$$$$</strong> $60+</p>'
  },

  // Article sections
  sections: [
    {
      id: 'restaurant-1-9',
      title: {
        fr: 'Recommandations de Restaurants',
        en: 'Restaurant Recommendations'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        alt: {
          fr: 'Table de restaurant avec plats gastronomiques variés et verres de vin',
          en: 'Restaurant table with various gourmet dishes and wine glasses'
        },
        credit: 'Photo par Jay Wennington sur Unsplash'
      },
      content: {
        fr: `
          <h2>1. Tuck Shop Restaurant - Bistro Saint-Henri</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p>Le <strong><a href="/entreprise/tuck-shop-restaurant-4">Tuck Shop</a></strong> est un bistro réputé de Saint-Henri qui brille par sa carte saisonnière, son exécution précise et sa belle sélection de vins naturels.</p>

          <h4>À essayer</h4>
          <p>Plats du marché changeants, viandes braisées, poissons du jour</p>

          <h5>Prix : <strong>$$$</strong> (30-60$)</h5>
          <h6>📍 4662 rue Notre-Dame O, Montréal</h6>

          <hr>

          <h2>2. Restaurant Chez Victoire - Bistronomie du Plateau</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p><strong><a href="/entreprise/restaurant-chez-victoire-1166342932">Chez Victoire</a></strong> représente la bistronomie montréalaise moderne : produits locaux, dressages soignés et ambiance conviviale qui définit l'esprit du Plateau.</p>

          <h4>À essayer</h4>
          <p>Volaille et gibier selon saison, poissons, pâtisseries maison</p>

          <h5>Prix : <strong>$$$</strong> (30-60$)</h5>
          <h6>📍 1453 av. du Mont-Royal E, Montréal | ☎️ (514) 521-6789</h6>

          <hr>

          <h2>3. Restaurant Yoko Luna - Supper Club Spectaculaire</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p>Le <strong><a href="/entreprise/restaurant-yoko-luna">Yoko Luna</a></strong> offre une expérience supper-club unique : cuisine asiatique contemporaine, cocktails créatifs et décor immersif pour une soirée mémorable.</p>

          <h4>À essayer</h4>
          <p>Assiettes à partager fusion, sushis créatifs, viandes grillées au charbon</p>

          <h5>Prix : <strong>$$$–$$$$</strong> (30-60$+)</h5>
          <h6>📍 1232 rue de la Montagne, Montréal</h6>

          <hr>

          <h2>4. Deville Dînerbar - Institution Rétro-Moderne</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p><strong><a href="/entreprise/deville-dinerbar-inc-2">Deville Dînerbar</a></strong> est une institution du centre-ville : diner rétro-moderne avec portions généreuses et esprit festif qui plaît à tous.</p>

          <h4>À essayer</h4>
          <p>Burgers gourmands, poutines créatives, milkshakes décadents</p>

          <h5>Prix : <strong>$$–$$$</strong> (15-60$)</h5>
          <h6>📍 1425 rue Stanley, Montréal</h6>

          <hr>

          <h2>5. Uniburger - Le Smash Burger Culte</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p><strong><a href="/entreprise/uniburger-inc-3">Uniburger</a></strong> a révolutionné le burger à Montréal : menu court, qualité constante et excellent rapport qualité-prix en font LE burger incontournable.</p>

          <h4>À essayer</h4>
          <p>Burger classique double smash, frites croustillantes maison</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 2001 rue Saint-Denis, Montréal</h6>

          <hr>

          <h2>6. Crêperie Chez Suzette - Tradition Bretonne</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p>La <strong><a href="/entreprise/creperie-chez-suzette-2">Crêperie Chez Suzette</a></strong> est une adresse emblématique du Vieux-Montréal pour ses crêpes authentiques et son ambiance chaleureuse.</p>

          <h4>À essayer</h4>
          <p>Galettes bretonnes complètes, crêpes flambées au Grand Marnier, soupe à l'oignon gratinée</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 3 rue Saint-Paul E, Montréal (Vieux-Montréal)</h6>

          <hr>

          <h2>7. Vieux Vélo - Brunch Emblématique</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p>Le <strong><a href="/entreprise/vieux-velo">Vieux Vélo</a></strong> est le chéri des locaux pour le brunch : œufs parfaitement exécutés, sandwichs créatifs et cafés soignés.</p>

          <h4>À essayer</h4>
          <p>Œufs bénédictine maison, sandwich "Val-Mont", latté specialty</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 6228 rue Cartier, Montréal (Rosemont)</h6>

          <hr>

          <h2>8. Restaurant Kiku - Classique Japonais</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p><strong><a href="/entreprise/restaurant-kiku-montreal-2">Restaurant Kiku</a></strong> sur Monkland est un classique pour ses sushis de qualité et son atmosphère conviviale de quartier.</p>

          <h4>À essayer</h4>
          <p>Assortiments sushis/makis chef, tempura légère, teriyaki grillés</p>

          <h5>Prix : <strong>$$–$$$</strong> (15-60$)</h5>
          <h6>📍 5515 avenue Monkland, Montréal (NDG)</h6>

          <hr>

          <h2>9. Gibeau Orange Julep - Icône Pop-Culture</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p>Le <strong><a href="/entreprise/restaurant-gibeau-orange-julep-1166504523">Gibeau Orange Julep</a></strong> est une véritable icône : architecture unique en forme d'orange, rassemblements auto et jus d'orange mythique depuis 1932.</p>

          <h4>À essayer</h4>
          <p>Hot-dog steamé à l'ancienne, poutine classique, jus d'orange "Julep" maison</p>

          <h5>Prix : <strong>$</strong> (&lt;15$)</h5>
          <h6>📍 7700 boulevard Décarie, Montréal | 🚗 Parking disponible</h6>

          <hr>

          <h2>10. Steak Frites St-Paul - Bistro Viande</h2>
          <h3>Pourquoi cette recommandation</h3>
          <p><strong><a href="/entreprise/steak-frites-3">Steak Frites</a></strong> excelle dans la simplicité : le concept parfaitement exécuté du steak grillé accompagné de frites croustillantes. Une adresse sans prétention qui maîtrise l'art du classique.</p>

          <h4>À essayer</h4>
          <p>Steak grillé au choix de cuisson, frites maison croustillantes, sauces variées</p>

          <h5>Prix : <strong>$$–$$$</strong> (15-60$)</h5>
          <h6>📍 405 rue Saint-Antoine O, Montréal</h6>
        `,
        en: `
          <h2>1. Tuck Shop Restaurant - Saint-Henri Bistro</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/tuck-shop-restaurant-4">Tuck Shop</a></strong> is a renowned Saint-Henri bistro that shines with its seasonal menu, precise execution, and beautiful natural wine selection.</p>

          <h4>Must Try</h4>
          <p>Changing market dishes, braised meats, fish of the day</p>

          <h5>Price: <strong>$$$</strong> ($30-60)</h5>
          <h6>📍 4662 Notre-Dame Street W, Montreal</h6>

          <hr>

          <h2>2. Restaurant Chez Victoire - Plateau Bistronomy</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/restaurant-chez-victoire-1166342932">Chez Victoire</a></strong> represents modern Montreal bistronomy: local products, refined plating, and friendly ambiance that defines the Plateau spirit.</p>

          <h4>Must Try</h4>
          <p>Seasonal poultry and game, fish, homemade pastries</p>

          <h5>Price: <strong>$$$</strong> ($30-60)</h5>
          <h6>📍 1453 Mont-Royal Ave E, Montreal | ☎️ (514) 521-6789</h6>

          <hr>

          <h2>3. Restaurant Yoko Luna - Spectacular Supper Club</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/restaurant-yoko-luna">Yoko Luna</a></strong> offers a unique supper club experience: contemporary Asian cuisine, creative cocktails, and immersive decor for a memorable evening.</p>

          <h4>Must Try</h4>
          <p>Fusion sharing plates, creative sushi, charcoal-grilled meats</p>

          <h5>Price: <strong>$$$–$$$$</strong> ($30-60+)</h5>
          <h6>📍 1232 de la Montagne Street, Montreal</h6>

          <hr>

          <h2>4. Deville Dînerbar - Retro-Modern Institution</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/deville-dinerbar-inc-2">Deville Dînerbar</a></strong> is a downtown institution: retro-modern diner with generous portions and festive spirit that pleases everyone.</p>

          <h4>Must Try</h4>
          <p>Gourmet burgers, creative poutines, decadent milkshakes</p>

          <h5>Price: <strong>$$–$$$</strong> ($15-60)</h5>
          <h6>📍 1425 Stanley Street, Montreal</h6>

          <hr>

          <h2>5. Uniburger - The Cult Smash Burger</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/uniburger-inc-3">Uniburger</a></strong> revolutionized burgers in Montreal: short menu, consistent quality, and excellent value make it THE essential burger spot.</p>

          <h4>Must Try</h4>
          <p>Classic double smash burger, crispy homemade fries</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 2001 Saint-Denis Street, Montreal</h6>

          <hr>

          <h2>6. Crêperie Chez Suzette - Breton Tradition</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/creperie-chez-suzette-2">Crêperie Chez Suzette</a></strong> is an iconic Old Montreal address for authentic crepes and warm atmosphere.</p>

          <h4>Must Try</h4>
          <p>Complete Breton galettes, Grand Marnier flambéed crepes, French onion soup au gratin</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 3 Saint-Paul Street E, Montreal (Old Montreal)</h6>

          <hr>

          <h2>7. Vieux Vélo - Iconic Brunch</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/vieux-velo">Vieux Vélo</a></strong> is the locals' favorite for brunch: perfectly executed eggs, creative sandwiches, and carefully crafted coffees.</p>

          <h4>Must Try</h4>
          <p>Homemade eggs benedict, "Val-Mont" sandwich, specialty latte</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 6228 Cartier Street, Montreal (Rosemont)</h6>

          <hr>

          <h2>8. Restaurant Kiku - Japanese Classic</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/restaurant-kiku-montreal-2">Restaurant Kiku</a></strong> on Monkland is a classic for quality sushi and friendly neighborhood atmosphere.</p>

          <h4>Must Try</h4>
          <p>Chef's sushi/maki assortments, light tempura, grilled teriyaki</p>

          <h5>Price: <strong>$$–$$$</strong> ($15-60)</h5>
          <h6>📍 5515 Monkland Avenue, Montreal (NDG)</h6>

          <hr>

          <h2>9. Gibeau Orange Julep - Pop-Culture Icon</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/restaurant-gibeau-orange-julep-1166504523">Gibeau Orange Julep</a></strong> is a true icon: unique orange-shaped architecture, car gatherings, and legendary orange juice since 1932.</p>

          <h4>Must Try</h4>
          <p>Old-fashioned steamed hot dog, classic poutine, homemade "Julep" orange juice</p>

          <h5>Price: <strong>$</strong> (&lt;$15)</h5>
          <h6>📍 7700 Décarie Boulevard, Montreal | 🚗 Parking available</h6>

          <hr>

          <h2>10. Steak Frites St-Paul - Meat Bistro</h2>
          <h3>Why We Recommend It</h3>
          <p><strong><a href="/en/entreprise/steak-frites-3">Steak Frites</a></strong> excels in simplicity: the perfectly executed concept of grilled steak with crispy fries. An unpretentious address that masters the art of the classic.</p>

          <h4>Must Try</h4>
          <p>Grilled steak cooked to order, crispy homemade fries, variety of sauces</p>

          <h5>Price: <strong>$$–$$$</strong> ($15-60)</h5>
          <h6>📍 405 Saint-Antoine Street W, Montreal</h6>
        `
      }
    },
    {
      id: 'autres-mentions',
      title: {
        fr: 'Autres Mentions',
        en: 'Other Mentions'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        alt: {
          fr: 'Variété de plats de restaurants présentés sur une table',
          en: 'Variety of restaurant dishes presented on a table'
        },
        credit: 'Photo par Lily Banse sur Unsplash'
      },
      content: {
        fr: `
          <p>Ces restaurants méritent également votre attention pour leurs spécialités uniques :</p>

          <h3>Crêpe Moundo - Crêpes Conviviales</h3>
          <p><strong><a href="/entreprise/crepe-moundo">Crêpe Moundo</a></strong> propose des crêpes sucrées et salées dans une ambiance décontractée.</p>
          <p><strong>$–$$</strong> | 📍 10650 place de l'Acadie, Montréal</p>

          <hr>

          <h3>Soupe Soupe Saint-Denis - Repas Santé</h3>
          <p><strong><a href="/entreprise/soupe-soupe-saint-denis-inc">Soupe Soupe</a></strong> offre soupes-repas nutritives et salades fraîches, parfait pour les midis pressés.</p>
          <p><strong>$–$$</strong> | 📍 1228 Saint-Denis, Montréal</p>

          <hr>

          <h3>Max Barbecue - BBQ Décontracté</h3>
          <p><strong><a href="/entreprise/max-barbecue">Max Barbecue</a></strong> sert un BBQ authentique dans une atmosphère conviviale, idéal entre amis.</p>
          <p><strong>$$</strong> | 📍 7093 rue Saint-Denis, Montréal</p>
        `,
        en: `
          <p>These restaurants also deserve your attention for their unique specialties:</p>

          <h3>Crêpe Moundo - Friendly Crepes</h3>
          <p><strong><a href="/en/entreprise/crepe-moundo">Crêpe Moundo</a></strong> offers sweet and savory crepes in a casual atmosphere.</p>
          <p><strong>$–$$</strong> | 📍 10650 de l'Acadie Place, Montreal</p>

          <hr>

          <h3>Soupe Soupe Saint-Denis - Healthy Meals</h3>
          <p><strong><a href="/en/entreprise/soupe-soupe-saint-denis-inc">Soupe Soupe</a></strong> offers nutritious soup-meals and fresh salads, perfect for busy lunches.</p>
          <p><strong>$–$$</strong> | 📍 1228 Saint-Denis, Montreal</p>

          <hr>

          <h3>Max Barbecue - Casual BBQ</h3>
          <p><strong><a href="/en/entreprise/max-barbecue">Max Barbecue</a></strong> serves authentic BBQ in a friendly atmosphere, ideal with friends.</p>
          <p><strong>$$</strong> | 📍 7093 Saint-Denis Street, Montreal</p>
        `
      }
    }
  ],

  // Call to action
  cta: {
    fr: {
      title: 'Découvrez Plus de Restaurants à Montréal',
      description: 'Explorez notre répertoire complet de restaurants montréalais avec avis, photos et coordonnées.',
      buttonText: 'Rechercher des Restaurants',
      buttonLink: '/recherche?category=restauration-et-alimentation'
    },
    en: {
      title: 'Discover More Restaurants in Montreal',
      description: 'Explore our complete directory of Montreal restaurants with reviews, photos and contact information.',
      buttonText: 'Search Restaurants',
      buttonLink: '/en/search?category=restauration-et-alimentation'
    }
  }
};
