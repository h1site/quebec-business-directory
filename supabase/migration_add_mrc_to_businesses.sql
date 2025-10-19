-- Migration: Add MRC field to businesses table and populate it
-- This allows precise filtering by MRC (MRC Regionale de Comté)

-- Step 1: Add MRC column to businesses table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'mrc'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN mrc TEXT;
        CREATE INDEX IF NOT EXISTS idx_businesses_mrc ON public.businesses(mrc);
    END IF;
END $$;

-- Step 2: Populate MRC based on city
-- Quebec regions and their MRCs with cities mapping

UPDATE public.businesses SET mrc = 'Kamouraska' WHERE city IN ('Kamouraska', 'Saint-Pascal', 'La Pocatière', 'Saint-Alexandre-de-Kamouraska', 'Saint-André', 'Saint-Bruno-de-Kamouraska');
UPDATE public.businesses SET mrc = 'Rivière-du-Loup' WHERE city IN ('Rivière-du-Loup', 'Cacouna', 'L''Isle-Verte', 'Saint-Antonin', 'Saint-Arsène', 'Saint-Modeste');
UPDATE public.businesses SET mrc = 'Témiscouata' WHERE city IN ('Témiscouata-sur-le-Lac', 'Cabano', 'Dégelis', 'Notre-Dame-du-Lac', 'Pohénégamook');
UPDATE public.businesses SET mrc = 'Les Basques' WHERE city IN ('Trois-Pistoles', 'Notre-Dame-des-Neiges', 'Saint-Jean-de-Dieu');
UPDATE public.businesses SET mrc = 'Rimouski-Neigette' WHERE city IN ('Rimouski', 'Le Bic', 'Saint-Fabien', 'Saint-Anaclet-de-Lessard');
UPDATE public.businesses SET mrc = 'La Mitis' WHERE city IN ('Mont-Joli', 'Métis-sur-Mer', 'Grand-Métis', 'Sainte-Flavie', 'Sainte-Luce');
UPDATE public.businesses SET mrc = 'La Matapédia' WHERE city IN ('Amqui', 'Causapscal', 'Lac-au-Saumon', 'Sayabec', 'Val-Brillant');
UPDATE public.businesses SET mrc = 'La Matanie' WHERE city IN ('Matane', 'Baie-des-Sables', 'Les Méchins');

-- Saguenay-Lac-Saint-Jean (02)
UPDATE public.businesses SET mrc = 'Le Fjord-du-Saguenay' WHERE city IN ('Saguenay', 'Chicoutimi', 'Jonquière', 'La Baie', 'Saint-Fulgence', 'Ferland-et-Boilleau');
UPDATE public.businesses SET mrc = 'Lac-Saint-Jean-Est' WHERE city IN ('Alma', 'Desbiens', 'Métabetchouan-Lac-à-la-Croix', 'Saint-Gédéon', 'Saint-Bruno');
UPDATE public.businesses SET mrc = 'Domaine-du-Roy' WHERE city IN ('Roberval', 'Saint-Félicien', 'Chambord', 'Sainte-Hedwidge', 'Saint-François-de-Sales');
UPDATE public.businesses SET mrc = 'Maria-Chapdelaine' WHERE city IN ('Dolbeau-Mistassini', 'Normandin', 'Albanel', 'Girardville');

-- Capitale-Nationale (03)
UPDATE public.businesses SET mrc = 'La Côte-de-Beaupré' WHERE city IN ('Beaupré', 'Sainte-Anne-de-Beaupré', 'Château-Richer', 'Boischatel', 'L''Ange-Gardien');
UPDATE public.businesses SET mrc = 'L''Île-d''Orléans' WHERE city IN ('Saint-Pierre-de-l''Île-d''Orléans', 'Saint-Laurent-de-l''Île-d''Orléans', 'Sainte-Famille', 'Saint-Jean-de-l''Île-d''Orléans');
UPDATE public.businesses SET mrc = 'La Jacques-Cartier' WHERE city IN ('Shannon', 'Sainte-Catherine-de-la-Jacques-Cartier', 'Fossambault-sur-le-Lac', 'Lac-Saint-Joseph', 'Sainte-Brigitte-de-Laval');
UPDATE public.businesses SET mrc = 'Charlevoix-Est' WHERE city IN ('Baie-Saint-Paul', 'La Malbaie', 'Clermont', 'Les Éboulements', 'Saint-Urbain');
UPDATE public.businesses SET mrc = 'Charlevoix' WHERE city IN ('La Malbaie', 'Baie-Saint-Paul');
UPDATE public.businesses SET mrc = 'Portneuf' WHERE city IN ('Portneuf', 'Donnacona', 'Saint-Raymond', 'Pont-Rouge', 'Cap-Santé', 'Neuville', 'Saint-Basile', 'Saint-Marc-des-Carrières');
UPDATE public.businesses SET mrc = 'Québec' WHERE city IN ('Québec', 'Lévis', 'Sainte-Foy', 'Charlesbourg', 'Beauport');

