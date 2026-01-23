-- ÉTAPE 8: VACUUM pour libérer l'espace
-- ⚠️ ATTENTION: Cette opération peut prendre 5-10 minutes
-- Elle va verrouiller la table pendant l'exécution

VACUUM FULL ANALYZE businesses;

-- Vérifier que c'est fait
SELECT 'VACUUM terminé!' as status;
