/**
 * Check HTTP status of every URL in pages-database/latest.json.
 *
 * Categorizes:
 *   - alive (200)
 *   - redirect (301/302 → target)
 *   - gone (404/410)
 *   - error (5xx, timeout, network)
 *
 * Writes scripts/pages-database/url-status-YYYY-MM-DD.json.
 */

const fs = require('fs')
const path = require('path')

const BASE = 'https://registreduquebec.com'
const CONCURRENCY = 20
const TIMEOUT_MS = 10000

const input = path.join(__dirname, 'pages-database/latest.json')
const out = path.join(__dirname, `pages-database/url-status-${new Date().toISOString().slice(0,10)}.json`)

const pages = JSON.parse(fs.readFileSync(input, 'utf-8'))
console.log(`Checking ${pages.length} URLs...\n`)

let done = 0
const results = []

async function checkOne(page) {
  const url = BASE + page.path
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'registreduquebec-url-audit/1.0' },
    })
    const status = res.status
    let target = null
    if (status >= 300 && status < 400) {
      target = res.headers.get('location')
      if (target && target.startsWith(BASE)) target = target.slice(BASE.length)
    }
    return {
      path: page.path,
      section: page.section,
      total_clicks: page.total_clicks,
      status,
      bucket:
        status === 200 ? 'alive' :
        status >= 300 && status < 400 ? 'redirect' :
        status === 404 || status === 410 ? 'gone' :
        'error',
      redirect_target: target,
    }
  } catch (e) {
    return {
      path: page.path,
      section: page.section,
      total_clicks: page.total_clicks,
      status: 0,
      bucket: 'error',
      error: e.message,
    }
  } finally {
    clearTimeout(t)
  }
}

async function pool() {
  const queue = pages.slice()
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const p = queue.shift()
      const r = await checkOne(p)
      results.push(r)
      done++
      if (done % 200 === 0) process.stdout.write(`  ${done}/${pages.length}\n`)
    }
  })
  await Promise.all(workers)
}

;(async () => {
  const t0 = Date.now()
  await pool()
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\nDone in ${elapsed}s\n`)

  // Stats
  const byBucket = { alive: 0, redirect: 0, gone: 0, error: 0 }
  const clicksByBucket = { alive: 0, redirect: 0, gone: 0, error: 0 }
  for (const r of results) {
    byBucket[r.bucket]++
    clicksByBucket[r.bucket] += r.total_clicks
  }
  console.log('Statut HTTP des 5,162 URLs:')
  console.log(`${'Bucket'.padEnd(10)} ${'Pages'.padStart(6)} ${'Clics 12mo'.padStart(12)}`)
  for (const b of ['alive','redirect','gone','error']) {
    console.log(`${b.padEnd(10)} ${String(byBucket[b]).padStart(6)} ${clicksByBucket[b].toLocaleString().padStart(12)}`)
  }

  // Redirect target distribution
  const redirects = results.filter(r => r.bucket === 'redirect')
  const targetBuckets = {}
  for (const r of redirects) {
    const t = r.redirect_target || '(null)'
    let cat = 'autre'
    if (t === '/' || t === '/?...' || t.startsWith('/?')) cat = '→ /'
    else if (t.startsWith('/entreprise/')) cat = '→ /entreprise/'
    else if (t.startsWith('/en/company/')) cat = '→ /en/company/'
    else if (t.startsWith('/categorie/')) cat = '→ /categorie/'
    else if (t.startsWith('/ville/')) cat = '→ /ville/'
    else if (t.startsWith('/blogue/')) cat = '→ /blogue/'
    else if (t.startsWith('/recherche')) cat = '→ /recherche'
    targetBuckets[cat] = (targetBuckets[cat] || 0) + 1
  }
  if (Object.keys(targetBuckets).length) {
    console.log('\nRedirects → où ils pointent:')
    for (const [k,v] of Object.entries(targetBuckets).sort((a,b)=>b[1]-a[1])) {
      console.log(`  ${k.padEnd(20)} ${String(v).padStart(5)}`)
    }
  }

  // Section breakdown
  const sectionStats = {}
  for (const r of results) {
    const s = r.section
    sectionStats[s] = sectionStats[s] || { alive: 0, redirect: 0, gone: 0, error: 0, total: 0 }
    sectionStats[s][r.bucket]++
    sectionStats[s].total++
  }
  console.log('\nPar section:')
  console.log(`${'Section'.padEnd(20)} ${'Total'.padStart(6)} ${'Alive'.padStart(6)} ${'Redir'.padStart(6)} ${'Gone'.padStart(5)} ${'Err'.padStart(4)}`)
  for (const [s,v] of Object.entries(sectionStats).sort((a,b)=>b[1].total-a[1].total)) {
    console.log(`${s.padEnd(20)} ${String(v.total).padStart(6)} ${String(v.alive).padStart(6)} ${String(v.redirect).padStart(6)} ${String(v.gone).padStart(5)} ${String(v.error).padStart(4)}`)
  }

  fs.writeFileSync(out, JSON.stringify(results, null, 2))
  console.log(`\n💾 ${out}`)
})()
