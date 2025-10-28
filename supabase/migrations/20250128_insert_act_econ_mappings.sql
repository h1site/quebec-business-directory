-- Insérer les mappings ACT_ECON → main_categories

-- 1000: Industrie des aliments → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1000', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1100: Industries des boissons → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1100', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1200: Industries du tabac → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1200', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1500: Industries des produits du caoutchouc → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1600: Industries des produits en matière plastique → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1700: Industries du cuir et des produits connexes → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1800: Industries textiles de première transformation → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 1900: Industrie des produits textiles → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('1900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2400: Industries de l'habillement → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2400', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2500: Industries du bois → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2600: Industries du meuble et des articles d'ameublement → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2700: Industrie du papier et des produits en papier → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2800: Imprimerie → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 2900: Industries de première transformation des métaux → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('2900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3000: Industries de la fabrication des produits métalliques (sauf les industries de la machinerie et du matériel de transport) → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3000', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3100: Industries de la machinerie (sauf électrique) → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3100', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3200: Industries du matériel de transport → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3200', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3300: Industries des produits électriques et électroniques → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3300', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3500: Industries des produits minéraux non métalliques → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3600: Industries des produits du pétrole et du charbon → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3700: Industries chimiques → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 3900: Autres industries manufacturières → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('3900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4000: Constructeurs → Construction et rénovation
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4000', '60beba89-442b-43ff-8fee-96a28922d789', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4200: Entrepreneurs spécialisés → Construction et rénovation
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4200', '60beba89-442b-43ff-8fee-96a28922d789', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4400: Services relatifs à la construction → Construction et rénovation
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4400', '60beba89-442b-43ff-8fee-96a28922d789', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4500: Transports → Automobile et transport
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4500', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4600: Transports par pipelines → Automobile et transport
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4600', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4700: Entreposage → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4800: Communications → Technologie et informatique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4800', 'efab1e6e-3c3b-4240-9625-c27477667630', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 4900: Autres services publics → Technologie et informatique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('4900', 'efab1e6e-3c3b-4240-9625-c27477667630', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5000: Commerces de gros de produits agricoles → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5000', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5100: Commerce de gros de produits pétroliers → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5100', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5200: Commerces de gros de produits alimentaires → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5200', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5300: Commerces de gros de vêtements → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5300', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5400: Commerces de gros d'articles ménagers → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5400', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5500: Commerces de gros de véhicules automobiles → Automobile et transport
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5500', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5600: Commerces de gros des articles de quincaillerie → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5600', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5700: Commerces de gros de machines → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5700', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 5900: Commerces de gros de produits divers → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('5900', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6000: Commerces de détail des aliments → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6000', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6100: Commerces de détail des chaussures → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6100', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6200: Commerces de détail de meubles → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6200', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6300: Commerces de détail des véhicules automobiles → Automobile et transport
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6300', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6500: Autres commerces de détail → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6500', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 6900: Commerces de détails hors magasin → Commerce de détail
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('6900', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7000: Intermédiaires financiers de dépôts → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7000', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7100: Sociétés de crédit à la consommation et aux entreprises → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7100', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7200: Sociétés d'investissement → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7200', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7300: Sociétés des assurances → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7300', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7400: Autres intermédiaires financiers → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7400', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7500: Services immobiliers (sauf les lotisseurs) → Immobilier
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7500', '2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7600: Agences d'assurances et agences immobilières → Finance, assurance et juridique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7600', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 7700: Services aux entreprises → Services professionnels
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('7700', '944753c0-0ebf-4d74-9168-268fab04fc0d', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8100: Services de l'administration fédérale → Organismes publics et communautaires
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8100', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8200: Services de l'administration provinciale → Organismes publics et communautaires
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8200', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8300: Services des administrations locales → Organismes publics et communautaires
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8300', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8400: Organismes internationaux et autres organismes extraterritoriaux → Organismes publics et communautaires
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8400', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8500: Services d'enseignement → Éducation et formation
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8500', '783970a1-2bed-4f8e-9f1b-29bfb68cf3b3', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 8600: Services de santé et services sociaux → Santé et bien-être
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('8600', 'b6f1a7d3-9a7c-4871-bd63-2770ba99540f', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9100: Hébergement → Tourisme et hébergement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9100', 'a43306cc-1d4f-4a49-bb28-41a372889b18', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9200: Restauration → Restauration et alimentation
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9200', 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9600: Services de divertissements et de loisirs → Sports et loisirs
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9600', 'a57cc9f2-15f0-4ffe-880b-2d48f5fba09e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9700: Services personnels et domestiques → Maison et services domestiques
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9700', 'ae549a95-5732-4b7f-8aa8-4460e087acbd', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9800: Associations → Organismes publics et communautaires
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9800', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 9900: Autres services → Services professionnels
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('9900', '944753c0-0ebf-4d74-9168-268fab04fc0d', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0100: Agriculture → Agriculture et environnement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0100', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0200: Services relatifs à l'agriculture → Agriculture et environnement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0200', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0300: Pêche et piégeage → Agriculture et environnement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0300', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0400: Exploitation forestière → Agriculture et environnement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0400', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0500: Services forestiers → Agriculture et environnement
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0500', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0600: Mines → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0700: Extraction du pétrole et du gaz naturel → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0800: Carrières et gravières → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- 0900: Services miniers → Industrie, fabrication et logistique
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES ('0900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

