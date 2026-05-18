/**
 * Build redirect/gone mapping for all dead URLs in pages-database/url-status-*.json.
 *
 * For each dead URL:
 *   1. Extract slug from path (last segment, with trailing -N variants tried)
 *   2. Look up Supabase businesses table to see if any related slug still exists
 *   3. Output mapping: 301 → /entreprise/{slug} OR 410 → gone forever
 *
 * Output:
 *   - scripts/pages-database/dead-mapping.json — for human review
 *   - src/data/legacy-redirects.json          — consumed by middleware
 */

require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STATUS_FILE = path.join(__dirname, 'pages-database/url-status-2026-05-18.json')
const OUT_DEBUG = path.join(__dirname, 'pages-database/dead-mapping.json')
const OUT_PROD = path.join(__dirname, '..', 'src/data/legacy-redirects.json')

// Extract candidate slugs from a path. Returns ordered list (most-likely first).
function extractCandidates(p) {
  const seg = p.split('/').filter(Boolean)
  if (!seg.length) return []
  const last = seg[seg.length - 1]
  const cands = new Set([last])
  // Strip trailing -N (e.g. "...inc-2" → "...inc")
  const stripped = last.replace(/-\d+$/, '')
  if (stripped !== last) cands.add(stripped)
  // Try last two segments joined (some URLs may have city/business)
  if (seg.length >= 2) {
    cands.add(`${seg[seg.length - 2]}-${last}`)
  }
  return Array.from(cands)
}

/**
 * Look up only the slugs we actually need (extracted from dead URLs).
 * Much faster than full table scan, and bypasses Supabase pagination timeouts.
 */
async function lookupSlugs(candidateSlugs) {
  console.log(`Looking up ${candidateSlugs.length} candidate slugs in DB...`)
  const slugs = new Map()
  const batchSize = 200
  for (let i = 0; i < candidateSlugs.length; i += batchSize) {
    const batch = candidateSlugs.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('businesses')
      .select('slug, verification_confidence, is_claimed')
      .in('slug', batch)
    if (error) throw new Error(error.message)
    for (const b of data || []) slugs.set(b.slug, b)
    if (i % 1000 === 0) process.stdout.write(`  ${Math.min(i + batchSize, candidateSlugs.length)}/${candidateSlugs.length}... `)
  }
  console.log(`\n  Matched: ${slugs.size}/${candidateSlugs.length}\n`)
  return slugs
}

function isQualityTarget(b) {
  // Mirrors getBusiness() filter in the FR page: verification=high OR is_claimed
  return b.verification_confidence === 'high' || b.is_claimed === true
}

async function main() {
  const statuses = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'))
  const dead = statuses.filter((s) => s.bucket === 'gone')
  console.log(`Dead URLs to map: ${dead.length}`)

  // Collect all candidate slugs we'll need to check
  const allCandidates = new Set()
  const perPathCandidates = new Map()
  for (const d of dead) {
    const cands = extractCandidates(d.path)
    perPathCandidates.set(d.path, cands)
    for (const c of cands) allCandidates.add(c)
  }
  console.log(`Unique slug candidates to check: ${allCandidates.size}`)

  const slugMap = await lookupSlugs(Array.from(allCandidates))

  const buckets = { redirect: 0, gone_no_match: 0, gone_low_quality: 0 }
  const out = []

  for (const d of dead) {
    const cands = perPathCandidates.get(d.path) || []
    let match = null
    let matchedSlug = null
    for (const c of cands) {
      if (slugMap.has(c)) {
        match = slugMap.get(c)
        matchedSlug = c
        break
      }
    }

    if (!match) {
      buckets.gone_no_match++
      out.push({ from: d.path, action: '410', reason: 'no_slug_match', clicks_12mo: d.total_clicks })
      continue
    }

    // Match found — but does it pass the quality filter for /entreprise/[slug]?
    if (!isQualityTarget(match)) {
      buckets.gone_low_quality++
      out.push({
        from: d.path,
        action: '410',
        reason: 'low_quality_target',
        matched_slug: matchedSlug,
        clicks_12mo: d.total_clicks,
      })
      continue
    }

    // Good match — redirect
    buckets.redirect++
    out.push({
      from: d.path,
      action: '301',
      target: `/entreprise/${matchedSlug}`,
      clicks_12mo: d.total_clicks,
    })
  }

  console.log('\nMapping breakdown:')
  console.log(`  301 redirect (slug exists + quality):    ${buckets.redirect}`)
  console.log(`  410 gone (slug exists but low quality):  ${buckets.gone_low_quality}`)
  console.log(`  410 gone (no slug match in DB):          ${buckets.gone_no_match}`)
  const recoveredClicks = out.filter((o) => o.action === '301').reduce((s, o) => s + (o.clicks_12mo || 0), 0)
  const lostClicks = out.filter((o) => o.action === '410').reduce((s, o) => s + (o.clicks_12mo || 0), 0)
  console.log(`\nClicks recovered via 301: ${recoveredClicks}`)
  console.log(`Clicks definitively lost (410): ${lostClicks}`)

  // Write debug JSON
  fs.writeFileSync(OUT_DEBUG, JSON.stringify(out, null, 2))
  console.log(`\n💾 ${OUT_DEBUG}`)

  // Write production lookup tables (lean format for middleware)
  fs.mkdirSync(path.dirname(OUT_PROD), { recursive: true })
  const redirects = {}
  const gone = []
  for (const o of out) {
    if (o.action === '301') redirects[o.from] = o.target
    else gone.push(o.from)
  }
  fs.writeFileSync(OUT_PROD, JSON.stringify({ redirects, gone }, null, 2))
  console.log(`💾 ${OUT_PROD}  (${Object.keys(redirects).length} redirects, ${gone.length} gone)`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
