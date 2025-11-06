/**
 * Blog data for SSR
 * Simplified version of blog articles data for server-side rendering
 */

export const blogArticles = [
  {
    id: 'neq-quebec-guide',
    slug: 'neq-quebec-tout-savoir-numero-entreprise',
    publishedDate: '2025-11-01',
    author: 'Registre du Québec',
    readTime: '8 min',
    seo: {
      fr: {
        title: 'NEQ Québec : tout savoir sur le numéro d\'entreprise du Québec | Guide 2025',
        description: 'Guide complet NEQ Québec 2025 : définition du numéro d\'entreprise à 10 chiffres, qui doit l\'obtenir (inc., freelance, OSBL), étapes d\'immatriculation, recherche et vérification au registre.',
        keywords: 'NEQ Québec, numéro entreprise Québec, NEQ recherche, comment obtenir NEQ, registre entreprise Québec',
        canonical: 'https://registreduquebec.com/blogue/neq-quebec-tout-savoir-numero-entreprise'
      },
      en: {
        title: 'Quebec NEQ: Everything About the Quebec Enterprise Number | 2025 Guide',
        description: 'Complete Quebec NEQ guide 2025: definition of the 10-digit enterprise number, who needs it (inc., freelance, NPO), registration steps, search and verification in the registry.',
        keywords: 'Quebec NEQ, Quebec enterprise number, NEQ search, how to get NEQ, Quebec business registry',
        canonical: 'https://registreduquebec.com/en/blog/neq-quebec-tout-savoir-numero-entreprise'
      }
    },
    heroImage: {
      url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
      alt: {
        fr: 'Documents d\'entreprise et formulaires administratifs québécois montrant l\'importance du numéro NEQ',
        en: 'Quebec business documents and administrative forms showing the importance of NEQ number'
      }
    },
    title: {
      fr: 'NEQ Québec : tout savoir sur le numéro d\'entreprise du Québec',
      en: 'Quebec NEQ: Everything About the Quebec Enterprise Number'
    },
    intro: {
      fr: 'Le NEQ (Numéro d\'entreprise du Québec) est l\'identifiant officiel à 10 chiffres qui permet d\'identifier une entreprise immatriculée au Québec. Il est exigé dans de nombreuses démarches administratives et facilite les échanges avec l\'État.',
      en: 'The NEQ (Quebec Enterprise Number) is the official 10-digit identifier for businesses registered in Quebec. It is required for many administrative procedures and facilitates exchanges with the government.'
    },
    content: {
      fr: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Qu'est-ce que le NEQ?</h2>
          <p style="margin-bottom: 1rem;">Le NEQ (Numéro d'entreprise du Québec) est un identifiant unique à 10 chiffres attribué à chaque entreprise immatriculée au Québec. Ce numéro est essentiel pour toutes les transactions administratives avec le gouvernement du Québec et sert d'identification officielle pour votre entreprise.</p>
          <p style="margin-bottom: 1rem;">Le NEQ est attribué par le Registraire des entreprises du Québec (REQ) lors de l'immatriculation de votre entreprise. Il reste attaché à votre entreprise durant tout son cycle de vie, de sa création à sa fermeture.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Qui a besoin d'un NEQ?</h2>
          <p style="margin-bottom: 1rem;">Les types d'entreprises suivants doivent obtenir un NEQ :</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Sociétés par actions (Inc., Ltd., Ltée)</li>
            <li>Entreprises individuelles opérant sous un nom autre que celui du propriétaire</li>
            <li>Sociétés de personnes (générales et en commandite)</li>
            <li>Organismes à but non lucratif</li>
            <li>Coopératives</li>
          </ul>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Comment obtenir votre NEQ</h2>
          <p style="margin-bottom: 1rem;">Pour obtenir votre NEQ, vous devez immatriculer votre entreprise auprès du Registraire des entreprises du Québec. Le processus peut être complété en ligne via le site du REQ. Vous devrez fournir des informations sur la structure de votre entreprise, ses activités, son adresse et sa gestion.</p>
          <p style="margin-bottom: 1rem;">Les frais d'immatriculation varient selon le type d'entreprise. Une fois complétée, vous recevrez votre NEQ immédiatement, que vous pourrez ensuite utiliser pour toutes vos démarches administratives.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Rechercher un NEQ</h2>
          <p style="margin-bottom: 1rem;">Vous pouvez rechercher le NEQ de n'importe quelle entreprise québécoise en utilisant l'annuaire Registre du Québec. Entrez simplement le nom de l'entreprise et vous trouverez son NEQ ainsi que d'autres informations publiques telles que l'adresse, la date d'immatriculation et le statut de l'entreprise.</p>
        </section>
      `,
      en: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">What is the NEQ?</h2>
          <p style="margin-bottom: 1rem;">The NEQ (Numéro d'entreprise du Québec) is a unique 10-digit identifier assigned to every business registered in Quebec. This number is essential for all administrative dealings with the Quebec government and serves as the official identification for your business.</p>
          <p style="margin-bottom: 1rem;">The NEQ is assigned by the Quebec Enterprise Registrar (REQ) when you register your business. It remains attached to your business throughout its entire lifecycle, from creation to closure.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Who Needs a NEQ?</h2>
          <p style="margin-bottom: 1rem;">The following types of businesses must obtain a NEQ:</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Corporations (Inc., Ltd., Ltée)</li>
            <li>Sole proprietorships operating under a name other than the owner's name</li>
            <li>Partnerships (general and limited)</li>
            <li>Non-profit organizations</li>
            <li>Cooperatives</li>
          </ul>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">How to Obtain Your NEQ</h2>
          <p style="margin-bottom: 1rem;">To obtain your NEQ, you must register your business with the Quebec Enterprise Registrar. The process can be completed online through the REQ website. You'll need to provide information about your business structure, activities, address, and management.</p>
          <p style="margin-bottom: 1rem;">The registration fee varies depending on your business type. Once completed, you'll receive your NEQ immediately, which you can then use for all your administrative procedures.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Searching for a NEQ</h2>
          <p style="margin-bottom: 1rem;">You can search for any Quebec business's NEQ using the Registre du Québec directory. Simply enter the business name, and you'll find their NEQ along with other public information such as address, registration date, and business status.</p>
        </section>
      `
    }
  },
  {
    id: 'comment-reclamer-fiche',
    slug: 'comment-reclamer-fiche-entreprise',
    publishedDate: '2025-10-28',
    author: 'Registre du Québec',
    readTime: '6 min',
    seo: {
      fr: {
        title: 'Comment réclamer votre fiche d\'entreprise sur Registre du Québec | Guide complet',
        description: 'Guide complet pour réclamer votre fiche d\'entreprise sur Registre du Québec : étapes de réclamation, vérification d\'identité, avantages du backlink dofollow et optimisation SEO.',
        keywords: 'réclamer fiche entreprise, backlink dofollow, référencement local Québec, optimisation fiche entreprise',
        canonical: 'https://registreduquebec.com/blogue/comment-reclamer-fiche-entreprise'
      },
      en: {
        title: 'How to Claim Your Business Listing on Quebec Registry | Complete Guide',
        description: 'Complete guide to claim your business listing on Quebec Registry: claiming steps, identity verification, dofollow backlink benefits and SEO optimization.',
        keywords: 'claim business listing, dofollow backlink, Quebec local SEO, business listing optimization',
        canonical: 'https://registreduquebec.com/en/blog/comment-reclamer-fiche-entreprise'
      }
    },
    heroImage: {
      url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
      alt: {
        fr: 'Propriétaire d\'entreprise réclamant sa fiche en ligne avec ordinateur et smartphone',
        en: 'Business owner claiming their listing online with computer and smartphone'
      }
    },
    title: {
      fr: 'Comment réclamer votre fiche d\'entreprise sur Registre du Québec',
      en: 'How to Claim Your Business Listing on Quebec Registry'
    },
    intro: {
      fr: 'Réclamer votre fiche d\'entreprise sur le Registre du Québec vous permet de contrôler vos informations, d\'améliorer votre visibilité en ligne et d\'obtenir un précieux backlink dofollow pour votre référencement. Découvrez comment le faire en quelques étapes simples.',
      en: 'Claiming your business listing on Quebec Registry allows you to control your information, improve your online visibility, and get a valuable dofollow backlink for your SEO. Learn how to do it in a few simple steps.'
    },
    content: {
      fr: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Pourquoi réclamer votre fiche d'entreprise?</h2>
          <p style="margin-bottom: 1rem;">Réclamer votre fiche d'entreprise sur le Registre du Québec vous donne le contrôle sur vos informations et offre plusieurs avantages clés :</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Mettre à jour et corriger vos informations d'entreprise</li>
            <li>Ajouter des photos, heures d'ouverture et services</li>
            <li>Répondre aux avis clients</li>
            <li>Obtenir un backlink dofollow précieux vers votre site web</li>
            <li>Améliorer votre référencement local</li>
          </ul>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Comment réclamer votre fiche</h2>
          <p style="margin-bottom: 1rem;">Le processus de réclamation est simple et gratuit. Voici les étapes :</p>
          <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Trouvez votre entreprise avec la fonction de recherche</li>
            <li>Cliquez sur le bouton "Réclamer cette entreprise"</li>
            <li>Créez un compte gratuit ou connectez-vous</li>
            <li>Vérifiez votre identité en tant que propriétaire</li>
            <li>Complétez votre profil d'entreprise</li>
          </ol>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Avantages SEO de la réclamation</h2>
          <p style="margin-bottom: 1rem;">Quand vous réclamez votre fiche, vous obtenez un backlink dofollow vers votre site web. Ceci est précieux pour votre référencement car il aide à améliorer l'autorité de votre domaine et peut augmenter vos classements dans les moteurs de recherche comme Google.</p>
        </section>
      `,
      en: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Why Claim Your Business Listing?</h2>
          <p style="margin-bottom: 1rem;">Claiming your business listing on Registre du Québec gives you control over your business information and provides several key benefits:</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Update and correct your business information</li>
            <li>Add photos, hours of operation, and services</li>
            <li>Respond to customer reviews</li>
            <li>Get a valuable dofollow backlink to your website</li>
            <li>Improve your local SEO rankings</li>
          </ul>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">How to Claim Your Listing</h2>
          <p style="margin-bottom: 1rem;">The claiming process is simple and free. Here are the steps:</p>
          <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
            <li>Find your business using the search function</li>
            <li>Click on "Claim This Business" button</li>
            <li>Create a free account or log in</li>
            <li>Verify your identity as the business owner</li>
            <li>Complete your business profile</li>
          </ol>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">SEO Benefits of Claiming</h2>
          <p style="margin-bottom: 1rem;">When you claim your listing, you get a dofollow backlink to your website. This is valuable for your SEO because it helps improve your domain authority and can boost your rankings in search engines like Google.</p>
        </section>
      `
    }
  },
  {
    id: 'top-10-restaurants-montreal',
    slug: 'top-10-restaurants-montreal',
    publishedDate: '2025-10-25',
    author: 'Registre du Québec',
    readTime: '7 min',
    seo: {
      fr: {
        title: 'Top 10 des meilleurs restaurants à Montréal en 2025 | Registre du Québec',
        description: 'Découvrez les 10 meilleurs restaurants de Montréal en 2025 : Joe Beef, Toqué!, Liverpool House, Au Pied de Cochon et plus. Guide complet avec coordonnées et spécialités.',
        keywords: 'meilleurs restaurants Montréal, top restaurants Montréal 2025, restaurants gastronomiques Montréal, où manger Montréal',
        canonical: 'https://registreduquebec.com/blogue/top-10-restaurants-montreal'
      },
      en: {
        title: 'Top 10 Best Restaurants in Montreal in 2025 | Quebec Registry',
        description: 'Discover the 10 best restaurants in Montreal in 2025: Joe Beef, Toqué!, Liverpool House, Au Pied de Cochon and more. Complete guide with contact info and specialties.',
        keywords: 'best restaurants Montreal, top Montreal restaurants 2025, fine dining Montreal, where to eat Montreal',
        canonical: 'https://registreduquebec.com/en/blog/top-10-restaurants-montreal'
      }
    },
    heroImage: {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      alt: {
        fr: 'Plat gastronomique servi dans un restaurant haut de gamme de Montréal',
        en: 'Gourmet dish served in a high-end Montreal restaurant'
      }
    },
    title: {
      fr: 'Top 10 des meilleurs restaurants à Montréal en 2025',
      en: 'Top 10 Best Restaurants in Montreal in 2025'
    },
    intro: {
      fr: 'Montréal est reconnue mondialement pour sa scène gastronomique exceptionnelle. Des bistrots français aux restaurants innovants, découvrez notre sélection des 10 meilleurs restaurants de Montréal en 2025, basée sur les avis clients, la qualité et l\'expérience culinaire.',
      en: 'Montreal is world-renowned for its exceptional food scene. From French bistros to innovative restaurants, discover our selection of the 10 best restaurants in Montreal in 2025, based on customer reviews, quality and culinary experience.'
    },
    content: {
      fr: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Les meilleures expériences culinaires de Montréal</h2>
          <p style="margin-bottom: 1rem;">Montréal est reconnue pour sa scène culinaire exceptionnelle, mêlant gastronomie française et influences internationales. Des bistrots chaleureux aux établissements haut de gamme, la ville offre des expériences culinaires inoubliables.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Top restaurants de Montréal 2025</h2>
          <p style="margin-bottom: 1rem;">Notre sélection inclut des établissements iconiques comme Joe Beef, Toqué! et Au Pied de Cochon, reconnus pour leur qualité exceptionnelle, leur cuisine innovante et leurs excellents avis clients.</p>
          <p style="margin-bottom: 1rem;">Chaque restaurant de cette liste a été sélectionné en fonction des avis clients, de la qualité culinaire, de l'ambiance et de l'expérience globale.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Conseils pour réserver</h2>
          <p style="margin-bottom: 1rem;">Plusieurs des meilleurs restaurants de Montréal sont rapidement complets, surtout les fins de semaine. Nous recommandons de réserver au moins 2-3 semaines à l'avance pour les établissements les plus populaires.</p>
        </section>
      `,
      en: `
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Montreal's Best Dining Experiences</h2>
          <p style="margin-bottom: 1rem;">Montreal is renowned for its exceptional culinary scene, blending French gastronomy with international influences. From cozy bistros to upscale dining establishments, the city offers unforgettable dining experiences.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Top Restaurants in Montreal 2025</h2>
          <p style="margin-bottom: 1rem;">Our selection includes iconic establishments like Joe Beef, Toqué!, and Au Pied de Cochon, known for their exceptional quality, innovative cuisine, and outstanding customer reviews.</p>
          <p style="margin-bottom: 1rem;">Each restaurant on this list has been selected based on customer reviews, culinary quality, ambiance, and overall dining experience.</p>
        </section>
        <section style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Reservation Tips</h2>
          <p style="margin-bottom: 1rem;">Many of Montreal's top restaurants book up quickly, especially on weekends. We recommend making reservations at least 2-3 weeks in advance for the most popular establishments.</p>
        </section>
      `
    }
  }
];

export function getArticleBySlug(slug) {
  return blogArticles.find(article => article.slug === slug);
}

export function getAllArticles() {
  return blogArticles;
}
