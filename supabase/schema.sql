-- Quebec Business Directory - Supabase schema
-- Run this script in the Supabase SQL editor (or via the CLI) to provision the data model.
-- The script enables required extensions, creates lookup and domain tables, and seeds the
-- category taxonomy and filter values that the application expects.

-- Enable extensions used by the project -------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "postgis";

-- Helper trigger to keep updated_at columns in sync -------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Primary taxonomy tables ---------------------------------------------------
create table if not exists public.main_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_main_categories
before update on public.main_categories
for each row execute function public.handle_updated_at();

create table if not exists public.sub_categories (
  id uuid primary key default gen_random_uuid(),
  main_category_id uuid not null references public.main_categories(id) on delete cascade,
  slug text not null,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (main_category_id, slug),
  unique (main_category_id, label_fr)
);

create trigger set_updated_at_sub_categories
before update on public.sub_categories
for each row execute function public.handle_updated_at();

-- Lookup tables for transversal filters -------------------------------------
create table if not exists public.lookup_business_sizes (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_business_sizes
before update on public.lookup_business_sizes
for each row execute function public.handle_updated_at();

create table if not exists public.lookup_service_languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_service_languages
before update on public.lookup_service_languages
for each row execute function public.handle_updated_at();

create table if not exists public.lookup_service_modes (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_service_modes
before update on public.lookup_service_modes
for each row execute function public.handle_updated_at();

create table if not exists public.lookup_certifications (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_certifications
before update on public.lookup_certifications
for each row execute function public.handle_updated_at();

create table if not exists public.lookup_accessibility_features (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_accessibility_features
before update on public.lookup_accessibility_features
for each row execute function public.handle_updated_at();

create table if not exists public.lookup_payment_methods (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_fr text not null,
  label_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_payment_methods
before update on public.lookup_payment_methods
for each row execute function public.handle_updated_at();

-- Core business table -------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  mission_statement text,
  core_values text,
  phone text,
  email text,
  website text,
  address text,
  address_line2 text,
  city text,
  region text,
  province text not null default 'QC',
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  location geography(Point, 4326),
  products_services text,
  business_size_id uuid references public.lookup_business_sizes(id) on delete set null,
  established_year smallint,
  is_franchise boolean not null default false,
  slug text not null unique,
  seo_keywords text[] not null default '{}',
  seo_secondary_keywords text[] not null default '{}',
  seo_tags text[] not null default '{}',
  service_area text,
  service_radius_km numeric(6,2),
  rating_average numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  categories text[] not null default '{}',
  notes_internal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector
);

create index if not exists businesses_owner_idx on public.businesses (owner_id);
create index if not exists businesses_slug_idx on public.businesses (slug);
create index if not exists businesses_city_idx on public.businesses (lower(city));
create index if not exists businesses_region_idx on public.businesses (lower(region));
create index if not exists businesses_province_idx on public.businesses (province);
create index if not exists businesses_categories_idx on public.businesses using gin (categories);
create index if not exists businesses_seo_tags_idx on public.businesses using gin (seo_tags);
create index if not exists businesses_search_vector_idx on public.businesses using gin (search_vector);
create index if not exists businesses_location_idx on public.businesses using gist (location);
create index if not exists businesses_rating_idx on public.businesses (rating_average desc);

create trigger set_updated_at_businesses
before update on public.businesses
for each row execute function public.handle_updated_at();

-- Relationship tables -------------------------------------------------------
create table if not exists public.business_categories (
  business_id uuid not null references public.businesses(id) on delete cascade,
  sub_category_id uuid not null references public.sub_categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (business_id, sub_category_id)
);

create unique index if not exists business_categories_primary_idx
on public.business_categories (business_id)
where is_primary;

create index if not exists business_categories_subcategory_idx
on public.business_categories (sub_category_id);

create table if not exists public.business_languages (
  business_id uuid not null references public.businesses(id) on delete cascade,
  language_id uuid not null references public.lookup_service_languages(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, language_id)
);

create table if not exists public.business_service_modes (
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_mode_id uuid not null references public.lookup_service_modes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, service_mode_id)
);

create table if not exists public.business_certifications (
  business_id uuid not null references public.businesses(id) on delete cascade,
  certification_id uuid not null references public.lookup_certifications(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, certification_id)
);

create table if not exists public.business_accessibility_features (
  business_id uuid not null references public.businesses(id) on delete cascade,
  accessibility_feature_id uuid not null references public.lookup_accessibility_features(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, accessibility_feature_id)
);

create table if not exists public.business_payment_methods (
  business_id uuid not null references public.businesses(id) on delete cascade,
  payment_method_id uuid not null references public.lookup_payment_methods(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, payment_method_id)
);

create table if not exists public.business_tags (
  business_id uuid not null references public.businesses(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  primary key (business_id, tag)
);

create index if not exists business_tags_search_idx
on public.business_tags using gin (lower(tag) gin_trgm_ops);

create unique index if not exists business_tags_unique_lower_idx
on public.business_tags (business_id, lower(tag));

-- Content enrichment tables -------------------------------------------------
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  is_24h boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, day_of_week),
  check (
    (is_closed and opens_at is null and closes_at is null)
    or
    (is_24h and opens_at is null and closes_at is null)
    or
    (not is_closed and not is_24h and opens_at is not null and closes_at is not null)
  )
);

create trigger set_updated_at_business_hours
before update on public.business_hours
for each row execute function public.handle_updated_at();

create table if not exists public.business_special_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  special_date date not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, special_date)
);

