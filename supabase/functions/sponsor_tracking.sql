-- Fonction pour incrémenter une impression (vue)
CREATE OR REPLACE FUNCTION increment_sponsor_impression(p_sponsor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insérer ou mettre à jour les stats du jour
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, v_today, 1, 0)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET
    impressions = sponsor_stats.impressions + 1,
    updated_at = NOW();
END;
$$;

-- Fonction pour incrémenter un click
CREATE OR REPLACE FUNCTION increment_sponsor_click(p_sponsor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insérer ou mettre à jour les stats du jour
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, v_today, 0, 1)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET
    clicks = sponsor_stats.clicks + 1,
    updated_at = NOW();
END;
$$;

-- Fonction pour obtenir les stats d'un sponsor sur une période
CREATE OR REPLACE FUNCTION get_sponsor_stats(
  p_sponsor_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.date,
    s.impressions,
    s.clicks,
    s.ctr
  FROM sponsor_stats s
  WHERE s.sponsor_id = p_sponsor_id
    AND s.date BETWEEN p_start_date AND p_end_date
  ORDER BY s.date DESC;
END;
$$;

-- Fonction pour obtenir les stats agrégées d'un sponsor
CREATE OR REPLACE FUNCTION get_sponsor_stats_summary(
  p_sponsor_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_impressions BIGINT,
  total_clicks BIGINT,
  avg_ctr DECIMAL(5,2),
  best_day_impressions INTEGER,
  best_day_clicks INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(s.impressions), 0)::BIGINT as total_impressions,
    COALESCE(SUM(s.clicks), 0)::BIGINT as total_clicks,
    CASE
      WHEN COALESCE(SUM(s.impressions), 0) > 0 THEN
        (COALESCE(SUM(s.clicks), 0)::DECIMAL / COALESCE(SUM(s.impressions), 0)::DECIMAL * 100)
      ELSE 0
    END as avg_ctr,
    COALESCE(MAX(s.impressions), 0)::INTEGER as best_day_impressions,
    COALESCE(MAX(s.clicks), 0)::INTEGER as best_day_clicks
  FROM sponsor_stats s
  WHERE s.sponsor_id = p_sponsor_id
    AND s.date >= CURRENT_DATE - p_days;
END;
$$;

-- Commenter les fonctions
COMMENT ON FUNCTION increment_sponsor_impression IS 'Incrémente le compteur d''impressions pour un sponsor';
COMMENT ON FUNCTION increment_sponsor_click IS 'Incrémente le compteur de clicks pour un sponsor';
COMMENT ON FUNCTION get_sponsor_stats IS 'Récupère les statistiques d''un sponsor sur une période';
COMMENT ON FUNCTION get_sponsor_stats_summary IS 'Récupère un résumé des statistiques d''un sponsor';