-- Mauricie (04)
UPDATE public.businesses SET mrc = 'Les Chenaux' WHERE city IN ('Sainte-Anne-de-la-Pérade', 'Batiscan', 'Saint-Prosper-de-Champlain', 'Champlain');
UPDATE public.businesses SET mrc = 'Mékinac' WHERE city IN ('Trois-Rives', 'Saint-Tite', 'Sainte-Thècle');
UPDATE public.businesses SET mrc = 'Shawinigan' WHERE city IN ('Shawinigan', 'Grand-Mère', 'Shawinigan-Sud');
UPDATE public.businesses SET mrc = 'Trois-Rivières' WHERE city IN ('Trois-Rivières', 'Cap-de-la-Madeleine', 'Pointe-du-Lac');
UPDATE public.businesses SET mrc = 'Maskinongé' WHERE city IN ('Louiseville', 'Maskinongé', 'Saint-Justin', 'Yamachiche');

-- Estrie (05)
UPDATE public.businesses SET mrc = 'Le Granit' WHERE city IN ('Lac-Mégantic', 'Frontenac', 'Nantes', 'Marston');
UPDATE public.businesses SET mrc = 'Le Haut-Saint-François' WHERE city IN ('Cookshire-Eaton', 'East Angus', 'Scotstown', 'Bury');
UPDATE public.businesses SET mrc = 'Le Val-Saint-François' WHERE city IN ('Richmond', 'Windsor', 'Valcourt', 'Lawrenceville');
UPDATE public.businesses SET mrc = 'Memphrémagog' WHERE city IN ('Magog', 'Orford', 'Eastman', 'Austin', 'Bolton-Est');
UPDATE public.businesses SET mrc = 'Sherbrooke' WHERE city IN ('Sherbrooke', 'Fleurimont', 'Lennoxville', 'Rock Forest');
UPDATE public.businesses SET mrc = 'Coaticook' WHERE city IN ('Coaticook', 'Waterville', 'Barnston-Ouest', 'Compton');
UPDATE public.businesses SET mrc = 'Les Sources' WHERE city IN ('Asbestos', 'Danville', 'Wotton', 'Saint-Camille');

-- Montréal (06)
UPDATE public.businesses SET mrc = 'Montréal' WHERE city IN ('Montréal', 'Montreal', 'Westmount', 'Mont-Royal', 'Côte-Saint-Luc', 'Hampstead', 'Montréal-Est', 'Montréal-Ouest', 'Outremont', 'Verdun', 'LaSalle', 'Lachine', 'Dorval', 'Pointe-Claire', 'Kirkland', 'Beaconsfield', 'Baie-d''Urfé', 'Sainte-Anne-de-Bellevue', 'Pierrefonds', 'Dollard-des-Ormeaux', 'Roxboro', 'Anjou', 'Montréal-Nord', 'Saint-Léonard', 'Saint-Laurent', 'Ahuntsic', 'Rosemont', 'Villeray');

-- Outaouais (07)
UPDATE public.businesses SET mrc = 'Gatineau' WHERE city IN ('Gatineau', 'Hull', 'Aylmer', 'Buckingham', 'Masson-Angers');
UPDATE public.businesses SET mrc = 'Les Collines-de-l''Outaouais' WHERE city IN ('Chelsea', 'Cantley', 'La Pêche', 'Val-des-Monts', 'Pontiac');
UPDATE public.businesses SET mrc = 'Papineau' WHERE city IN ('Thurso', 'Papineauville', 'Saint-André-Avellin', 'Plaisance');
UPDATE public.businesses SET mrc = 'Pontiac' WHERE city IN ('Fort-Coulonge', 'Shawville', 'Campbell''s Bay', 'Bryson');
UPDATE public.businesses SET mrc = 'Vallée-de-la-Gatineau' WHERE city IN ('Maniwaki', 'Gracefield', 'Bouchette', 'Kazabazua');

