import PropTypes from 'prop-types';
import './BusinessAttributes.css';

/**
 * Component to display business attributes from Google Places
 * (Restaurant features, parking, accessibility, EV charging, etc.)
 */
const BusinessAttributes = ({ business }) => {
  if (!business) return null;

  const {
    restaurantAttributes,
    parkingOptions,
    paymentOptions,
    accessibilityOptions,
    evChargeOptions,
    fuelOptions
  } = business;

  // Helper to check if any attribute is truthy in an object
  const hasAnyTrueAttribute = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(val => val === true || (val && typeof val === 'object'));
  };

  const showRestaurant = hasAnyTrueAttribute(restaurantAttributes);
  const showParking = parkingOptions !== null && parkingOptions !== undefined;
  const showPayment = paymentOptions !== null && paymentOptions !== undefined;
  const showAccessibility = hasAnyTrueAttribute(accessibilityOptions);
  const showEV = evChargeOptions !== null && evChargeOptions !== undefined;
  const showFuel = fuelOptions !== null && fuelOptions !== undefined;

  // If nothing to show, don't render
  if (!showRestaurant && !showParking && !showPayment && !showAccessibility && !showEV && !showFuel) {
    return null;
  }

  return (
    <div className="business-attributes">
      <h3>Attributs et services</h3>

      {/* Restaurant/Commerce Attributes */}
      {showRestaurant && (
        <div className="attribute-section">
          <h4>🍽️ Services de restauration</h4>
          <div className="attribute-grid">
            {restaurantAttributes.dineIn && (
              <div className="attribute-item">✓ Sur place</div>
            )}
            {restaurantAttributes.takeout && (
              <div className="attribute-item">✓ Pour emporter</div>
            )}
            {restaurantAttributes.delivery && (
              <div className="attribute-item">✓ Livraison</div>
            )}
            {restaurantAttributes.reservable && (
              <div className="attribute-item">✓ Réservations</div>
            )}
            {restaurantAttributes.outdoorSeating && (
              <div className="attribute-item">✓ Terrasse extérieure</div>
            )}
            {restaurantAttributes.liveMusic && (
              <div className="attribute-item">✓ Musique live</div>
            )}
            {restaurantAttributes.goodForChildren && (
              <div className="attribute-item">✓ Adapté aux enfants</div>
            )}
            {restaurantAttributes.goodForGroups && (
              <div className="attribute-item">✓ Adapté aux groupes</div>
            )}
            {restaurantAttributes.servesVegetarianFood && (
              <div className="attribute-item">✓ Options végétariennes</div>
            )}
            {restaurantAttributes.servesBeer && (
              <div className="attribute-item">✓ Bière disponible</div>
            )}
            {restaurantAttributes.servesWine && (
              <div className="attribute-item">✓ Vin disponible</div>
            )}
            {restaurantAttributes.servesBreakfast && (
              <div className="attribute-item">✓ Déjeuner</div>
            )}
            {restaurantAttributes.servesLunch && (
              <div className="attribute-item">✓ Dîner</div>
            )}
            {restaurantAttributes.servesDinner && (
              <div className="attribute-item">✓ Souper</div>
            )}
            {restaurantAttributes.servesBrunch && (
              <div className="attribute-item">✓ Brunch</div>
            )}
          </div>
        </div>
      )}

      {/* Parking Options */}
      {showParking && (
        <div className="attribute-section">
          <h4>🅿️ Stationnement</h4>
          <div className="attribute-grid">
            {parkingOptions.free_parking && (
              <div className="attribute-item">✓ Stationnement gratuit</div>
            )}
            {parkingOptions.paid_parking && (
              <div className="attribute-item">✓ Stationnement payant</div>
            )}
            {parkingOptions.street_parking && (
              <div className="attribute-item">✓ Stationnement dans la rue</div>
            )}
            {parkingOptions.parking_lot && (
              <div className="attribute-item">✓ Stationnement</div>
            )}
            {parkingOptions.parking_garage && (
              <div className="attribute-item">✓ Garage de stationnement</div>
            )}
            {parkingOptions.valet_parking && (
              <div className="attribute-item">✓ Service de voiturier</div>
            )}
          </div>
        </div>
      )}

      {/* Payment Options */}
      {showPayment && (
        <div className="attribute-section">
          <h4>💳 Options de paiement</h4>
          <div className="attribute-grid">
            {paymentOptions.accepts_cash && (
              <div className="attribute-item">✓ Argent comptant</div>
            )}
            {paymentOptions.accepts_credit_cards && (
              <div className="attribute-item">✓ Cartes de crédit</div>
            )}
            {paymentOptions.accepts_debit_cards && (
              <div className="attribute-item">✓ Cartes de débit</div>
            )}
            {paymentOptions.accepts_nfc && (
              <div className="attribute-item">✓ Paiements sans contact (NFC)</div>
            )}
          </div>
        </div>
      )}

      {/* Accessibility Options */}
      {showAccessibility && (
        <div className="attribute-section">
          <h4>♿ Accessibilité</h4>
          <div className="attribute-grid">
            {accessibilityOptions.wheelchairAccessibleEntrance && (
              <div className="attribute-item">✓ Entrée accessible en fauteuil roulant</div>
            )}
            {accessibilityOptions.wheelchair_accessible_parking && (
              <div className="attribute-item">✓ Stationnement accessible</div>
            )}
            {accessibilityOptions.wheelchair_accessible_restroom && (
              <div className="attribute-item">✓ Toilettes accessibles</div>
            )}
            {accessibilityOptions.wheelchair_accessible_seating && (
              <div className="attribute-item">✓ Places assises accessibles</div>
            )}
          </div>
        </div>
      )}

      {/* EV Charging Options */}
      {showEV && evChargeOptions && (
        <div className="attribute-section">
          <h4>🔌 Bornes de recharge électrique</h4>
          <div className="attribute-grid">
            {evChargeOptions.has_ev_charging && (
              <div className="attribute-item">✓ Bornes de recharge disponibles</div>
            )}
            {evChargeOptions.ev_connector_types && evChargeOptions.ev_connector_types.length > 0 && (
              <div className="attribute-item">
                Types: {evChargeOptions.ev_connector_types.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fuel Options */}
      {showFuel && fuelOptions && (
        <div className="attribute-section">
          <h4>⛽ Carburant</h4>
          <div className="attribute-grid">
            {fuelOptions.diesel && (
              <div className="attribute-item">✓ Diesel</div>
            )}
            {fuelOptions.gasoline && (
              <div className="attribute-item">✓ Essence</div>
            )}
            {fuelOptions.propane && (
              <div className="attribute-item">✓ Propane</div>
            )}
            {fuelOptions.biodiesel && (
              <div className="attribute-item">✓ Biodiesel</div>
            )}
            {fuelOptions.ethanol && (
              <div className="attribute-item">✓ Éthanol</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

BusinessAttributes.propTypes = {
  business: PropTypes.shape({
    restaurantAttributes: PropTypes.object,
    parkingOptions: PropTypes.object,
    paymentOptions: PropTypes.object,
    accessibilityOptions: PropTypes.object,
    evChargeOptions: PropTypes.object,
    fuelOptions: PropTypes.object
  })
};

export default BusinessAttributes;
