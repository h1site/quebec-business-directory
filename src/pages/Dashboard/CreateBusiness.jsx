import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBusiness } from '../../services/businessService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { popularCategories } from '../../data/popularSearches.js';

const CreateBusiness = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState({ type: null, message: null });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    categories: [],
    products_services: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    const options = Array.from(event.target.selectedOptions, (option) => option.value);
    setForm((prev) => ({ ...prev, categories: options }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: null });

    if (!user) {
      setStatus({ type: 'error', message: 'Vous devez être connecté pour créer une fiche.' });
      return;
    }

    if (!form.name || !form.description || !form.email || !form.address || !form.city) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs requis.' });
      return;
    }

    try {
      setSubmitting(true);
      await createBusiness({
        ...form,
        owner_id: user.id,
        categories: form.categories,
        products_services: form.products_services,
        phone: form.phone,
        postal_code: form.postalCode
      });
      setStatus({ type: 'success', message: 'Votre entreprise a été soumise pour approbation.' });
      setForm({
        name: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        categories: [],
        products_services: ''
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ padding: '3rem 0' }}>
      <h1>{t('dashboard.createTitle')}</h1>
      {status.message && (
        <div
          className="alert"
          style={
            status.type === 'error'
              ? { background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }
              : {}
          }
        >
          {status.message}
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          {t('dashboard.businessName')} *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          {t('dashboard.description')} *
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          {t('dashboard.phone')}
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          {t('dashboard.email')} *
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          {t('dashboard.website')}
          <input name="website" value={form.website} onChange={handleChange} />
        </label>
        <label>
          {t('dashboard.address')} *
          <input name="address" value={form.address} onChange={handleChange} required />
        </label>
        <label>
          {t('dashboard.city')} *
          <input name="city" value={form.city} onChange={handleChange} required />
        </label>
        <label>
          {t('dashboard.postalCode')}
          <input name="postalCode" value={form.postalCode} onChange={handleChange} />
        </label>
        <label>
          {t('dashboard.categories')}
          <select multiple value={form.categories} onChange={handleCategoryChange}>
            {popularCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('dashboard.productsServices')}
          <textarea
            name="products_services"
            value={form.products_services}
            onChange={handleChange}
          />
        </label>
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '...' : t('dashboard.submit')}
        </button>
      </form>
    </section>
  );
};

export default CreateBusiness;
