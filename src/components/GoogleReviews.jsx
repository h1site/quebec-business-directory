import { useState } from 'react';
import PropTypes from 'prop-types';
import './GoogleReviews.css';

const GoogleReviews = ({ rating, reviewsCount, reviews }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const goToNextReview = () => {
    if (reviews && reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }
  };

  const goToPreviousReview = () => {
    if (reviews && reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  const goToReview = (index) => {
    setCurrentReviewIndex(index);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3; // Lower threshold for half star display

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
          <span key={i} className="star star-empty">★</span>
        );
      }
    }

    return stars;
  };

  if (!rating && (!reviews || reviews.length === 0)) {
    return null;
  }

  // Display up to 5 reviews in carousel
  const reviewsToShow = reviews && reviews.length > 0 ? reviews.slice(0, 5) : [];
  const currentReview = reviewsToShow.length > 0 ? reviewsToShow[currentReviewIndex] : null;

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

      {currentReview && (
        <div className="reviews-carousel">
          <div className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-name">{currentReview.author_name}</div>
                <div className="review-rating">{renderStars(currentReview.rating)}</div>
                {currentReview.relative_time_description && (
                  <div className="review-time">{currentReview.relative_time_description}</div>
                )}
              </div>
            </div>
            {currentReview.text && (
              <p className="review-text">{currentReview.text}</p>
            )}
          </div>

          {/* Carousel Controls */}
          {reviewsToShow.length > 1 && (
            <>
              <div className="carousel-navigation">
                <button
                  className="carousel-button carousel-prev"
                  onClick={goToPreviousReview}
                  aria-label="Avis précédent"
                >
                  ‹
                </button>
                <div className="carousel-indicators">
                  {reviewsToShow.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-indicator ${index === currentReviewIndex ? 'active' : ''}`}
                      onClick={() => goToReview(index)}
                      aria-label={`Aller à l'avis ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  className="carousel-button carousel-next"
                  onClick={goToNextReview}
                  aria-label="Avis suivant"
                >
                  ›
                </button>
              </div>
              <div className="carousel-counter">
                {currentReviewIndex + 1} / {reviewsToShow.length}
              </div>
            </>
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
