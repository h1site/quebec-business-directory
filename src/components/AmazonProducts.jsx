import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AmazonProducts.css';

function AmazonProducts({ categorySlug }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [categorySlug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/amazon-products?category=${categorySlug || 'default'}`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading Amazon products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher si aucun produit
  if (loading || error || products.length === 0) {
    return null;
  }

  return (
    <div className="amazon-products-section">
      <div className="amazon-products-header">
        <h3>{t('amazonProducts.title')}</h3>
        <p className="amazon-products-subtitle">
          {t('amazonProducts.subtitle')}
        </p>
      </div>

      <div className="amazon-products-grid">
        {products.map((product) => (
          <a
            key={product.asin}
            href={product.url}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
            className="amazon-product-card"
          >
            {product.image && (
              <div className="amazon-product-image">
                <img src={product.image} alt={product.title} loading="lazy" />
              </div>
            )}

            <div className="amazon-product-info">
              <h4 className="amazon-product-title">{product.title}</h4>

              {product.brand && (
                <p className="amazon-product-brand">{product.brand}</p>
              )}

              <div className="amazon-product-footer">
                {product.rating && (
                  <div className="amazon-product-rating">
                    <span className="amazon-stars">
                      {'★'.repeat(Math.floor(product.rating))}
                      {product.rating % 1 >= 0.5 && '½'}
                    </span>
                    <span className="amazon-rating-value">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {product.price && (
                  <div className="amazon-product-price">{product.price}</div>
                )}
              </div>

              <div className="amazon-cta">
                {t('amazonProducts.viewOnAmazon')}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 11L11 1M11 1H1M11 1V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      <p className="amazon-disclosure">
        {t('amazonProducts.disclosure')}
      </p>
    </div>
  );
}

export default AmazonProducts;
