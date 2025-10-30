# Implémentation: Option "Cacher l'adresse"

## Résumé
Permettre aux utilisateurs de cacher leur adresse physique sur leur fiche publique tout en la conservant dans la base de données.

## 1. Migration Base de Données (À FAIRE MANUELLEMENT DANS SUPABASE)

```sql
-- Ajouter la colonne show_address (défaut: TRUE pour toutes les entreprises existantes)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;

-- Créer un index pour performance
CREATE INDEX IF NOT EXISTS idx_businesses_show_address
ON businesses(show_address);
```

## 2. Modifications des Fichiers

### A) CreateBusinessWizard.jsx
**Ligne 32-68**: Ajouter `show_address: true` dans formData initial:

```javascript
const [formData, setFormData] = useState({
  // ... autres champs ...

  // Step 4: Address
  address: '',
  city: '',
  province: 'QC',
  postal_code: '',
  show_address: true,  // ← AJOUTER CETTE LIGNE

  // ... reste ...
});
```

### B) WizardStep5_Address.jsx
**Après la ligne 274** (avant `</div></div>`), ajouter le toggle:

```jsx
        {/* Nouveau: Toggle pour afficher/cacher l'adresse */}
        <div className="form-group" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px', border: '1px solid #e6e9f0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <input
              id="show_address"
              type="checkbox"
              checked={formData.show_address !== false}
              onChange={(e) => updateFormData({ show_address: e.target.checked })}
              style={{ marginTop: '0.25rem', width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <label htmlFor="show_address" style={{ fontWeight: 600, color: '#1e3a8a', cursor: 'pointer', display: 'block', marginBottom: '0.5rem' }}>
                {t('wizard.step5.showAddressLabel')}
              </label>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                {t('wizard.step5.showAddressHelp')}
              </p>
              {formData.show_address === false && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#92400e' }}>
                    ⚠️ {t('wizard.step5.showAddressWarning')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
```

### C) EditBusiness.jsx
Chercher où l'adresse est affichée et ajouter le même toggle (même code que ci-dessus).

### D) BusinessDetails.jsx
**Trouver la section "Adresse"** (autour ligne 600-700) et envelopper dans une condition:

```jsx
{/* Adresse - Afficher seulement si show_address est TRUE */}
{business.show_address !== false && business.address && (
  <div className="info-card">
    <h3 className="info-card-title">
      <span className="info-icon">📍</span>
      {t('business.address')}
    </h3>
    <div className="info-card-content">
      {/* ... contenu adresse actuel ... */}
    </div>
  </div>
)}
```

**Pour la carte/map**, envelopper aussi:

```jsx
{/* Carte - Afficher seulement si show_address est TRUE */}
{business.show_address !== false && (business.latitude && business.longitude) && (
  <div className="full-width-map-section">
    {/* ... contenu map actuel ... */}
  </div>
)}
```

**Pour Waze**, envelopper aussi:

```jsx
{/* Waze - Afficher seulement si show_address est TRUE */}
{business.show_address !== false && business.latitude && business.longitude && (
  <a href={`https://waze.com/ul?ll=${business.latitude},${business.longitude}&navigate=yes`}
     target="_blank"
     rel="noopener noreferrer"
     className="btn btn-waze">
    {t('business.openInWaze')}
  </a>
)}
```

### E) i18n.js - Traductions FR

```javascript
// Dans home.step5 (autour ligne 449):
showAddressLabel: 'Afficher mon adresse sur ma fiche publique',
showAddressHelp: 'Si vous décochez cette option, votre adresse complète, la carte et le bouton Waze ne seront pas affichés sur votre fiche publique. Vous pourrez activer ou désactiver cette option à tout moment en modifiant votre fiche.',
showAddressWarning: 'Votre adresse, la carte et les coordonnées GPS ne seront pas visibles sur votre fiche publique.',
```

### F) i18n.js - Traductions EN

```javascript
// Dans en.step5 (autour ligne 449):
showAddressLabel: 'Display my address on my public listing',
showAddressHelp: 'If you uncheck this option, your full address, map, and Waze button will not be displayed on your public listing. You can enable or disable this option at any time by editing your listing.',
showAddressWarning: 'Your address, map, and GPS coordinates will not be visible on your public listing.',
```

## 3. Ordre d'implémentation

1. ✅ Exécuter la migration SQL dans Supabase
2. ✅ Ajouter `show_address: true` dans CreateBusinessWizard formData
3. ✅ Ajouter le toggle dans WizardStep5_Address.jsx
4. ✅ Ajouter le toggle dans EditBusiness.jsx
5. ✅ Ajouter les conditions dans BusinessDetails.jsx (adresse, map, waze)
6. ✅ Ajouter les traductions FR/EN
7. ✅ Build et test
8. ✅ Push

## 4. Comportement Attendu

- **Par défaut**: show_address = TRUE (affiche adresse, map, waze)
- **Si désactivé**: show_address = FALSE
  - ❌ Adresse complète cachée
  - ❌ Carte OpenStreetMap cachée
  - ❌ Bouton Waze caché
  - ✅ Téléphone, email, website toujours visibles
  - ✅ L'adresse reste en DB pour usage interne

## 5. Note Importante

⚠️ **LA MIGRATION SQL DOIT ÊTRE EXÉCUTÉE AVANT DE DÉPLOYER LE CODE**

Sinon, les requêtes échoueront car la colonne `show_address` n'existera pas.
