-- Migration: Support pour import REQ et système de réclamation
-- Description: Ajoute les colonnes nécessaires pour importer des entreprises depuis le Registre des Entreprises du Québec (REQ)
--              et permet aux propriétaires de réclamer leur fiche

-- Étape 1: Ajouter colonnes pour tracking de source et réclamation
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS neq VARCHAR(10),
ADD COLUMN IF NOT EXISTS etablissement_number VARCHAR(5) DEFAULT '1',
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS scian_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS scian_description TEXT,
ADD COLUMN IF NOT EXISTS auto_categorized BOOLEAN DEFAULT FALSE;

-- Index pour performance
CREATE INDEX IF NOT EXISTS businesses_neq_idx ON businesses(neq);
CREATE INDEX IF NOT EXISTS businesses_is_claimed_idx ON businesses(is_claimed);
CREATE INDEX IF NOT EXISTS businesses_scian_idx ON businesses(scian_code);
CREATE INDEX IF NOT EXISTS businesses_data_source_idx ON businesses(data_source);

-- Contrainte d'unicité composite sur (neq, etablissement_number)
-- Car un même NEQ peut avoir plusieurs établissements (NO_SUF_ETAB dans REQ)
-- Drop ancien constraint si existe
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_neq_unique;
-- Créer nouveau constraint composite
ALTER TABLE businesses ADD CONSTRAINT businesses_neq_etablissement_unique UNIQUE (neq, etablissement_number);

-- Étape 2: Créer table de mapping SCIAN → Catégories
CREATE TABLE IF NOT EXISTS scian_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scian_code VARCHAR(10) NOT NULL,
  scian_digits INTEGER NOT NULL, -- 2, 3, 4, 5 ou 6 chiffres
  description_fr TEXT,
  main_category_id UUID REFERENCES main_categories(id) ON DELETE CASCADE,
  sub_category_id UUID REFERENCES sub_categories(id) ON DELETE CASCADE,
  confidence_level INTEGER DEFAULT 100, -- 100 = très certain, 50 = incertain
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scian_mapping_code_idx ON scian_category_mapping(scian_code);
CREATE INDEX IF NOT EXISTS scian_mapping_digits_idx ON scian_category_mapping(scian_digits);

