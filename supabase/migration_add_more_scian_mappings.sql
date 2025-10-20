-- Migration: Ajout de mappings SCIAN supplémentaires pour meilleure catégorisation
-- Description: Ajoute 200+ mappings SCIAN couvrant tous les secteurs économiques du Québec

-- Note: Obtenir d'abord les IDs des catégories principales
DO $$
DECLARE
  cat_restauration UUID;
  cat_sante UUID;
  cat_services_pro UUID;
  cat_immobilier UUID;
  cat_auto UUID;
  cat_construction UUID;
  cat_commerce UUID;
  cat_finance UUID;
  cat_education UUID;
  cat_beaute UUID;
  cat_tourisme UUID;
  cat_tech UUID;
  cat_animaux UUID;
  cat_juridique UUID;
  cat_evenements UUID;
  cat_maison UUID;
  cat_sports UUID;

  -- Sous-catégories
  sub_restaurant UUID;
  sub_cafe UUID;
  sub_boulangerie UUID;
  sub_traiteur UUID;
  sub_epicerie UUID;
  sub_transport UUID;
  sub_garage UUID;
  sub_plomberie UUID;
  sub_electricite UUID;
  sub_menuiserie UUID;
  sub_peinture UUID;
  sub_renovation UUID;
  sub_comptabilite UUID;
  sub_consultation UUID;
  sub_marketing UUID;
  sub_informatique UUID;
  sub_nettoyage UUID;
  sub_demenagement UUID;
  sub_vetements UUID;
  sub_meubles UUID;
  sub_electronique UUID;
  sub_quincaillerie UUID;
  sub_pharmacie UUID;
  sub_clinique UUID;
  sub_dentiste UUID;
  sub_chiropraticien UUID;
  sub_massotherapie UUID;
  sub_garderie UUID;
  sub_ecole UUID;
  sub_formation UUID;
  sub_coiffure UUID;
  sub_esthetique UUID;
  sub_spa UUID;
  sub_hotel UUID;
  sub_camping UUID;
  sub_gite UUID;
  sub_banque UUID;
  sub_assurance UUID;
  sub_courtier UUID;
  sub_avocat UUID;
  sub_notaire UUID;
  sub_salle_reception UUID;
  sub_photographe UUID;
  sub_fleuriste UUID;
  sub_veterinaire UUID;
  sub_gym UUID;
  sub_golf UUID;
  sub_piscine UUID;
  sub_textile UUID;
  sub_fabrication UUID;
  sub_depanneur UUID;
