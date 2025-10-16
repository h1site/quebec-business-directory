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
```

Créez une table `businesses` contenant au minimum les colonnes suivantes :

- `id` (UUID, primary key)
- `name` (text)
- `description` (text)
- `phone` (text)
- `email` (text)
- `website` (text)
- `address` (text)
- `city` (text)
- `postal_code` (text)
- `categories` (text[])
- `products_services` (text)
- `owner_id` (uuid, référence utilisateur)
- `created_at` (timestamp)
- `location` (geography(Point, 4326)) pour la recherche par distance (optionnel)

Pour la recherche plein texte, ajoutez une colonne `search_vector` (tsvector) et un index correspondant :

```sql
alter table businesses add column if not exists search_vector tsvector;
create index if not exists businesses_search_vector_idx on businesses using gin(search_vector);
create or replace function businesses_search_vector_trigger()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(new.products_services, '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger update_business_search_vector
before insert or update on businesses
for each row execute procedure businesses_search_vector_trigger();
```

## Scripts

- `npm run dev` : démarre le serveur de développement Vite
- `npm run build` : construit la version de production
- `npm run preview` : prévisualise la build
- `npm run lint` : exécute ESLint sur `src/`

## Licence

MIT
