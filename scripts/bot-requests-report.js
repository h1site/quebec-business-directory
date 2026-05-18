/**
 * Bot crawl report — reads from public.bot_requests (populated by middleware).
 *
 * Usage:
 *   node scripts/bot-requests-report.js                  # last 7 days summary
 *   node scripts/bot-requests-report.js --days=30
 *   node scripts/bot-requests-report.js --bot=googlebot
 *   node scripts/bot-requests-report.js --action=gone    # what bots are hitting 410s
 *   node scripts/bot-requests-report.js --path=/entreprise/
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const DAYS = parseInt(process.argv.find((a) => a.startsWith('--days='))?.split('=')[1] || '7', 10)
const BOT_FILTER = process.argv.find((a) => a.startsWith('--bot='))?.split('=')[1]
const ACTION_FILTER = process.argv.find((a) => a.startsWith('--action='))?.split('=')[1]
const PATH_FILTER = process.argv.find((a) => a.startsWith('--path='))?.split('=')[1]

async function main() {
  const since = new Date(Date.now() - DAYS * 86400000).toISOString()
  let q = supabase.from('bot_requests').select('*', { count: 'exact' }).gte('occurred_at', since)
  if (BOT_FILTER) q = q.eq('bot', BOT_FILTER)
  if (ACTION_FILTER) q = q.eq('action', ACTION_FILTER)
  if (PATH_FILTER) q = q.ilike('path', `%${PATH_FILTER}%`)
  q = q.order('occurred_at', { ascending: false }).limit(10000)

  const { data, count, error } = await q
  if (error) throw new Error(error.message)
  if (!data || !data.length) {
    console.log('No bot requests in the requested window.')
    return
  }

  console.log(`Période: derniers ${DAYS} jours`)
  console.log(`Total bot requests captured: ${count}`)
  console.log(`Rows fetched (capped at 10k): ${data.length}\n`)

  // Breakdown by bot
  const byBot = {}
  for (const r of data) {
    byBot[r.bot] = byBot[r.bot] || { total: 0, redirect: 0, gone: 0, passthrough: 0 }
    byBot[r.bot].total++
    byBot[r.bot][r.action]++
  }
  console.log('Par bot:')
  console.log(`${'Bot'.padEnd(15)} ${'Total'.padStart(7)} ${'Redir'.padStart(6)} ${'Gone'.padStart(6)} ${'Pass'.padStart(6)}`)
  for (const [b, v] of Object.entries(byBot).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`${b.padEnd(15)} ${String(v.total).padStart(7)} ${String(v.redirect).padStart(6)} ${String(v.gone).padStart(6)} ${String(v.passthrough).padStart(6)}`)
  }

  // Breakdown by action
  console.log('\nPar action (middleware decision):')
  const byAction = { redirect: 0, gone: 0, passthrough: 0 }
  for (const r of data) byAction[r.action]++
  for (const [a, n] of Object.entries(byAction)) {
    console.log(`  ${a.padEnd(12)} ${n}`)
  }

  // Top paths by hits (recent)
  console.log('\nTop 20 paths les plus crawlés:')
  const byPath = {}
  for (const r of data) {
    byPath[r.path] = byPath[r.path] || { total: 0, action: r.action }
    byPath[r.path].total++
  }
  const tops = Object.entries(byPath).sort((a, b) => b[1].total - a[1].total).slice(0, 20)
  console.log(`${'Hits'.padStart(5)} ${'Action'.padEnd(12)} Path`)
  for (const [p, v] of tops) {
    console.log(`${String(v.total).padStart(5)} ${v.action.padEnd(12)} ${p.slice(0, 80)}`)
  }

  // Daily volume
  console.log('\nVolume jour-par-jour:')
  const byDay = {}
  for (const r of data) {
    const d = r.occurred_at.slice(0, 10)
    byDay[d] = byDay[d] || { total: 0, gone: 0, redirect: 0 }
    byDay[d].total++
    if (r.action === 'gone') byDay[d].gone++
    if (r.action === 'redirect') byDay[d].redirect++
  }
  console.log(`${'Date'.padEnd(12)} ${'Total'.padStart(6)} ${'Gone'.padStart(6)} ${'Redir'.padStart(6)}`)
  for (const d of Object.keys(byDay).sort().reverse()) {
    const v = byDay[d]
    console.log(`${d.padEnd(12)} ${String(v.total).padStart(6)} ${String(v.gone).padStart(6)} ${String(v.redirect).padStart(6)}`)
  }
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
