import { NextResponse } from 'next/server'
import { getBusinessesSitemapXml } from '@/lib/sitemap-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Businesses with rating 0-2.0 or no rating (first 10k)
  const xml = await getBusinessesSitemapXml(0, 2.0, 10000, 0, true)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
