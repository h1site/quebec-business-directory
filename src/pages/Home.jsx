import { Helmet } from 'react-helmet-async';
import SearchHero from '../components/SearchHero.jsx';
import { generateOrganizationSchema, generateWebSiteSchema } from '../utils/schemaMarkup.js';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Registre d'entreprise du Québec - Trouvez les meilleurs entreprises locales</title>
        <meta name="description" content="Découvrez les meilleures entreprises du Québec. Annuaire complet avec avis, coordonnées et informations détaillées." />

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateOrganizationSchema())}
        </script>

        {/* WebSite with SearchAction Schema */}
        <script type="application/ld+json">
          {JSON.stringify(generateWebSiteSchema())}
        </script>
      </Helmet>

      <div>
        <SearchHero />
      </div>
    </>
  );
};

export default Home;
