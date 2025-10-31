# Automatisation de la Régénération des Sitemaps

Ce document explique comment automatiser la régénération des sitemaps pour un site avec contenu dynamique.

## 📋 Solutions Disponibles

### 1. API Endpoint (On-Demand) ⚡ RECOMMANDÉ

**Fichier**: `api/regenerate-sitemaps.js`

**Utilisation**:
```javascript
// Dans n'importe quel composant après ajout d'entreprise
import { triggerSitemapRegenerationDelayed } from '../utils/sitemapTrigger';

const handleSubmit = async (formData) => {
  // 1. Sauvegarder l'entreprise
  await saveBusinessToDatabase(formData);

  // 2. Déclencher la régénération (avec délai de 1 minute)
  triggerSitemapRegenerationDelayed('business_added', 60000);
};
```

**Avantages**:
- ✅ Régénération immédiate après ajout de contenu
- ✅ Contrôle total sur quand régénérer
- ✅ Peut être appelé depuis l'interface admin
- ✅ Sécurisé avec clé secrète

**Configuration**:
```env
# .env
VITE_SITEMAP_REGENERATE_URL=/api/regenerate-sitemaps
VITE_SITEMAP_REGENERATE_SECRET=votre-cle-secrete-super-longue-123
SITEMAP_REGENERATE_SECRET=votre-cle-secrete-super-longue-123
```

---

### 2. GitHub Actions (Automatique Quotidien) 🤖

**Fichier**: `.github/workflows/regenerate-sitemaps.yml`

**Fonctionnalités**:
- ⏰ Régénération automatique chaque nuit à 3h (23h EST)
- 🔘 Déclenchement manuel via GitHub UI
- 📤 Commit et push automatique des nouveaux sitemaps
- 🔔 Notification à Google après régénération

**Comment déclencher manuellement**:
1. Aller sur GitHub → Actions
2. Sélectionner "Régénération Automatique des Sitemaps"
3. Cliquer sur "Run workflow"

**Avantages**:
- ✅ Zéro maintenance
- ✅ Régénération garantie chaque jour
- ✅ Gratuit avec GitHub
- ✅ Logs disponibles dans GitHub Actions

---

### 3. Supabase Database Trigger (Temps Réel) ⚡⚡

**Pour les plus avancés**: Créer un trigger Supabase qui appelle l'API après INSERT/UPDATE

```sql
-- Créer une fonction PostgreSQL
CREATE OR REPLACE FUNCTION notify_sitemap_regeneration()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler l'API de régénération
  PERFORM net.http_post(
    url := 'https://registreduquebec.com/api/regenerate-sitemaps',
    body := jsonb_build_object(
      'secret', 'votre-cle-secrete',
      'reason', 'database_trigger'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table businesses
CREATE TRIGGER sitemap_regeneration_trigger
AFTER INSERT OR UPDATE OR DELETE ON businesses
FOR EACH STATEMENT
EXECUTE FUNCTION notify_sitemap_regeneration();
```

**Avantages**:
- ✅ Temps réel absolu
- ✅ Aucun code front-end nécessaire
- ⚠️ Peut régénérer très souvent (utiliser un throttle)

---

## 🎯 Recommandation par Scénario

### Scénario 1: Site avec peu d'ajouts (< 10/jour)
**Solution**: GitHub Actions (quotidien)
- Simple et suffisant
- Zéro code à maintenir

### Scénario 2: Site avec ajouts modérés (10-100/jour)
**Solution**: API Endpoint avec délai
- Régénération groupée toutes les heures
- Appel depuis l'interface admin

### Scénario 3: Site avec nombreux ajouts (> 100/jour)
**Solution**: GitHub Actions (quotidien) + API Endpoint manuel
- Régénération quotidienne automatique
- Option manuelle si urgent

### Scénario 4: Site critique (besoin temps réel)
**Solution**: Supabase Trigger + Throttling
- Mise à jour immédiate
- Throttle pour éviter surcharge

---

## 📝 Exemple d'Intégration dans un Formulaire

```jsx
import { useState } from 'react';
import { triggerSitemapRegenerationDelayed } from '../utils/sitemapTrigger';
import { supabase } from '../lib/supabase';

export default function AddBusinessForm() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sauvegarder l'entreprise
      const { data, error } = await supabase
        .from('businesses')
        .insert([formData]);

      if (error) throw error;

      // 2. Déclencher régénération sitemap (dans 5 minutes)
      triggerSitemapRegenerationDelayed('business_added', 300000);

      alert('✅ Entreprise ajoutée! Le sitemap sera mis à jour dans 5 minutes.');

    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire */}
      <button type="submit" disabled={loading}>
        {loading ? 'Ajout en cours...' : 'Ajouter l\'entreprise'}
      </button>
    </form>
  );
}
```

---

## 🔧 Configuration Vercel (si hébergé sur Vercel)

Vercel régénère automatiquement le site à chaque push. Avec GitHub Actions, les sitemaps seront pushés automatiquement, déclenchant un nouveau build.

**Optimisation**: Désactiver le rebuild pour les commits de sitemap:

```javascript
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "github": {
    "enabled": true,
    "autoJobCancelation": true,
    "silent": true
  },
  "build": {
    "env": {
      "SKIP_REBUILD": "true"
    }
  }
}
```

Ou ignorer les commits avec `[skip ci]` (déjà configuré dans le workflow).

---

## 🚀 Démarrage Rapide

### Étape 1: Configurer les secrets
```bash
# Ajouter à .env
echo "SITEMAP_REGENERATE_SECRET=$(openssl rand -hex 32)" >> .env
```

### Étape 2: Configurer GitHub Secrets
1. GitHub → Settings → Secrets → New repository secret
2. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Étape 3: Tester l'API
```bash
curl -X POST http://localhost:3000/api/regenerate-sitemaps \
  -H "Content-Type: application/json" \
  -d '{"secret":"votre-cle-secrete"}'
```

### Étape 4: Activer GitHub Actions
- Le workflow s'exécutera automatiquement chaque nuit
- Ou déclenchement manuel via GitHub UI

---

## 📊 Monitoring

### Vérifier la dernière régénération
```bash
# Date du dernier sitemap généré
ls -lh public/sitemap.xml

# Nombre d'URLs dans le sitemap
grep -c "<loc>" public/sitemap.xml
```

### Notifier Google après régénération
```bash
# Automatique dans GitHub Actions, ou manuel:
curl "https://www.google.com/ping?sitemap=https://registreduquebec.com/sitemap.xml"
```

---

## ❓ FAQ

**Q: Combien de temps prend la régénération?**
R: ~3-5 minutes pour 480k entreprises

**Q: Puis-je régénérer trop souvent?**
R: Oui. Google recommande max 1x par jour pour les gros sites. Utilisez le délai.

**Q: Le site sera-t-il down pendant la régénération?**
R: Non, les anciens sitemaps restent disponibles pendant la génération.

**Q: Que se passe-t-il si la régénération échoue?**
R: Les anciens sitemaps restent en place. Vérifiez les logs GitHub Actions.

---

## 🔗 Liens Utiles

- [Documentation Google Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Hooks](https://vercel.com/docs/concepts/git/deploy-hooks)
