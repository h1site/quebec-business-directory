/**
 * Build a snapshot of pages with ≥1 click in the last 12 months.
 *
 * Sources: Google Search Console + Bing Webmaster Tools.
 * Output: scripts/pages-database/snapshot-YYYY-MM-DD.json + latest.json
 *
 * Use cases supported by the schema:
 *   1. Indexation priority    → use `should_keep_indexed` field
 *   2. Audit / reporting      → compare snapshots over time (snapshot_date)
 *   3. Content optimization   → use `opportunity_score` to find under-performers
 *
 * Usage:
 *   node scripts/build-pages-database.js
 *   node scripts/build-pages-database.js --days=90
 */

require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')

const DAYS = parseInt(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] || '365', 10)
const OUT_DIR = path.join(__dirname, 'pages-database')
fs.mkdirSync(OUT_DIR, { recursive: true })

const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10)

// ── helpers ────────────────────────────────────────────────────────────────

function normalize(u) {
  try {
    const url = new URL(u)
    return url.pathname.replace(/\/+$/, '') || '/'
  } catch {
    return u
  }
}

function sectionOf(p) {
  if (p.startsWith('/entreprise/')) return '/entreprise/'
  if (p.startsWith('/en/company/')) return '/en/company/'
  if (p.startsWith('/categorie/')) return '/categorie/'
  if (p.startsWith('/ville/')) return '/ville/'
  if (p.startsWith('/blogue/')) return '/blogue/'
  if (p.startsWith('/region/')) return '/region/'
  if (p.startsWith('/top/')) return '/top/'
  if (p.startsWith('/recherche')) return '/recherche'
  if (p.startsWith('/en/')) return '/en/*'
  if (p === '/' || p === '') return '/ (home)'
  return 'autre (old URLs)'
}

// ── GSC ────────────────────────────────────────────────────────────────────

async function fetchGSC() {
  const TOKEN_PATH = path.join(__dirname, '.gsc-token.json')
  const oauth2 = new google.auth.OAuth2(
    process.env.GSC_CLIENT_ID,
    process.env.GSC_CLIENT_SECRET,
    'http://localhost:3333'
  )
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'))
  oauth2.setCredentials(token)
  if (token.expiry_date && token.expiry_date < Date.now()) {
    const { credentials } = await oauth2.refreshAccessToken()
    oauth2.setCredentials(credentials)
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials))
  }
  const sc = google.searchconsole({ version: 'v1', auth: oauth2 })

  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - DAYS)

  let all = []
  let startRow = 0
  while (true) {
    const res = await sc.searchanalytics.query({
      siteUrl: process.env.GSC_SITE_URL || 'sc-domain:registreduquebec.com',
      requestBody: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: ['page'],
        rowLimit: 25000,
        startRow,
      },
    })
    const rows = res.data.rows || []
    all = all.concat(rows)
    if (rows.length < 25000) break
    startRow += 25000
  }

  return all
    .filter((r) => (r.clicks || 0) >= 1)
    .map((r) => ({
      url: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position,
    }))
}

// ── Bing ───────────────────────────────────────────────────────────────────

