-- Table pour tracker les IPs uniques par jour (déduplication)
CREATE TABLE IF NOT EXISTS sponsor_ip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  has_viewed BOOLEAN DEFAULT false,
  has_clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, ip_address, date) -- Une seule entrée par IP/sponsor/jour
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_sponsor_ip_tracking_lookup
ON sponsor_ip_tracking(sponsor_id, ip_address, date);

-- Trigger pour updated_at
CREATE TRIGGER update_sponsor_ip_tracking_updated_at
  BEFORE UPDATE ON sponsor_ip_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour tracker une impression avec déduplication IP
CREATE OR REPLACE FUNCTION track_sponsor_impression(
  p_sponsor_id UUID,
  p_ip_address TEXT
)
RETURNS BOOLEAN -- Retourne true si l'impression a été comptée, false si déjà vue aujourd'hui
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_ip INET := p_ip_address::INET;
  v_already_viewed BOOLEAN;
BEGIN
  -- Vérifier si cette IP a déjà vu ce sponsor aujourd'hui
  SELECT has_viewed INTO v_already_viewed
  FROM sponsor_ip_tracking
  WHERE sponsor_id = p_sponsor_id
    AND ip_address = v_ip
    AND date = v_today;

  -- Si déjà vu aujourd'hui, ne pas compter
  IF v_already_viewed = true THEN
    RETURN false;
  END IF;

  -- Marquer l'IP comme ayant vu le sponsor
  INSERT INTO sponsor_ip_tracking (sponsor_id, ip_address, date, has_viewed, has_clicked)
  VALUES (p_sponsor_id, v_ip, v_today, true, false)
  ON CONFLICT (sponsor_id, ip_address, date)
  DO UPDATE SET
    has_viewed = true,
    updated_at = NOW();

  -- Incrémenter les stats
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, v_today, 1, 0)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET
    impressions = sponsor_stats.impressions + 1,
    updated_at = NOW();

  RETURN true;
END;
$$;

-- Fonction pour tracker un click avec déduplication IP
CREATE OR REPLACE FUNCTION track_sponsor_click(
  p_sponsor_id UUID,
  p_ip_address TEXT
)
RETURNS BOOLEAN -- Retourne true si le click a été compté, false si déjà cliqué aujourd'hui
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_ip INET := p_ip_address::INET;
  v_already_clicked BOOLEAN;
BEGIN
  -- Vérifier si cette IP a déjà cliqué sur ce sponsor aujourd'hui
  SELECT has_clicked INTO v_already_clicked
  FROM sponsor_ip_tracking
  WHERE sponsor_id = p_sponsor_id
    AND ip_address = v_ip
    AND date = v_today;

  -- Si déjà cliqué aujourd'hui, ne pas compter
  IF v_already_clicked = true THEN
    RETURN false;
  END IF;

  -- Marquer l'IP comme ayant cliqué
  INSERT INTO sponsor_ip_tracking (sponsor_id, ip_address, date, has_viewed, has_clicked)
  VALUES (p_sponsor_id, v_ip, v_today, false, true)
  ON CONFLICT (sponsor_id, ip_address, date)
  DO UPDATE SET
    has_clicked = true,
    updated_at = NOW();

  -- Incrémenter les stats
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, v_today, 0, 1)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET
    clicks = sponsor_stats.clicks + 1,
    updated_at = NOW();

  RETURN true;
END;
$$;

-- Fonction de nettoyage automatique (supprimer les IPs de plus de 7 jours)
CREATE OR REPLACE FUNCTION cleanup_old_sponsor_ip_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM sponsor_ip_tracking
  WHERE date < CURRENT_DATE - INTERVAL '7 days';
END;
$$;

-- Commentaires
COMMENT ON TABLE sponsor_ip_tracking IS 'Tracking des IPs uniques pour déduplication des stats (une vue + un click par IP par jour)';
COMMENT ON FUNCTION track_sponsor_impression IS 'Track une impression uniquement si l''IP n''a pas déjà vu ce sponsor aujourd''hui';
COMMENT ON FUNCTION track_sponsor_click IS 'Track un click uniquement si l''IP n''a pas déjà cliqué sur ce sponsor aujourd''hui';
COMMENT ON FUNCTION cleanup_old_sponsor_ip_tracking IS 'Nettoyer les entrées IP de plus de 7 jours (à exécuter quotidiennement)';