create trigger set_updated_at_business_special_hours
before update on public.business_special_hours
for each row execute function public.handle_updated_at();

create table if not exists public.business_media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_media_business_idx on public.business_media (business_id);
create index if not exists business_media_type_idx on public.business_media (media_type);
create index if not exists business_media_position_idx on public.business_media (business_id, position);

create trigger set_updated_at_business_media
before update on public.business_media
for each row execute function public.handle_updated_at();

create table if not exists public.business_social_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  platform text not null,
  url text not null,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at_business_social_links
before update on public.business_social_links
for each row execute function public.handle_updated_at();

create unique index if not exists business_social_links_unique_lower_idx
on public.business_social_links (business_id, lower(platform));

create table if not exists public.business_promotions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  starts_at date,
  ends_at date,
  url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index if not exists business_promotions_business_idx on public.business_promotions (business_id);
create index if not exists business_promotions_active_idx on public.business_promotions (is_active);
create index if not exists business_promotions_dates_idx on public.business_promotions (starts_at, ends_at);

create trigger set_updated_at_business_promotions
before update on public.business_promotions
for each row execute function public.handle_updated_at();

create table if not exists public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  source text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_reviews_business_idx on public.business_reviews (business_id);
create index if not exists business_reviews_rating_idx on public.business_reviews (rating);
create index if not exists business_reviews_published_idx on public.business_reviews (is_published);

create trigger set_updated_at_business_reviews
before update on public.business_reviews
for each row execute function public.handle_updated_at();

-- Search helpers ------------------------------------------------------------
create or replace function public.businesses_search_vector_trigger()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(new.categories, ' '), '')), 'B') ||
    setweight(to_tsvector('french', coalesce(new.products_services, '')), 'C') ||
    setweight(to_tsvector('french', coalesce(array_to_string(new.seo_keywords, ' '), '')), 'D') ||
    setweight(to_tsvector('french', coalesce(array_to_string(new.seo_tags, ' '), '')), 'D');
  return new;
end;
$$ language plpgsql;

create trigger businesses_search_vector_update
before insert or update on public.businesses
for each row execute function public.businesses_search_vector_trigger();

-- Synchronise legacy categories array ---------------------------------------
create or replace function public.refresh_business_categories(p_business_id uuid)
returns void as $$
begin
  update public.businesses b
  set categories = coalesce(
    (
      select array_agg(distinct sc.label_fr order by sc.label_fr)
      from public.business_categories bc
      join public.sub_categories sc on sc.id = bc.sub_category_id
      where bc.business_id = p_business_id
    ),
    '{}'
  )
  where b.id = p_business_id;
end;
$$ language plpgsql;

create or replace function public.business_categories_sync_trigger()
returns trigger as $$
declare
  v_business_id uuid;
