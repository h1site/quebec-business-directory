/**
 * Google Search Console Data Fetcher
 *
 * Fetches all pages + keywords from GSC via OAuth2.
 * First run: opens browser for auth, saves token to scripts/.gsc-token.json.
 * Next runs: uses saved token (auto-refreshes when expired).
 *
 * Usage:
 *   node scripts/gsc-fetch-data.js                    # Last 28 days, top 100 pages
 *   node scripts/gsc-fetch-data.js --days=90          # Last 90 days
 *   node scripts/gsc-fetch-data.js --page=/blogue/    # Filter by URL substring
 *   node scripts/gsc-fetch-data.js --type=indexation  # Indexation summary instead of keywords
 *
 * Env vars (.env.local):
 *   GSC_CLIENT_ID       — Google OAuth client ID
 *   GSC_CLIENT_SECRET   — Google OAuth client secret
 *   GSC_SITE_URL        — defaults to https://registreduquebec.com
 */

require('dotenv').config({ path: '.env.local' })

const { google } = require('googleapis')
const http = require('http')
const fs = require('fs')
const path = require('path')

const CLIENT_ID = process.env.GSC_CLIENT_ID
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET
const SITE_URL = process.env.GSC_SITE_URL || 'https://registreduquebec.com'
const TOKEN_PATH = path.join(__dirname, '.gsc-token.json')
const REDIRECT_URI = 'http://localhost:3333'

const DAYS = parseInt(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] || '28', 10)
const PAGE_FILTER = process.argv.find((a) => a.startsWith('--page='))?.split('=')[1]
const REPORT_TYPE = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1] || 'keywords'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing GSC_CLIENT_ID or GSC_CLIENT_SECRET in .env.local')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

async function getAuthToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
    oauth2Client.setCredentials(token)

    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log('🔄 Refreshing expired token...')
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials))
      console.log('✅ Token refreshed')
    }
    return
  }

  console.log('🔐 First-time authentication required...')

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    prompt: 'consent',
  })

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:3333')
        const code = url.searchParams.get('code')
        if (!code) return

        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end('<h1>✅ Authentification réussie</h1><p>Tu peux fermer cette fenêtre.</p>')

        console.log('✅ Token saved')
        server.close()
        resolve()
      } catch (err) {
        res.writeHead(500)
        res.end('Error')
        reject(err)
      }
    })

    server.listen(3333, () => {
      console.log('\n👉 Ouvre ce lien dans ton navigateur:\n')
      console.log(authUrl)
      console.log('\n⏳ En attente de l\'authentification...\n')
      const { exec } = require('child_process')
      exec(`open "${authUrl}"`)
    })
  })
}

async function listSites() {
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client })
  const sites = await searchconsole.sites.list()
  console.log('📋 Sites disponibles:')
  for (const site of sites.data.siteEntry || []) {
    console.log(`  ${site.siteUrl} (${site.permissionLevel})`)
  }
  console.log('')
}

async function fetchKeywordReport() {
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - DAYS)
  const range = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }

  console.log(`📅 Période: ${range.startDate} → ${range.endDate} (${DAYS} jours)\n`)

  const pageFilters = PAGE_FILTER
    ? [{ dimension: 'page', operator: 'contains', expression: PAGE_FILTER }]
    : []

  console.log('📊 Fetching pages...')
  const pagesResp = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ['page'],
      dimensionFilterGroups: pageFilters.length ? [{ filters: pageFilters }] : undefined,
      rowLimit: 5000,
    },
  })

  const pages = (pagesResp.data.rows || []).map((row) => ({
    page: (row.keys || [])[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }))

  console.log(`  ✅ ${pages.length} pages found\n`)

  console.log('🔍 Fetching keywords per page (top 100 by impressions)...')
  const topPages = pages.sort((a, b) => b.impressions - a.impressions).slice(0, PAGE_FILTER ? pages.length : 100)
  const results = []

  for (let i = 0; i < topPages.length; i++) {
    const page = topPages[i]
    if (i % 10 === 0) {
      console.log(`  [${i + 1}/${topPages.length}] ${page.page.replace(SITE_URL, '')}`)
    }
    try {
      const queryResp = await searchconsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
          startDate: range.startDate,
          endDate: range.endDate,
          dimensions: ['query'],
          dimensionFilterGroups: [{
            filters: [{ dimension: 'page', operator: 'equals', expression: page.page }],
          }],
          rowLimit: 50,
        },
      })
      const keywords = (queryResp.data.rows || []).map((row) => ({
        query: (row.keys || [])[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      }))
      results.push({ ...page, keywords })
      await new Promise((r) => setTimeout(r, 100))
    } catch (err) {
      console.error(`  ❌ Error for ${page.page}:`, err.message)
      results.push({ ...page, keywords: [] })
    }
  }

  return results
}

