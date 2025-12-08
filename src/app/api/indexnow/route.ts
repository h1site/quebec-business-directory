import { NextRequest, NextResponse } from 'next/server'

const INDEXNOW_KEY = '5d17e0f050b4a9ebf837714e925f3dbb'
const SITE_URL = 'https://registreduquebec.com'

// IndexNow endpoints
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
]

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Limit to 10,000 URLs per request (IndexNow limit)
    const urlsToSubmit = urls.slice(0, 10000)

    const payload = {
      host: 'registreduquebec.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urlsToSubmit,
    }

    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        return {
          endpoint,
          status: response.status,
          ok: response.ok,
        }
      })
    )

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.ok
    ).length

    return NextResponse.json({
      success: true,
      message: `Submitted ${urlsToSubmit.length} URLs to ${successCount}/${INDEXNOW_ENDPOINTS.length} endpoints`,
      urlsSubmitted: urlsToSubmit.length,
      results: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ),
    })
  } catch (error) {
    console.error('IndexNow error:', error)
    return NextResponse.json(
      { error: 'Failed to submit to IndexNow' },
      { status: 500 }
    )
  }
}

// GET endpoint to submit important pages
export async function GET() {
  const importantUrls = [
    SITE_URL,
    `${SITE_URL}/en`,
    `${SITE_URL}/recherche`,
    `${SITE_URL}/en/search`,
    `${SITE_URL}/parcourir/categories`,
    `${SITE_URL}/en/browse/categories`,
    `${SITE_URL}/a-propos`,
    `${SITE_URL}/en/about`,
    `${SITE_URL}/faq`,
    `${SITE_URL}/en/faq`,
    `${SITE_URL}/blogue`,
    `${SITE_URL}/en/blog`,
  ]

  const payload = {
    host: 'registreduquebec.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: importantUrls,
  }

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      return {
        endpoint,
        status: response.status,
        ok: response.ok,
      }
    })
  )

  return NextResponse.json({
    success: true,
    message: 'Submitted important pages to IndexNow',
    urls: importantUrls,
    results: results.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: r.reason }
    ),
  })
}
