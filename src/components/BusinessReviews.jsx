import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import './BusinessReviews.css';

const BusinessReviews = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadReviews();
  }, [businessId]);

  const loadReviews = async () => {
    try {
      // Charger les critiques
      const { data: reviewsData, error } = await supabase
        .from('business_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (reviewsData && reviewsData.length > 0) {
        // Charger les profils utilisateurs pour chaque critique
        const enrichedReviews = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url')
              .eq('user_id', review.user_id)
              .single();

            return {
              ...review,
              user_profiles: profile
            };
          })
        );

        setReviews(enrichedReviews);

        // Calculer les statistiques
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / reviewsData.length;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(r => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setStats({
          average: Math.round(average * 10) / 10,
          count: reviewsData.length,
          distribution
        });
      } else {
        setReviews([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement critiques:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating, count) => {
    const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
    return (
      <div className="rating-bar">
        <span className="rating-label">{rating} étoiles</span>
        <div className="bar-container">
          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Chargement des critiques...</div>;
  }

  return (
    <div className="business-reviews">
      <h2>Critiques et évaluations</h2>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Aucune critique pour le moment.</p>
          <p>Soyez le premier à partager votre expérience!</p>
        </div>
      ) : (
        <>
          {/* Statistiques des critiques */}
          <div className="reviews-stats">
            <div className="overall-rating">
              <div className="rating-number">{stats.average}</div>
              {renderStars(Math.round(stats.average))}
              <div className="rating-text">
                {stats.count} {stats.count === 1 ? 'critique' : 'critiques'}
              </div>
            </div>

            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating}>
                  {renderRatingBar(rating, stats.distribution[rating])}
                </div>
              ))}
            </div>
          </div>

          {/* Liste des critiques */}
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img
                      src={review.user_profiles?.avatar_url || '/default-avatar.svg'}
                      alt="Avatar"
                      className="reviewer-avatar"
                    />
                    <div>
                      <div className="reviewer-name">
                        {review.user_profiles?.full_name || 'Utilisateur anonyme'}
                      </div>
                      <div className="review-date">{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="review-comment">{review.comment}</p>

                {review.photos && review.photos.length > 0 && (
                  <div className="review-photos">
                    {review.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="review-photo"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessReviews;
