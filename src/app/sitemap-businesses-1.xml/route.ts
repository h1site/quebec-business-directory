import { NextResponse } from 'next/server'
import { getBusinessesSitemapXml } from '@/lib/sitemap-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Businesses with rating 4.0-4.5 (first 10k)
  const xml = await getBusinessesSitemapXml(4.0, 4.5, 10000, 0)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