-- Abitibi-Témiscamingue (08)
UPDATE public.businesses SET mrc = 'Abitibi' WHERE city IN ('Amos', 'La Sarre', 'Macamic', 'Taschereau');
UPDATE public.businesses SET mrc = 'Abitibi-Ouest' WHERE city IN ('La Sarre', 'Macamic', 'Dupuy', 'Palmarolle');
UPDATE public.businesses SET mrc = 'Rouyn-Noranda' WHERE city IN ('Rouyn-Noranda', 'Arntfield', 'Cléricy', 'Cloutier');
UPDATE public.businesses SET mrc = 'Témiscamingue' WHERE city IN ('Ville-Marie', 'Témiscaming', 'Notre-Dame-du-Nord', 'Kipawa');
UPDATE public.businesses SET mrc = 'Vallée-de-l''Or' WHERE city IN ('Val-d''Or', 'Malartic', 'Senneterre', 'Cadillac');

-- Côte-Nord (09)
UPDATE public.businesses SET mrc = 'La Haute-Côte-Nord' WHERE city IN ('Les Escoumins', 'Tadoussac', 'Sacré-Coeur', 'Bergeronnes');
UPDATE public.businesses SET mrc = 'Manicouagan' WHERE city IN ('Baie-Comeau', 'Hauterive', 'Chute-aux-Outardes', 'Pointe-Lebel', 'Ragueneau');
UPDATE public.businesses SET mrc = 'Sept-Rivières' WHERE city IN ('Sept-Îles', 'Port-Cartier', 'Havre-Saint-Pierre', 'Sheldrake');
UPDATE public.businesses SET mrc = 'Minganie' WHERE city IN ('Havre-Saint-Pierre', 'Longue-Pointe-de-Mingan', 'Baie-Johan-Beetz');
UPDATE public.businesses SET mrc = 'Caniapiscau' WHERE city IN ('Fermont', 'Schefferville');

-- Nord-du-Québec (10)
UPDATE public.businesses SET mrc = 'Eeyou Istchee' WHERE city IN ('Chibougamau', 'Chapais', 'Lebel-sur-Quévillon', 'Matagami');
UPDATE public.businesses SET mrc = 'Jamésie' WHERE city IN ('Chibougamau', 'Chapais', 'Lebel-sur-Quévillon', 'Matagami');

-- Gaspésie–Îles-de-la-Madeleine (11)
UPDATE public.businesses SET mrc = 'Avignon' WHERE city IN ('Carleton-sur-Mer', 'Maria', 'New Richmond', 'Nouvelle', 'Saint-Alexis-de-Matapédia');
UPDATE public.businesses SET mrc = 'Bonaventure' WHERE city IN ('Bonaventure', 'Caplan', 'New Carlisle', 'Paspébiac', 'Saint-Siméon');
UPDATE public.businesses SET mrc = 'La Côte-de-Gaspé' WHERE city IN ('Gaspé', 'Percé', 'Grande-Rivière', 'Sainte-Anne-des-Monts', 'Cap-Chat');
UPDATE public.businesses SET mrc = 'La Haute-Gaspésie' WHERE city IN ('Sainte-Anne-des-Monts', 'Cap-Chat', 'Mont-Saint-Pierre', 'Marsoui');
UPDATE public.businesses SET mrc = 'Le Rocher-Percé' WHERE city IN ('Percé', 'Chandler', 'Grande-Rivière', 'Port-Daniel-Gascons');
UPDATE public.businesses SET mrc = 'Les Îles-de-la-Madeleine' WHERE city IN ('Cap-aux-Meules', 'Fatima', 'Havre-aux-Maisons', 'Grande-Entrée', 'L''Étang-du-Nord', 'L''Île-d''Entrée');

