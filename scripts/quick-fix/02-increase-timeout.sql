-- Augmenter le timeout à 10 minutes
-- Exécuter AVANT chaque création d'index
SET statement_timeout = '10min';

SELECT 'Timeout augmenté à 10 minutes' as status;
