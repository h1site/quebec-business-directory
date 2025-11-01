/**
 * Blog Article: Top 10 Restaurants à Montréal
 * Bilingual content (French/English)
 */

export const top10RestaurantsMontreal = {
  id: 'top-10-restaurants-montreal',
  slug: 'top-10-restaurants-montreal',
  publishedDate: '2025-11-01',
  lastUpdated: '2025-11-01',
  author: 'Registre du Québec',
  readTime: '10 min',

  // SEO metadata
  seo: {
    fr: {
      title: 'Top 10 des Meilleurs Restaurants à Montréal 2025 | Guide Complet',
      description: 'Découvrez les 10 meilleurs restaurants à Montréal : du bistro élégant au burger culte, avec prix, spécialités et adresses. Guide complet 2025.',
      keywords: 'restaurants Montréal, meilleurs restaurants Montréal, où manger Montréal, gastronomie Montréal, restaurants top Montréal 2025'
    },
    en: {
      title: 'Top 10 Best Restaurants in Montreal 2025 | Complete Guide',
      description: 'Discover the 10 best restaurants in Montreal: from elegant bistros to cult burgers, with prices, specialties and addresses. Complete 2025 guide.',
      keywords: 'Montreal restaurants, best restaurants Montreal, where to eat Montreal, Montreal gastronomy, top Montreal restaurants 2025'
    }
  },

  // Hero image
  heroImage: {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    alt: {
      fr: 'Intérieur élégant de restaurant avec tables dressées et ambiance chaleureuse à Montréal',
      en: 'Elegant restaurant interior with set tables and warm ambiance in Montreal'
    }
  },

  // Article title (H1)
  title: {
    fr: 'Top 10 des Meilleurs Restaurants à Montréal en 2025',
    en: 'Top 10 Best Restaurants in Montreal in 2025'
  },

  // Intro text
  intro: {
    fr: '<p>Montréal est une <strong>capitale gastronomique</strong> reconnue mondialement. Des bistrots élégants aux adresses culte, découvrez notre sélection des 10 meilleurs restaurants qui définissent la scène culinaire montréalaise en 2025.</p><p><strong>Barème prix (indicatif)</strong> : <strong>$</strong> &lt; 15$ | <strong>$$</strong> 15–30$ | <strong>$$$</strong> 30–60$ | <strong>$$$$</strong> 60$+</p>',
    en: '<p>Montreal is a <strong>world-renowned gastronomic capital</strong>. From elegant bistros to cult addresses, discover our selection of the 10 best restaurants defining Montreal\'s culinary scene in 2025.</p><p><strong>Price range (indicative)</strong>: <strong>$</strong> &lt; $15 | <strong>$$</strong> $15–30 | <strong>$$$</strong> $30–60 | <strong>$$$$</strong> $60+</p>'
  },

  // Article sections
  sections: [
    {
      id: 'restaurant-1',
      title: {
        fr: '1. Restaurant Le Filet - Cuisine de la Mer Élégante',
        en: '1. Restaurant Le Filet - Elegant Seafood Cuisine'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de',
        alt: {
          fr: 'Assiette de fruits de mer élégamment dressée dans un restaurant gastronomique',
          en: 'Elegantly plated seafood dish in a gourmet restaurant'
        },
        credit: 'Photo par Jay Wennington sur Unsplash'
      },
      content: {
        fr: `
          <h2>1. Restaurant Le Filet</h2>

          <h3>Pourquoi il est dans le Top 10</h3>
          <p>Le <strong><a href="/recherche?q=restaurant+le+filet+montreal">Restaurant Le Filet</a></strong> incarne la cuisine de marché montréalaise axée sur la mer. Son ambiance chic de quartier, combinée à un service affûté et une carte créative, en fait une destination incontournable pour les amateurs de produits de la mer.</p>

          <h4>Spécialités à essayer</h4>
          <ul>
            <li><strong>Tartares créatifs</strong> - Préparations innovantes avec poissons frais du jour</li>
            <li><strong>Poissons entiers travaillés</strong> - Techniques de cuisson maîtrisées</li>
            <li><strong>Assiettes à partager</strong> - Expérience conviviale de dégustation</li>
          </ul>

          <h5>Fourchette de prix</h5>
          <p><strong>$$$–$$$$</strong> (30-60$+)</p>

          <h6>Informations pratiques</h6>
          <p>📍 <strong>Adresse</strong> : 219, avenue Mont-Royal Ouest, Montréal<br>
          🏙️ <strong>Quartier</strong> : Plateau-Mont-Royal<br>
          🍷 <strong>Ambiance</strong> : Chic décontracté, idéal pour occasions spéciales</p>
        `,
        en: `
          <h2>1. Restaurant Le Filet</h2>

          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=restaurant+le+filet+montreal">Restaurant Le Filet</a></strong> embodies Montreal's market-driven seafood cuisine. Its chic neighborhood ambiance, combined with sharp service and a creative menu, makes it an essential destination for seafood lovers.</p>

          <h4>Specialties to Try</h4>
          <ul>
            <li><strong>Creative tartares</strong> - Innovative preparations with fresh daily fish</li>
            <li><strong>Whole worked fish</strong> - Masterful cooking techniques</li>
            <li><strong>Sharing plates</strong> - Convivial tasting experience</li>
          </ul>

          <h5>Price Range</h5>
          <p><strong>$$$–$$$$</strong> ($30-60+)</p>

          <h6>Practical Information</h6>
          <p>📍 <strong>Address</strong>: 219 Mont-Royal Avenue West, Montreal<br>
          🏙️ <strong>Neighborhood</strong>: Plateau-Mont-Royal<br>
          🍷 <strong>Ambiance</strong>: Casual chic, ideal for special occasions</p>
        `
      }
    },
    {
      id: 'restaurant-2-10',
      title: {
        fr: 'Les Autres Incontournables',
        en: 'Other Must-Try Restaurants'
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
          <h2>2. Tuck Shop Restaurant - Bistro Saint-Henri</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p>Le <strong><a href="/recherche?q=tuck+shop+restaurant+montreal">Tuck Shop</a></strong> est un bistro réputé de Saint-Henri qui brille par sa carte saisonnière, son exécution précise et sa belle sélection de vins naturels.</p>

          <h4>À essayer</h4>
          <p>Plats du marché changeants, viandes braisées, poissons du jour</p>

          <h5>Prix : <strong>$$$</strong> (30-60$)</h5>
          <h6>📍 4662 rue Notre-Dame O, Montréal</h6>

          <hr>

          <h2>3. Restaurant Chez Victoire - Bistronomie du Plateau</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p><strong><a href="/recherche?q=chez+victoire+montreal">Chez Victoire</a></strong> représente la bistronomie montréalaise moderne : produits locaux, dressages soignés et ambiance conviviale qui définit l'esprit du Plateau.</p>

          <h4>À essayer</h4>
          <p>Volaille et gibier selon saison, poissons, pâtisseries maison</p>

          <h5>Prix : <strong>$$$</strong> (30-60$)</h5>
          <h6>📍 1453 av. du Mont-Royal E, Montréal | ☎️ (514) 521-6789</h6>

          <hr>

          <h2>4. Restaurant Yoko Luna - Supper Club Spectaculaire</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p>Le <strong><a href="/recherche?q=yoko+luna+montreal">Yoko Luna</a></strong> offre une expérience supper-club unique : cuisine asiatique contemporaine, cocktails créatifs et décor immersif pour une soirée mémorable.</p>

          <h4>À essayer</h4>
          <p>Assiettes à partager fusion, sushis créatifs, viandes grillées au charbon</p>

          <h5>Prix : <strong>$$$–$$$$</strong> (30-60$+)</h5>
          <h6>📍 1232 rue de la Montagne, Montréal</h6>

          <hr>

          <h2>5. Deville Dînerbar - Institution Rétro-Moderne</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p><strong><a href="/recherche?q=deville+dinerbar+montreal">Deville Dînerbar</a></strong> est une institution du centre-ville : diner rétro-moderne avec portions généreuses et esprit festif qui plaît à tous.</p>

          <h4>À essayer</h4>
          <p>Burgers gourmands, poutines créatives, milkshakes décadents</p>

          <h5>Prix : <strong>$$–$$$</strong> (15-60$)</h5>
          <h6>📍 1425 rue Stanley, Montréal</h6>

          <hr>

          <h2>6. Uniburger - Le Smash Burger Culte</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p><strong><a href="/recherche?q=uniburger+montreal">Uniburger</a></strong> a révolutionné le burger à Montréal : menu court, qualité constante et excellent rapport qualité-prix en font LE burger incontournable.</p>

          <h4>À essayer</h4>
          <p>Burger classique double smash, frites croustillantes maison</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 2001 rue Saint-Denis, Montréal</h6>

          <hr>

          <h2>7. Crêperie Chez Suzette - Tradition Bretonne</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p>La <strong><a href="/recherche?q=creperie+chez+suzette+montreal">Crêperie Chez Suzette</a></strong> est une adresse emblématique du Vieux-Montréal pour ses crêpes authentiques et son ambiance chaleureuse.</p>

          <h4>À essayer</h4>
          <p>Galettes bretonnes complètes, crêpes flambées au Grand Marnier, soupe à l'oignon gratinée</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 3 rue Saint-Paul E, Montréal (Vieux-Montréal)</h6>

          <hr>

          <h2>8. Vieux Vélo - Brunch Emblématique</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p>Le <strong><a href="/recherche?q=vieux+velo+montreal">Vieux Vélo</a></strong> est le chéri des locaux pour le brunch : œufs parfaitement exécutés, sandwichs créatifs et cafés soignés.</p>

          <h4>À essayer</h4>
          <p>Œufs bénédictine maison, sandwich "Val-Mont", latté specialty</p>

          <h5>Prix : <strong>$–$$</strong> (&lt;15-30$)</h5>
          <h6>📍 6228 rue Cartier, Montréal (Rosemont)</h6>

          <hr>

          <h2>9. Restaurant Kiku - Classique Japonais</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p><strong><a href="/recherche?q=restaurant+kiku+montreal">Restaurant Kiku</a></strong> sur Monkland est un classique pour ses sushis de qualité et son atmosphère conviviale de quartier.</p>

          <h4>À essayer</h4>
          <p>Assortiments sushis/makis chef, tempura légère, teriyaki grillés</p>

          <h5>Prix : <strong>$$–$$$</strong> (15-60$)</h5>
          <h6>📍 5515 avenue Monkland, Montréal (NDG)</h6>

          <hr>

          <h2>10. Gibeau Orange Julep - Icône Pop-Culture</h2>
          <h3>Pourquoi il est dans le Top 10</h3>
          <p>Le <strong><a href="/recherche?q=orange+julep+montreal">Gibeau Orange Julep</a></strong> est une véritable icône : architecture unique en forme d'orange, rassemblements auto et jus d'orange mythique depuis 1932.</p>

          <h4>À essayer</h4>
          <p>Hot-dog steamé à l'ancienne, poutine classique, jus d'orange "Julep" maison</p>

          <h5>Prix : <strong>$</strong> (&lt;15$)</h5>
          <h6>📍 7700 boulevard Décarie, Montréal | 🚗 Parking disponible</h6>
        `,
        en: `
          <h2>2. Tuck Shop Restaurant - Saint-Henri Bistro</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=tuck+shop+restaurant+montreal">Tuck Shop</a></strong> is a renowned Saint-Henri bistro that shines with its seasonal menu, precise execution, and beautiful natural wine selection.</p>

          <h4>Must Try</h4>
          <p>Changing market dishes, braised meats, fish of the day</p>

          <h5>Price: <strong>$$$</strong> ($30-60)</h5>
          <h6>📍 4662 Notre-Dame Street W, Montreal</h6>

          <hr>

          <h2>3. Restaurant Chez Victoire - Plateau Bistronomy</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=chez+victoire+montreal">Chez Victoire</a></strong> represents modern Montreal bistronomy: local products, refined plating, and friendly ambiance that defines the Plateau spirit.</p>

          <h4>Must Try</h4>
          <p>Seasonal poultry and game, fish, homemade pastries</p>

          <h5>Price: <strong>$$$</strong> ($30-60)</h5>
          <h6>📍 1453 Mont-Royal Ave E, Montreal | ☎️ (514) 521-6789</h6>

          <hr>

          <h2>4. Restaurant Yoko Luna - Spectacular Supper Club</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=yoko+luna+montreal">Yoko Luna</a></strong> offers a unique supper club experience: contemporary Asian cuisine, creative cocktails, and immersive decor for a memorable evening.</p>

          <h4>Must Try</h4>
          <p>Fusion sharing plates, creative sushi, charcoal-grilled meats</p>

          <h5>Price: <strong>$$$–$$$$</strong> ($30-60+)</h5>
          <h6>📍 1232 de la Montagne Street, Montreal</h6>

          <hr>

          <h2>5. Deville Dînerbar - Retro-Modern Institution</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=deville+dinerbar+montreal">Deville Dînerbar</a></strong> is a downtown institution: retro-modern diner with generous portions and festive spirit that pleases everyone.</p>

          <h4>Must Try</h4>
          <p>Gourmet burgers, creative poutines, decadent milkshakes</p>

          <h5>Price: <strong>$$–$$$</strong> ($15-60)</h5>
          <h6>📍 1425 Stanley Street, Montreal</h6>

          <hr>

          <h2>6. Uniburger - The Cult Smash Burger</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=uniburger+montreal">Uniburger</a></strong> revolutionized burgers in Montreal: short menu, consistent quality, and excellent value make it THE essential burger spot.</p>

          <h4>Must Try</h4>
          <p>Classic double smash burger, crispy homemade fries</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 2001 Saint-Denis Street, Montreal</h6>

          <hr>

          <h2>7. Crêperie Chez Suzette - Breton Tradition</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=creperie+chez+suzette+montreal">Crêperie Chez Suzette</a></strong> is an iconic Old Montreal address for authentic crepes and warm atmosphere.</p>

          <h4>Must Try</h4>
          <p>Complete Breton galettes, Grand Marnier flambéed crepes, French onion soup au gratin</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 3 Saint-Paul Street E, Montreal (Old Montreal)</h6>

          <hr>

          <h2>8. Vieux Vélo - Iconic Brunch</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=vieux+velo+montreal">Vieux Vélo</a></strong> is the locals' favorite for brunch: perfectly executed eggs, creative sandwiches, and carefully crafted coffees.</p>

          <h4>Must Try</h4>
          <p>Homemade eggs benedict, "Val-Mont" sandwich, specialty latte</p>

          <h5>Price: <strong>$–$$</strong> (&lt;$15-30)</h5>
          <h6>📍 6228 Cartier Street, Montreal (Rosemont)</h6>

          <hr>

          <h2>9. Restaurant Kiku - Japanese Classic</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=restaurant+kiku+montreal">Restaurant Kiku</a></strong> on Monkland is a classic for quality sushi and friendly neighborhood atmosphere.</p>

          <h4>Must Try</h4>
          <p>Chef's sushi/maki assortments, light tempura, grilled teriyaki</p>

          <h5>Price: <strong>$$–$$$</strong> ($15-60)</h5>
          <h6>📍 5515 Monkland Avenue, Montreal (NDG)</h6>

          <hr>

          <h2>10. Gibeau Orange Julep - Pop-Culture Icon</h2>
          <h3>Why It's in the Top 10</h3>
          <p><strong><a href="/en/search?q=orange+julep+montreal">Gibeau Orange Julep</a></strong> is a true icon: unique orange-shaped architecture, car gatherings, and legendary orange juice since 1932.</p>

          <h4>Must Try</h4>
          <p>Old-fashioned steamed hot dog, classic poutine, homemade "Julep" orange juice</p>

          <h5>Price: <strong>$</strong> (&lt;$15)</h5>
          <h6>📍 7700 Décarie Boulevard, Montreal | 🚗 Parking available</h6>
        `
      }
    },
    {
      id: 'mentions-honorables',
      title: {
        fr: 'Mentions Honorables',
        en: 'Honorable Mentions'
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
          <h2>Mentions Honorables</h2>

          <p>Ces restaurants méritent également votre attention pour leurs spécialités uniques :</p>

          <h3>Steak Frites St-Paul - Bistro Viande</h3>
          <p><strong><a href="/recherche?q=steak+frites+montreal">Steak Frites</a></strong> excelle dans la simplicité : steak parfaitement grillé et frites croustillantes.</p>
          <p><strong>$$–$$$</strong> | 📍 405 rue Saint-Antoine O, Montréal</p>

          <hr>

          <h3>Crêpe Moundo - Crêpes Conviviales</h3>
          <p><strong><a href="/recherche?q=crepe+moundo+montreal">Crêpe Moundo</a></strong> propose des crêpes sucrées et salées dans une ambiance décontractée.</p>
          <p><strong>$–$$</strong> | 📍 10650 place de l'Acadie, Montréal</p>

          <hr>

          <h3>Soupe Soupe Saint-Denis - Repas Santé</h3>
          <p><strong><a href="/recherche?q=soupe+soupe+montreal">Soupe Soupe</a></strong> offre soupes-repas nutritives et salades fraîches, parfait pour les midis pressés.</p>
          <p><strong>$–$$</strong> | 📍 1228 Saint-Denis, Montréal</p>

          <hr>

          <h3>Max Barbecue - BBQ Décontracté</h3>
          <p><strong><a href="/recherche?q=max+barbecue+montreal">Max Barbecue</a></strong> sert un BBQ authentique dans une atmosphère conviviale, idéal entre amis.</p>
          <p><strong>$$</strong> | 📍 7093 rue Saint-Denis, Montréal</p>
        `,
        en: `
          <h2>Honorable Mentions</h2>

          <p>These restaurants also deserve your attention for their unique specialties:</p>

          <h3>Steak Frites St-Paul - Meat Bistro</h3>
          <p><strong><a href="/en/search?q=steak+frites+montreal">Steak Frites</a></strong> excels in simplicity: perfectly grilled steak and crispy fries.</p>
          <p><strong>$$–$$$</strong> | 📍 405 Saint-Antoine Street W, Montreal</p>

          <hr>

          <h3>Crêpe Moundo - Friendly Crepes</h3>
          <p><strong><a href="/en/search?q=crepe+moundo+montreal">Crêpe Moundo</a></strong> offers sweet and savory crepes in a casual atmosphere.</p>
          <p><strong>$–$$</strong> | 📍 10650 de l'Acadie Place, Montreal</p>

          <hr>

          <h3>Soupe Soupe Saint-Denis - Healthy Meals</h3>
          <p><strong><a href="/en/search?q=soupe+soupe+montreal">Soupe Soupe</a></strong> offers nutritious soup-meals and fresh salads, perfect for busy lunches.</p>
          <p><strong>$–$$</strong> | 📍 1228 Saint-Denis, Montreal</p>

          <hr>

          <h3>Max Barbecue - Casual BBQ</h3>
          <p><strong><a href="/en/search?q=max+barbecue+montreal">Max Barbecue</a></strong> serves authentic BBQ in a friendly atmosphere, ideal with friends.</p>
          <p><strong>$$</strong> | 📍 7093 Saint-Denis Street, Montreal</p>
        `
      }
    },
    {
      id: 'conseils-pratiques',
      title: {
        fr: 'Conseils Pratiques pour Profiter des Restaurants',
        en: 'Practical Tips to Enjoy Restaurants'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b',
        alt: {
          fr: 'Chef préparant des plats dans une cuisine de restaurant professionnel',
          en: 'Chef preparing dishes in a professional restaurant kitchen'
        },
        credit: 'Photo par Louis Hansel sur Unsplash'
      },
      content: {
        fr: `
          <h2>Conseils Pratiques</h2>

          <h3>Réservations</h3>
          <p>Pour les restaurants <strong>$$$–$$$$</strong>, réservez <strong>2-3 semaines à l'avance</strong>, surtout pour les vendredis et samedis soir. Les établissements plus décontractés acceptent généralement les clients sans réservation.</p>

          <h3>Meilleur Moment pour Visiter</h3>
          <ul>
            <li><strong>Brunch weekend</strong> : Arrivez avant 10h ou après 13h pour éviter l'attente</li>
            <li><strong>Déjeuner en semaine</strong> : Excellentes promotions lunch (11h30-14h)</li>
            <li><strong>Happy hour</strong> : Plusieurs restaurants offrent des rabais 16h-18h</li>
            <li><strong>Souper tôt</strong> : Réservez avant 18h30 pour plus de disponibilités</li>
          </ul>

          <h3>Budget Pratique</h3>
          <p><strong>Couple pour souper (2 personnes) estimations moyennes :</strong></p>
          <ul>
            <li><strong>$</strong> : 20-40$ total</li>
            <li><strong>$$</strong> : 40-80$ total</li>
            <li><strong>$$$</strong> : 80-150$ total</li>
            <li><strong>$$$$</strong> : 150$+ total</li>
          </ul>
          <p><em>Prix incluent taxes et pourboire (15-20% d'usage au Québec)</em></p>

          <h3>Stationnement à Montréal</h3>
          <ul>
            <li><strong>Plateau/Mile-End</strong> : Stationnement rue difficile, privilégiez métro ou Bixi</li>
            <li><strong>Centre-ville</strong> : Stationnements payants (15-25$/soir)</li>
            <li><strong>Vieux-Montréal</strong> : Stationnements Champ-de-Mars ou Ville-Marie</li>
            <li><strong>Applications utiles</strong> : SPAQ, PayByPhone pour stationnement rue</li>
          </ul>

          <h3>Code Vestimentaire</h3>
          <ul>
            <li><strong>Casual élégant</strong> : La plupart des restaurants $$$–$$$$</li>
            <li><strong>Décontracté</strong> : Burgers, crêperies, diners</li>
            <li><strong>Évitez</strong> : Shorts/sandales dans les établissements haut de gamme</li>
          </ul>
        `,
        en: `
          <h2>Practical Tips</h2>

          <h3>Reservations</h3>
          <p>For <strong>$$$–$$$$</strong> restaurants, book <strong>2-3 weeks ahead</strong>, especially for Friday and Saturday evenings. More casual establishments generally accept walk-ins.</p>

          <h3>Best Time to Visit</h3>
          <ul>
            <li><strong>Weekend brunch</strong>: Arrive before 10am or after 1pm to avoid waits</li>
            <li><strong>Weekday lunch</strong>: Excellent lunch promotions (11:30am-2pm)</li>
            <li><strong>Happy hour</strong>: Several restaurants offer discounts 4-6pm</li>
            <li><strong>Early dinner</strong>: Book before 6:30pm for more availability</li>
          </ul>

          <h3>Practical Budget</h3>
          <p><strong>Couple for dinner (2 people) average estimates:</strong></p>
          <ul>
            <li><strong>$</strong>: $20-40 total</li>
            <li><strong>$$</strong>: $40-80 total</li>
            <li><strong>$$$</strong>: $80-150 total</li>
            <li><strong>$$$$</strong>: $150+ total</li>
          </ul>
          <p><em>Prices include taxes and tip (15-20% customary in Quebec)</em></p>

          <h3>Parking in Montreal</h3>
          <ul>
            <li><strong>Plateau/Mile-End</strong>: Street parking difficult, prefer metro or Bixi</li>
            <li><strong>Downtown</strong>: Paid parking ($15-25/evening)</li>
            <li><strong>Old Montreal</strong>: Champ-de-Mars or Ville-Marie parking</li>
            <li><strong>Useful apps</strong>: SPAQ, PayByPhone for street parking</li>
          </ul>

          <h3>Dress Code</h3>
          <ul>
            <li><strong>Smart casual</strong>: Most $$$–$$$$ restaurants</li>
            <li><strong>Casual</strong>: Burgers, creperies, diners</li>
            <li><strong>Avoid</strong>: Shorts/sandals in upscale establishments</li>
          </ul>
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
      buttonLink: '/recherche?category=restaurants'
    },
    en: {
      title: 'Discover More Restaurants in Montreal',
      description: 'Explore our complete directory of Montreal restaurants with reviews, photos and contact information.',
      buttonText: 'Search Restaurants',
      buttonLink: '/en/search?category=restaurants'
    }
  }
};
