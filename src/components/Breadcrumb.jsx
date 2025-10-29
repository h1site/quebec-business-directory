import { Helmet } from 'react-helmet-async';
import LocalizedLink from './LocalizedLink.jsx';
import { generateBreadcrumbSchema } from '../utils/schemaMarkup';
import './Breadcrumb.css';

/**
 * Breadcrumb component with structured data for SEO
 * @param {Array} items - Array of breadcrumb items { name, url }
 * @example
 * <Breadcrumb items={[
 *   { name: 'Accueil', url: '/' },
 *   { name: 'Restaurants', url: '/categorie/restaurants' },
 *   { name: 'Montréal', url: '/ville/montreal' },
 *   { name: 'Restaurant La Belle Province' }
 * ]} />
 */
const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Generate schema markup for SEO
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <nav aria-label="breadcrumb" className="breadcrumb-container">
        <ol className="breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={index}
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isLast ? (
                  <span itemProp="name">{item.name}</span>
                ) : (
                  <LocalizedLink to={item.url} itemProp="item">
                    <span itemProp="name">{item.name}</span>
                  </LocalizedLink>
                )}
                <meta itemProp="position" content={index + 1} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
