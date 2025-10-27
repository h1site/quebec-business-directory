# 📊 Système de Statistiques et Analytics

Ce document décrit le système complet de statistiques et analytics pour le Registre d'Entreprises du Québec.

## 🎯 Fonctionnalités

### 1. Tracking des événements
- ✅ **Vues de fiches d'entreprises** - Enregistre chaque consultation d'une fiche
- ✅ **Clics sur sites web** - Track les clics sortants vers les sites des entreprises
- ✅ **Origine du trafic** - Détecte le referrer (d'où vient le visiteur)
- ✅ **Informations techniques** - User-agent, IP, géolocalisation

### 2. Exclusion des IPs admin
- ✅ **Enregistrement automatique** - L'IP de l'admin est enregistrée au login
- ✅ **Exclusion automatique** - Les vues/clics des admins ne comptent pas dans les stats
- ✅ **Multi-IP** - Supporte plusieurs IPs par admin (bureau, maison, mobile, etc.)

### 3. Dashboard Admin
- ✅ **Vue d'ensemble** - Statistiques globales en un coup d'œil
- ✅ **Top fiches** - Les 10 fiches les plus consultées
- ✅ **Top clics** - Les 10 sites web les plus cliqués
- ✅ **Répartition géographique** - Top 20 villes les plus actives
- ✅ **Répartition par catégories** - Distribution des entreprises par secteur

### 4. Performance
- ✅ **Cache des stats** - Table `business_stats` pour accès ultra-rapide
- ✅ **Stats agrégées** - Table `daily_stats` pour historique optimisé
- ✅ **Indexes optimisés** - Requêtes rapides même avec des millions de lignes

## 📦 Architecture

### Tables de base de données

```sql
-- IPs admin à exclure
admin_ips (id, user_id, ip_address, created_at, updated_at)

-- Événements de vues (données brutes)
business_views (id, business_id, ip_address, user_agent, referrer, viewed_at)

-- Événements de clics (données brutes)
website_clicks (id, business_id, website_url, ip_address, user_agent, referrer, clicked_at)

-- Stats agrégées par jour (performance)
daily_stats (id, date, total_views, total_clicks, unique_visitors, new_businesses, claimed_businesses)

-- Stats par entreprise (cache)
business_stats (business_id, total_views, total_clicks, last_viewed_at, last_clicked_at, views_this_month, clicks_this_month)
```

### Fonctions PostgreSQL

#### `record_business_view(business_id, ip_address, user_agent, referrer)`
Enregistre une vue sur une fiche d'entreprise.
- Vérifie si l'IP est une IP admin (exclusion automatique)
- Insère dans `business_views`
- Met à jour `business_stats` en temps réel

#### `record_website_click(business_id, website_url, ip_address, user_agent, referrer)`
Enregistre un clic sur un site web externe.
- Vérifie si l'IP est une IP admin (exclusion automatique)
- Insère dans `website_clicks`
- Met à jour `business_stats` en temps réel

#### `is_admin_ip(ip_address)`
Vérifie si une IP appartient à un admin.

#### `reset_monthly_stats()`
Réinitialise les compteurs mensuels (à exécuter le 1er de chaque mois via cron).

## 🚀 Installation

### 1. Exécuter la migration SQL

```bash
# Dans Supabase SQL Editor ou via CLI
psql -h <supabase-host> -d postgres -f supabase/migrations/20250127_create_analytics_tables.sql
```

### 2. Vérifier les permissions RLS

Les tables sont protégées par Row Level Security (RLS):
- Seuls les admins peuvent voir les statistiques
- Les fonctions PostgreSQL gèrent l'insertion des événements

### 3. Ajouter la route dans App.jsx

```jsx
import AdminStats from './pages/Admin/AdminStats';

// Dans les routes
<Route path="/admin/stats" element={<AdminStats />} />
```

## 💻 Utilisation

### 1. Tracker une vue de fiche

```jsx
import { useTrackBusinessView } from '../hooks/useAnalytics';

const BusinessDetails = () => {
  const { business } = useBusinessData();

  // Track automatiquement après 2 secondes (évite les bounces)
  useTrackBusinessView(business?.id);

  return <div>...</div>;
};
```

### 2. Tracker un clic sur site web

```jsx
import { useTrackWebsiteClick } from '../hooks/useAnalytics';

const WebsiteButton = ({ business }) => {
  const trackClick = useTrackWebsiteClick(business.id);

  const handleClick = () => {
    trackClick(business.website);
    // Puis rediriger
    window.open(business.website, '_blank');
  };

  return <button onClick={handleClick}>Visiter le site</button>;
};
```

### 3. Enregistrer l'IP d'un admin

```jsx
import { registerAdminIP } from '../services/analyticsService';

// Au login de l'admin
useEffect(() => {
  if (user && user.role === 'admin') {
    registerAdminIP(user.id);
  }
}, [user]);
```

### 4. Afficher les statistiques

```jsx
import { getGlobalStats, getCategoryStats } from '../services/analyticsService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getGlobalStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div>
      <h2>Total: {stats?.totalBusinesses}</h2>
      <h3>Vues: {stats?.totalViews}</h3>
    </div>
  );
};
```

## 📈 Dashboard Admin

Accéder au dashboard: `/admin/stats`

### Sections disponibles:

1. **📊 Vue d'ensemble**
   - Total entreprises
   - Entreprises revendiquées vs non revendiquées
   - Vues et clics totaux

2. **🔥 Top 10 - Fiches les plus consultées**
   - Classement des fiches par nombre de vues
   - Nom, ville, total de vues

3. **🌐 Top 10 - Sites web les plus cliqués**
   - Classement des backlinks par nombre de clics
   - Preuve de la valeur du backlink gratuit

4. **🏷️ Répartition par catégories**
   - Distribution des entreprises par secteur d'activité
   - Top 12 catégories

5. **🏙️ Top 20 - Villes les plus actives**
   - Classement géographique
   - Heatmap visuelle des régions

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables analytics sont protégées:

```sql
-- Seuls les admins peuvent voir les stats
CREATE POLICY "Admins can view business_views" ON business_views
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### Exclusion des IPs admin

```sql
-- Vérifie automatiquement dans les fonctions
IF is_admin_ip(p_ip_address) THEN
  RETURN; -- Ne pas enregistrer
END IF;
```

## 🎨 Fonctionnalités futures

### Phase 2 - Graphiques avancés
- [ ] Line charts pour l'évolution temporelle
- [ ] Bar charts pour les catégories
- [ ] Pie charts pour claimed vs unclaimed
- [ ] Intégration de Chart.js ou Recharts

### Phase 3 - Analytics avancés
- [ ] Heatmap géographique interactive (Mapbox/Leaflet)
- [ ] Taux de conversion (vues → clics)
- [ ] Temps passé sur les fiches
- [ ] Taux de rebond
- [ ] Parcours utilisateur

### Phase 4 - Rapports
- [ ] Export PDF des statistiques
- [ ] Rapports mensuels automatiques par email
- [ ] Comparaisons période sur période
- [ ] Prévisions et tendances (ML)

### Phase 5 - API publique
- [ ] API pour que les entreprises voient leurs propres stats
- [ ] Widget embeddable pour afficher les stats sur leur site
- [ ] Badges "Top entreprise" automatiques

## 🛠️ Maintenance

### Tâches mensuelles

```sql
-- Réinitialiser les compteurs mensuels (1er du mois)
SELECT reset_monthly_stats();
```

### Archivage (optionnel)

Pour de meilleures performances à long terme:

```sql
-- Archiver les vues de plus de 6 mois
INSERT INTO business_views_archive
SELECT * FROM business_views
WHERE viewed_at < NOW() - INTERVAL '6 months';

DELETE FROM business_views
WHERE viewed_at < NOW() - INTERVAL '6 months';
```

### Nettoyage des IPs admin inactives

```sql
-- Supprimer les IPs d'admins qui n'existent plus
DELETE FROM admin_ips
WHERE user_id NOT IN (SELECT id FROM auth.users);
```

## 📊 Métriques clés (KPIs)

### Pour le business
- **Taux de réclamation** = Claimed / Total × 100
- **Taux de complétion** = Fiches complètes / Total × 100
- **Taux d'engagement** = Clics / Vues × 100
- **Croissance** = Nouvelles entreprises ce mois / Total × 100

### Pour le SEO
- **Trafic organique** = Vues avec referrer Google
- **Valeur du backlink** = Nombre de clics sortants
- **Top sources** = Referrers les plus fréquents
- **Taux de conversion** = Utilisateurs qui cliquent

## 🐛 Troubleshooting

### Les stats ne s'enregistrent pas

1. Vérifier que la migration SQL a été exécutée
2. Vérifier les permissions RLS dans Supabase
3. Vérifier que l'IP publique est accessible (api.ipify.org)
4. Vérifier les logs de la console du navigateur

### Mon IP admin n'est pas exclue

1. Vérifier que `registerAdminIP()` a été appelé au login
2. Vérifier dans la table `admin_ips` que l'IP est enregistrée
3. Vider le cache du navigateur et réessayer

### Performances lentes

1. Vérifier que les indexes sont créés
2. Utiliser les stats agrégées (`business_stats`, `daily_stats`)
3. Limiter les requêtes à des périodes courtes
4. Archiver les anciennes données

## 📚 Resources

- [Supabase Analytics Guide](https://supabase.com/docs/guides/analytics)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Recharts Documentation](https://recharts.org/)

## 👨‍💻 Support

Pour toute question ou problème:
- Consulter la documentation Supabase
- Vérifier les logs PostgreSQL
- Contacter l'équipe de développement

---

**Dernière mise à jour**: 27 janvier 2025
**Version**: 1.0.0
**Auteur**: Claude Code + Sébastien Ross