-- Chaudière-Appalaches (12)
UPDATE public.businesses SET mrc = 'L''Islet' WHERE city IN ('Saint-Jean-Port-Joli', 'L''Islet', 'Saint-Pamphile', 'Montmagny');
UPDATE public.businesses SET mrc = 'Montmagny' WHERE city IN ('Montmagny', 'Saint-Pierre-de-la-Rivière-du-Sud', 'Berthier-sur-Mer');
UPDATE public.businesses SET mrc = 'Bellechasse' WHERE city IN ('Saint-Raphaël', 'Saint-Michel-de-Bellechasse', 'Saint-Lazare-de-Bellechasse', 'Saint-Gervais');
UPDATE public.businesses SET mrc = 'Lévis' WHERE city IN ('Lévis', 'Saint-Jean-Chrysostome', 'Saint-Nicolas', 'Saint-Étienne-de-Lauzon', 'Saint-Rédempteur');
UPDATE public.businesses SET mrc = 'Lotbinière' WHERE city IN ('Laurier-Station', 'Saint-Agapit', 'Sainte-Croix', 'Lotbinière', 'Saint-Apollinaire');
UPDATE public.businesses SET mrc = 'Les Appalaches' WHERE city IN ('Thetford Mines', 'Black Lake', 'Disraeli', 'Beaulac-Garthby');
UPDATE public.businesses SET mrc = 'Les Etchemins' WHERE city IN ('Sainte-Marie', 'Lac-Etchemin', 'Saint-Victor', 'Sainte-Justine');
UPDATE public.businesses SET mrc = 'La Nouvelle-Beauce' WHERE city IN ('Sainte-Marie', 'Saint-Joseph-de-Beauce', 'Beauceville', 'Saint-Georges', 'Vallée-Jonction');
UPDATE public.businesses SET mrc = 'Beauce-Sartigan' WHERE city IN ('Saint-Georges', 'Beauceville', 'Saint-Benoît-Labre', 'Saint-Éphrem-de-Beauce');
UPDATE public.businesses SET mrc = 'Robert-Cliche' WHERE city IN ('Beauceville', 'Saint-Joseph-de-Beauce', 'Saint-Victor');

-- Laval (13)
UPDATE public.businesses SET mrc = 'Laval' WHERE city IN ('Laval', 'Chomedey', 'Duvernay', 'Fabreville', 'Laval-des-Rapides', 'Pont-Viau', 'Saint-François', 'Saint-Vincent-de-Paul', 'Sainte-Dorothée', 'Sainte-Rose', 'Vimont', 'Auteuil');

-- Lanaudière (14)
UPDATE public.businesses SET mrc = 'L''Assomption' WHERE city IN ('L''Assomption', 'Repentigny', 'L''Épiphanie', 'Saint-Sulpice', 'Charlemagne');
UPDATE public.businesses SET mrc = 'D''Autray' WHERE city IN ('Berthierville', 'Saint-Gabriel-de-Brandon', 'Mandeville', 'Lavaltrie');
UPDATE public.businesses SET mrc = 'Joliette' WHERE city IN ('Joliette', 'Crabtree', 'Notre-Dame-des-Prairies', 'Saint-Charles-Borromée');
UPDATE public.businesses SET mrc = 'Matawinie' WHERE city IN ('Saint-Michel-des-Saints', 'Rawdon', 'Chertsey', 'Saint-Donat', 'Sainte-Émélie-de-l''Énergie');
UPDATE public.businesses SET mrc = 'Montcalm' WHERE city IN ('Saint-Jacques', 'Saint-Esprit', 'Sainte-Julienne', 'Sainte-Marie-Salomé');
UPDATE public.businesses SET mrc = 'Les Moulins' WHERE city IN ('Terrebonne', 'Mascouche', 'Lachenaie', 'La Plaine');

