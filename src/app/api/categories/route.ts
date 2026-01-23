import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Cache categories for 1 hour (categories change rarely)
export const revalidate = 3600
export const dynamic = 'force-static'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mainCategoryId = searchParams.get('main_category_id')
  const lang = searchParams.get('lang') || 'fr'

  try {
    const supabase = createServiceClient()

    // If main_category_id is provided, fetch subcategories
    if (mainCategoryId) {
      const { data, error } = await supabase
        .from('sub_categories')
        .select(`id, slug, label_fr, label_en, main_category_id`)
        .eq('main_category_id', mainCategoryId)
        .order(lang === 'en' ? 'label_en' : 'label_fr')

      if (error) {
        console.error('Error fetching subcategories:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(
        { subcategories: data || [] },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      )
    }

    // Otherwise, fetch main categories
    const { data, error } = await supabase
      .from('main_categories')
      .select(`id, slug, label_fr, label_en`)
      .order(lang === 'en' ? 'label_en' : 'label_fr')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { categories: data || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
