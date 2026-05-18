import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'info@h1site.com'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user via anon client + JWT
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: userErr } = await anon.auth.getUser(token)
  if (userErr || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Service client for the actual query
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const url = new URL(req.url)
  const days = parseInt(url.searchParams.get('days') || '7', 10)
  const bot = url.searchParams.get('bot')
  const action = url.searchParams.get('action')
  const pathFilter = url.searchParams.get('path')

  const since = new Date(Date.now() - days * 86400000).toISOString()

  let q = svc.from('bot_requests').select('*', { count: 'exact' }).gte('occurred_at', since)
  if (bot) q = q.eq('bot', bot)
  if (action) q = q.eq('action', action)
  if (pathFilter) q = q.ilike('path', `%${pathFilter}%`)
  q = q.order('occurred_at', { ascending: false }).limit(5000)

  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregations
  const byBot: Record<string, { total: number; redirect: number; gone: number; passthrough: number }> = {}
  const byDay: Record<string, { total: number; redirect: number; gone: number; passthrough: number }> = {}
  const byPath: Record<string, { total: number; lastAction: string }> = {}
  for (const r of data || []) {
    byBot[r.bot] = byBot[r.bot] || { total: 0, redirect: 0, gone: 0, passthrough: 0 }
    byBot[r.bot].total++
    byBot[r.bot][r.action as 'redirect' | 'gone' | 'passthrough']++

    const d = r.occurred_at.slice(0, 10)
    byDay[d] = byDay[d] || { total: 0, redirect: 0, gone: 0, passthrough: 0 }
    byDay[d].total++
    byDay[d][r.action as 'redirect' | 'gone' | 'passthrough']++

    byPath[r.path] = byPath[r.path] || { total: 0, lastAction: r.action }
    byPath[r.path].total++
  }

  return NextResponse.json({
    total: count,
    fetched: data?.length || 0,
    byBot,
    byDay,
    topPaths: Object.entries(byPath)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 30)
      .map(([path, v]) => ({ path, ...v })),
    recent: (data || []).slice(0, 100),
  })
}