-- Laurentides (15)
UPDATE public.businesses SET mrc = 'Antoine-Labelle' WHERE city IN ('Mont-Laurier', 'Mont-Tremblant', 'Nominingue', 'Rivière-Rouge', 'La Macaza');
UPDATE public.businesses SET mrc = 'Argenteuil' WHERE city IN ('Lachute', 'Brownsburg-Chatham', 'Gore', 'Grenville', 'Grenville-sur-la-Rouge');
UPDATE public.businesses SET mrc = 'Deux-Montagnes' WHERE city IN ('Deux-Montagnes', 'Saint-Eustache', 'Sainte-Marthe-sur-le-Lac', 'Pointe-Calumet', 'Saint-Joseph-du-Lac');
UPDATE public.businesses SET mrc = 'Les Laurentides' WHERE city IN ('Sainte-Agathe-des-Monts', 'Saint-Faustin-Lac-Carré', 'Val-David', 'Val-Morin', 'Sainte-Adèle');
UPDATE public.businesses SET mrc = 'Les Pays-d''en-Haut' WHERE city IN ('Sainte-Adèle', 'Saint-Sauveur', 'Morin-Heights', 'Piedmont', 'Prévost');
UPDATE public.businesses SET mrc = 'Mirabel' WHERE city IN ('Mirabel', 'Saint-Janvier', 'Saint-Benoît');
UPDATE public.businesses SET mrc = 'Rivière-du-Nord' WHERE city IN ('Saint-Jérôme', 'Prévost', 'Sainte-Sophie', 'Saint-Hippolyte');
UPDATE public.businesses SET mrc = 'Thérèse-De Blainville' WHERE city IN ('Blainville', 'Sainte-Thérèse', 'Rosemère', 'Bois-des-Filion', 'Lorraine', 'Sainte-Anne-des-Plaines');

-- Montérégie (16)
UPDATE public.businesses SET mrc = 'Acton' WHERE city IN ('Acton Vale', 'Roxton Falls', 'Sainte-Christine', 'Upton');
UPDATE public.businesses SET mrc = 'Beauharnois-Salaberry' WHERE city IN ('Beauharnois', 'Salaberry-de-Valleyfield', 'Saint-Louis-de-Gonzague', 'Saint-Stanislas-de-Kostka');
UPDATE public.businesses SET mrc = 'Brome-Missisquoi' WHERE city IN ('Bromont', 'Cowansville', 'Sutton', 'Farnham', 'Bedford');
UPDATE public.businesses SET mrc = 'La Haute-Yamaska' WHERE city IN ('Granby', 'Waterloo', 'Roxton Pond', 'Sainte-Cécile-de-Milton');
UPDATE public.businesses SET mrc = 'La Vallée-du-Richelieu' WHERE city IN ('Beloeil', 'Mont-Saint-Hilaire', 'McMasterville', 'Otterburn Park', 'Saint-Basile-le-Grand');
UPDATE public.businesses SET mrc = 'Le Haut-Richelieu' WHERE city IN ('Saint-Jean-sur-Richelieu', 'Chambly', 'Carignan', 'Saint-Luc', 'Iberville');
UPDATE public.businesses SET mrc = 'Le Haut-Saint-Laurent' WHERE city IN ('Huntingdon', 'Ormstown', 'Sainte-Martine', 'Saint-Chrysostome');
UPDATE public.businesses SET mrc = 'Longueuil' WHERE city IN ('Longueuil', 'Boucherville', 'Brossard', 'Greenfield Park', 'LeMoyne', 'Saint-Bruno-de-Montarville', 'Saint-Hubert', 'Saint-Lambert');
UPDATE public.businesses SET mrc = 'Marguerite-D''Youville' WHERE city IN ('Varennes', 'Sainte-Julie', 'Contrecoeur', 'Verchères', 'Calixa-Lavallée');
UPDATE public.businesses SET mrc = 'Les Maskoutains' WHERE city IN ('Saint-Hyacinthe', 'Saint-Pie', 'Saint-Liboire', 'Saint-Dominique');
UPDATE public.businesses SET mrc = 'Pierre-De Saurel' WHERE city IN ('Sorel-Tracy', 'Saint-Joseph-de-Sorel', 'Sainte-Victoire-de-Sorel');
UPDATE public.businesses SET mrc = 'Roussillon' WHERE city IN ('Châteauguay', 'La Prairie', 'Candiac', 'Delson', 'Sainte-Catherine', 'Saint-Philippe', 'Saint-Constant', 'Mercier');
UPDATE public.businesses SET mrc = 'Rouville' WHERE city IN ('Marieville', 'Richelieu', 'Saint-Césaire', 'Saint-Paul-d''Abbotsford');
UPDATE public.businesses SET mrc = 'Vaudreuil-Soulanges' WHERE city IN ('Vaudreuil-Dorion', 'Vaudreuil', 'Hudson', 'Pincourt', 'Rigaud', 'Saint-Lazare', 'Pointe-des-Cascades', 'L''Île-Perrot', 'Notre-Dame-de-l''Île-Perrot', 'Terrasse-Vaudreuil', 'Vaudreuil-sur-le-Lac', 'Les Cèdres', 'Coteau-du-Lac', 'Les Coteaux', 'Pointe-Fortune', 'Rivière-Beaudette', 'Saint-Clet', 'Saint-Polycarpe', 'Saint-Télesphore', 'Saint-Zotique', 'Salaberry-de-Valleyfield');