begin
  v_business_id := coalesce(new.business_id, old.business_id);
  perform public.refresh_business_categories(v_business_id);
  return null;
end;
$$ language plpgsql;

create trigger business_categories_sync
after insert or update or delete on public.business_categories
for each row execute function public.business_categories_sync_trigger();

-- Seed data -----------------------------------------------------------------
insert into public.main_categories (slug, label_fr, label_en, description_fr, description_en)
values
  ('commerce-de-detail', 'Commerce de détail', 'Retail', 'Entreprises vendant des biens directement aux consommateurs.', 'Businesses selling goods directly to consumers.'),
  ('services-professionnels', 'Services professionnels', 'Professional Services', 'Spécialistes offrant des services-conseils ou techniques.', 'Consultative or technical specialist services.'),
  ('sante-et-bien-etre', 'Santé et bien-être', 'Health & Wellness', 'Soins de santé et services de bien-être.', 'Health care and wellness services.'),
  ('restauration-et-alimentation', 'Restauration et alimentation', 'Food & Beverage', 'Restaurants, cafés et entreprises alimentaires.', 'Restaurants, cafés, and food businesses.'),
  ('tourisme-et-hebergement', 'Tourisme et hébergement', 'Tourism & Lodging', 'Hébergement et services liés au tourisme.', 'Lodging and tourism services.'),
  ('construction-et-renovation', 'Construction et rénovation', 'Construction & Renovation', 'Entrepreneurs et métiers de la construction.', 'Construction trades and contractors.'),
  ('immobilier', 'Immobilier', 'Real Estate', 'Services liés à l''achat, la vente et la gestion immobilière.', 'Property buying, selling, and management services.'),
  ('automobile-et-transport', 'Automobile et transport', 'Automotive & Transportation', 'Vente, réparation et services de transport.', 'Vehicle sales, repair, and transportation services.'),
  ('technologie-et-informatique', 'Technologie et informatique', 'Technology & IT', 'Solutions numériques et technologiques.', 'Digital and technology solutions.'),
  ('arts-medias-et-divertissement', 'Arts, médias et divertissement', 'Arts, Media & Entertainment', 'Création artistique, médias et événements culturels.', 'Creative industries, media, and cultural events.'),
  ('education-et-formation', 'Éducation et formation', 'Education & Training', 'Organismes de formation et d''apprentissage.', 'Organisations providing instruction and training.'),
  ('organismes-publics-et-communautaires', 'Organismes publics et communautaires', 'Public & Community Organisations', 'Services gouvernementaux et communautaires.', 'Governmental and community services.'),
  ('finance-assurance-et-juridique', 'Finance, assurance et juridique', 'Finance, Insurance & Legal', 'Services financiers, assurances et cabinets juridiques.', 'Financial, insurance, and legal services.'),
  ('industrie-fabrication-et-logistique', 'Industrie, fabrication et logistique', 'Industry, Manufacturing & Logistics', 'Production, entreposage et logistique.', 'Production, warehousing, and logistics.'),
  ('agriculture-et-environnement', 'Agriculture et environnement', 'Agriculture & Environment', 'Agriculture, horticulture et services environnementaux.', 'Agriculture, horticulture, and environmental services.')
on conflict (slug) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    updated_at = now();

