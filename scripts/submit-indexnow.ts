/**
 * Submit URLs to IndexNow (Bing, Yandex)
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow.ts [--limit=1000] [--type=reviews|enriched|all]
 */

import { createClient } from '@supabase/supabase-js'

const INDEXNOW_KEY = '5d17e0f050b4a9ebf837714e925f3dbb'
const SITE_URL = 'https://registreduquebec.com'

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
]

const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '1000')
const TYPE = process.argv.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'all'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(url, key)
}

async function submitToIndexNow(urls: string[]): Promise<void> {
  console.log(`\n📤 Submitting ${urls.length} URLs to IndexNow...`)

  // IndexNow limit is 10,000 URLs per request
  const batches = []
  for (let i = 0; i < urls.length; i += 10000) {
    batches.push(urls.slice(i, i + 10000))
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`   Batch ${i + 1}/${batches.length} (${batch.length} URLs)`)

    const payload = {
      host: 'registreduquebec.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    }

    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        return { endpoint, status: response.status, ok: response.ok }
      })
    )

    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        const { endpoint, status, ok } = r.value
        const name = endpoint.includes('bing') ? 'Bing' : endpoint.includes('yandex') ? 'Yandex' : 'IndexNow'
        console.log(`      ${ok ? '✅' : '❌'} ${name}: ${status}`)
      } else {
        console.log(`      ❌ Error: ${r.reason}`)
      }
    })

    // Small delay between batches
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

async function main() {
  console.log('🚀 IndexNow URL Submission')
  console.log(`   Type: ${TYPE}`)
  console.log(`   Limit: ${LIMIT}`)

  const supabase = getSupabaseClient()
  const urls: string[] = []

  // Add static important pages
  const staticPages = [
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
  urls.push(...staticPages)
  console.log(`\n📄 Added ${staticPages.length} static pages`)

  // Get ALL businesses (paginate to get all results)
  console.log('\n🔍 Fetching all businesses...')
  let allBusinesses: { slug: string }[] = []
  let page = 0
  const pageSize = 1000

  while (true) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug')
      .not('slug', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('❌ Error fetching businesses:', error)
      break
    }

    if (!businesses || businesses.length === 0) {
      break
    }

    allBusinesses = allBusinesses.concat(businesses)
    console.log(`   Page ${page + 1}: ${businesses.length} businesses (total: ${allBusinesses.length})`)
    page++
  }

  allBusinesses.forEach((b) => {
    urls.push(`${SITE_URL}/entreprise/${b.slug}`)
  })
  console.log(`   Found ${allBusinesses.length} total businesses`)

  // Remove duplicates
  const uniqueUrls = [...new Set(urls)]
  console.log(`\n📊 Total unique URLs: ${uniqueUrls.length}`)

  // Submit to IndexNow
  await submitToIndexNow(uniqueUrls)

  console.log('\n✅ Done!')
}

main().catch(console.error)
