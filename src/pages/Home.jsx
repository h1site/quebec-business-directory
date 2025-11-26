import { Helmet } from 'react-helmet-async';
import SearchHeroYelp from '../components/SearchHeroYelp.jsx';
import PopularCities from '../components/PopularCities.jsx';
import ThanksPartners from '../components/ThanksPartners.jsx';
import BlogSection from '../components/BlogSection.jsx';
import UserTestimonials from '../components/UserTestimonials.jsx';
import Sponsors from '../components/Sponsors.jsx';
import { generateOrganizationSchema, generateWebSiteSchema } from '../utils/schemaMarkup.js';

const Home = () => {
  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Comment trouver une entreprise au Québec?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Utilisez notre moteur de recherche pour trouver des entreprises par nom, ville, région ou catégorie. Notre annuaire contient plus de 600 000 entreprises québécoises avec coordonnées complètes et informations détaillées."
        }
      },
      {
        "@type": "Question",
        "name": "Qu'est-ce que le NEQ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le NEQ (Numéro d'entreprise du Québec) est un identifiant unique attribué à chaque entreprise enregistrée au Québec. Il permet d'identifier de façon certaine une entreprise dans les différents registres gouvernementaux."
        }
      },
      {
        "@type": "Question",
        "name": "Comment réclamer la fiche de mon entreprise?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pour réclamer votre fiche d'entreprise, créez un compte gratuit, trouvez votre entreprise et cliquez sur 'Réclamer votre fiche'. Vous pourrez ensuite ajouter des informations, photos et gérer votre présence en ligne."
        }
      },
      {
        "@type": "Question",
        "name": "Les informations sont-elles à jour?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nos données proviennent du Registre des entreprises du Québec (REQ) et sont mises à jour régulièrement. Les entreprises peuvent également mettre à jour leurs informations en réclamant leur fiche."
        }
      },
      {
        "@type": "Question",
        "name": "L'utilisation du registre est-elle gratuite?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, la recherche et la consultation des fiches d'entreprises sont entièrement gratuites. Les entreprises peuvent également réclamer et gérer leur fiche gratuitement."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Registre d'entreprise du Québec - Trouvez les meilleurs entreprises locales</title>
        <meta name="description" content="Découvrez les meilleures entreprises du Québec. Annuaire complet avec avis, coordonnées et informations détaillées. Plus de 600 000 entreprises québécoises." />
        <link rel="canonical" href="https://registreduquebec.com/" />

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateOrganizationSchema())}
        </script>

        {/* WebSite with SearchAction Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateWebSiteSchema())}
        </script>

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div>
        <SearchHeroYelp />
        <PopularCities />
        <ThanksPartners />
        <BlogSection />
        <UserTestimonials />
        {/* <Sponsors /> */}
      </div>
    </>
  );
};

export default Home;
