/**
 * Bing Webmaster Tools Data Fetcher
 *
 * Pulls traffic stats, top pages, top queries from Bing.
 * Uses simple API key auth (no OAuth).
 *
 * Usage:
 *   node scripts/bing-fetch-data.js              # full report (traffic + pages + queries)
 *   node scripts/bing-fetch-data.js --type=traffic
 *   node scripts/bing-fetch-data.js --type=pages
 *   node scripts/bing-fetch-data.js --type=queries
 *   node scripts/bing-fetch-data.js --type=quickwins   # pages avec CTR < 2% en position 5-15
 *
 * Env vars (.env.local):
 *   BING_API_KEY    — Bing Webmaster Tools API key (Settings → API Access)
 *   BING_SITE_URL   — defaults to https://registreduquebec.com/
 */

require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')

const API_KEY = process.env.BING_API_KEY
const SITE_URL = process.env.BING_SITE_URL || 'https://registreduquebec.com/'
const REPORT_TYPE = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1] || 'all'

if (!API_KEY) {
  console.error('❌ Missing BING_API_KEY in .env.local')
  process.exit(1)
}

const BASE = 'https://ssl.bing.com/webmaster/api.svc/json'

async function call(endpoint, params = {}) {
  const qs = new URLSearchParams({ siteUrl: SITE_URL, apikey: API_KEY, ...params })
  const url = `${BASE}/${endpoint}?${qs}`
  const res = await fetch(url)
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Bad JSON from ${endpoint}: ${text.slice(0, 200)}`)
  }
  if (json.ErrorCode) {
    throw new Error(`Bing API error ${json.ErrorCode}: ${json.Message}`)
  }
  return json.d || []
}

function parseBingDate(s) {
  const m = /\((\d+)/.exec(s || '')
  return m ? new Date(parseInt(m[1], 10)) : null
}

function fmt(n) {
  return n.toLocaleString('en-US')
}

function sectionOf(url) {
  const u = url.replace(/^https?:\/\/(www\.)?registreduquebec\.com/, '')
  if (u.startsWith('/entreprise/')) return '/entreprise/'
  if (u.startsWith('/en/company/')) return '/en/company/'
  if (u.startsWith('/categorie/')) return '/categorie/'
  if (u.startsWith('/ville/')) return '/ville/'
  if (u.startsWith('/blogue/')) return '/blogue/'
  if (u.startsWith('/region/')) return '/region/'
  if (u.startsWith('/top/')) return '/top/'
  if (u.startsWith('/recherche')) return '/recherche'
  if (u.startsWith('/en/')) return '/en/*'
  if (u === '' || u === '/') return '/ (home)'
  return 'autre'
}

async function reportTraffic() {
  console.log('\n=== TRAFFIC HISTORIQUE ===')
  const rows = await call('GetRankAndTrafficStats')

  const parsed = rows.map((r) => ({
    date: parseBingDate(r.Date),
    clicks: r.Clicks || 0,
    impressions: r.Impressions || 0,
    avgClickPos: r.AvgClickPosition || 0,
    avgImprPos: r.AvgImpressionPosition || 0,
  })).filter((r) => r.date).sort((a, b) => a.date - b.date)

  if (!parsed.length) {
    console.log('Aucune donnée.')
    return
  }

  const totalC = parsed.reduce((s, r) => s + r.clicks, 0)
  const totalI = parsed.reduce((s, r) => s + r.impressions, 0)
  console.log(`Période: ${parsed[0].date.toISOString().slice(0, 10)} → ${parsed[parsed.length - 1].date.toISOString().slice(0, 10)}  (${parsed.length} jours)`)
  console.log(`Total: ${fmt(totalC)} clics / ${fmt(totalI)} impressions  (CTR ${(totalC / totalI * 100).toFixed(2)}%)`)

  // Monthly aggregation
  const monthly = {}
  for (const r of parsed) {
    const m = r.date.toISOString().slice(0, 7)
    monthly[m] = monthly[m] || { clicks: 0, impressions: 0, days: 0 }
    monthly[m].clicks += r.clicks
    monthly[m].impressions += r.impressions
    monthly[m].days += 1
  }
  console.log('\nMensuel :')
  console.log(`${'Mois'.padEnd(10)} ${'Clics'.padStart(7)} ${'Impressions'.padStart(12)} ${'Jours'.padStart(6)}`)
  for (const m of Object.keys(monthly).sort()) {
    const x = monthly[m]
    console.log(`${m.padEnd(10)} ${fmt(x.clicks).padStart(7)} ${fmt(x.impressions).padStart(12)} ${String(x.days).padStart(6)}`)
  }
}

async function reportPages() {
  console.log('\n=== PAGES ===')
  const rows = await call('GetPageStats')

  // Aggregate by URL across all dates
  const agg = {}
  for (const r of rows) {
    const url = r.Query || ''
    if (!url) continue
    agg[url] = agg[url] || { clicks: 0, impressions: 0, positions: [] }
    agg[url].clicks += r.Clicks || 0
    agg[url].impressions += r.Impressions || 0
    const p = r.AvgImpressionPosition || 0
    if (p > 0) agg[url].positions.push(p)
  }

  const pages = Object.entries(agg).map(([url, v]) => ({
    url,
    clicks: v.clicks,
    impressions: v.impressions,
    avgPos: v.positions.length ? v.positions.reduce((a, b) => a + b, 0) / v.positions.length : 0,
    ctr: v.impressions ? (v.clicks / v.impressions) : 0,
  }))

  console.log(`${pages.length} pages distinctes\n`)

  // Section breakdown
  const buckets = {}
  for (const p of pages) {
    const b = sectionOf(p.url)
    buckets[b] = buckets[b] || { pages: 0, clicks: 0, impressions: 0 }
    buckets[b].pages += 1
    buckets[b].clicks += p.clicks
    buckets[b].impressions += p.impressions
  }
  console.log(`${'Section'.padEnd(18)} ${'Pages'.padStart(6)} ${'Clics'.padStart(7)} ${'Impressions'.padStart(12)} ${'CTR'.padStart(6)}`)
  for (const [b, v] of Object.entries(buckets).sort((a, b) => b[1].impressions - a[1].impressions)) {
    const ctr = v.impressions ? (v.clicks / v.impressions * 100).toFixed(1) + '%' : '—'
    console.log(`${b.padEnd(18)} ${String(v.pages).padStart(6)} ${fmt(v.clicks).padStart(7)} ${fmt(v.impressions).padStart(12)} ${ctr.padStart(6)}`)
  }

  console.log('\n=== TOP 25 PAR CLICS ===')
  for (const p of pages.sort((a, b) => b.clicks - a.clicks).slice(0, 25)) {
    const u = p.url.replace('https://registreduquebec.com', '').slice(0, 70)
    console.log(`${String(p.clicks).padStart(4)} clics | ${String(p.impressions).padStart(5)} imp | pos ${p.avgPos.toFixed(1).padStart(5)} | ${u}`)
  }

  console.log('\n=== TOP 25 PAR IMPRESSIONS ===')
  for (const p of pages.sort((a, b) => b.impressions - a.impressions).slice(0, 25)) {
    const u = p.url.replace('https://registreduquebec.com', '').slice(0, 70)
    const ctr = p.impressions ? (p.clicks / p.impressions * 100).toFixed(1) + '%' : '—'
    console.log(`${String(p.clicks).padStart(4)} clics | ${String(p.impressions).padStart(5)} imp | pos ${p.avgPos.toFixed(1).padStart(5)} | CTR ${ctr.padStart(5)} | ${u}`)
  }

  const out = path.join(__dirname, `bing-pages-${new Date().toISOString().slice(0, 10)}.json`)
  fs.writeFileSync(out, JSON.stringify(pages, null, 2))
  console.log(`\n💾 ${out}`)

  return pages
}

async function reportQueries() {
  console.log('\n=== QUERIES ===')
  const rows = await call('GetQueryStats')

  const agg = {}
  for (const r of rows) {
    const q = r.Query || ''
    if (!q) continue
    agg[q] = agg[q] || { clicks: 0, impressions: 0, positions: [] }
    agg[q].clicks += r.Clicks || 0
    agg[q].impressions += r.Impressions || 0
    const p = r.AvgImpressionPosition || 0
    if (p > 0) agg[q].positions.push(p)
  }

  const queries = Object.entries(agg).map(([q, v]) => ({
    query: q,
    clicks: v.clicks,
    impressions: v.impressions,
    avgPos: v.positions.length ? v.positions.reduce((a, b) => a + b, 0) / v.positions.length : 0,
    ctr: v.impressions ? (v.clicks / v.impressions) : 0,
  }))

  console.log(`${queries.length} requêtes distinctes\n`)

  console.log('=== TOP 30 PAR CLICS ===')
  for (const q of queries.sort((a, b) => b.clicks - a.clicks).slice(0, 30)) {
    console.log(`${String(q.clicks).padStart(4)} clics | ${String(q.impressions).padStart(5)} imp | pos ${q.avgPos.toFixed(1).padStart(5)} | "${q.query}"`)
  }

  console.log('\n=== TOP 20 PAR IMPRESSIONS (sans clic — opportunities) ===')
  const noClick = queries.filter((q) => q.clicks === 0 && q.impressions >= 20).sort((a, b) => b.impressions - a.impressions)
  for (const q of noClick.slice(0, 20)) {
    console.log(`${String(q.impressions).padStart(5)} imp | pos ${q.avgPos.toFixed(1).padStart(5)} | "${q.query}"`)
  }

  const out = path.join(__dirname, `bing-queries-${new Date().toISOString().slice(0, 10)}.json`)
  fs.writeFileSync(out, JSON.stringify(queries, null, 2))
  console.log(`\n💾 ${out}`)
}

async function reportQuickWins(pages) {
  console.log('\n=== QUICK WINS (pos 5-15, CTR < 2%, ≥50 impr) ===')
  pages = pages || (await (async () => {
    const rows = await call('GetPageStats')
    const agg = {}
    for (const r of rows) {
      const url = r.Query || ''
      if (!url) continue
      agg[url] = agg[url] || { clicks: 0, impressions: 0, positions: [] }
      agg[url].clicks += r.Clicks || 0
      agg[url].impressions += r.Impressions || 0
      const p = r.AvgImpressionPosition || 0
      if (p > 0) agg[url].positions.push(p)
    }
    return Object.entries(agg).map(([url, v]) => ({
      url, clicks: v.clicks, impressions: v.impressions,
      avgPos: v.positions.length ? v.positions.reduce((a, b) => a + b, 0) / v.positions.length : 0,
      ctr: v.impressions ? (v.clicks / v.impressions) : 0,
    }))
  })())

  const wins = pages
    .filter((p) => p.avgPos >= 5 && p.avgPos <= 15 && p.impressions >= 50 && p.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)

  for (const p of wins.slice(0, 30)) {
    const u = p.url.replace('https://registreduquebec.com', '')
    console.log(`\n  "${u}"`)
    console.log(`  pos ${p.avgPos.toFixed(1)} | ${p.impressions} imp | ${p.clicks} clics | CTR ${(p.ctr * 100).toFixed(2)}%`)
    console.log(`  💡 Améliorer le title/meta — potentiel ~${Math.round(p.impressions * 0.04)} clics si CTR passe à 4%`)
  }
  console.log(`\nTotal opportunities: ${wins.length}`)
}

async function main() {
  console.log('🔍 Bing Webmaster Tools Data Fetcher')
  console.log(`Site: ${SITE_URL}`)

  try {
    if (REPORT_TYPE === 'traffic' || REPORT_TYPE === 'all') await reportTraffic()
    let pages = null
    if (REPORT_TYPE === 'pages' || REPORT_TYPE === 'all') pages = await reportPages()
    if (REPORT_TYPE === 'queries' || REPORT_TYPE === 'all') await reportQueries()
    if (REPORT_TYPE === 'quickwins') await reportQuickWins(pages)
  } catch (err) {
    console.error('❌', err.message)
    process.exit(1)
  }
}

main()
