import React from 'react';
import { useTranslation } from 'react-i18next';
import './SocialShare.css';
import {
  trackFacebookShare,
  trackTwitterShare,
  trackLinkedInShare,
  trackEmailShare
} from '../services/ctaTrackingService';

const SocialShare = ({ business }) => {
  const { t, i18n } = useTranslation();

  // Construire l'URL de la fiche
  const businessUrl = `https://registreduquebec.com/${i18n.language}/entreprise/${business.slug}`;

  // Texte de partage
  const shareText = i18n.language === 'fr'
    ? `Découvrez ${business.name} sur le Registre du Québec`
    : `Discover ${business.name} on Registre du Québec`;

  const handleFacebookShare = () => {
    trackFacebookShare(business.id);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(businessUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    trackTwitterShare(business.id);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(businessUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    trackLinkedInShare(business.id);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(businessUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    trackEmailShare(business.id);
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(
      i18n.language === 'fr'
        ? `Bonjour,\n\nJe voulais partager cette entreprise avec vous:\n\n${business.name}\n${businessUrl}\n\nBonne journée!`
        : `Hello,\n\nI wanted to share this business with you:\n\n${business.name}\n${businessUrl}\n\nHave a great day!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(businessUrl);
      // Afficher un message de confirmation (vous pouvez ajouter un toast ici)
      alert(t('business.linkCopied') || 'Lien copié!');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="contact-section social-share-section">
      <h3 className="sidebar-title">{t('business.shareOnSocial')}</h3>
      <div className="social-share-buttons">
        {/* Facebook */}
        <button
          onClick={handleFacebookShare}
          className="social-share-btn facebook"
          aria-label="Share on Facebook"
          title="Facebook"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Twitter/X */}
        <button
          onClick={handleTwitterShare}
          className="social-share-btn twitter"
          aria-label="Share on Twitter"
          title="Twitter/X"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          onClick={handleLinkedInShare}
          className="social-share-btn linkedin"
          aria-label="Share on LinkedIn"
          title="LinkedIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>

        {/* Email */}
        <button
          onClick={handleEmailShare}
          className="social-share-btn email"
          aria-label="Share by Email"
          title="Email"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="social-share-btn copy-link"
          aria-label="Copy Link"
          title={t('business.copyLink') || 'Copier le lien'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
