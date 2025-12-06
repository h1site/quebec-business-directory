import { NextResponse } from 'next/server'
import { getBusinessesSitemapXml } from '@/lib/sitemap-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Businesses with rating 2.0-3.0 (first 10k)
  const xml = await getBusinessesSitemapXml(2.0, 3.0, 10000, 0)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
