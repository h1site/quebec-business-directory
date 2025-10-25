-- Fonction SQL pour assigner les catégories en masse
-- Cette fonction s'exécute côté serveur, donc pas de timeout!

-- Supprimer l'ancienne version si elle existe
DROP FUNCTION IF EXISTS assign_categories_from_act_econ();

CREATE OR REPLACE FUNCTION assign_categories_from_act_econ()
RETURNS TABLE(
  total_updated BIGINT,
  codes_processed INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_updated BIGINT := 0;
  v_codes_processed INTEGER := 0;
  v_code RECORD;
BEGIN
  -- Boucle sur tous les mappings ACT_ECON avec confidence >= 0.5
  FOR v_code IN
    SELECT DISTINCT
      act_econ_code,
      main_category_id,
      sub_category_id
    FROM act_econ_category_mappings
    WHERE confidence_score >= 0.5
    ORDER BY act_econ_code
  LOOP
    -- Mettre à jour toutes les businesses avec ce code ACT_ECON
    WITH updated AS (
      UPDATE businesses
      SET categories = CASE
        WHEN v_code.sub_category_id IS NOT NULL THEN
          ARRAY[v_code.main_category_id, v_code.sub_category_id]
        ELSE
          ARRAY[v_code.main_category_id]
        END
      WHERE act_econ_code = v_code.act_econ_code
        AND (categories IS NULL OR categories = '{}')
      RETURNING id
    )
    SELECT COUNT(*) INTO v_total_updated FROM updated;

    v_codes_processed := v_codes_processed + 1;

    -- Log progress tous les 50 codes
    IF v_codes_processed % 50 = 0 THEN
      RAISE NOTICE 'Processed % codes, % businesses updated so far',
        v_codes_processed, v_total_updated;
    END IF;
  END LOOP;

  -- Retourner les statistiques
  RETURN QUERY SELECT v_total_updated, v_codes_processed;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION assign_categories_from_act_econ() TO anon;
GRANT EXECUTE ON FUNCTION assign_categories_from_act_econ() TO authenticated;

-- Pour exécuter la fonction:
-- SELECT * FROM assign_categories_from_act_econ();