async function fetchBing() {
  const SITE = process.env.BING_SITE_URL
  const KEY = process.env.BING_API_KEY
  const url = `https://ssl.bing.com/webmaster/api.svc/json/GetPageStats?siteUrl=${encodeURIComponent(SITE)}&apikey=${KEY}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.ErrorCode) throw new Error(`Bing API error ${json.ErrorCode}: ${json.Message}`)
  const rows = json.d || []

  const agg = {}
  for (const r of rows) {
    const u = r.Query
    if (!u) continue
    agg[u] = agg[u] || { clicks: 0, impressions: 0, positions: [] }
    agg[u].clicks += r.Clicks || 0
    agg[u].impressions += r.Impressions || 0
    const p = r.AvgImpressionPosition || 0
    if (p > 0) agg[u].positions.push(p)
  }

  return Object.entries(agg)
    .filter(([_, v]) => v.clicks >= 1)
    .map(([url, v]) => ({
      url,
      clicks: v.clicks,
      impressions: v.impressions,
      position: v.positions.length ? v.positions.reduce((a, b) => a + b, 0) / v.positions.length : 0,
    }))
}

// ── merge ──────────────────────────────────────────────────────────────────

function merge(gsc, bing) {
  const m = {}
  for (const r of gsc) {
    const p = normalize(r.url)
    m[p] = m[p] || baseRow(p)
    m[p].gsc_clicks += r.clicks
    m[p].gsc_impressions += r.impressions
    m[p].gsc_position = r.position
  }
  for (const r of bing) {
    const p = normalize(r.url)
    m[p] = m[p] || baseRow(p)
    m[p].bing_clicks += r.clicks
    m[p].bing_impressions += r.impressions
    m[p].bing_position = r.position
  }

  return Object.values(m).map(enrich).sort((a, b) => b.total_clicks - a.total_clicks)
}

function baseRow(p) {
  return {
    path: p,
    section: sectionOf(p),
    snapshot_date: SNAPSHOT_DATE,
    gsc_clicks: 0,
    gsc_impressions: 0,
    gsc_position: null,
    bing_clicks: 0,
    bing_impressions: 0,
    bing_position: null,
  }
}

function enrich(r) {
  r.total_clicks = r.gsc_clicks + r.bing_clicks
  r.total_impressions = r.gsc_impressions + r.bing_impressions
  r.source = r.gsc_clicks > 0 && r.bing_clicks > 0 ? 'both' : r.gsc_clicks > 0 ? 'gsc' : 'bing'
  r.avg_position = (() => {
    const pos = [r.gsc_position, r.bing_position].filter((p) => p && p > 0)
    return pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : null
  })()

  // Use case 1: indexation priority — keep indexed if any clicks
  r.should_keep_indexed = r.total_clicks >= 1

  // Use case 3: opportunity score — high impressions, low CTR, mid-range position
  const ctr = r.total_impressions ? r.total_clicks / r.total_impressions : 0
  const posOK = r.avg_position && r.avg_position >= 5 && r.avg_position <= 20
  r.opportunity_score = posOK && r.total_impressions >= 50 && ctr < 0.05
    ? Math.round(r.total_impressions * 0.04 - r.total_clicks)
    : 0

  return r
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Building pages database (last ${DAYS} days)\n`)

  console.log('📊 GSC...')
  const gsc = await fetchGSC()
  console.log(`  ${gsc.length} pages with ≥1 click`)

  console.log('📊 Bing...')
  const bing = await fetchBing()
  console.log(`  ${bing.length} pages with ≥1 click`)

  console.log('\n🔀 Merging...')
  const merged = merge(gsc, bing)
  console.log(`  ${merged.length} unique pages`)

  // Section breakdown
  const buckets = {}
  for (const r of merged) {
    buckets[r.section] = buckets[r.section] || { pages: 0, clicks: 0 }
    buckets[r.section].pages++
    buckets[r.section].clicks += r.total_clicks
  }
  console.log('\nRépartition:')
  console.log(`${'Section'.padEnd(20)} ${'Pages'.padStart(6)} ${'Clics'.padStart(7)}`)
  for (const [b, v] of Object.entries(buckets).sort((a, b) => b[1].clicks - a[1].clicks)) {
    console.log(`${b.padEnd(20)} ${String(v.pages).padStart(6)} ${v.clicks.toLocaleString().padStart(7)}`)
  }

  // Source breakdown
  const bySource = { both: 0, gsc: 0, bing: 0 }
  for (const r of merged) bySource[r.source]++
  console.log(`\nSources: both=${bySource.both}  gsc only=${bySource.gsc}  bing only=${bySource.bing}`)

  // Opportunities (use case 3)
  const oppCount = merged.filter((r) => r.opportunity_score > 0).length
  console.log(`Opportunities (pos 5-20, ≥50 impr, CTR <5%): ${oppCount}`)

  // Write snapshot
  const snapshotPath = path.join(OUT_DIR, `snapshot-${SNAPSHOT_DATE}.json`)
  const latestPath = path.join(OUT_DIR, 'latest.json')
  fs.writeFileSync(snapshotPath, JSON.stringify(merged, null, 2))
  fs.writeFileSync(latestPath, JSON.stringify(merged, null, 2))
  console.log(`\n💾 ${snapshotPath}`)
  console.log(`💾 ${latestPath}`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
