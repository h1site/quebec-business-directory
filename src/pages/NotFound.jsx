import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

const NotFound = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const langPrefix = isEnglish ? '/en' : '';

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Page Not Found - 404' : 'Page Introuvable - 404'} | {isEnglish ? 'Quebec Business Registry' : 'Registre du Québec'}</title>
        <meta name="description" content={isEnglish ? 'This page does not exist. Return to the homepage or search for businesses in Quebec.' : 'Cette page n\'existe pas. Retournez à l\'accueil ou recherchez des entreprises au Québec.'} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container not-found-page">
        <div className="not-found-content">
          <div className="not-found-icon">404</div>

          <h1 className="not-found-title">
            {isEnglish ? 'Page Not Found' : 'Page Introuvable'}
          </h1>

          <p className="not-found-description">
            {isEnglish
              ? 'The page you are looking for does not exist or has been moved.'
              : 'La page que vous cherchez n\'existe pas ou a été déplacée.'}
          </p>

          <div className="not-found-actions">
            <Link to={langPrefix || '/'} className="btn btn-primary">
              {isEnglish ? 'Back to Homepage' : 'Retour à l\'accueil'}
            </Link>
            <Link to={`${langPrefix}/recherche`} className="btn btn-secondary">
              {isEnglish ? 'Search Businesses' : 'Rechercher des entreprises'}
            </Link>
          </div>

          <div className="not-found-suggestions">
            <h2>{isEnglish ? 'Quick Links' : 'Liens Rapides'}</h2>
            <ul>
              <li>
                <Link to={`${langPrefix}/categorie/commerce-de-detail`}>
                  {isEnglish ? 'Retail Businesses' : 'Commerce de Détail'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/categorie/services-professionnels`}>
                  {isEnglish ? 'Professional Services' : 'Services Professionnels'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/region/montreal`}>
                  {isEnglish ? 'Businesses in Montreal' : 'Entreprises à Montréal'}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/a-propos`}>
                  {isEnglish ? 'About Us' : 'À Propos'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
