# Répertoire d'entreprises du Québec

Application React bilingue inspirée des Pages Jaunes pour découvrir des entreprises locales, gérée par Supabase pour l'authentification et les données.

## Fonctionnalités

- Interface d'accueil bilingue (français par défaut, bascule anglais/français)
- Recherche rapide par mots-clés et ville dès l'accueil
- Page de résultats avec filtres (ville, téléphone, catégorie, distance)
- Composants de cartes pour afficher les entreprises
- Authentification Supabase (inscription et connexion)
- Tableau de bord pour soumettre une nouvelle fiche d'entreprise
- Données d'exemple locales lorsque Supabase n'est pas configuré

## Démarrage

```bash
npm install
npm run dev
```

L'application s'exécute sur [http://localhost:5173](http://localhost:5173).

## Configuration Supabase

Copiez `.env.example` vers `.env` et indiquez vos clés Supabase :

```bash
VITE_SUPABASE_URL=VotreURLSupabase
VITE_SUPABASE_ANON_KEY=VotreClefAnonyme
GOOGLE_PLACES_API_KEY=VotreClefGooglePlacesAPI
```

## Configuration pour Vercel (Production)

Pour déployer sur Vercel avec la fonctionnalité d'importation Google My Business :

1. **Variables d'environnement à configurer dans Vercel** :
   - Allez dans Project Settings → Environment Variables
   - Ajoutez les variables suivantes :
     - `VITE_SUPABASE_URL` : URL de votre projet Supabase
     - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase
     - `GOOGLE_PLACES_API_KEY` : Votre clé API Google Places

2. **API Serverless** :
   - L'API Google Places est déjà configurée dans `/api/google-places.js`
   - Vercel détecte automatiquement les fonctions serverless dans le dossier `/api`
   - Aucune configuration supplémentaire n'est nécessaire

3. **Important** :
   - Ne jamais commiter le fichier `.env` dans Git
   - Toutes les variables d'environnement doivent être configurées dans l'interface Vercel

### Provisionner le schéma complet

Le dépôt inclut un script SQL clé en main (`supabase/schema.sql`) qui installe l’ensemble des tables, vues, index et déclencheurs nécessaires (catégories principales/sous-catégories, filtres transversaux, médias, horaires, SEO, etc.).

1. Ouvrez le **SQL Editor** de Supabase (ou utilisez le CLI `supabase db remote commit`).
2. Copiez le contenu de `supabase/schema.sql`, puis exécutez-le tel quel.
3. Le script est idempotent : vous pouvez le relancer pour mettre à jour les descriptions ou compléter le référencement sans perdre les données existantes.

Le schéma provisionne notamment :

- `main_categories` & `sub_categories` : taxonomie hiérarchique des secteurs et sous-secteurs (en français et en anglais).
- `businesses` : fiche principale de chaque entreprise, incluant slug SEO, coordonnées, aire de service, mots-clés, notes internes et champs de mission/valeurs.
- `business_categories` : liaison entre une entreprise et ses sous-catégories, avec prise en charge d’une catégorie primaire.
- Tables de référence (`lookup_*`) pour les filtres transversaux (taille de l’entreprise, langues de service, modes de service, certifications, accessibilité, moyens de paiement) et leurs tables de liaison (`business_*`).
- Tables d’enrichissement (`business_hours`, `business_special_hours`, `business_media`, `business_social_links`, `business_promotions`, `business_reviews`, `business_tags`).
- Une vue `businesses_enriched` agrégeant la catégorie primaire et les filtres associés, pratique pour alimenter le frontend.
- Index de recherche (plein texte, trigrammes, GIST) et triggers pour synchroniser le champ `categories` attendu par le frontend ainsi que le vecteur de recherche en français.

> **Remarque :** le script n’active pas de politiques de sécurité (RLS). Ajoutez vos règles en fonction de vos besoins d’authentification Supabase.

## Scripts

- `npm run dev` : démarre le serveur de développement Vite
- `npm run build` : construit la version de production
- `npm run preview` : prévisualise la build
- `npm run lint` : exécute ESLint sur `src/`

## Publier le projet sur GitHub

1. [Créez un dépôt vide sur GitHub](https://github.com/new) (sans README/LICENCE auto-générés).
2. Initialisez Git en local si ce n'est pas déjà fait :

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Ajoutez GitHub comme dépôt distant (remplacez `<votre-utilisateur>` et `<nom-du-depot>`).

   ```bash
   git remote add origin https://github.com/<votre-utilisateur>/<nom-du-depot>.git
   ```

4. Envoyez vos fichiers :

   ```bash
   git push -u origin main
   ```

   Si votre branche locale se nomme différemment (par exemple `master` ou `work`), adaptez la commande :

   ```bash
   git push -u origin <nom-de-la-branche>
   ```

5. (Optionnel) Activez GitHub Pages pour un hébergement statique en construisant d'abord l'application, puis en publiant le dossier `dist` avec un workflow CI/CD ou un outil comme [GitHub Pages Deploy Action](https://github.com/JamesIves/github-pages-deploy-action).

## Licence

MIT
