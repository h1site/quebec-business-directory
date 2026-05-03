import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 86400 // 24 hours

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page: pageParam } = await params
  const page = parseInt(pageParam, 10)

  if (isNaN(page) || page < 1) {
    return new NextResponse('Invalid page', { status: 400 })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
