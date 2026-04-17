-- Pillar pages for SEO internal linking
-- Each page targets a specific category × city combo
CREATE TABLE IF NOT EXISTS top_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  excerpt_fr TEXT,
  excerpt_en TEXT,
  intro_fr TEXT NOT NULL,
  intro_en TEXT,
  criteria_fr TEXT,
  criteria_en TEXT,
  conclusion_fr TEXT,
  conclusion_en TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top_pages_slug ON top_pages(slug);
CREATE INDEX IF NOT EXISTS idx_top_pages_city ON top_pages(city);
CREATE INDEX IF NOT EXISTS idx_top_pages_published ON top_pages(is_published) WHERE is_published = true;
