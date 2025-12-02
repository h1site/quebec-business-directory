import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export interface BlogArticle {
  id: string
  slug: string
  title_fr: string
  title_en: string
  excerpt_fr: string
  excerpt_en: string
  content_fr: string
  content_en: string
  youtube_url: string | null
  thumbnail_url: string | null
  published_at: string
  created_at: string
  is_published: boolean
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'fr'

  try {
    const supabase = createServiceClient()

    // Try to fetch from blog_articles table
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return NextResponse.json({ articles: data, source: 'supabase' })
    }

    // If table doesn't exist or is empty, return empty array
    // The blog page will show a placeholder message
    return NextResponse.json({
      articles: [],
      source: 'none',
      message: 'No blog articles table found. Create the table in Supabase with the provided schema.'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/*
-- SQL to create the blog_articles table in Supabase:

CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_fr VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  excerpt_fr TEXT,
  excerpt_en TEXT,
  content_fr TEXT,
  content_en TEXT,
  youtube_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published articles
CREATE POLICY "Public can read published articles"
ON blog_articles FOR SELECT
USING (is_published = true);

-- Example insert:
INSERT INTO blog_articles (slug, title_fr, title_en, excerpt_fr, excerpt_en, youtube_url, is_published) VALUES
('comment-creer-fiche-entreprise',
 'Comment créer une fiche d''entreprise',
 'How to create a business listing',
 'Apprenez à créer votre fiche d''entreprise sur Registre du Québec.',
 'Learn how to create your business listing on Quebec Registry.',
 'https://www.youtube.com/watch?v=XXXX',
 true);
*/
