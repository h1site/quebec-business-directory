import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only load GA if measurement ID is configured
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics: No measurement ID configured');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // We'll send page views manually
    });

    console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    // Track page views on route change
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
