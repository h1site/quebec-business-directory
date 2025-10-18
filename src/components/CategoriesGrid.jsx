import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMainCategories, getSubCategories } from '../services/lookupService.js';
import { useTranslation } from 'react-i18next';
import './CategoriesGrid.css';

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
                  {getLabel(category)}
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