-- Sub-categories seeds (in French and English)
with mc as (
  select slug, id from public.main_categories
)
insert into public.sub_categories (main_category_id, slug, label_fr, label_en, description_fr, description_en)
select mc.id, sub.slug, sub.label_fr, sub.label_en, sub.description_fr, sub.description_en
from mc
join (
  values
    ('commerce-de-detail', 'boutiques-de-vetements', 'Boutiques de vêtements', 'Clothing Boutiques', null, null),
    ('commerce-de-detail', 'bijouteries', 'Bijouteries', 'Jewellery Stores', null, null),
    ('commerce-de-detail', 'librairies', 'Librairies', 'Bookstores', null, null),
    ('commerce-de-detail', 'magasins-electronique', 'Magasins d’électronique', 'Electronics Stores', null, null),
    ('commerce-de-detail', 'animaleries', 'Animaleries', 'Pet Shops', null, null),
    ('commerce-de-detail', 'magasins-de-sport', 'Magasins de sport', 'Sporting Goods Stores', null, null),
    ('services-professionnels', 'comptables', 'Comptables', 'Accountants', null, null),
    ('services-professionnels', 'avocats', 'Avocats', 'Lawyers', null, null),
    ('services-professionnels', 'consultants', 'Consultants', 'Consultants', null, null),
    ('services-professionnels', 'agences-marketing', 'Agences marketing', 'Marketing Agencies', null, null),
    ('services-professionnels', 'architectes', 'Architectes', 'Architects', null, null),
    ('services-professionnels', 'ressources-humaines', 'Ressources humaines', 'Human Resources', null, null),
    ('sante-et-bien-etre', 'cliniques-medicales', 'Cliniques médicales', 'Medical Clinics', null, null),
    ('sante-et-bien-etre', 'dentistes', 'Dentistes', 'Dentists', null, null),
    ('sante-et-bien-etre', 'massotherapeutes', 'Massothérapeutes', 'Massage Therapists', null, null),
    ('sante-et-bien-etre', 'psychologues', 'Psychologues', 'Psychologists', null, null),
    ('sante-et-bien-etre', 'salles-de-sport', 'Salles de sport', 'Gyms & Fitness Centres', null, null),
    ('sante-et-bien-etre', 'spas', 'Spas', 'Spas & Wellness Centres', null, null),
    ('restauration-et-alimentation', 'restaurants', 'Restaurants', 'Restaurants', null, null),
    ('restauration-et-alimentation', 'cafes', 'Cafés', 'Cafés', null, null),
    ('restauration-et-alimentation', 'bars', 'Bars', 'Bars & Pubs', null, null),
    ('restauration-et-alimentation', 'traiteurs', 'Traiteurs', 'Catering Services', null, null),
    ('restauration-et-alimentation', 'boulangeries', 'Boulangeries', 'Bakeries', null, null),
    ('restauration-et-alimentation', 'food-trucks', 'Food trucks', 'Food Trucks', null, null),
    ('tourisme-et-hebergement', 'hotels', 'Hôtels', 'Hotels', null, null),
    ('tourisme-et-hebergement', 'auberges', 'Auberges', 'Inns & B&Bs', null, null),
    ('tourisme-et-hebergement', 'gites', 'Gîtes touristiques', 'Guest Houses', null, null),
    ('tourisme-et-hebergement', 'centres-de-villegiature', 'Centres de villégiature', 'Resorts & Retreats', null, null),
    ('tourisme-et-hebergement', 'agences-de-voyage', 'Agences de voyage', 'Travel Agencies', null, null),
    ('tourisme-et-hebergement', 'attractions-touristiques', 'Attractions touristiques', 'Tourist Attractions', null, null),
    ('construction-et-renovation', 'entrepreneurs-generaux', 'Entrepreneurs généraux', 'General Contractors', null, null),
    ('construction-et-renovation', 'electriciens', 'Électriciens', 'Electricians', null, null),
    ('construction-et-renovation', 'plombiers', 'Plombiers', 'Plumbers', null, null),
    ('construction-et-renovation', 'couvreurs', 'Couvreurs', 'Roofers', null, null),
    ('construction-et-renovation', 'peintres', 'Peintres', 'Painters', null, null),
    ('construction-et-renovation', 'paysagistes', 'Paysagistes', 'Landscapers', null, null),
    ('immobilier', 'courtiers-immobiliers', 'Courtiers immobiliers', 'Real Estate Brokers', null, null),
    ('immobilier', 'gestion-immobiliere', 'Gestion immobilière', 'Property Management', null, null),
    ('immobilier', 'inspecteurs-batiment', 'Inspecteurs en bâtiment', 'Building Inspectors', null, null),
    ('immobilier', 'promoteurs-immobiliers', 'Promoteurs immobiliers', 'Real Estate Developers', null, null),
    ('immobilier', 'evaluation-immobiliere', 'Services d''évaluation', 'Appraisal Services', null, null),
    ('immobilier', 'homestaging', 'Home staging', 'Home Staging', null, null),
    ('automobile-et-transport', 'concessionnaires-auto', 'Concessionnaires automobiles', 'Car Dealerships', null, null),
    ('automobile-et-transport', 'garages', 'Garages & ateliers mécaniques', 'Auto Repair Shops', null, null),
    ('automobile-et-transport', 'location-vehicules', 'Location de véhicules', 'Vehicle Rental', null, null),
    ('automobile-et-transport', 'transport-routier', 'Transport routier', 'Transportation & Logistics', null, null),
    ('automobile-et-transport', 'pieces-auto', 'Pièces automobiles', 'Auto Parts Stores', null, null),
    ('automobile-et-transport', 'ecoles-de-conduite', 'Écoles de conduite', 'Driving Schools', null, null),
    ('technologie-et-informatique', 'developpement-logiciel', 'Développement logiciel', 'Software Development', null, null),
    ('technologie-et-informatique', 'services-ti-geres', 'Services TI gérés', 'Managed IT Services', null, null),
    ('technologie-et-informatique', 'cybersecurite', 'Cybersécurité', 'Cybersecurity', null, null),
    ('technologie-et-informatique', 'materiel-informatique', 'Vente de matériel informatique', 'IT Hardware Retailers', null, null),
    ('technologie-et-informatique', 'startups-saas', 'Startups SaaS', 'SaaS Startups', null, null),
    ('technologie-et-informatique', 'consultants-numeriques', 'Consultants en transformation numérique', 'Digital Transformation Consultants', null, null),
    ('arts-medias-et-divertissement', 'studios-design', 'Studios de design', 'Design Studios', null, null),
    ('arts-medias-et-divertissement', 'agences-evenementielles', 'Agences événementielles', 'Event Agencies', null, null),
    ('arts-medias-et-divertissement', 'studios-enregistrement', 'Studios d''enregistrement', 'Recording Studios', null, null),
    ('arts-medias-et-divertissement', 'galeries-art', 'Galeries d''art', 'Art Galleries', null, null),
    ('arts-medias-et-divertissement', 'compagnies-theatre', 'Compagnies de théâtre', 'Theatre Companies', null, null),
    ('arts-medias-et-divertissement', 'production-video', 'Production vidéo', 'Video Production', null, null),
    ('education-et-formation', 'ecoles-privees', 'Écoles privées', 'Private Schools', null, null),
    ('education-et-formation', 'centres-formation-professionnelle', 'Centres de formation professionnelle', 'Vocational Training Centres', null, null),
    ('education-et-formation', 'tutorat', 'Services de tutorat', 'Tutoring Services', null, null),
    ('education-et-formation', 'formation-continue', 'Formation continue', 'Continuing Education', null, null),
    ('education-et-formation', 'services-educatifs-specialises', 'Services éducatifs spécialisés', 'Specialised Educational Services', null, null),
    ('education-et-formation', 'garderies', 'Garderies & CPE', 'Daycare & Early Childhood Centres', null, null),
    ('organismes-publics-et-communautaires', 'municipalites', 'Municipalités', 'Municipal Services', null, null),
    ('organismes-publics-et-communautaires', 'organismes-sans-but-lucratif', 'Organismes sans but lucratif', 'Non-profit Organisations', null, null),
    ('organismes-publics-et-communautaires', 'centres-communautaires', 'Centres communautaires', 'Community Centres', null, null),
    ('organismes-publics-et-communautaires', 'services-sociaux', 'Services sociaux', 'Social Services', null, null),
    ('organismes-publics-et-communautaires', 'cooperatives', 'Coopératives', 'Cooperatives', null, null),
    ('organismes-publics-et-communautaires', 'bibliotheques', 'Bibliothèques', 'Libraries', null, null),
    ('finance-assurance-et-juridique', 'institutions-financieres', 'Institutions financières', 'Financial Institutions', null, null),
    ('finance-assurance-et-juridique', 'courtiers-assurance', 'Courtiers en assurances', 'Insurance Brokers', null, null),
    ('finance-assurance-et-juridique', 'planificateurs-financiers', 'Planificateurs financiers', 'Financial Planners', null, null),
    ('finance-assurance-et-juridique', 'cabinets-juridiques', 'Cabinets juridiques', 'Law Firms', null, null),
    ('finance-assurance-et-juridique', 'services-paie', 'Services de paie', 'Payroll Services', null, null),
    ('finance-assurance-et-juridique', 'notaires', 'Notaires', 'Notaries', null, null),
    ('industrie-fabrication-et-logistique', 'usines-manufacturieres', 'Usines manufacturières', 'Manufacturing Plants', null, null),
    ('industrie-fabrication-et-logistique', 'entreposage', 'Entreposage & distribution', 'Warehousing & Distribution', null, null),
    ('industrie-fabrication-et-logistique', 'services-logistiques', 'Services logistiques', 'Logistics Services', null, null),
    ('industrie-fabrication-et-logistique', 'fournisseurs-industriels', 'Fournisseurs industriels', 'Industrial Suppliers', null, null),
    ('industrie-fabrication-et-logistique', 'fabrication-alimentaire', 'Fabrication alimentaire', 'Food Manufacturing', null, null),
    ('industrie-fabrication-et-logistique', 'imprimeries', 'Imprimeries', 'Printing Houses', null, null),
    ('agriculture-et-environnement', 'fermes', 'Fermes & producteurs locaux', 'Farms & Local Producers', null, null),
    ('agriculture-et-environnement', 'producteurs-bio', 'Producteurs biologiques', 'Organic Producers', null, null),
    ('agriculture-et-environnement', 'amenagement-forestier', 'Services d''aménagement forestier', 'Forestry Services', null, null),
    ('agriculture-et-environnement', 'gestion-dechets', 'Gestion des déchets & recyclage', 'Waste Management & Recycling', null, null),
    ('agriculture-et-environnement', 'entreprises-horticoles', 'Entreprises horticoles', 'Horticultural Services', null, null),
    ('agriculture-et-environnement', 'technologies-vertes', 'Technologies vertes', 'Green Technologies', null, null)
) as sub(category_slug, slug, label_fr, label_en, description_fr, description_en)
  on mc.slug = sub.category_slug
