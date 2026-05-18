-- Bot request log — captures every Googlebot / Bingbot / AdsBot hit so we can
-- see what the search engines are crawling and how we're responding.
--
-- Written by the edge middleware in fire-and-forget mode (no awaited write).

CREATE TABLE IF NOT EXISTS public.bot_requests (
  id          BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bot         TEXT NOT NULL,           -- 'googlebot' | 'bingbot' | 'adsbot' | 'other-bot'
  user_agent  TEXT,
  method      TEXT,
  path        TEXT NOT NULL,
  status      INT NOT NULL,            -- 200, 301, 410, etc. (what middleware decided; passthrough = 0)
  action      TEXT NOT NULL,           -- 'redirect' | 'gone' | 'passthrough'
  referer     TEXT,
  country     TEXT                     -- from Vercel geo headers when available
);

CREATE INDEX IF NOT EXISTS bot_requests_bot_date ON public.bot_requests (bot, occurred_at DESC);
CREATE INDEX IF NOT EXISTS bot_requests_path     ON public.bot_requests (path);
CREATE INDEX IF NOT EXISTS bot_requests_action   ON public.bot_requests (action, occurred_at DESC);

-- Retention: purge rows older than 90 days.
-- Run this from a cron or manually:
--   DELETE FROM public.bot_requests WHERE occurred_at < NOW() - INTERVAL '90 days';
