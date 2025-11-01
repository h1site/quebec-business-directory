import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './FAQ.css';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = {
    fr: {
      title: 'Foire aux questions (FAQ)',
      subtitle: 'Trouvez rapidement les réponses à vos questions sur le Registre du Québec',
      categories: [
        {
          name: 'Recherche et navigation',
          questions: [
            {
              q: 'Comment trouver une entreprise au Québec?',
              a: 'Utilisez notre moteur de recherche en haut de la page. Vous pouvez rechercher par nom d\'entreprise, ville, région, catégorie ou numéro d\'entreprise du Québec (NEQ). Notre annuaire contient plus de 600 000 entreprises québécoises avec coordonnées complètes et informations détaillées.'
            },
            {
              q: 'Comment rechercher par catégorie?',
              a: 'Cliquez sur "Catégories" dans le menu principal ou utilisez la barre de recherche en tapant le type d\'entreprise recherché (ex: "restaurant", "plombier", "avocat"). Vous pouvez également filtrer par sous-catégories pour des résultats plus précis.'
            },
            {
              q: 'Puis-je rechercher par ville ou région?',
              a: 'Oui! Utilisez les filtres de localisation pour rechercher par ville spécifique (ex: Montréal, Québec, Sherbrooke) ou par région administrative (ex: Montérégie, Laurentides). Vous pouvez aussi combiner la recherche par catégorie ET localisation.'
            },
            {
              q: 'Les informations sont-elles à jour?',
              a: 'Nos données proviennent du Registre des entreprises du Québec (REQ) et sont mises à jour régulièrement. Les entreprises qui réclament leur fiche peuvent mettre à jour leurs informations en temps réel, garantissant ainsi l\'exactitude des données.'
            },
            {
              q: 'Comment fonctionne la recherche par NEQ?',
              a: 'Entrez simplement le numéro d\'entreprise du Québec (NEQ) à 10 chiffres dans la barre de recherche. Le NEQ est un identifiant unique qui vous mènera directement à la fiche de l\'entreprise recherchée.'
            }
          ]
        },
        {
          name: 'Fiches d\'entreprises',
          questions: [
            {
              q: 'Qu\'est-ce que le NEQ?',
              a: 'Le NEQ (Numéro d\'entreprise du Québec) est un identifiant unique à 10 chiffres attribué par le Registraire des entreprises à chaque entreprise enregistrée au Québec. Il permet d\'identifier de façon certaine une entreprise dans les différents registres gouvernementaux et bases de données commerciales.'
            },
            {
              q: 'Quelles informations trouve-t-on sur une fiche d\'entreprise?',
              a: 'Chaque fiche contient : le nom légal et commercial, le NEQ, l\'adresse complète, les coordonnées (téléphone, email, site web), les heures d\'ouverture, les catégories d\'activité, une description des services, des photos, des avis clients, et un lien vers la fiche Google My Business si disponible.'
            },
            {
              q: 'Comment sont classées les entreprises dans les résultats?',
              a: 'Les résultats sont classés selon plusieurs critères : pertinence par rapport à votre recherche, complétude de la fiche, nombre d\'avis, activité récente, et proximité géographique. Les fiches réclamées et complètes ont généralement un meilleur classement.'
            },
            {
              q: 'Puis-je voir les avis clients?',
              a: 'Oui, les fiches affichent les avis Google importés automatiquement depuis Google My Business. Vous pouvez consulter les notes, lire les commentaires et voir la note moyenne globale de chaque entreprise.'
            }
          ]
        },
        {
          name: 'Réclamer et gérer une fiche',
          questions: [
            {
              q: 'Comment réclamer la fiche de mon entreprise?',
              a: 'Créez un compte gratuit, connectez-vous, trouvez votre entreprise via la recherche, puis cliquez sur le bouton "Réclamer cette fiche" sur la page de votre entreprise. Notre équipe vous contactera par email ou téléphone pour vérifier votre identité - aucun document compliqué requis!'
            },
            {
              q: 'Qui peut réclamer une fiche d\'entreprise?',
              a: 'Seuls les propriétaires, dirigeants ou employés autorisés peuvent réclamer une fiche. Vous devez avoir l\'autorité légale de représenter l\'entreprise. Lors de la vérification, notre équipe confirmera votre identité et votre droit de gérer la fiche.'
            },
            {
              q: 'Combien de temps prend la vérification?',
              a: 'La vérification est généralement complétée en 24 à 48 heures. Notre équipe vous contactera rapidement par email ou téléphone pour confirmer votre identité. Une fois vérifié, vous pourrez immédiatement gérer votre fiche.'
            },
            {
              q: 'Que puis-je modifier sur ma fiche?',
              a: 'Une fois réclamée, vous pouvez modifier : la description de votre entreprise, les heures d\'ouverture, les coordonnées (téléphone, email, site web), ajouter des photos de qualité, gérer vos services et catégories, et maintenir vos informations à jour en temps réel.'
            },
            {
              q: 'Puis-je gérer plusieurs entreprises avec un seul compte?',
              a: 'Oui! Un seul compte vous permet de gérer plusieurs fiches d\'entreprises. Idéal si vous êtes propriétaire de plusieurs établissements ou si vous gérez les fiches pour différentes entreprises en tant que professionnel.'
            },
            {
              q: 'Comment supprimer ou fermer ma fiche?',
              a: 'Si votre entreprise a fermé définitivement, contactez notre support avec votre NEQ et une preuve de fermeture. Nous marquerons la fiche comme fermée. Les fiches ne peuvent pas être supprimées car elles font partie du registre public, mais elles seront clairement identifiées comme inactives.'
            }
          ]
        },
        {
          name: 'Comptes et connexion',
          questions: [
            {
              q: 'L\'utilisation du registre est-elle gratuite?',
              a: 'Oui, totalement gratuit! La recherche et la consultation des fiches sont entièrement gratuites. Les entreprises peuvent également créer un compte, réclamer et gérer leur fiche sans frais. Certaines fonctionnalités premium pourraient être offertes à l\'avenir.'
            },
            {
              q: 'Ai-je besoin d\'un compte pour rechercher des entreprises?',
              a: 'Non, la recherche est accessible à tous sans inscription. Vous pouvez consulter toutes les fiches d\'entreprises gratuitement. Un compte est nécessaire uniquement si vous souhaitez réclamer et gérer une fiche d\'entreprise.'
            },
            {
              q: 'Comment créer un compte?',
              a: 'Cliquez sur "Connexion" en haut de la page, puis sur "Créer un compte". Entrez votre email et un mot de passe sécurisé. Vous recevrez un email de confirmation pour activer votre compte. Le processus prend moins de 2 minutes!'
            },
            {
              q: 'J\'ai oublié mon mot de passe, que faire?',
              a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié?". Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe. Le lien est valide pendant 24 heures pour des raisons de sécurité.'
            },
            {
              q: 'Mes données personnelles sont-elles sécurisées?',
              a: 'Absolument. Nous utilisons un cryptage de niveau bancaire pour protéger vos données. Nous ne vendons jamais vos informations personnelles à des tiers. Consultez notre politique de confidentialité pour plus de détails sur la protection de vos données.'
            }
          ]
        },
        {
          name: 'Optimisation et visibilité',
          questions: [
            {
              q: 'Comment améliorer la visibilité de ma fiche?',
              a: 'Réclamez votre fiche, complétez toutes les sections à 100%, ajoutez 5-10 photos professionnelles, rédigez une description détaillée avec mots-clés, mettez à jour vos heures régulièrement, répondez aux avis clients, et maintenez vos informations à jour.'
            },
            {
              q: 'Les photos sont-elles importantes?',
              a: 'Très importantes! Les fiches avec photos professionnelles reçoivent 42% plus de demandes d\'itinéraire et 35% plus de clics vers le site web. Ajoutez au minimum : logo, façade, intérieur, équipe, et produits/services.'
            },
            {
              q: 'Qu\'est-ce qu\'un backlink dofollow?',
              a: 'En réclamant votre fiche, vous obtenez un lien dofollow vers votre site web. C\'est un lien de haute qualité qui améliore votre référencement Google (SEO) et augmente votre autorité de domaine. C\'est un avantage SEO gratuit et précieux!'
            },
            {
              q: 'Puis-je importer mes données Google My Business?',
              a: 'Oui! Pour les fiches réclamées, vous pouvez importer automatiquement vos informations Google My Business incluant les avis, photos, heures d\'ouverture et coordonnées. Cela synchronise vos données en quelques clics depuis le panneau d\'administration.'
            },
            {
              q: 'Comment obtenir plus d\'avis clients?',
              a: 'Les avis sont importés depuis Google My Business. Pour obtenir plus d\'avis, encouragez vos clients satisfaits à laisser un avis sur votre fiche Google. Ces avis apparaîtront automatiquement sur votre fiche du Registre du Québec.'
            }
          ]
        },
        {
          name: 'Fonctionnalités et outils',
          questions: [
            {
              q: 'Qu\'est-ce que le système de parrainage?',
              a: 'Les entreprises peuvent devenir parrains du Registre du Québec en affichant leur logo et message sur des pages pertinentes. C\'est une excellente visibilité locale qui aide aussi à maintenir le registre gratuit pour tous. Contactez-nous pour les options de parrainage.'
            },
            {
              q: 'Y a-t-il une application mobile?',
              a: 'Le site est entièrement optimisé pour mobile et tablette avec un design responsive. Vous pouvez l\'utiliser sur n\'importe quel appareil via votre navigateur web sans télécharger d\'application. Une app native pourrait être développée selon la demande.'
            },
            {
              q: 'Puis-je exporter des données d\'entreprises?',
              a: 'Les fonctionnalités d\'export sont réservées aux administrateurs pour des raisons de confidentialité et respect des données. Si vous avez des besoins spécifiques pour votre entreprise, contactez notre équipe pour discuter des solutions disponibles.'
            },
            {
              q: 'Le site est-il disponible en anglais?',
              a: 'Oui! Le site est entièrement bilingue (français/anglais). Cliquez sur le sélecteur de langue en haut de la page pour basculer entre les deux langues. Toutes les fonctionnalités et contenus sont disponibles dans les deux langues officielles.'
            }
          ]
        },
        {
          name: 'Support et aide',
          questions: [
            {
              q: 'Comment contacter le support?',
              a: 'Vous pouvez nous contacter via la page "À propos" qui contient un formulaire de contact. Nous répondons généralement dans les 24 heures ouvrables. Pour les questions urgentes concernant votre fiche, incluez votre NEQ dans votre message.'
            },
            {
              q: 'Où trouver des guides et tutoriels?',
              a: 'Consultez notre blogue pour des guides détaillés, tutoriels vidéo et conseils pratiques sur : comment réclamer votre fiche, optimiser votre présence en ligne, comprendre le NEQ, et bien plus. De nouveaux articles sont ajoutés régulièrement.'
            },
            {
              q: 'Puis-je signaler une information incorrecte?',
              a: 'Oui, si vous remarquez une erreur sur une fiche, contactez notre support en précisant le NEQ de l\'entreprise et la nature de l\'erreur. Si c\'est votre entreprise, réclamez la fiche pour corriger vous-même les informations instantanément.'
            },
            {
              q: 'Comment signaler une fiche frauduleuse?',
              a: 'Si vous suspectez une fiche frauduleuse ou du contenu inapproprié, utilisez le bouton "Signaler" sur la fiche ou contactez notre équipe de modération. Nous enquêterons et prendrons les mesures appropriées pour maintenir l\'intégrité du registre.'
            },
            {
              q: 'Y a-t-il des frais cachés?',
              a: 'Aucun frais caché! Le Registre du Québec est 100% gratuit pour la recherche et la gestion de base des fiches. Nous sommes transparents sur tous nos services. Si des options premium sont ajoutées à l\'avenir, elles seront clairement identifiées et optionnelles.'
            }
          ]
        }
      ]
    },
    en: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Quickly find answers to your questions about Quebec Business Directory',
      categories: [
        {
          name: 'Search and Navigation',
          questions: [
            {
              q: 'How do I find a business in Quebec?',
              a: 'Use our search engine at the top of the page. You can search by business name, city, region, category, or Quebec Enterprise Number (NEQ). Our directory contains over 600,000 Quebec businesses with complete contact information and detailed data.'
            },
            {
              q: 'How do I search by category?',
              a: 'Click on "Categories" in the main menu or use the search bar by typing the type of business you\'re looking for (e.g., "restaurant", "plumber", "lawyer"). You can also filter by subcategories for more precise results.'
            },
            {
              q: 'Can I search by city or region?',
              a: 'Yes! Use location filters to search by specific city (e.g., Montreal, Quebec City, Sherbrooke) or administrative region (e.g., Montérégie, Laurentides). You can also combine category AND location searches.'
            },
            {
              q: 'Is the information up to date?',
              a: 'Our data comes from the Quebec Business Registry (REQ) and is updated regularly. Businesses that claim their listing can update their information in real-time, ensuring data accuracy.'
            },
            {
              q: 'How does NEQ search work?',
              a: 'Simply enter the 10-digit Quebec Enterprise Number (NEQ) in the search bar. The NEQ is a unique identifier that will take you directly to the business listing you\'re looking for.'
            }
          ]
        },
        {
          name: 'Business Listings',
          questions: [
            {
              q: 'What is a NEQ?',
              a: 'The NEQ (Quebec Enterprise Number) is a unique 10-digit identifier assigned by the Enterprise Registrar to each business registered in Quebec. It allows for certain identification of a business in various government registries and commercial databases.'
            },
            {
              q: 'What information is on a business listing?',
              a: 'Each listing contains: legal and trade name, NEQ, complete address, contact information (phone, email, website), business hours, activity categories, service description, photos, customer reviews, and a link to the Google My Business listing if available.'
            },
            {
              q: 'How are businesses ranked in results?',
              a: 'Results are ranked by several criteria: relevance to your search, listing completeness, number of reviews, recent activity, and geographic proximity. Claimed and complete listings generally rank higher.'
            },
            {
              q: 'Can I see customer reviews?',
              a: 'Yes, listings display Google reviews automatically imported from Google My Business. You can view ratings, read comments, and see the overall average rating for each business.'
            }
          ]
        },
        {
          name: 'Claiming and Managing Listings',
          questions: [
            {
              q: 'How do I claim my business listing?',
              a: 'Create a free account, log in, find your business via search, then click the "Claim This Listing" button on your business page. Our team will contact you by email or phone to verify your identity - no complicated paperwork required!'
            },
            {
              q: 'Who can claim a business listing?',
              a: 'Only owners, executives, or authorized employees can claim a listing. You must have legal authority to represent the business. During verification, our team will confirm your identity and right to manage the listing.'
            },
            {
              q: 'How long does verification take?',
              a: 'Verification is typically completed within 24 to 48 hours. Our team will contact you quickly by email or phone to confirm your identity. Once verified, you can immediately manage your listing.'
            },
            {
              q: 'What can I edit on my listing?',
              a: 'Once claimed, you can edit: business description, business hours, contact information (phone, email, website), add quality photos, manage services and categories, and keep your information up to date in real-time.'
            },
            {
              q: 'Can I manage multiple businesses with one account?',
              a: 'Yes! One account allows you to manage multiple business listings. Ideal if you own multiple locations or manage listings for different businesses as a professional.'
            },
            {
              q: 'How do I delete or close my listing?',
              a: 'If your business has permanently closed, contact our support with your NEQ and proof of closure. We\'ll mark the listing as closed. Listings cannot be deleted as they\'re part of the public registry, but they\'ll be clearly identified as inactive.'
            }
          ]
        },
        {
          name: 'Accounts and Login',
          questions: [
            {
              q: 'Is the registry free to use?',
              a: 'Yes, completely free! Search and listing consultation are entirely free. Businesses can also create an account, claim and manage their listing at no cost. Some premium features may be offered in the future.'
            },
            {
              q: 'Do I need an account to search for businesses?',
              a: 'No, search is accessible to everyone without registration. You can view all business listings for free. An account is only needed if you want to claim and manage a business listing.'
            },
            {
              q: 'How do I create an account?',
              a: 'Click "Login" at the top of the page, then "Create Account". Enter your email and a secure password. You\'ll receive a confirmation email to activate your account. The process takes less than 2 minutes!'
            },
            {
              q: 'I forgot my password, what should I do?',
              a: 'On the login page, click "Forgot Password?". Enter your email address and you\'ll receive a link to reset your password. The link is valid for 24 hours for security reasons.'
            },
            {
              q: 'Is my personal data secure?',
              a: 'Absolutely. We use bank-level encryption to protect your data. We never sell your personal information to third parties. Check our privacy policy for more details on data protection.'
            }
          ]
        },
        {
          name: 'Optimization and Visibility',
          questions: [
            {
              q: 'How do I improve my listing\'s visibility?',
              a: 'Claim your listing, complete all sections 100%, add 5-10 professional photos, write a detailed description with keywords, update hours regularly, respond to customer reviews, and keep information current.'
            },
            {
              q: 'Are photos important?',
              a: 'Very important! Listings with professional photos receive 42% more direction requests and 35% more website clicks. Add at minimum: logo, storefront, interior, team, and products/services.'
            },
            {
              q: 'What is a dofollow backlink?',
              a: 'By claiming your listing, you get a dofollow link to your website. This is a high-quality link that improves your Google SEO and increases your domain authority. It\'s a free and valuable SEO advantage!'
            },
            {
              q: 'Can I import my Google My Business data?',
              a: 'Yes! For claimed listings, you can automatically import your Google My Business information including reviews, photos, business hours, and contact details. This syncs your data in a few clicks from the admin panel.'
            },
            {
              q: 'How do I get more customer reviews?',
              a: 'Reviews are imported from Google My Business. To get more reviews, encourage satisfied customers to leave a review on your Google listing. These reviews will automatically appear on your Quebec Business Directory listing.'
            }
          ]
        },
        {
          name: 'Features and Tools',
          questions: [
            {
              q: 'What is the sponsorship system?',
              a: 'Businesses can become sponsors of Quebec Business Directory by displaying their logo and message on relevant pages. It\'s excellent local visibility that also helps keep the registry free for all. Contact us for sponsorship options.'
            },
            {
              q: 'Is there a mobile app?',
              a: 'The site is fully optimized for mobile and tablet with responsive design. You can use it on any device via your web browser without downloading an app. A native app could be developed based on demand.'
            },
            {
              q: 'Can I export business data?',
              a: 'Export features are reserved for administrators for privacy and data protection reasons. If you have specific needs for your business, contact our team to discuss available solutions.'
            },
            {
              q: 'Is the site available in English?',
              a: 'Yes! The site is fully bilingual (French/English). Click the language selector at the top of the page to switch between languages. All features and content are available in both official languages.'
            }
          ]
        },
        {
          name: 'Support and Help',
          questions: [
            {
              q: 'How do I contact support?',
              a: 'You can contact us via the "About" page which contains a contact form. We typically respond within 24 business hours. For urgent questions about your listing, include your NEQ in your message.'
            },
            {
              q: 'Where can I find guides and tutorials?',
              a: 'Check our blog for detailed guides, video tutorials, and practical tips on: how to claim your listing, optimize your online presence, understand NEQ, and much more. New articles are added regularly.'
            },
            {
              q: 'Can I report incorrect information?',
              a: 'Yes, if you notice an error on a listing, contact our support specifying the business NEQ and the nature of the error. If it\'s your business, claim the listing to correct the information yourself instantly.'
            },
            {
              q: 'How do I report a fraudulent listing?',
              a: 'If you suspect a fraudulent listing or inappropriate content, use the "Report" button on the listing or contact our moderation team. We\'ll investigate and take appropriate action to maintain registry integrity.'
            },
            {
              q: 'Are there hidden fees?',
              a: 'No hidden fees! Quebec Business Directory is 100% free for search and basic listing management. We\'re transparent about all our services. If premium options are added in the future, they\'ll be clearly identified and optional.'
            }
          ]
        }
      ]
    }
  };

  const currentFAQ = faqData[lang] || faqData.fr;

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": currentFAQ.categories.flatMap(category =>
      category.questions.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    )
  };

  return (
    <>
      <Helmet>
        <title>{currentFAQ.title} - {lang === 'en' ? 'Quebec Business Directory' : 'Registre du Québec'}</title>
        <meta name="description" content={currentFAQ.subtitle} />
        <link rel="canonical" href={`https://registreduquebec.com${lang === 'en' ? '/en/faq' : '/faq'}`} />

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>

        {/* Open Graph */}
        <meta property="og:title" content={currentFAQ.title} />
        <meta property="og:description" content={currentFAQ.subtitle} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://registreduquebec.com${lang === 'en' ? '/en/faq' : '/faq'}`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentFAQ.title} />
        <meta name="twitter:description" content={currentFAQ.subtitle} />
      </Helmet>

      <div className="faq-page">
        <div className="faq-hero">
          <div className="container">
            <h1>{currentFAQ.title}</h1>
            <p className="faq-subtitle">{currentFAQ.subtitle}</p>
          </div>
        </div>

        <div className="container faq-content">
          {currentFAQ.categories.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="faq-category-title">{category.name}</h2>
              <div className="faq-questions">
                {category.questions.map((item, qIndex) => {
                  const globalIndex = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={qIndex}
                      className={`faq-item ${isOpen ? 'open' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleQuestion(globalIndex)}
                        aria-expanded={isOpen}
                      >
                        <span className="faq-question-text">{item.q}</span>
                        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                      </button>
                      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="faq-contact">
            <h2>{lang === 'en' ? 'Still Have Questions?' : 'Vous avez encore des questions?'}</h2>
            <p>
              {lang === 'en'
                ? 'If you didn\'t find the answer you were looking for, feel free to contact our support team. We\'re here to help!'
                : 'Si vous n\'avez pas trouvé la réponse que vous cherchiez, n\'hésitez pas à contacter notre équipe de support. Nous sommes là pour vous aider!'
              }
            </p>
            <a href={lang === 'en' ? '/en/about' : '/a-propos'} className="faq-contact-btn">
              {lang === 'en' ? 'Contact Us' : 'Nous Contacter'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
