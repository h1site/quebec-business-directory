-- Create table for bot visit logging
CREATE TABLE IF NOT EXISTS bot_visit_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Bot identification
  bot_type VARCHAR(50) NOT NULL, -- 'googlebot', 'bingbot', 'other'
  user_agent TEXT,

  -- Request details
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params JSONB,
  method VARCHAR(10) DEFAULT 'GET',

  -- Response details
  status_code INT NOT NULL,
  indexable BOOLEAN NOT NULL DEFAULT true,
  indexable_reason TEXT, -- Reason if not indexable: '404', 'redirect', 'error', etc.

  -- Page details
  page_type VARCHAR(50), -- 'business', 'category', 'city', 'blog', 'static', etc.
  business_id BIGINT,
  business_slug VARCHAR(255),
  category_slug VARCHAR(255),
  city_slug VARCHAR(255),
  blog_slug VARCHAR(255),

  -- Redirect info (if applicable)
  redirect_to TEXT,
  redirect_reason TEXT, -- 'wrong_category', 'missing_city', etc.

  -- SEO details
  has_canonical BOOLEAN DEFAULT false,
  canonical_url TEXT,
  has_meta_tags BOOLEAN DEFAULT false,
  has_schema_org BOOLEAN DEFAULT false,

  -- Performance
  response_time_ms INT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_visit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_bot_type ON bot_visit_logs(bot_type);
CREATE INDEX IF NOT EXISTS idx_bot_logs_status_code ON bot_visit_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_bot_logs_indexable ON bot_visit_logs(indexable);
CREATE INDEX IF NOT EXISTS idx_bot_logs_page_type ON bot_visit_logs(page_type);
CREATE INDEX IF NOT EXISTS idx_bot_logs_business_slug ON bot_visit_logs(business_slug);
CREATE INDEX IF NOT EXISTS idx_bot_logs_url ON bot_visit_logs(url);

-- Create a view for quick stats
CREATE OR REPLACE VIEW bot_visit_stats AS
SELECT
  bot_type,
  page_type,
  status_code,
  indexable,
  indexable_reason,
  COUNT(*) as visit_count,
  AVG(response_time_ms) as avg_response_time,
  DATE(created_at) as visit_date
FROM bot_visit_logs
GROUP BY bot_type, page_type, status_code, indexable, indexable_reason, DATE(created_at)
ORDER BY visit_date DESC, visit_count DESC;

-- Create a view for non-indexable pages
CREATE OR REPLACE VIEW non_indexable_pages AS
SELECT
  url,
  bot_type,
  status_code,
  indexable_reason,
  redirect_to,
  redirect_reason,
  COUNT(*) as occurrence_count,
  MAX(created_at) as last_seen,
  MIN(created_at) as first_seen
FROM bot_visit_logs
WHERE indexable = false
GROUP BY url, bot_type, status_code, indexable_reason, redirect_to, redirect_reason
ORDER BY occurrence_count DESC, last_seen DESC;

COMMENT ON TABLE bot_visit_logs IS 'Logs all bot visits (Googlebot, Bingbot, etc.) to track indexability and SEO issues';
COMMENT ON COLUMN bot_visit_logs.indexable IS 'Whether the page should be indexed by search engines';
COMMENT ON COLUMN bot_visit_logs.indexable_reason IS 'If not indexable, the reason: 404, 301_redirect, 500_error, no_content, etc.';
