import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabaseClient';
import './WizardStep.css';

const WizardStep7_Category = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('main_categories')
          .select('id, slug, label_fr')
          .order('label_fr');

        if (error) {
          console.error('Error fetching categories - Details:', error);
          throw error;
        }

        console.log('Categories loaded:', data);
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.main_category_id) {
        setSubcategories([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sub_categories')
          .select('id, slug, label_fr')
          .eq('main_category_id', formData.main_category_id)
          .order('label_fr');

        if (error) throw error;
        setSubcategories(data || []);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [formData.main_category_id]);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.main_category_id) {
      newErrors.category = t('wizard.step7.categoryError');
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.main_category_id, onValidationChange, t]);

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;

    if (!selectedId) {
      updateFormData({
        main_category_id: null,
        main_category_slug: null,
        main_category_name: null,
        subcategory_id: null,
        subcategory_slug: null,
        subcategory_name: null
      });
      return;
    }

    const selectedCategory = categories.find(cat => cat.id.toString() === selectedId);

    if (selectedCategory) {
      updateFormData({
        main_category_id: selectedCategory.id,
        main_category_slug: selectedCategory.slug,
        main_category_name: selectedCategory.label_fr,
        subcategory_id: null,
        subcategory_slug: null,
        subcategory_name: null
      });
    }
  };

  const handleSubcategoryChange = (e) => {
    const selectedId = e.target.value;

    if (!selectedId) {
      updateFormData({
        subcategory_id: null,
        subcategory_slug: null,
        subcategory_name: null
      });
      return;
    }

    const selectedSubcategory = subcategories.find(sub => sub.id.toString() === selectedId);

    if (selectedSubcategory) {
      updateFormData({
        subcategory_id: selectedSubcategory.id,
        subcategory_slug: selectedSubcategory.slug,
        subcategory_name: selectedSubcategory.label_fr
      });
    }
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step7.title')}</h2>
        <p className="step-description">
          {t('wizard.step7.description')}
        </p>
      </div>

      <div className="step-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('wizard.step7.loading')}</p>
          </div>
        ) : (
          <>
            {/* Catégorie principale */}
            <div className="form-group">
              <label htmlFor="main-category" className="form-label required">
                Catégorie principale
              </label>
              <select
                id="main-category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={formData.main_category_id || ''}
                onChange={handleCategoryChange}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label_fr}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
              <span className="help-text">
                Choisissez la catégorie qui correspond le mieux à votre entreprise
              </span>
            </div>

            {/* Sous-catégorie (apparaît seulement si une catégorie est sélectionnée) */}
            {formData.main_category_id && subcategories.length > 0 && (
              <div className="form-group">
                <label htmlFor="sub-category" className="form-label">
                  Sous-catégorie <span className="optional">(optionnel)</span>
                </label>
                <select
                  id="sub-category"
                  className="form-select"
                  value={formData.subcategory_id || ''}
                  onChange={handleSubcategoryChange}
                >
                  <option value="">Sélectionnez une sous-catégorie</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.label_fr}
                    </option>
                  ))}
                </select>
                <span className="help-text">
                  Affinez votre catégorie pour plus de précision
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

WizardStep7_Category.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep7_Category;
