import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './BusinessFAQ.css';

/**
 * Business FAQ Component with Accordion
 * Displays 6 standard questions based on business data
 */
const BusinessFAQ = ({ business, businessHours }) => {
  const { t, i18n } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ items based on business data
  const faqItems = [
    // Question 1: City
    {
      question: t('faq.cityQuestion', { name: business.name }),
      answer: business.city
        ? t('faq.cityAnswer', { name: business.name, city: business.city, region: business.region || '' })
        : t('faq.noDataAvailable')
    },

    // Question 2: Address
    {
      question: t('faq.addressQuestion', { name: business.name }),
      answer: business.address
        ? `${business.address}${business.address_line2 ? `, ${business.address_line2}` : ''}, ${business.city}, ${business.province || 'QC'} ${business.postal_code || ''}`
        : t('faq.noDataAvailable')
    },

    // Question 3: Phone
    {
      question: t('faq.phoneQuestion', { name: business.name }),
      answer: business.phone
        ? t('faq.phoneAnswer', { name: business.name, phone: business.phone })
        : t('faq.phoneAnswerNo', { name: business.name })
    },

    // Question 4: Website
    {
      question: t('faq.websiteQuestion', { name: business.name }),
      answer: business.website
        ? t('faq.websiteAnswer', { name: business.name })
        : t('faq.websiteAnswerNo', { name: business.name })
    },

    // Question 5: Opening hours
    {
      question: t('faq.hoursQuestion', { name: business.name }),
      answer: (businessHours && Array.isArray(businessHours) && businessHours.length > 0) || business.opening_hours
        ? t('faq.hoursAnswer', { name: business.name })
        : t('faq.hoursAnswerNo', { name: business.name })
    },

    // Question 6: Industry/Category (with subcategory if available)
    {
      question: t('faq.industryQuestion', { name: business.name }),
      answer: (() => {
        // Get main category - use primary_main_category_* fields
        const mainCategory = i18n.language === 'en'
          ? business.primary_main_category_en
          : business.primary_main_category_fr;

        // Get subcategory if available - use primary_sub_category_* fields
        const subCategory = i18n.language === 'en'
          ? business.primary_sub_category_en
          : business.primary_sub_category_fr;

        // Build answer
        if (mainCategory) {
          if (subCategory) {
            return t('faq.industryAnswerWithSub', {
              name: business.name,
              category: mainCategory,
              subcategory: subCategory
            });
          } else {
            return t('faq.industryAnswer', {
              name: business.name,
              category: mainCategory
            });
          }
        }
        return t('faq.noDataAvailable');
      })()
    }
  ];

  return (
    <section className="business-faq-section">
      <h2 className="faq-title">{t('faq.title')}</h2>
      <div className="faq-accordion">
        {faqItems.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className={`faq-question ${openIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="faq-question-text">{item.question}</span>
              <span className="faq-icon" aria-hidden="true">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`faq-answer ${openIndex === index ? 'open' : ''}`}
              aria-hidden={openIndex !== index}
            >
              <div className="faq-answer-content">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

BusinessFAQ.propTypes = {
  business: PropTypes.shape({
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    region: PropTypes.string,
    address: PropTypes.string,
    address_line2: PropTypes.string,
    province: PropTypes.string,
    postal_code: PropTypes.string,
    phone: PropTypes.string,
    website: PropTypes.string,
    opening_hours: PropTypes.object,
    primary_main_category_fr: PropTypes.string,
    primary_main_category_en: PropTypes.string,
    primary_sub_category_fr: PropTypes.string,
    primary_sub_category_en: PropTypes.string
  }).isRequired,
  businessHours: PropTypes.array
};

export default BusinessFAQ;
