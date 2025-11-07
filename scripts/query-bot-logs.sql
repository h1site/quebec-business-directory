-- Query bot visit logs and statistics

-- 1. View recent bot visits (last 100)
SELECT
  created_at,
  bot_type,
  path,
  status_code,
  indexable,
  indexable_reason,
  page_type,
  business_slug,
  redirect_to,
  redirect_reason,
  response_time_ms
FROM bot_visit_logs
ORDER BY created_at DESC
LIMIT 100;

-- 2. Count visits by bot type and indexability
SELECT
  bot_type,
  indexable,
  indexable_reason,
  COUNT(*) as visit_count
FROM bot_visit_logs
GROUP BY bot_type, indexable, indexable_reason
ORDER BY visit_count DESC;

-- 3. View non-indexable pages (most common issues)
SELECT * FROM non_indexable_pages
LIMIT 50;

-- 4. View bot visit statistics by date
SELECT * FROM bot_visit_stats
WHERE visit_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY visit_date DESC, visit_count DESC;

-- 5. View redirect statistics
SELECT
  redirect_reason,
  COUNT(*) as redirect_count,
  COUNT(DISTINCT business_slug) as unique_businesses
FROM bot_visit_logs
WHERE status_code = 301
GROUP BY redirect_reason
ORDER BY redirect_count DESC;

-- 6. View 404 errors by bot type
SELECT
  bot_type,
  path,
  COUNT(*) as error_count,
  MAX(created_at) as last_seen
FROM bot_visit_logs
WHERE status_code = 404
GROUP BY bot_type, path
ORDER BY error_count DESC
LIMIT 50;

-- 7. View response time statistics
SELECT
  page_type,
  bot_type,
  AVG(response_time_ms) as avg_response_time,
  MIN(response_time_ms) as min_response_time,
  MAX(response_time_ms) as max_response_time,
  COUNT(*) as request_count
FROM bot_visit_logs
WHERE response_time_ms IS NOT NULL
GROUP BY page_type, bot_type
ORDER BY avg_response_time DESC;

-- 8. View pages with missing canonical tags
SELECT
  page_type,
  path,
  COUNT(*) as occurrence_count
FROM bot_visit_logs
WHERE has_canonical = false AND indexable = true
GROUP BY page_type, path
ORDER BY occurrence_count DESC
LIMIT 30;

-- 9. View Googlebot vs Bingbot indexability comparison
SELECT
  bot_type,
  page_type,
  COUNT(*) as total_visits,
  SUM(CASE WHEN indexable THEN 1 ELSE 0 END) as indexable_visits,
  ROUND(100.0 * SUM(CASE WHEN indexable THEN 1 ELSE 0 END) / COUNT(*), 2) as indexable_percentage
FROM bot_visit_logs
GROUP BY bot_type, page_type
ORDER BY bot_type, total_visits DESC;

-- 10. View most visited businesses by bots
SELECT
  business_slug,
  COUNT(*) as visit_count,
  COUNT(DISTINCT bot_type) as unique_bots,
  MAX(created_at) as last_visit
FROM bot_visit_logs
WHERE business_slug IS NOT NULL
GROUP BY business_slug
ORDER BY visit_count DESC
LIMIT 50;
