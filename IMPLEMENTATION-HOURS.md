# Implémentation: Heures d'ouverture (Opening Hours)

## Statut: 80% Complété

### ✅ Terminé:

1. **Migration SQL** - `scripts/add-opening-hours.sql`
   - Colonne `opening_hours` (JSONB, NULL par défaut)
   - Index GIN pour performance
   - Vue `businesses_enriched` mise à jour

2. **Composant Wizard** - `src/components/CreateBusiness/components/WizardStep6_Hours.jsx`
   - Interface complète pour définir les heures
   - Bouton "Copier à tous les jours"
   - Option pour sauter les heures (optionnel)
   - Responsive mobile

3. **Wizard mis à jour** - `src/components/CreateBusiness/CreateBusinessWizard.jsx`
   - Import de WizardStep6_Hours
   - TOTAL_STEPS = 8 (ajout d'1 étape)
   - opening_hours dans formData
   - Case 5 ajouté pour WizardStep6_Hours

4. **EditBusiness mis à jour** - `src/pages/Dashboard/EditBusiness.jsx`
   - Onglet "Horaires" avec emoji 🕐
   - opening_hours dans form state
   - opening_hours chargé depuis business data
   - Case 'hours' dans saveTab()
   - UI complète inline avec gestion des jours

### ⚠️ À COMPLÉTER:

#### 1. Affichage sur BusinessDetails.jsx

Ajouter l'affichage des heures d'ouverture dans la sidebar, après la section contact:

```jsx
{/* Opening Hours Section */}
{business.opening_hours && (
  <div className="contact-section">
    <h3 className="sidebar-title">{t('business.openingHours')}</h3>
    <div className="hours-list">
      {Object.entries(business.opening_hours).map(([day, hours]) => (
        <div key={day} className="hours-item">
          <span className="hours-day">{t(`business.days.${day}`)}</span>
          <span className="hours-time">
            {hours.closed
              ? t('business.closed')
              : `${hours.open} - ${hours.close}`
            }
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

**CSS à ajouter dans BusinessDetails.css:**

```css
.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.hours-item:last-child {
  border-bottom: none;
}

.hours-day {
  font-weight: 600;
  text-transform: capitalize;
  color: #475569;
}

.hours-time {
  color: #64748b;
}
```

#### 2. Traductions i18n.js

**Localisation**: Après `step5` dans wizard section

**FRANÇAIS** (après ligne ~480):

```javascript
step6_hours: {
  title: 'Heures d\'ouverture',
  description: 'Indiquez vos heures d\'ouverture (optionnel)',
  optionalMessage: 'Les heures d\'ouverture sont optionnelles. Vous pouvez les ajouter maintenant ou plus tard.',
  addHours: 'Ajouter les heures d\'ouverture',
  skipHours: 'Ne pas afficher les heures d\'ouverture',
  closed: 'Fermé',
  copyToAll: 'Copier à tous les jours',
  days: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  }
},
```

**ANGLAIS** (après ligne ~1100):

```javascript
step6_hours: {
  title: 'Opening Hours',
  description: 'Set your opening hours (optional)',
  optionalMessage: 'Opening hours are optional. You can add them now or later.',
  addHours: 'Add opening hours',
  skipHours: 'Don\'t display opening hours',
  closed: 'Closed',
  copyToAll: 'Copy to all days',
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }
},
```

**EditBusiness translations (FR):**

```javascript
editBusiness: {
  // ... existing translations
  hours: 'Horaires',
  noHoursSet: 'Aucune heure d\'ouverture définie',
  addHours: 'Ajouter les heures',
  removeHours: 'Ne pas afficher les heures d\'ouverture',
  saveHours: 'Sauvegarder les horaires',
  // ...
}
```

**EditBusiness translations (EN):**

```javascript
editBusiness: {
  // ... existing translations
  hours: 'Hours',
  noHoursSet: 'No opening hours set',
  addHours: 'Add hours',
  removeHours: 'Don\'t display opening hours',
  saveHours: 'Save hours',
  // ...
}
```

**BusinessDetails translations (FR):**

```javascript
business: {
  // ... existing translations
  openingHours: 'Heures d\'ouverture',
  closed: 'Fermé',
  days: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  },
  // ...
}
```

**BusinessDetails translations (EN):**

```javascript
business: {
  // ... existing translations
  openingHours: 'Opening Hours',
  closed: 'Closed',
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  },
  // ...
}
```

### 📋 Steps pour compléter:

1. **Exécuter la migration SQL dans Supabase**:
   ```sql
   -- Voir scripts/add-opening-hours.sql
   ```

2. **Ajouter l'affichage dans BusinessDetails.jsx** (voir code ci-dessus)

3. **Ajouter les traductions dans i18n.js** (voir traductions ci-dessus)

4. **Build et test**:
   ```bash
   npm run build
   npm run dev
   ```

5. **Tester**:
   - Créer une nouvelle entreprise avec heures
   - Modifier les heures d'une entreprise existante
   - Vérifier l'affichage sur la page de détails
   - Tester sans heures (optionnel)

### 🎯 Format JSON des heures:

```json
{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "10:00", "close": "16:00", "closed": false},
  "sunday": {"open": "", "close": "", "closed": true}
}
```

### 📁 Fichiers modifiés:

- ✅ `scripts/add-opening-hours.sql`
- ✅ `src/components/CreateBusiness/components/WizardStep6_Hours.jsx`
- ✅ `src/components/CreateBusiness/CreateBusinessWizard.jsx`
- ✅ `src/pages/Dashboard/EditBusiness.jsx`
- ⚠️ `src/pages/BusinessDetails.jsx` (à compléter)
- ⚠️ `src/services/i18n.js` (à compléter)
- ⚠️ `src/pages/BusinessDetails.css` (à compléter)
