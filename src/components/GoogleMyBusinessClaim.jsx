import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import './GoogleMyBusinessClaim.css';

const GoogleMyBusinessClaim = ({ business, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gmbLocations, setGmbLocations] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  // Step 1: Initiate Google OAuth for Google My Business
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // OAuth with Google My Business scope
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/business.manage',
          redirectTo: `${window.location.origin}/claim-gmb-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (authError) throw authError;

      // The OAuth flow will redirect to the callback URL
      // We'll handle the rest in the callback page
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Erreur lors de la connexion à Google: ' + err.message);
      setLoading(false);
    }
  };

  // Step 2: Fetch Google My Business locations
  const fetchGMBLocations = async (accessToken) => {
    setLoading(true);
    setError(null);

    try {
      // Call Google My Business API to get accounts
      const accountsResponse = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!accountsResponse.ok) {
        throw new Error('Impossible de récupérer les comptes Google My Business');
      }

      const accountsData = await accountsResponse.json();
      const accounts = accountsData.accounts || [];

      if (accounts.length === 0) {
        throw new Error('Aucun compte Google My Business trouvé');
      }

      // Get locations for the first account (you can expand this to handle multiple accounts)
      const accountName = accounts[0].name;
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!locationsResponse.ok) {
        throw new Error('Impossible de récupérer les emplacements');
      }

      const locationsData = await locationsResponse.json();
      const locations = locationsData.locations || [];

      // Filter locations that might match the current business
      const filteredLocations = locations.filter(loc => {
        const locName = loc.title?.toLowerCase() || '';
        const bizName = business.name?.toLowerCase() || '';
        const locCity = loc.address?.locality?.toLowerCase() || '';
        const bizCity = business.city?.toLowerCase() || '';

        // Match by name or city
        return locName.includes(bizName) ||
               bizName.includes(locName) ||
               (locCity === bizCity && locName && bizName);
      });

      setGmbLocations(filteredLocations.length > 0 ? filteredLocations : locations);
      setLoading(false);
    } catch (err) {
      console.error('GMB fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Step 3: Submit claim with selected GMB location
  const handleSubmitClaim = async () => {
    if (!selectedLocation) {
      setError('Veuillez sélectionner un emplacement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Vous devez être connecté');
      }

      // Create the claim with GMB verification
      const { data: claim, error: claimError } = await supabase
        .from('business_claims')
        .insert({
          business_id: business.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.name || user.email,
          verification_method: 'google_business',
          verification_data: {
            gmb_location_name: selectedLocation.name,
            gmb_location_title: selectedLocation.title,
            gmb_location_address: selectedLocation.address,
            gmb_place_id: selectedLocation.metadata?.placeId,
            verified_at: new Date().toISOString()
          },
          status: 'approved' // Auto-approve GMB claims
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Update business immediately (GMB claims are auto-approved)
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          owner_id: user.id,
          claimed_at: new Date().toISOString(),
          is_claimed: true,
          // Optionally update Google Place ID if available
          google_place_id: selectedLocation.metadata?.placeId || business.google_place_id
        })
        .eq('id', business.id);

      if (updateError) throw updateError;

      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        alert('✅ Entreprise réclamée avec succès via Google My Business!');
        window.location.reload();
      }
    } catch (err) {
      console.error('Claim submission error:', err);
      setError('Erreur lors de la réclamation: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="google-my-business-claim">
      <div className="gmb-header">
        <h3>Réclamer avec Google My Business</h3>
        <p className="gmb-description">
          Connectez-vous avec votre compte Google pour réclamer cette fiche
          en utilisant votre profil Google My Business.
        </p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {!gmbLocations ? (
        // Step 1: Google Sign In
        <div className="gmb-signin">
          <button
            className="btn-google-signin"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {loading ? 'Connexion...' : 'Continuer avec Google My Business'}
          </button>

          {onCancel && (
            <button className="btn-cancel" onClick={onCancel}>
              Annuler
            </button>
          )}
        </div>
      ) : (
        // Step 2: Select GMB Location
        <div className="gmb-locations">
          <h4>Sélectionnez votre emplacement Google My Business</h4>
          <p className="help-text">
            Choisissez l'emplacement qui correspond à <strong>{business.name}</strong>
          </p>

          <div className="locations-list">
            {gmbLocations.map((location, index) => (
              <div
                key={index}
                className={`location-card ${selectedLocation === location ? 'selected' : ''}`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="location-header">
                  <input
                    type="radio"
                    name="gmb-location"
                    checked={selectedLocation === location}
                    onChange={() => setSelectedLocation(location)}
                  />
                  <h5>{location.title}</h5>
                </div>
                <div className="location-details">
                  {location.address && (
                    <p className="location-address">
                      📍 {location.address.addressLines?.join(', ')}<br />
                      {location.address.locality}, {location.address.administrativeArea} {location.address.postalCode}
                    </p>
                  )}
                  {location.phoneNumbers?.primaryPhone && (
                    <p className="location-phone">
                      📞 {location.phoneNumbers.primaryPhone}
                    </p>
                  )}
                  {location.websiteUri && (
                    <p className="location-website">
                      🌐 {location.websiteUri}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="gmb-actions">
            <button
              className="btn-submit"
              onClick={handleSubmitClaim}
              disabled={!selectedLocation || loading}
            >
              {loading ? 'Réclamation en cours...' : 'Réclamer cette fiche'}
            </button>
            <button className="btn-cancel" onClick={onCancel}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMyBusinessClaim;