function printKeywordReport(data) {
  data.sort((a, b) => b.clicks - a.clicks)

  console.log('\n\n' + '='.repeat(100))
  console.log('📊 TOP PAGES PAR CLICS')
  console.log('='.repeat(100))

  for (const page of data.slice(0, 30)) {
    const url = page.page.replace(SITE_URL, '')
    console.log(`\n📄 ${url}`)
    console.log(`   Clics: ${page.clicks} | Impressions: ${page.impressions} | CTR: ${(page.ctr * 100).toFixed(1)}% | Position: ${page.position.toFixed(1)}`)
    if (page.keywords.length > 0) {
      console.log('   Keywords:')
      for (const kw of page.keywords.slice(0, 10)) {
        console.log(`     "${kw.query}" → ${kw.clicks} clics, ${kw.impressions} imp, ${(kw.ctr * 100).toFixed(1)}% CTR, pos ${kw.position.toFixed(1)}`)
      }
    }
  }

  console.log('\n\n' + '='.repeat(100))
  console.log('🎯 QUICK WINS (position 5-20, ≥50 impressions, CTR <5%)')
  console.log('='.repeat(100))

  const quickWins = []
  for (const page of data) {
    for (const kw of page.keywords) {
      if (kw.position >= 5 && kw.position <= 20 && kw.impressions >= 50 && kw.ctr < 0.05) {
        quickWins.push({
          url: page.page.replace(SITE_URL, ''),
          query: kw.query,
          clicks: kw.clicks,
          impressions: kw.impressions,
          ctr: kw.ctr,
          position: kw.position,
        })
      }
    }
  }
  quickWins.sort((a, b) => b.impressions - a.impressions)

  for (const qw of quickWins.slice(0, 20)) {
    console.log(`\n  "${qw.query}" → pos ${qw.position.toFixed(1)}, ${qw.impressions} imp, ${(qw.ctr * 100).toFixed(1)}% CTR`)
    console.log(`  Page: ${qw.url}`)
    console.log(`  💡 Optimiser → estim. ~${Math.round(qw.impressions * 0.08)} clics/mois`)
  }

  const outputPath = path.join(__dirname, `gsc-data-${new Date().toISOString().split('T')[0]}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`\n\n💾 Données complètes sauvegardées: ${outputPath}`)

  const totalClicks = data.reduce((s, p) => s + p.clicks, 0)
  const totalImpressions = data.reduce((s, p) => s + p.impressions, 0)
  console.log(`\n📊 Total: ${totalClicks} clics | ${totalImpressions} impressions | ${data.length} pages | ${quickWins.length} quick wins`)
}

async function fetchIndexationReport() {
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - DAYS)
  const range = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }

  console.log(`📅 Période: ${range.startDate} → ${range.endDate} (${DAYS} jours)\n`)
  console.log('📊 Fetching all pages with impressions...')

  const pagesResp = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ['page'],
      rowLimit: 25000,
    },
  })

  const pages = pagesResp.data.rows || []
  console.log(`\n📊 RÉSUMÉ INDEXATION (pages avec impressions GSC)`)
  console.log('='.repeat(80))
  console.log(`Pages avec ≥1 impression : ${pages.length.toLocaleString()}`)

  const buckets = {
    '/entreprise/': 0,
    '/en/company/': 0,
    '/categorie/': 0,
    '/ville/': 0,
    '/blogue/': 0,
    '/region/': 0,
    '/top/': 0,
    '/recherche': 0,
    '/en/search': 0,
    'autre': 0,
  }
  for (const row of pages) {
    const url = (row.keys || [])[0] || ''
    let matched = false
    for (const prefix of Object.keys(buckets)) {
      if (prefix !== 'autre' && url.includes(prefix)) {
        buckets[prefix]++
        matched = true
        break
      }
    }
    if (!matched) buckets.autre++
  }

  console.log('\nRépartition par section :')
  for (const [prefix, count] of Object.entries(buckets).sort((a, b) => b[1] - a[1])) {
    if (count > 0) console.log(`  ${prefix.padEnd(20)} ${count.toString().padStart(6)} pages`)
  }

  const outputPath = path.join(__dirname, `gsc-indexation-${new Date().toISOString().split('T')[0]}.json`)
  fs.writeFileSync(outputPath, JSON.stringify({ totalPages: pages.length, buckets, pages: pages.map((r) => ({ url: r.keys[0], impressions: r.impressions, clicks: r.clicks })) }, null, 2))
  console.log(`\n💾 Détail: ${outputPath}`)
}

async function main() {
  console.log('🔍 Google Search Console Data Fetcher\n')
  await getAuthToken()
  await listSites()

  if (REPORT_TYPE === 'indexation') {
    await fetchIndexationReport()
  } else {
    const data = await fetchKeywordReport()
    printKeywordReport(data)
  }
}

main().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
