import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../../services/supabaseClient';
import './WizardStep.css';

const WizardStep7_Category = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, icon')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.main_category_id) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.main_category_id, onValidationChange]);

  const handleCategorySelect = (category) => {
    updateFormData({
      main_category_id: category.id,
      main_category_slug: category.slug,
      main_category_name: category.name
    });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Catégorie</h2>
        <p className="step-description">
          Dans quelle catégorie se trouve votre entreprise ?
        </p>
      </div>

      <div className="step-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des catégories...</p>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="category-search" className="form-label">
                Rechercher une catégorie
              </label>
              <input
                id="category-search"
                type="text"
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Restaurant, Plombier, Avocat..."
              />
            </div>

            {errors.category && (
              <div className="alert alert-warning">
                <span className="alert-icon">⚠️</span>
                {errors.category}
              </div>
            )}

            <div className="category-grid">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const isSelected = formData.main_category_id === category.id;
                  return (
                    <div
                      key={category.id}
                      className={`category-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category.icon && (
                        <div className="category-icon">{category.icon}</div>
                      )}
                      <div className="category-name">{category.name}</div>
                      {isSelected && (
                        <div className="category-checkmark">✓</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>Aucune catégorie trouvée pour "{searchTerm}"</p>
                </div>
              )}
            </div>
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