-- Étape 3: Créer table pour gérer les réclamations de fiches
CREATE TABLE IF NOT EXISTS business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info_needed')),
  verification_method VARCHAR(20) CHECK (verification_method IN ('email', 'phone', 'document', 'manual')),
  verification_token TEXT,

  -- Informations du réclamant
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_phone TEXT,

  -- Informations de vérification
  business_email TEXT,
  business_phone TEXT,
  supporting_documents TEXT[], -- URLs vers fichiers uploadés

  -- Notes administratives
  admin_notes TEXT,
  rejection_reason TEXT,

  -- Timestamps
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  UNIQUE(business_id, user_id) -- Un utilisateur ne peut réclamer qu'une fois la même fiche
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS business_claims_status_idx ON business_claims(status);
CREATE INDEX IF NOT EXISTS business_claims_business_idx ON business_claims(business_id);
CREATE INDEX IF NOT EXISTS business_claims_user_idx ON business_claims(user_id);
CREATE INDEX IF NOT EXISTS business_claims_created_idx ON business_claims(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_business_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_claims_updated_at
BEFORE UPDATE ON business_claims
FOR EACH ROW EXECUTE FUNCTION update_business_claims_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE businesses IS 'Table principale des entreprises. Supporte import manuel, Google Places et REQ.';
COMMENT ON COLUMN businesses.neq IS 'Numéro d''entreprise du Québec (REQ). Identifiant unique du gouvernement.';
COMMENT ON COLUMN businesses.is_claimed IS 'Indique si la fiche a été réclamée et vérifiée par le propriétaire.';
COMMENT ON COLUMN businesses.data_source IS 'Source des données: manual, google, req, import';
COMMENT ON COLUMN businesses.scian_code IS 'Code SCIAN (Système de classification des industries de l''Amérique du Nord)';
COMMENT ON COLUMN businesses.auto_categorized IS 'Indique si la catégorisation a été faite automatiquement via SCIAN';

COMMENT ON TABLE scian_category_mapping IS 'Mapping entre codes SCIAN et catégories du système';
COMMENT ON TABLE business_claims IS 'Demandes de réclamation de fiches d''entreprises par leurs propriétaires';

-- Étape 4: Peupler la table scian_category_mapping avec les mappings de base
-- Ces mappings couvrent les codes SCIAN les plus courants au Québec

WITH category_ids AS (
  SELECT
    'restauration-et-alimentation' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'restauration-et-alimentation') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'restaurants') as sub_id_restaurants,
    (SELECT id FROM sub_categories WHERE slug = 'cafes') as sub_id_cafes,
    (SELECT id FROM sub_categories WHERE slug = 'bars') as sub_id_bars,
    (SELECT id FROM sub_categories WHERE slug = 'traiteurs') as sub_id_traiteurs,
    (SELECT id FROM sub_categories WHERE slug = 'boulangeries') as sub_id_boulangeries
),
construction_ids AS (
  SELECT
    'construction-et-renovation' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'construction-et-renovation') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'entrepreneurs-generaux') as sub_id_generaux,
    (SELECT id FROM sub_categories WHERE slug = 'electriciens') as sub_id_electriciens,
    (SELECT id FROM sub_categories WHERE slug = 'plombiers') as sub_id_plombiers,
    (SELECT id FROM sub_categories WHERE slug = 'couvreurs') as sub_id_couvreurs,
    (SELECT id FROM sub_categories WHERE slug = 'peintres') as sub_id_peintres,
    (SELECT id FROM sub_categories WHERE slug = 'paysagistes') as sub_id_paysagistes
),
immobilier_ids AS (
  SELECT
    'immobilier' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'immobilier') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'courtiers-immobiliers') as sub_id_courtiers,
    (SELECT id FROM sub_categories WHERE slug = 'gestion-immobiliere') as sub_id_gestion
),
services_pro_ids AS (
  SELECT
    'services-professionnels' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'services-professionnels') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'comptables') as sub_id_comptables,
    (SELECT id FROM sub_categories WHERE slug = 'avocats') as sub_id_avocats,
    (SELECT id FROM sub_categories WHERE slug = 'consultants') as sub_id_consultants,
    (SELECT id FROM sub_categories WHERE slug = 'agences-marketing') as sub_id_marketing,
    (SELECT id FROM sub_categories WHERE slug = 'architectes') as sub_id_architectes
),
sante_ids AS (
  SELECT
    'sante-et-bien-etre' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'sante-et-bien-etre') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'cliniques-medicales') as sub_id_cliniques,
    (SELECT id FROM sub_categories WHERE slug = 'dentistes') as sub_id_dentistes,
    (SELECT id FROM sub_categories WHERE slug = 'massotherapeutes') as sub_id_massotherapeutes,
    (SELECT id FROM sub_categories WHERE slug = 'psychologues') as sub_id_psychologues,
    (SELECT id FROM sub_categories WHERE slug = 'salles-de-sport') as sub_id_gyms
),
auto_ids AS (
  SELECT
    'automobile-et-transport' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'automobile-et-transport') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'concessionnaires-auto') as sub_id_concessionnaires,
    (SELECT id FROM sub_categories WHERE slug = 'garages') as sub_id_garages,
    (SELECT id FROM sub_categories WHERE slug = 'location-vehicules') as sub_id_location,
    (SELECT id FROM sub_categories WHERE slug = 'pieces-auto') as sub_id_pieces
),
commerce_ids AS (
  SELECT
    'commerce-de-detail' as cat_slug,
    (SELECT id FROM main_categories WHERE slug = 'commerce-de-detail') as main_id,
    (SELECT id FROM sub_categories WHERE slug = 'boutiques-de-vetements') as sub_id_vetements,
    (SELECT id FROM sub_categories WHERE slug = 'bijouteries') as sub_id_bijouteries,
    (SELECT id FROM sub_categories WHERE slug = 'librairies') as sub_id_librairies,
    (SELECT id FROM sub_categories WHERE slug = 'magasins-electronique') as sub_id_electronique
)

INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, sub_category_id, confidence_level)
SELECT * FROM (VALUES
  -- RESTAURATION ET ALIMENTATION (722)
  ('72', 2, 'Hébergement et services de restauration', (SELECT main_id FROM category_ids), NULL, 70),
  ('722', 3, 'Services de restauration et débits de boissons', (SELECT main_id FROM category_ids), NULL, 85),
  ('7221', 4, 'Restaurants à service complet', (SELECT main_id FROM category_ids), (SELECT sub_id_restaurants FROM category_ids), 95),
  ('7222', 4, 'Établissements de restauration à service restreint', (SELECT main_id FROM category_ids), (SELECT sub_id_restaurants FROM category_ids), 90),
  ('7223', 4, 'Services de restauration spéciaux', (SELECT main_id FROM category_ids), (SELECT sub_id_traiteurs FROM category_ids), 95),
  ('7224', 4, 'Débits de boissons alcoolisées', (SELECT main_id FROM category_ids), (SELECT sub_id_bars FROM category_ids), 95),
  ('72231', 5, 'Services de restauration contractuels', (SELECT main_id FROM category_ids), (SELECT sub_id_traiteurs FROM category_ids), 98),
  ('72232', 5, 'Traiteurs', (SELECT main_id FROM category_ids), (SELECT sub_id_traiteurs FROM category_ids), 100),
  ('311811', 6, 'Boulangeries de détail', (SELECT main_id FROM category_ids), (SELECT sub_id_boulangeries FROM category_ids), 100),
  ('445291', 6, 'Pâtisseries', (SELECT main_id FROM category_ids), (SELECT sub_id_boulangeries FROM category_ids), 95),

  -- CONSTRUCTION ET RÉNOVATION (23)
  ('23', 2, 'Construction', (SELECT main_id FROM construction_ids), NULL, 80),
  ('236', 3, 'Construction de bâtiments', (SELECT main_id FROM construction_ids), (SELECT sub_id_generaux FROM construction_ids), 90),
  ('237', 3, 'Génie civil et construction', (SELECT main_id FROM construction_ids), (SELECT sub_id_generaux FROM construction_ids), 85),
  ('238', 3, 'Entrepreneurs spécialisés', (SELECT main_id FROM construction_ids), NULL, 90),
  ('2361', 4, 'Construction de bâtiments résidentiels', (SELECT main_id FROM construction_ids), (SELECT sub_id_generaux FROM construction_ids), 95),
  ('2362', 4, 'Construction de bâtiments non résidentiels', (SELECT main_id FROM construction_ids), (SELECT sub_id_generaux FROM construction_ids), 95),
  ('23821', 5, 'Travaux d''installation électrique', (SELECT main_id FROM construction_ids), (SELECT sub_id_electriciens FROM construction_ids), 100),
  ('23822', 5, 'Travaux de plomberie, chauffage et climatisation', (SELECT main_id FROM construction_ids), (SELECT sub_id_plombiers FROM construction_ids), 100),
  ('23816', 5, 'Travaux de couverture', (SELECT main_id FROM construction_ids), (SELECT sub_id_couvreurs FROM construction_ids), 100),
  ('23832', 5, 'Travaux de peinture et de décoration', (SELECT main_id FROM construction_ids), (SELECT sub_id_peintres FROM construction_ids), 100),
  ('23839', 5, 'Autres entrepreneurs spécialisés', (SELECT main_id FROM construction_ids), NULL, 70),
  ('561730', 6, 'Services d''aménagement paysager', (SELECT main_id FROM construction_ids), (SELECT sub_id_paysagistes FROM construction_ids), 100),

  -- IMMOBILIER (531)
  ('53', 2, 'Services immobiliers et services de location et de location à bail', (SELECT main_id FROM immobilier_ids), NULL, 75),
  ('531', 3, 'Services immobiliers', (SELECT main_id FROM immobilier_ids), NULL, 90),
  ('5311', 4, 'Bailleurs de biens immobiliers', (SELECT main_id FROM immobilier_ids), (SELECT sub_id_gestion FROM immobilier_ids), 85),
  ('5312', 4, 'Bureaux d''agents et de courtiers immobiliers', (SELECT main_id FROM immobilier_ids), (SELECT sub_id_courtiers FROM immobilier_ids), 100),
  ('5313', 4, 'Activités liées à l''immobilier', (SELECT main_id FROM immobilier_ids), (SELECT sub_id_gestion FROM immobilier_ids), 90),

  -- SERVICES PROFESSIONNELS (54)
  ('54', 2, 'Services professionnels, scientifiques et techniques', (SELECT main_id FROM services_pro_ids), NULL, 80),
  ('541', 3, 'Services professionnels, scientifiques et techniques', (SELECT main_id FROM services_pro_ids), NULL, 85),
  ('5411', 4, 'Services juridiques', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_avocats FROM services_pro_ids), 100),
  ('5412', 4, 'Services de comptabilité, de préparation de déclarations de revenus, de tenue de livres et de paye', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_comptables FROM services_pro_ids), 100),
  ('5413', 4, 'Services d''architecture, de génie et services connexes', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_architectes FROM services_pro_ids), 95),
  ('54131', 5, 'Services d''architecture', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_architectes FROM services_pro_ids), 100),
  ('5414', 4, 'Services spécialisés de design', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_marketing FROM services_pro_ids), 80),
  ('5415', 4, 'Services de design informatique et services connexes', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_consultants FROM services_pro_ids), 85),
  ('5416', 4, 'Services de conseils en gestion, de conseils scientifiques et de conseils techniques', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_consultants FROM services_pro_ids), 95),
  ('5418', 4, 'Services de publicité, de relations publiques et services connexes', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_marketing FROM services_pro_ids), 100),
  ('54181', 5, 'Agences de publicité', (SELECT main_id FROM services_pro_ids), (SELECT sub_id_marketing FROM services_pro_ids), 100),

  -- SANTÉ ET BIEN-ÊTRE (62)
  ('62', 2, 'Soins de santé et assistance sociale', (SELECT main_id FROM sante_ids), NULL, 85),
  ('621', 3, 'Services de soins de santé ambulatoires', (SELECT main_id FROM sante_ids), NULL, 90),
  ('6211', 4, 'Cabinets de médecins', (SELECT main_id FROM sante_ids), (SELECT sub_id_cliniques FROM sante_ids), 100),
  ('6212', 4, 'Cabinets de dentistes', (SELECT main_id FROM sante_ids), (SELECT sub_id_dentistes FROM sante_ids), 100),
  ('6213', 4, 'Cabinets d''autres praticiens de la santé', (SELECT main_id FROM sante_ids), NULL, 80),
  ('62133', 5, 'Cabinets de psychologues', (SELECT main_id FROM sante_ids), (SELECT sub_id_psychologues FROM sante_ids), 100),
  ('62139', 5, 'Autres bureaux de praticiens de la santé', (SELECT main_id FROM sante_ids), (SELECT sub_id_massotherapeutes FROM sante_ids), 70),
  ('713940', 6, 'Centres de conditionnement physique', (SELECT main_id FROM sante_ids), (SELECT sub_id_gyms FROM sante_ids), 100),

  -- AUTOMOBILE ET TRANSPORT (441-484)
  ('441', 3, 'Concessionnaires de véhicules et de pièces automobiles', (SELECT main_id FROM auto_ids), NULL, 90),
  ('4411', 4, 'Concessionnaires automobiles', (SELECT main_id FROM auto_ids), (SELECT sub_id_concessionnaires FROM auto_ids), 100),
  ('4412', 4, 'Autres concessionnaires de véhicules automobiles', (SELECT main_id FROM auto_ids), (SELECT sub_id_concessionnaires FROM auto_ids), 95),
  ('4413', 4, 'Marchands de pièces et d''accessoires pour véhicules automobiles', (SELECT main_id FROM auto_ids), (SELECT sub_id_pieces FROM auto_ids), 100),
  ('8111', 4, 'Réparation et entretien de véhicules automobiles', (SELECT main_id FROM auto_ids), (SELECT sub_id_garages FROM auto_ids), 100),
  ('5321', 4, 'Location de véhicules automobiles', (SELECT main_id FROM auto_ids), (SELECT sub_id_location FROM auto_ids), 100),

  -- COMMERCE DE DÉTAIL (44-45)
  ('44', 2, 'Commerces de détail', (SELECT main_id FROM commerce_ids), NULL, 75),
  ('45', 2, 'Commerces de détail', (SELECT main_id FROM commerce_ids), NULL, 75),
  ('448', 3, 'Magasins de vêtements et d''accessoires vestimentaires', (SELECT main_id FROM commerce_ids), (SELECT sub_id_vetements FROM commerce_ids), 95),
  ('4481', 4, 'Magasins de vêtements', (SELECT main_id FROM commerce_ids), (SELECT sub_id_vetements FROM commerce_ids), 98),
  ('44831', 5, 'Bijouteries', (SELECT main_id FROM commerce_ids), (SELECT sub_id_bijouteries FROM commerce_ids), 100),
  ('45121', 5, 'Librairies', (SELECT main_id FROM commerce_ids), (SELECT sub_id_librairies FROM commerce_ids), 100),
  ('443', 3, 'Magasins d''appareils électroniques et ménagers', (SELECT main_id FROM commerce_ids), (SELECT sub_id_electronique FROM commerce_ids), 95)

) AS mappings(scian_code, scian_digits, description_fr, main_category_id, sub_category_id, confidence_level)
WHERE mappings.main_category_id IS NOT NULL; -- Ne pas insérer si catégorie n'existe pas

-- Afficher les statistiques
SELECT
  COUNT(*) as total_mappings,
  COUNT(DISTINCT scian_code) as unique_codes,
  COUNT(CASE WHEN sub_category_id IS NOT NULL THEN 1 END) as with_subcategory
FROM scian_category_mapping;
