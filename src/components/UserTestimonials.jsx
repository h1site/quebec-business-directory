import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import './UserTestimonials.css';

const UserTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      // Récupérer quelques critiques récentes
      const { data, error } = await supabase
        .from('business_reviews_with_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Erreur lors du chargement:', error);
      }

      if (data) {
        console.log('Témoignages chargés:', data);
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Erreur chargement témoignages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return null; // Ne rien afficher pendant le chargement
  }

  if (testimonials.length === 0) {
    return null; // Ne rien afficher s'il n'y a pas de témoignages
  }

  return (
    <section className="user-testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <h2>Nos Avis</h2>
          <p className="testimonials-subtitle">
            Découvrez ce que nos utilisateurs disent de leur expérience
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <img
                    src={testimonial.avatar_url || '/default-avatar.svg'}
                    alt={testimonial.full_name || 'Utilisateur'}
                  />
                </div>
                <div className="testimonial-author">
                  <h4>{testimonial.full_name || 'Utilisateur anonyme'}</h4>
                  <div className="testimonial-rating">
                    {'★'.repeat(testimonial.rating)}
                    {'☆'.repeat(5 - testimonial.rating)}
                  </div>
                </div>
              </div>

              <p className="testimonial-comment">
                "{testimonial.comment.length > 150
                  ? testimonial.comment.substring(0, 150) + '...'
                  : testimonial.comment}"
              </p>

              <div className="testimonial-footer">
                <span className="testimonial-date">
                  {formatDate(testimonial.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTestimonials;