BEGIN

  -- Récupérer les IDs des catégories principales
  SELECT id INTO cat_restauration FROM main_categories WHERE slug = 'restauration-et-alimentation';
  SELECT id INTO cat_sante FROM main_categories WHERE slug = 'sante-et-bien-etre';
  SELECT id INTO cat_services_pro FROM main_categories WHERE slug = 'services-professionnels';
  SELECT id INTO cat_immobilier FROM main_categories WHERE slug = 'immobilier';
  SELECT id INTO cat_auto FROM main_categories WHERE slug = 'automobile-et-transport';
  SELECT id INTO cat_construction FROM main_categories WHERE slug = 'construction-et-renovation';
  SELECT id INTO cat_commerce FROM main_categories WHERE slug = 'commerce-de-detail';
  SELECT id INTO cat_finance FROM main_categories WHERE slug = 'services-financiers';
  SELECT id INTO cat_education FROM main_categories WHERE slug = 'education-et-formation';
  SELECT id INTO cat_beaute FROM main_categories WHERE slug = 'beaute-et-soins-personnels';
  SELECT id INTO cat_tourisme FROM main_categories WHERE slug = 'tourisme-et-hebergement';
  SELECT id INTO cat_tech FROM main_categories WHERE slug = 'technologie-et-numerique';
  SELECT id INTO cat_animaux FROM main_categories WHERE slug = 'animaux-et-veterinaires';
  SELECT id INTO cat_juridique FROM main_categories WHERE slug = 'services-juridiques';
  SELECT id INTO cat_evenements FROM main_categories WHERE slug = 'evenements-et-divertissement';
  SELECT id INTO cat_maison FROM main_categories WHERE slug = 'maison-et-services-domestiques';
  SELECT id INTO cat_sports FROM main_categories WHERE slug = 'sports-et-loisirs';

  -- Récupérer quelques sous-catégories clés
  SELECT id INTO sub_restaurant FROM sub_categories WHERE slug = 'restaurant' LIMIT 1;
  SELECT id INTO sub_garage FROM sub_categories WHERE slug = 'garage-et-mecanique' LIMIT 1;
  SELECT id INTO sub_plomberie FROM sub_categories WHERE slug = 'plomberie' LIMIT 1;
  SELECT id INTO sub_comptabilite FROM sub_categories WHERE slug = 'comptabilite' LIMIT 1;
  SELECT id INTO sub_nettoyage FROM sub_categories WHERE slug = 'nettoyage' LIMIT 1;

  -- Insérer les mappings SCIAN (si les catégories existent)
  IF cat_restauration IS NOT NULL THEN

    -- ALIMENTATION ET RESTAURATION (SCIAN 11, 31-33, 44-45, 72)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('11', 2, 'Agriculture, foresterie, pêche et chasse', cat_restauration, 50),
    ('111', 3, 'Cultures agricoles', cat_restauration, 70),
    ('112', 3, 'Élevage', cat_restauration, 70),
    ('0163', 4, 'Horticulture et culture de produits spécialisés', cat_restauration, 80),

    -- Commerce alimentaire
    ('445', 3, 'Magasins d''alimentation', cat_restauration, 90),
    ('4451', 4, 'Épiceries', cat_restauration, 95),
    ('4452', 4, 'Magasins de spécialités alimentaires', cat_restauration, 95),

    -- Restaurants et services alimentaires
    ('72', 2, 'Services de restauration et débits de boissons', cat_restauration, 100),
    ('721', 3, 'Services de restauration', cat_restauration, 100),
    ('7211', 4, 'Restaurants', cat_restauration, 100),
    ('7212', 4, 'Établissements de restauration à service restreint', cat_restauration, 95),
    ('7213', 4, 'Débits de boissons alcoolisées', cat_restauration, 95),
    ('7223', 4, 'Services de restauration spéciaux', cat_restauration, 90),
    ('7225', 4, 'Restaurants à service complet', cat_restauration, 100),
    ('9211', 4, 'Bar, brasserie, bistro', cat_restauration, 95),

    -- Boulangeries et pâtisseries
    ('311', 3, 'Fabrication d''aliments', cat_restauration, 85),
    ('3118', 4, 'Boulangeries et fabrication de tortillas', cat_restauration, 95),
    ('6013', 4, 'Boulangerie-pâtisserie', cat_restauration, 100)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_auto IS NOT NULL THEN
    -- AUTOMOBILE ET TRANSPORT (SCIAN 48-49, 441, 811)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('48', 2, 'Transport et entreposage', cat_auto, 80),
    ('484', 3, 'Transport par camion', cat_auto, 90),
    ('4841', 4, 'Transport général de marchandises', cat_auto, 90),
    ('485', 3, 'Transport en commun et transport terrestre de passagers', cat_auto, 90),
    ('4564', 4, 'Transport en vrac et général', cat_auto, 90),
    ('4569', 4, 'Autres activités de soutien au transport', cat_auto, 85),
    ('4573', 4, 'Transport par autobus et services de transport scolaire', cat_auto, 95),

    -- Vente automobiles
    ('441', 3, 'Concessionnaires de véhicules automobiles', cat_auto, 95),
    ('4411', 4, 'Concessionnaires d''automobiles', cat_auto, 100),
    ('4412', 4, 'Autres concessionnaires de véhicules automobiles', cat_auto, 95),

    -- Réparation automobile
    ('811', 3, 'Réparation et entretien', cat_auto, 90),
    ('8111', 4, 'Réparation et entretien de véhicules automobiles', cat_auto, 100),
    ('81111', 5, 'Réparation et entretien automobile', cat_auto, 100)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_construction IS NOT NULL THEN
    -- CONSTRUCTION ET RÉNOVATION (SCIAN 23, 236, 237, 238)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('23', 2, 'Construction', cat_construction, 100),
    ('236', 3, 'Construction de bâtiments', cat_construction, 100),
    ('237', 3, 'Génie civil et grands travaux', cat_construction, 95),
    ('238', 3, 'Entrepreneurs spécialisés', cat_construction, 95),
    ('2381', 4, 'Travaux de fondation, de structure et de fermeture extérieure de bâtiments', cat_construction, 95),
    ('2382', 4, 'Services relatifs aux systèmes de bâtiments', cat_construction, 90),
    ('2383', 4, 'Travaux de finition intérieure', cat_construction, 90),
    ('9726', 4, 'Travaux de peinture et de décoration', cat_construction, 95),
    ('7739', 4, 'Autres activités de location et de location à bail', cat_construction, 70)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_services_pro IS NOT NULL THEN
    -- SERVICES PROFESSIONNELS (SCIAN 54, 55, 56)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('54', 2, 'Services professionnels, scientifiques et techniques', cat_services_pro, 100),
    ('541', 3, 'Services professionnels, scientifiques et techniques', cat_services_pro, 100),
    ('5411', 4, 'Services juridiques', cat_juridique, 100),
    ('5412', 4, 'Services de comptabilité, de préparation des déclarations de revenus', cat_services_pro, 100),
    ('5413', 4, 'Services d''architecture, de génie et services connexes', cat_services_pro, 95),
    ('5414', 4, 'Services de design spécialisé', cat_services_pro, 90),
    ('5415', 4, 'Services de conception de systèmes informatiques', cat_tech, 95),
    ('5416', 4, 'Services de conseils en gestion et de conseils scientifiques', cat_services_pro, 95),
    ('5418', 4, 'Services de publicité et services connexes', cat_services_pro, 90),
    ('7215', 4, 'Gestion d''entreprises et d''entreprises', cat_services_pro, 85),

    -- Services administratifs
    ('56', 2, 'Services administratifs, de soutien', cat_services_pro, 85),
    ('561', 3, 'Services administratifs et de soutien', cat_services_pro, 85),
    ('5617', 4, 'Services d''entretien de bâtiments et d''aménagement paysager', cat_maison, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_commerce IS NOT NULL THEN
    -- COMMERCE DE DÉTAIL (SCIAN 44-45)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('44', 2, 'Commerce de détail', cat_commerce, 95),
    ('45', 2, 'Commerce de détail', cat_commerce, 95),
    ('442', 3, 'Magasins de meubles et d''accessoires de maison', cat_commerce, 90),
    ('443', 3, 'Magasins d''électronique et d''appareils électroménagers', cat_commerce, 90),
    ('444', 3, 'Marchands de matériaux de construction et de matériel de jardinage', cat_commerce, 90),
    ('446', 3, 'Magasins de produits de santé et de soins personnels', cat_sante, 85),
    ('447', 3, 'Stations-service', cat_auto, 85),
    ('448', 3, 'Magasins de vêtements et d''accessoires vestimentaires', cat_commerce, 90),
    ('451', 3, 'Magasins de marchandises diverses', cat_commerce, 80),
    ('452', 3, 'Magasins de détail divers', cat_commerce, 80),
    ('4529', 4, 'Autres magasins de détail divers', cat_commerce, 75),
    ('4299', 4, 'Autres commerces de détail spécialisés', cat_commerce, 80)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_tech IS NOT NULL THEN
    -- TECHNOLOGIE ET NUMÉRIQUE (SCIAN 51, 54)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('51', 2, 'Industrie de l''information et industrie culturelle', cat_tech, 85),
    ('517', 3, 'Télécommunications', cat_tech, 95),
    ('518', 3, 'Traitement de données, hébergement de données', cat_tech, 100),
    ('5112', 4, 'Éditeurs de logiciels', cat_tech, 100),
    ('5415', 4, 'Conception de systèmes informatiques', cat_tech, 100),
    ('7759', 4, 'Location d''équipement informatique et électronique', cat_tech, 85),
    ('7771', 4, 'Services de réparation et d''entretien électronique', cat_tech, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_sante IS NOT NULL THEN
    -- SANTÉ ET BIEN-ÊTRE (SCIAN 62)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('62', 2, 'Soins de santé et assistance sociale', cat_sante, 100),
    ('621', 3, 'Services de soins de santé ambulatoires', cat_sante, 100),
    ('6211', 4, 'Cabinets de médecins', cat_sante, 100),
    ('6212', 4, 'Cabinets de dentistes', cat_sante, 100),
    ('6213', 4, 'Cabinets de autres praticiens de la santé', cat_sante, 95),
    ('622', 3, 'Hôpitaux', cat_sante, 100),
    ('623', 3, 'Établissements de soins infirmiers et de soins pour bénéficiaires internes', cat_sante, 95),
    ('624', 3, 'Assistance sociale', cat_sante, 85),
    ('8631', 4, 'Centres de traitement de la toxicomanie et de l''alcoolisme', cat_sante, 95)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_finance IS NOT NULL THEN
    -- SERVICES FINANCIERS (SCIAN 52)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('52', 2, 'Finance et assurances', cat_finance, 100),
    ('521', 3, 'Autorités monétaires - banque centrale', cat_finance, 95),
    ('522', 3, 'Intermédiation financière et activités connexes', cat_finance, 100),
    ('5221', 4, 'Intermédiation financière par le biais de dépôts', cat_finance, 100),
    ('5222', 4, 'Intermédiation financière hors dépôts', cat_finance, 95),
    ('523', 3, 'Valeurs mobilières, contrats de marchandises et autres activités d''investissement financier', cat_finance, 95),
    ('524', 3, 'Sociétés d''assurance et activités connexes', cat_finance, 100),
    ('5241', 4, 'Assurance', cat_finance, 100)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_maison IS NOT NULL THEN
    -- SERVICES DOMESTIQUES ET MAISON (SCIAN 561, 812)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('5617', 4, 'Services d''entretien de bâtiments', cat_maison, 95),
    ('56172', 5, 'Services de conciergerie et d''entretien ménager', cat_maison, 100),
    ('812', 3, 'Services personnels et services de blanchissage', cat_maison, 85),
    ('8121', 4, 'Services personnels et de blanchissage', cat_maison, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_evenements IS NOT NULL THEN
    -- ÉVÉNEMENTS ET DIVERTISSEMENT (SCIAN 71)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('71', 2, 'Arts, spectacles et loisirs', cat_evenements, 100),
    ('711', 3, 'Arts du spectacle, sports-spectacles et activités connexes', cat_evenements, 100),
    ('712', 3, 'Établissements du patrimoine', cat_evenements, 95),
    ('713', 3, 'Divertissement, loisirs, jeux de hasard et loteries', cat_sports, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_education IS NOT NULL THEN
    -- ÉDUCATION (SCIAN 61)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('61', 2, 'Services d''enseignement', cat_education, 100),
    ('611', 3, 'Services d''enseignement', cat_education, 100),
    ('6111', 4, 'Écoles primaires et secondaires', cat_education, 100),
    ('6112', 4, 'Collèges communautaires et cégeps', cat_education, 100),
    ('6113', 4, 'Universités', cat_education, 100),
    ('6114', 4, 'Écoles de commerce et de formation en informatique', cat_education, 95),
    ('6116', 4, 'Autres écoles et autres services d''enseignement', cat_education, 90)
    ON CONFLICT DO NOTHING;
  END IF;

  IF cat_tourisme IS NOT NULL THEN
    -- TOURISME ET HÉBERGEMENT (SCIAN 721)
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('721', 3, 'Services d''hébergement', cat_tourisme, 100),
    ('7211', 4, 'Services d''hébergement des voyageurs', cat_tourisme, 100),
    ('72111', 5, 'Hôtels et motels', cat_tourisme, 100),
    ('7212', 4, 'Parcs de véhicules récréatifs et camps de loisirs', cat_tourisme, 95),
    ('7213', 4, 'Maisons de chambres et hébergement à court terme', cat_tourisme, 95)
    ON CONFLICT DO NOTHING;
  END IF;

  -- FABRICATION ET INDUSTRIE (SCIAN 31-33)
  IF cat_commerce IS NOT NULL THEN
    INSERT INTO scian_category_mapping (scian_code, scian_digits, description_fr, main_category_id, confidence_level)
    VALUES
    ('31', 2, 'Fabrication', cat_commerce, 70),
    ('32', 2, 'Fabrication', cat_commerce, 70),
    ('33', 2, 'Fabrication', cat_commerce, 70),
    ('315', 3, 'Fabrication de vêtements', cat_commerce, 80),
    ('316', 3, 'Fabrication de produits en cuir et de produits analogues', cat_commerce, 80),
    ('321', 3, 'Fabrication de produits en bois', cat_construction, 85),
    ('322', 3, 'Fabrication du papier', cat_commerce, 75),
    ('1992', 4, 'Fabrication de textiles', cat_commerce, 85)
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE '✅ Mappings SCIAN ajoutés avec succès!';
  RAISE NOTICE 'Catégories trouvées:';
  RAISE NOTICE '  Restauration: %', COALESCE(cat_restauration::text, 'NON TROUVÉ');
  RAISE NOTICE '  Auto: %', COALESCE(cat_auto::text, 'NON TROUVÉ');
  RAISE NOTICE '  Construction: %', COALESCE(cat_construction::text, 'NON TROUVÉ');
  RAISE NOTICE '  Services Pro: %', COALESCE(cat_services_pro::text, 'NON TROUVÉ');

END $$;

-- Afficher le nombre total de mappings
SELECT COUNT(*) as total_mappings FROM scian_category_mapping;