on conflict (main_category_id, slug) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    updated_at = now();

-- Lookup seed values --------------------------------------------------------
insert into public.lookup_business_sizes (key, label_fr, label_en, description_fr, description_en, position)
values
  ('travailleur-autonome', 'Travailleur autonome', 'Sole Proprietor', 'Entreprise opérée par une seule personne.', 'Single person business.', 1),
  ('pme', 'Petite ou moyenne entreprise', 'SME', 'Entreprise de taille petite ou moyenne.', 'Small or medium sized company.', 2),
  ('grande-entreprise', 'Grande entreprise', 'Large Enterprise', 'Organisation possédant plusieurs centaines d''employés.', 'Organisation with hundreds of employees.', 3),
  ('franchise', 'Franchise', 'Franchise', 'Entreprise opérant sous une marque franchisée.', 'Business operating under a franchise brand.', 4)
on conflict (key) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    position = excluded.position,
    updated_at = now();

insert into public.lookup_service_languages (code, label_fr, label_en, description_fr, description_en, position)
values
  ('fr', 'Français', 'French', 'Service offert en français.', 'Services available in French.', 1),
  ('en', 'Anglais', 'English', 'Service offert en anglais.', 'Services available in English.', 2),
  ('fr-en', 'Bilingue', 'Bilingual', 'Service offert en français et en anglais.', 'Services available in both French and English.', 3)