-- Centre-du-Québec (17)
UPDATE public.businesses SET mrc = 'Arthabaska' WHERE city IN ('Victoriaville', 'Warwick', 'Kingsey Falls', 'Daveluyville');
UPDATE public.businesses SET mrc = 'Bécancour' WHERE city IN ('Bécancour', 'Sainte-Angèle-de-Laval', 'Sainte-Sophie-de-Lévrard');
UPDATE public.businesses SET mrc = 'Drummond' WHERE city IN ('Drummondville', 'Saint-Cyrille-de-Wendover', 'Saint-Germain-de-Grantham');
UPDATE public.businesses SET mrc = 'L''Érable' WHERE city IN ('Plessisville', 'Princeville', 'Lyster', 'Inverness');
UPDATE public.businesses SET mrc = 'Nicolet-Yamaska' WHERE city IN ('Nicolet', 'Pierreville', 'Sainte-Monique', 'Baie-du-Febvre');

-- Step 3: Recreate businesses_enriched view with MRC field
DROP VIEW IF EXISTS public.businesses_enriched;

CREATE OR REPLACE VIEW public.businesses_enriched AS
SELECT
  b.*,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  mc.slug as primary_main_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en,
  sc.slug as primary_sub_category_slug,
  COALESCE(lang.languages, '{}') as languages,
  COALESCE(modes.modes, '{}') as service_modes,
  COALESCE(certs.certifications, '{}') as certifications,
  COALESCE(acc.accessibility, '{}') as accessibility_features,
  COALESCE(pay.payments, '{}') as payment_methods
FROM public.businesses b
LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
LEFT JOIN public.sub_categories sc ON sc.id = bc.sub_category_id
LEFT JOIN public.main_categories mc ON mc.id = sc.main_category_id
LEFT JOIN LATERAL (
  SELECT array_agg(lsl.code ORDER BY lsl.position) as languages
  FROM public.business_languages bl
  JOIN public.lookup_service_languages lsl ON lsl.id = bl.language_id
  WHERE bl.business_id = b.id
) lang ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lsm.key ORDER BY lsm.position) as modes
  FROM public.business_service_modes bsm
  JOIN public.lookup_service_modes lsm ON lsm.id = bsm.service_mode_id
  WHERE bsm.business_id = b.id
) modes ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lc.key ORDER BY lc.label_fr) as certifications
  FROM public.business_certifications bc2
  JOIN public.lookup_certifications lc ON lc.id = bc2.certification_id
  WHERE bc2.business_id = b.id
) certs ON true
LEFT JOIN LATERAL (
  SELECT array_agg(laf.key ORDER BY laf.label_fr) as accessibility
  FROM public.business_accessibility_features baf
  JOIN public.lookup_accessibility_features laf ON laf.id = baf.accessibility_feature_id
  WHERE baf.business_id = b.id
) acc ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lpm.key ORDER BY lpm.label_fr) as payments
  FROM public.business_payment_methods bpm
  JOIN public.lookup_payment_methods lpm ON lpm.id = bpm.payment_method_id
  WHERE bpm.business_id = b.id
) pay ON true;

-- Step 4: Verify results
SELECT
  COUNT(*) as total_businesses,
  COUNT(mrc) as businesses_with_mrc,
  COUNT(*) - COUNT(mrc) as businesses_without_mrc
FROM public.businesses;

SELECT mrc, COUNT(*) as count
FROM public.businesses
WHERE mrc IS NOT NULL
GROUP BY mrc
ORDER BY count DESC
LIMIT 20;
