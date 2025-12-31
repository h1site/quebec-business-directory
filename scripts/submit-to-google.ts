/**
 * Script pour soumettre le sitemap à Google via ping
 * Usage: npx tsx scripts/submit-to-google.ts
 */

const SITEMAP_URLS = [
  'https://registreduquebec.com/sitemap-static.xml',
  'https://registreduquebec.com/sitemap-categories.xml',
  'https://registreduquebec.com/sitemap-cities.xml',
  'https://registreduquebec.com/sitemap-businesses-premium.xml',
  'https://registreduquebec.com/sitemap-enrichi.xml',
  'https://registreduquebec.com/sitemap-reviews.xml',
  'https://registreduquebec.com/sitemapindex.xml',
]

async function pingGoogle(sitemapUrl: string) {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`

  try {
    const response = await fetch(pingUrl)
    if (response.ok) {
      console.log(`✅ Pinged Google for: ${sitemapUrl}`)
    } else {
      console.log(`⚠️ Failed to ping: ${sitemapUrl} (${response.status})`)
    }
  } catch (error) {
    console.error(`❌ Error pinging: ${sitemapUrl}`, error)
  }
}

async function pingBing(sitemapUrl: string) {
  const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`

  try {
    const response = await fetch(pingUrl)
    if (response.ok) {
      console.log(`✅ Pinged Bing for: ${sitemapUrl}`)
    } else {
      console.log(`⚠️ Failed to ping Bing: ${sitemapUrl} (${response.status})`)
    }
  } catch (error) {
    console.error(`❌ Error pinging Bing: ${sitemapUrl}`, error)
  }
}

async function main() {
  console.log('🚀 Submitting sitemaps to search engines...\n')

  console.log('=== Google ===')
  for (const url of SITEMAP_URLS) {
    await pingGoogle(url)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s between requests
  }

  console.log('\n=== Bing ===')
  for (const url of SITEMAP_URLS) {
    await pingBing(url)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n✅ Done! Sitemaps submitted to Google and Bing.')
  console.log('\n📝 Next steps:')
  console.log('1. Go to Google Search Console')
  console.log('2. Use URL Inspection tool for important pages')
  console.log('3. Click "Request Indexing" for each')
}

main()