on conflict (code) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    position = excluded.position,
    updated_at = now();

insert into public.lookup_service_modes (key, label_fr, label_en, description_fr, description_en, position)
values
  ('en-personne', 'En personne', 'In-person', 'Service offert sur place.', 'Service delivered on site.', 1),
  ('en-ligne', 'En ligne', 'Online', 'Service offert virtuellement.', 'Service delivered online.', 2),
  ('a-domicile', 'À domicile', 'At home', 'Service offert à domicile.', 'Service delivered at the client location.', 3),
  ('hybride', 'Hybride', 'Hybrid', 'Combinaison de service en personne et en ligne.', 'Combination of in-person and online delivery.', 4)
on conflict (key) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    position = excluded.position,
    updated_at = now();

insert into public.lookup_certifications (key, label_fr, label_en, description_fr, description_en)
values
  ('ecoresponsable', 'Écoresponsable', 'Eco-responsible', 'Entreprise engagée dans des pratiques durables.', 'Business committed to sustainable practices.'),
  ('iso9001', 'ISO 9001', 'ISO 9001', 'Certification de gestion de la qualité.', 'Quality management certification.'),
  ('membre-association', 'Membre d''une association', 'Association Member', 'Membre d''une association professionnelle reconnue.', 'Member of a recognised professional association.')
