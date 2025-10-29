/**
 * Web Vitals - Track Core Web Vitals metrics
 * https://web.dev/vitals/
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FID (First Input Delay) - Interactivity
 * - FCP (First Contentful Paint) - Loading
 * - LCP (Largest Contentful Paint) - Loading
 * - TTFB (Time to First Byte) - Server response
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

// Send metrics to Google Analytics (if available)
const sendToAnalytics = ({ name, delta, value, id }) => {
  // Check if gtag is available (Google Analytics)
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      delta: Math.round(delta),
      rating: getRating(name, value),
    });
  }
};

// Get rating (good/needs-improvement/poor) based on thresholds
const getRating = (name, value) => {
  const thresholds = {
    CLS: [0.1, 0.25],
    FID: [100, 300],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return '✅ good';
  if (value <= poor) return '⚠️ needs-improvement';
  return '❌ poor';
};

// Initialize Web Vitals tracking
reportWebVitals(sendToAnalytics);

export default reportWebVitals;
