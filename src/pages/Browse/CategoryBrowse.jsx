import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import './Browse.css';

const CategoryBrowse = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);

        // Get category info
        const { data: mainCat } = await supabase
          .from('main_categories')
          .select('label_fr')
          .eq('slug', categorySlug)
          .single();

        if (mainCat) {
          setCategoryName(mainCat.label_fr);
        }

        // Build query
        let query = supabase
          .from('businesses_enriched')
          .select('*');

        if (subCategorySlug) {
          // Get subcategory info
          const { data: subCat } = await supabase
            .from('sub_categories')
            .select('label_fr')
            .eq('slug', subCategorySlug)
            .single();

          if (subCat) {
            setSubCategoryName(subCat.label_fr);
          }

          // Filter by subcategory
          query = query.eq('primary_sub_category_slug', subCategorySlug);
        } else {
          // Filter by main category
          query = query.eq('primary_main_category_slug', categorySlug);
        }

        const { data, error: searchError } = await query.limit(100);

        if (searchError) {
          setError('Erreur lors du chargement des entreprises');
          return;
        }

        setBusinesses(data || []);
      } catch (err) {
        setError('Erreur lors du chargement des entreprises');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [categorySlug, subCategorySlug]);

  if (loading) {
    return (
      <div className="container browse-page">
        <div className="loading-state">Chargement des entreprises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container browse-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  const displayName = subCategoryName || categoryName;
  const titlePrefix = subCategorySlug ? 'Entreprises en' : 'Entreprises de';

  return (
    <>
      <Helmet>
        <title>{titlePrefix} {displayName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprises ${subCategorySlug ? 'en' : 'de'} ${displayName} au Québec`} />
      </Helmet>

      <div className="container browse-page">
        <div className="browse-header">
          {subCategorySlug && categoryName && (
            <div className="breadcrumb">
              <Link to={`/categorie/${categorySlug}`}>{categoryName}</Link>
              <span> / </span>
            </div>
          )}
          <h1>{titlePrefix} {displayName}</h1>
          <p className="browse-count">{businesses.length} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''}</p>
        </div>

        {businesses.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée dans cette catégorie</p>
            <Link to="/recherche" className="btn btn-primary">
              Rechercher ailleurs
            </Link>
          </div>
        ) : (
          <div className="business-grid">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryBrowse;