on conflict (key) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    updated_at = now();

insert into public.lookup_accessibility_features (key, label_fr, label_en, description_fr, description_en)
values
  ('stationnement', 'Stationnement sur place', 'On-site Parking', 'Stationnement disponible pour la clientèle.', 'Parking available for customers.'),
  ('mobilite-reduite', 'Accès mobilité réduite', 'Accessible Entrance', 'Accessible aux personnes à mobilité réduite.', 'Accessible to people with reduced mobility.'),
  ('livraison', 'Livraison', 'Delivery', 'Livraison offerte.', 'Delivery offered.'),
  ('rampe', 'Rampe d''accès', 'Access Ramp', 'Rampe d''accès disponible.', 'Access ramp available.'),
  ('ascenseur', 'Ascenseur', 'Elevator', 'Ascenseur disponible pour les étages.', 'Elevator available for upper floors.')
on conflict (key) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    updated_at = now();

insert into public.lookup_payment_methods (key, label_fr, label_en, description_fr, description_en)
values
  ('argent', 'Argent comptant', 'Cash', 'Paiements en argent comptant.', 'Cash payments accepted.'),
  ('debit', 'Carte débit', 'Debit Card', 'Paiements par carte débit.', 'Debit card payments accepted.'),
  ('credit', 'Carte de crédit', 'Credit Card', 'Paiements par carte de crédit.', 'Credit card payments accepted.'),
  ('virement', 'Virement bancaire', 'Bank Transfer', 'Paiement par virement bancaire.', 'Bank transfer payments accepted.'),
  ('paiements-mobiles', 'Paiements mobiles', 'Mobile Payments', 'Apple Pay, Google Pay, etc.', 'Apple Pay, Google Pay, etc.')
on conflict (key) do update
set label_fr = excluded.label_fr,
    label_en = excluded.label_en,
    description_fr = excluded.description_fr,
    description_en = excluded.description_en,
    updated_at = now();

-- Helpful view aggregating categories and lookups ---------------------------
create or replace view public.businesses_enriched as
select
  b.*,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en,
  coalesce(lang.languages, '{}') as languages,
  coalesce(modes.modes, '{}') as service_modes,
  coalesce(certs.certifications, '{}') as certifications,
  coalesce(acc.accessibility, '{}') as accessibility_features,
  coalesce(pay.payments, '{}') as payment_methods
from public.businesses b
left join public.business_categories bc on bc.business_id = b.id and bc.is_primary = true
left join public.sub_categories sc on sc.id = bc.sub_category_id
left join public.main_categories mc on mc.id = sc.main_category_id
left join lateral (
  select array_agg(lsl.code order by lsl.position) as languages
  from public.business_languages bl
  join public.lookup_service_languages lsl on lsl.id = bl.language_id
  where bl.business_id = b.id
) lang on true
left join lateral (
  select array_agg(lsm.key order by lsm.position) as modes
  from public.business_service_modes bsm
  join public.lookup_service_modes lsm on lsm.id = bsm.service_mode_id
  where bsm.business_id = b.id
) modes on true
left join lateral (
  select array_agg(lc.key order by lc.label_fr) as certifications
  from public.business_certifications bc2
  join public.lookup_certifications lc on lc.id = bc2.certification_id
  where bc2.business_id = b.id
) certs on true
left join lateral (
  select array_agg(laf.key order by laf.label_fr) as accessibility
  from public.business_accessibility_features baf
  join public.lookup_accessibility_features laf on laf.id = baf.accessibility_feature_id
  where baf.business_id = b.id
) acc on true
left join lateral (
  select array_agg(lpm.key order by lpm.label_fr) as payments
  from public.business_payment_methods bpm
  join public.lookup_payment_methods lpm on lpm.id = bpm.payment_method_id
  where bpm.business_id = b.id
) pay on true;
