import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMainCategories, getSubCategories } from '../services/lookupService.js';
import { useTranslation } from 'react-i18next';
import './CategoriesGrid.css';

// Mapping des icônes par slug de catégorie
const categoryIcons = {
  'agriculture-et-environnement': 'agriculture.svg',
  'arts-medias-et-divertissement': 'art.svg',
  'automobile-et-transport': 'automobile.svg',
  'commerce-de-detail': 'commerce.svg',
  'construction-et-renovation': 'construction.svg',
  'education-et-formation': 'education.svg',
  'finance-assurance-et-juridique': 'finance.svg',
  'immobilier': 'immobilier.svg',
  'industrie-fabrication-et-logistique': 'industrie.svg',
  'maison-et-services-domestiques': 'maison.svg',
  'organismes-publics-et-communautaires': 'organismes.svg',
  'restauration-et-alimentation': 'restauration.svg',
  'sante-et-bien-etre': 'sante.svg',
  'services-funeraires': 'funeraire.svg',
  'services-professionnels': 'services.svg',
  'soins-a-domicile': 'soins.svg',
  'sports-et-loisirs': 'sports.svg',
  'technologie-et-informatique': 'technologie.svg',
  'tourisme-et-hebergement': 'tourisme.svg'
};

const CategoriesGrid = () => {
  const { i18n } = useTranslation();
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [mainCatsResult, subCatsResult] = await Promise.all([
          getMainCategories(),
          getSubCategories()
        ]);

        // Extract data from the result objects
        setMainCategories(mainCatsResult.data || []);
        setSubCategories(subCatsResult.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getLabel = (item) => {
    return i18n.language === 'en' ? item.label_en : item.label_fr;
  };

  const getSubCategoriesForMain = (mainCategoryId) => {
    return subCategories
      .filter(sub => sub.main_category_id === mainCategoryId)
      .slice(0, 5); // Limit to 5 subcategories per main category
  };

  if (loading) {
    return <div className="categories-grid-loading">Chargement...</div>;
  }

  // Split categories into 4 columns (distribute evenly)
  const categoriesPerColumn = Math.ceil(mainCategories.length / 4);
  const columns = [
    mainCategories.slice(0, categoriesPerColumn),
    mainCategories.slice(categoriesPerColumn, categoriesPerColumn * 2),
    mainCategories.slice(categoriesPerColumn * 2, categoriesPerColumn * 3),
    mainCategories.slice(categoriesPerColumn * 3)
  ];

  return (
    <div className="categories-section">
      <h2 className="section-title">Explorer par catégorie</h2>
      <div className="categories-grid">
        {columns.map((columnCategories, colIndex) => (
          <div key={colIndex} className="category-column">
            {columnCategories.map((category) => (
              <div key={category.id} className="category-group">
                <Link
                  to={`/recherche?category=${category.slug}`}
                  className="category-main-link"
                >
                  {categoryIcons[category.slug] && (
                    <img
                      src={`/images/icons/${categoryIcons[category.slug]}`}
                      alt={getLabel(category)}
                      className="category-icon"
                    />
                  )}
                  <span className="category-title">{getLabel(category)}</span>
                </Link>
                <ul className="subcategories-list">
                  {getSubCategoriesForMain(category.id).map((subCat) => (
                    <li key={subCat.id}>
                      <Link
                        to={`/recherche?category=${category.slug}&subcategory=${subCat.slug}`}
                        className="subcategory-link"
                      >
                        {getLabel(subCat)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
