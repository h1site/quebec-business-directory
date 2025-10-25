-- =====================================================
-- Table: google_import_stats
-- Description: Track Google Places API import usage per day
-- Purpose: Stay within free tier (100 calls/day) by limiting to 90
-- =====================================================

-- Create table to track daily import statistics
CREATE TABLE IF NOT EXISTS google_import_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_date DATE NOT NULL DEFAULT CURRENT_DATE,
  import_count INTEGER NOT NULL DEFAULT 0,
  last_import_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one row per date
  UNIQUE(import_date)
);

-- Create index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_google_import_stats_date
  ON google_import_stats(import_date DESC);

-- =====================================================
-- Function: get_today_import_count
-- Description: Get the import count for today
-- Returns: Integer (number of imports today)
-- =====================================================
CREATE OR REPLACE FUNCTION get_today_import_count()
RETURNS INTEGER AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COALESCE(import_count, 0) INTO today_count
  FROM google_import_stats
  WHERE import_date = CURRENT_DATE;

  RETURN COALESCE(today_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: increment_import_count
-- Description: Increment today's import count by 1
-- Returns: New count
-- =====================================================
CREATE OR REPLACE FUNCTION increment_import_count()
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert or update today's count
  INSERT INTO google_import_stats (import_date, import_count, last_import_at)
  VALUES (CURRENT_DATE, 1, NOW())
  ON CONFLICT (import_date)
  DO UPDATE SET
    import_count = google_import_stats.import_count + 1,
    last_import_at = NOW(),
    updated_at = NOW()
  RETURNING import_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: check_can_import
-- Description: Check if import quota allows more imports today
-- Parameters: limit_count (default 90)
-- Returns: Boolean (true if can import, false if quota reached)
-- =====================================================
CREATE OR REPLACE FUNCTION check_can_import(limit_count INTEGER DEFAULT 90)
RETURNS BOOLEAN AS $$
DECLARE
  today_count INTEGER;
BEGIN
  today_count := get_today_import_count();
  RETURN today_count < limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: get_import_quota_info
-- Description: Get detailed quota information for today
-- Returns: JSON with quota details
-- =====================================================
CREATE OR REPLACE FUNCTION get_import_quota_info(limit_count INTEGER DEFAULT 90)
RETURNS JSON AS $$
DECLARE
  today_count INTEGER;
  result JSON;
BEGIN
  today_count := get_today_import_count();

  result := json_build_object(
    'imports_today', today_count,
    'limit', limit_count,
    'remaining', GREATEST(0, limit_count - today_count),
    'can_import', today_count < limit_count,
    'percentage_used', ROUND((today_count::NUMERIC / limit_count::NUMERIC) * 100, 1),
    'date', CURRENT_DATE
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE google_import_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read the statistics (to display on frontend)
CREATE POLICY "Anyone can read import stats"
  ON google_import_stats
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update (via backend only)
CREATE POLICY "Only service role can modify import stats"
  ON google_import_stats
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Initial data (optional)
-- =====================================================

-- Insert today's row with 0 count (optional, will be created on first import)
INSERT INTO google_import_stats (import_date, import_count)
VALUES (CURRENT_DATE, 0)
ON CONFLICT (import_date) DO NOTHING;

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant execute on functions to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_today_import_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_can_import(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_import_quota_info(INTEGER) TO anon, authenticated;

-- Only service role can increment
GRANT EXECUTE ON FUNCTION increment_import_count() TO service_role;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE google_import_stats IS 'Track daily Google Places API import usage to stay within free tier (100 calls/day)';
COMMENT ON COLUMN google_import_stats.import_date IS 'Date of imports (one row per day)';
COMMENT ON COLUMN google_import_stats.import_count IS 'Number of successful imports for this date';
COMMENT ON COLUMN google_import_stats.last_import_at IS 'Timestamp of most recent import';

COMMENT ON FUNCTION get_today_import_count() IS 'Returns the number of imports made today';
COMMENT ON FUNCTION increment_import_count() IS 'Increments todays import count by 1 and returns new count';
COMMENT ON FUNCTION check_can_import(INTEGER) IS 'Returns true if import quota allows more imports (default limit: 90)';
COMMENT ON FUNCTION get_import_quota_info(INTEGER) IS 'Returns detailed JSON with quota information for today';
