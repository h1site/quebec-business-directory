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
      // Récupérer quelques critiques récentes avec les infos des entreprises
      const { data, error } = await supabase
        .from('business_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Erreur lors du chargement:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Charger les infos des utilisateurs et entreprises séparément
        const enrichedData = await Promise.all(
          data.map(async (review) => {
            // Charger le profil utilisateur
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url')
              .eq('user_id', review.user_id)
              .maybeSingle();

            // Charger l'entreprise
            const { data: business } = await supabase
              .from('businesses')
              .select('id, name, slug, city')
              .eq('id', review.business_id)
              .maybeSingle();

            return {
              ...review,
              user_profiles: profile,
              businesses: business
            };
          })
        );

        console.log('Témoignages chargés:', enrichedData);
        setTestimonials(enrichedData);
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
    return null; // Cacher la section s'il n'y a aucune critique
  }

  return (
    <section className="user-testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <h2>Avis des Utilisateurs sur les Entreprises</h2>
          <p className="testimonials-subtitle">
            Découvrez ce que nos utilisateurs disent des entreprises québécoises
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <img
                    src={testimonial.user_profiles?.avatar_url || '/default-avatar.svg'}
                    alt={testimonial.user_profiles?.full_name || 'Utilisateur'}
                    loading="lazy"
                    decoding="async"
                    width="48"
                    height="48"
                  />
                </div>
                <div className="testimonial-author">
                  <h4>{testimonial.user_profiles?.full_name || 'Utilisateur anonyme'}</h4>
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
                <a
                  href={`/entreprise/${testimonial.businesses?.slug}`}
                  className="testimonial-business-link"
                >
                  {testimonial.businesses?.name}
                  {testimonial.businesses?.city && ` - ${testimonial.businesses.city}`}
                </a>
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
