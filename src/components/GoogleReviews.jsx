import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GoogleReviews.css';

const GoogleReviews = ({ rating, reviewsCount, reviews }) => {
  const [displayedReview, setDisplayedReview] = useState(null);

  // Select a random review to display
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const randomIndex = Math.floor(Math.random() * reviews.length);
      setDisplayedReview(reviews[randomIndex]);
    }
  }, [reviews]);

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="star star-full">★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="star star-half">★</span>
        );
      } else {
        stars.push(
          <span key={i} className="star star-empty">☆</span>
        );
      }
    }

    return stars;
  };

  if (!rating && (!reviews || reviews.length === 0)) {
    return null;
  }

  return (
    <div className="google-reviews-section">
      <div className="reviews-header">
        <img src="/images/logos/google.svg" alt="Google" className="google-logo" />
        <div className="reviews-rating">
          <div className="rating-stars">{renderStars(rating || 0)}</div>
          <div className="rating-info">
            <span className="rating-value">{rating ? rating.toFixed(1) : '0.0'}</span>
            <span className="reviews-count">({reviewsCount || 0} avis)</span>
          </div>
        </div>
      </div>

      {displayedReview && (
        <div className="review-card">
          <div className="review-header">
            {displayedReview.profile_photo_url && (
              <img
                src={displayedReview.profile_photo_url}
                alt={displayedReview.author_name}
                className="reviewer-photo"
              />
            )}
            <div className="reviewer-info">
              <div className="reviewer-name">{displayedReview.author_name}</div>
              <div className="review-rating">{renderStars(displayedReview.rating)}</div>
              {displayedReview.relative_time_description && (
                <div className="review-time">{displayedReview.relative_time_description}</div>
              )}
            </div>
          </div>
          {displayedReview.text && (
            <p className="review-text">{displayedReview.text}</p>
          )}
        </div>
      )}
    </div>
  );
};

GoogleReviews.propTypes = {
  rating: PropTypes.number,
  reviewsCount: PropTypes.number,
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      author_name: PropTypes.string,
      rating: PropTypes.number,
      text: PropTypes.string,
      time: PropTypes.number,
      relative_time_description: PropTypes.string,
      profile_photo_url: PropTypes.string
    })
  )
};

export default GoogleReviews;
