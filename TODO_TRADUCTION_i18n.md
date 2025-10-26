# 🌐 TODO: Traduction i18n des nouveaux composants

## Problème
Les composants suivants ont été créés avec du texte français **hardcodé** au lieu d'utiliser le système de traduction i18n (react-i18next).

---

## 📋 Composants à traduire

### 1. **Wizard de création d'entreprise**
**Localisation:** `/src/components/CreateBusiness/`

#### Fichiers concernés:
- ❌ `CreateBusinessWizard.jsx` - Titres, messages
- ❌ `WizardProgressBar.jsx` - Labels des étapes
- ❌ `WizardNavigation.jsx` - Boutons Retour/Continuer/Soumettre
- ❌ `BusinessPreview.jsx` - Textes du preview
- ❌ `WizardStep1_Basic.jsx` - Labels, placeholders, erreurs
- ❌ `WizardStep2_Details.jsx` - Labels, options, erreurs
- ❌ `WizardStep3_Media.jsx` - Labels, instructions, erreurs
- ❌ `WizardStep4_Contact.jsx` - Labels, placeholders, erreurs
- ❌ `WizardStep5_Address.jsx` - Labels, suggestions, erreurs
- ❌ `WizardStep6_Geolocation.jsx` - Instructions, boutons, erreurs
- ❌ `WizardStep7_Category.jsx` - Titre, placeholder, erreurs
- ❌ `WizardStep8_Services.jsx` - Labels, placeholders, exemples
- ❌ `WizardStep9_Summary.jsx` - Résumé, processus, conditions

**Estimation:** ~300+ chaînes de texte à traduire

---

### 2. **Modal de réclamation**
**Localisation:** `/src/components/ClaimBusinessModal.jsx`

#### Textes à traduire:
- ❌ Titres et sous-titres
- ❌ Labels de formulaire (nom, email, téléphone, message)
- ❌ Placeholders
- ❌ Messages de validation
- ❌ Instructions de vérification
- ❌ Messages de succès/erreur/en attente

**Estimation:** ~50+ chaînes de texte

---

## 🔧 Comment implémenter i18n

### Structure recommandée:

#### 1. Créer les fichiers de traduction

**`public/locales/fr/wizard.json`**
```json
{
  "wizard": {
    "title": "Créer une nouvelle entreprise",
    "step1": {
      "title": "Informations de base",
      "description": "Commencez par les informations essentielles",
      "nameLabel": "Nom de l'entreprise",
      "namePlaceholder": "Ex: Restaurant Le Gourmet",
      "nameRequired": "Le nom doit contenir au moins 3 caractères"
    }
  }
}
```

**`public/locales/en/wizard.json`**
```json
{
  "wizard": {
    "title": "Create a new business",
    "step1": {
      "title": "Basic information",
      "description": "Start with essential information",
      "nameLabel": "Business name",
      "namePlaceholder": "Ex: Le Gourmet Restaurant",
      "nameRequired": "Name must contain at least 3 characters"
    }
  }
}
```

#### 2. Utiliser dans les composants

**Avant (hardcodé):**
```jsx
<h2>Informations de base</h2>
<p>Commencez par les informations essentielles</p>
```

**Après (i18n):**
```jsx
import { useTranslation } from 'react-i18next';

const WizardStep1_Basic = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <h2>{t('wizard.step1.title')}</h2>
      <p>{t('wizard.step1.description')}</p>
      <label>{t('wizard.step1.nameLabel')}</label>
      <input placeholder={t('wizard.step1.namePlaceholder')} />
      {errors.name && <span>{t('wizard.step1.nameRequired')}</span>}
    </>
  );
};
```

---

## 📊 État actuel

### ✅ Composants déjà traduits:
- Header
- Footer
- BusinessDetails
- EditBusiness
- Home
- Search
- About
- LegalNotice
- PrivacyPolicy

### ❌ Composants NON traduits (créés récemment):
- **Wizard complet** (9 étapes)
- **ClaimBusinessModal**
- **BusinessPreview**
- **WizardNavigation**
- **WizardProgressBar**

---

## ⏱️ Estimation du travail

- **Création des fichiers JSON:** 2-3 heures
- **Modification des composants:** 4-5 heures
- **Tests en/fr:** 1 heure
- **Total:** ~8 heures de travail

---

## 🎯 Priorité

**MOYENNE** - Le site fonctionne en français actuellement. La traduction anglaise peut être faite progressivement.

### Options:
1. **Option 1 (recommandée):** Garder en français pour l'instant, traduire plus tard quand nécessaire
2. **Option 2:** Traduire seulement les composants les plus visibles (wizard)
3. **Option 3:** Traduire tout maintenant (8h de travail)

---

## 📝 Notes

- Le système i18n est déjà configuré dans le projet
- Les fichiers de traduction existants sont dans `/public/locales/[lang]/translation.json`
- Peut-être créer des fichiers séparés: `wizard.json`, `claim.json` pour mieux organiser

---

**Décision à prendre:** Voulez-vous traduire maintenant ou garder en français pour le moment?
