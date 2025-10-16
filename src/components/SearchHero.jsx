import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (what) params.set('q', what);
    if (where) params.set('city', where);
    const queryString = params.toString();
    navigate(queryString ? `/recherche?${queryString}` : '/recherche');
  };

  return (
    <section className="hero-section">
      <div className="container hero-content">
        <div>
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>
        <form className="search-boxes" onSubmit={onSubmit}>
          <input
            type="search"
            placeholder={t('hero.whatPlaceholder')}
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            aria-label={t('hero.whatPlaceholder')}
          />
          <input
            type="search"
            placeholder={t('hero.wherePlaceholder')}
            value={where}
            onChange={(event) => setWhere(event.target.value)}
            aria-label={t('hero.wherePlaceholder')}
          />
          <button type="submit" className="primary-button">
            {t('hero.searchButton')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchHero;
