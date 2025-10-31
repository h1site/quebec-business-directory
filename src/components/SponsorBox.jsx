import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import './SponsorBox.css';

/**
 * Composant d'affichage de commandite avec tracking
 * Affiche un sponsor aléatoire et track les impressions/clicks
 */
export default function SponsorBox() {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [userIp, setUserIp] = useState(null);

  // Obtenir l'IP du visiteur au chargement
  useEffect(() => {
    getUserIp();
  }, []);

  // Charger un sponsor aléatoire
  useEffect(() => {
    loadRandomSponsor();
  }, []);

  // Tracker l'impression (vue) une seule fois quand sponsor ET IP sont disponibles
  useEffect(() => {
    if (sponsor && userIp && !impressionTracked) {
      trackImpression(sponsor.id, userIp);
      setImpressionTracked(true);
    }
  }, [sponsor, userIp, impressionTracked]);

  /**
   * Obtient l'IP publique du visiteur
   */
  async function getUserIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error('Erreur récupération IP:', error);
      // Fallback: utiliser une IP locale si échec
      setUserIp('127.0.0.1');
    }
  }

  /**
   * Charge un sponsor actif aléatoirement
   */
  async function loadRandomSponsor() {
    try {
      console.log('🔍 SponsorBox: Chargement des sponsors...');
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('❌ SponsorBox: Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ SponsorBox: Sponsors trouvés:', data);

      if (data && data.length > 0) {
        // Sélectionner un sponsor aléatoire
        const randomIndex = Math.floor(Math.random() * data.length);
        const selectedSponsor = data[randomIndex];

        console.log('🎯 SponsorBox: Sponsor sélectionné:', selectedSponsor);

        // Générer l'URL du logo (Storage ou statique)
        if (selectedSponsor.use_storage_logo && selectedSponsor.logo_storage_path) {
          const { data: publicUrl } = supabase.storage
            .from('sponsor-logos')
            .getPublicUrl(selectedSponsor.logo_storage_path);

          selectedSponsor.logo_url = publicUrl.publicUrl;
          console.log('📦 SponsorBox: URL Storage:', selectedSponsor.logo_url);
        } else {
          selectedSponsor.logo_url = selectedSponsor.logo_path;
          console.log('📁 SponsorBox: URL Statique:', selectedSponsor.logo_url);
        }

        setSponsor(selectedSponsor);
      } else {
        console.warn('⚠️ SponsorBox: Aucun sponsor actif trouvé');
      }
    } catch (error) {
      console.error('❌ SponsorBox: Erreur chargement sponsor:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Track une impression (vue du sponsor) avec déduplication IP
   */
  async function trackImpression(sponsorId, ipAddress) {
    try {
      // Appeler la nouvelle fonction avec déduplication IP
      const { data, error } = await supabase.rpc('track_sponsor_impression', {
        p_sponsor_id: sponsorId,
        p_ip_address: ipAddress
      });

      if (error) {
        console.error('Erreur tracking impression:', error);
      } else if (data === false) {
        // Cette IP a déjà vu ce sponsor aujourd'hui
        console.log('Impression déjà comptée pour cette IP aujourd\'hui');
      }
    } catch (error) {
      console.error('Erreur tracking impression:', error);
    }
  }

  /**
   * Track un click avec déduplication IP et redirige vers l'URL avec UTM
   */
  async function handleClick(e) {
    e.preventDefault();

    if (!sponsor || !userIp) return;

    try {
      // Track le click avec déduplication IP
      const { data, error } = await supabase.rpc('track_sponsor_click', {
        p_sponsor_id: sponsor.id,
        p_ip_address: userIp
      });

      if (error) {
        console.error('Erreur tracking click:', error);
      } else if (data === false) {
        console.log('Click déjà compté pour cette IP aujourd\'hui');
      }

      // Construire l'URL avec UTM parameters
      const url = new URL(sponsor.cta_url);
      url.searchParams.set('utm_source', 'registreduquebec');
      url.searchParams.set('utm_medium', 'sponsored_listing');
      url.searchParams.set('utm_campaign', sponsor.company_name);

      // Ouvrir dans un nouvel onglet
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erreur handleClick:', error);
      // En cas d'erreur, ouvrir quand même le lien
      window.open(sponsor.cta_url, '_blank', 'noopener,noreferrer');
    }
  }

  // Ne rien afficher si pas de sponsor ou en chargement
  if (loading || !sponsor) {
    return null;
  }

  return (
    <div className="sponsor-box">
      <div className="sponsor-label">Commanditaire</div>
      <a
        href={sponsor.cta_url}
        onClick={handleClick}
        className="sponsor-content"
        rel="noopener noreferrer sponsored"
      >
        <div className="sponsor-logo-container">
          <img
            src={sponsor.logo_url}
            alt={sponsor.company_name}
            className="sponsor-logo"
            loading="lazy"
          />
        </div>
        <div className="sponsor-text">
          <div className="sponsor-company">{sponsor.company_name}</div>
          {sponsor.slogan && (
            <div className="sponsor-slogan">{sponsor.slogan}</div>
          )}
        </div>
        <div className="sponsor-cta">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </a>
    </div>
  );
}
