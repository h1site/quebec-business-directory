'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface BotRow {
  id: number
  occurred_at: string
  bot: string
  user_agent: string | null
  method: string | null
  path: string
  status: number
  action: 'redirect' | 'gone' | 'passthrough'
  referer: string | null
  country: string | null
}

interface BotStats { total: number; redirect: number; gone: number; passthrough: number }

interface ApiResp {
  total: number
  fetched: number
  byBot: Record<string, BotStats>
  byDay: Record<string, BotStats>
  topPaths: Array<{ path: string; total: number; lastAction: string }>
  recent: BotRow[]
}

const BOT_LABELS: Record<string, { label: string; color: string }> = {
  googlebot: { label: 'Googlebot', color: '#4285F4' },
  bingbot: { label: 'Bingbot', color: '#00897B' },
  adsbot: { label: 'AdsBot', color: '#F4B400' },
  'ai-bot': { label: 'AI (GPT/Claude/Perplexity)', color: '#9C27B0' },
  applebot: { label: 'Applebot', color: '#A2AAAD' },
  yandexbot: { label: 'YandexBot', color: '#FF0000' },
  baidubot: { label: 'Baidu', color: '#2319DC' },
  duckduckbot: { label: 'DuckDuckGo', color: '#DE5833' },
}

const ACTION_COLORS: Record<string, string> = {
  redirect: '#F4B400',
  gone: '#DB4437',
  passthrough: '#0F9D58',
}

export default function BotsPage() {
  const [data, setData] = useState<ApiResp | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [bot, setBot] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [pathFilter, setPathFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Pas de session')
        setLoading(false)
        return
      }
      const params = new URLSearchParams()
      params.set('days', String(days))
      if (bot) params.set('bot', bot)
      if (action) params.set('action', action)
      if (pathFilter) params.set('path', pathFilter)
      const res = await fetch(`/api/admin/bot-requests?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        setError(`HTTP ${res.status}`)
        setLoading(false)
        return
      }
      const json: ApiResp = await res.json()
      setData(json)
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, bot, action, pathFilter])

  const grandTotal = data ? Object.values(data.byBot).reduce((s, v) => s + v.total, 0) : 0
  const maxDay = data ? Math.max(1, ...Object.values(data.byDay).map((v) => v.total)) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Crawl Bots</h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Activité de Googlebot, Bingbot et bots IA captée par le middleware.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col text-xs gap-1" style={{ color: 'var(--foreground-muted)' }}>
            Période
            <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))} className="bg-black/30 rounded px-3 py-2 text-sm border border-white/10" style={{ color: 'var(--foreground)' }}>
              <option value={1}>24h</option>
              <option value={7}>7 jours</option>
              <option value={30}>30 jours</option>
              <option value={90}>90 jours</option>
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1" style={{ color: 'var(--foreground-muted)' }}>
            Bot
            <select value={bot} onChange={(e) => setBot(e.target.value)} className="bg-black/30 rounded px-3 py-2 text-sm border border-white/10" style={{ color: 'var(--foreground)' }}>
              <option value="">Tous</option>
              {Object.keys(BOT_LABELS).map((b) => (
                <option key={b} value={b}>{BOT_LABELS[b].label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1" style={{ color: 'var(--foreground-muted)' }}>
            Action
            <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-black/30 rounded px-3 py-2 text-sm border border-white/10" style={{ color: 'var(--foreground)' }}>
              <option value="">Toutes</option>
              <option value="passthrough">Passthrough (200)</option>
              <option value="redirect">Redirect (301)</option>
              <option value="gone">Gone (410)</option>
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1 flex-1" style={{ color: 'var(--foreground-muted)' }}>
            Path contient
            <input value={pathFilter} onChange={(e) => setPathFilter(e.target.value)} placeholder="/entreprise/..." className="bg-black/30 rounded px-3 py-2 text-sm border border-white/10" style={{ color: 'var(--foreground)' }} />
          </label>
          <button onClick={fetchData} className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-400 text-sm">↻ Refresh</button>
        </div>
      </div>

      {error && <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/10 text-red-300">{error}</div>}

      {loading && !data && (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}>
          Chargement…
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Total requests" value={data.total.toLocaleString()} sub={`${data.fetched} fetched`} />
            <Card label="Redirects (301)" value={Object.values(data.byBot).reduce((s, v) => s + v.redirect, 0).toLocaleString()} color="#F4B400" />
            <Card label="Gone (410)" value={Object.values(data.byBot).reduce((s, v) => s + v.gone, 0).toLocaleString()} color="#DB4437" />
            <Card label="Passthrough" value={Object.values(data.byBot).reduce((s, v) => s + v.passthrough, 0).toLocaleString()} color="#0F9D58" />
          </div>

          {/* By bot */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>Par bot</h2>
            <div className="space-y-2">
              {Object.entries(data.byBot).sort((a, b) => b[1].total - a[1].total).map(([b, v]) => {
                const pct = grandTotal ? (v.total / grandTotal) * 100 : 0
                const meta = BOT_LABELS[b] || { label: b, color: '#888' }
                return (
                  <div key={b}>
                    <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                      <span><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: meta.color }} />{meta.label}</span>
                      <span style={{ color: 'var(--foreground-muted)' }}>
                        {v.total.toLocaleString()} ({pct.toFixed(1)}%) — {v.passthrough} pass / {v.redirect} redir / {v.gone} gone
                      </span>
                    </div>
                    <div className="h-2 rounded bg-black/30 overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>Timeline (par jour)</h2>
            <div className="flex items-end gap-1 h-40">
              {Object.entries(data.byDay).sort().map(([d, v]) => (
                <div key={d} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col-reverse" style={{ height: '100%' }}>
                    <div title={`${d}: ${v.passthrough} pass`} style={{ background: ACTION_COLORS.passthrough, height: `${(v.passthrough / maxDay) * 100}%` }} />
                    <div title={`${d}: ${v.gone} gone`} style={{ background: ACTION_COLORS.gone, height: `${(v.gone / maxDay) * 100}%` }} />
                    <div title={`${d}: ${v.redirect} redir`} style={{ background: ACTION_COLORS.redirect, height: `${(v.redirect / maxDay) * 100}%` }} />
                  </div>
                  <div className="text-xs mt-1 group-hover:font-bold whitespace-nowrap" style={{ color: 'var(--foreground-muted)', fontSize: '10px' }}>{d.slice(5)}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              <span><span className="inline-block w-3 h-3 rounded mr-1" style={{ background: ACTION_COLORS.passthrough }} />Passthrough</span>
              <span><span className="inline-block w-3 h-3 rounded mr-1" style={{ background: ACTION_COLORS.gone }} />Gone (410)</span>
              <span><span className="inline-block w-3 h-3 rounded mr-1" style={{ background: ACTION_COLORS.redirect }} />Redirect (301)</span>
            </div>
          </div>

          {/* Top paths */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>Top 30 paths crawlés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5" style={{ color: 'var(--foreground-muted)' }}>
                    <th className="text-left py-2">Hits</th>
                    <th className="text-left">Action</th>
                    <th className="text-left">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPaths.map((p) => (
                    <tr key={p.path} className="border-b border-white/5" style={{ color: 'var(--foreground)' }}>
                      <td className="py-2 font-mono">{p.total}</td>
                      <td><span className="px-2 py-0.5 rounded text-xs" style={{ background: `${ACTION_COLORS[p.lastAction] || '#888'}30`, color: ACTION_COLORS[p.lastAction] || '#888' }}>{p.lastAction}</span></td>
                      <td className="font-mono text-xs break-all">{p.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent requests */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
            <h2 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>100 plus récentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5" style={{ color: 'var(--foreground-muted)' }}>
                    <th className="text-left py-2">Quand</th>
                    <th className="text-left">Bot</th>
                    <th className="text-left">Action</th>
                    <th className="text-left">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((r) => (
                    <tr key={r.id} className="border-b border-white/5" style={{ color: 'var(--foreground)' }}>
                      <td className="py-2 whitespace-nowrap font-mono">{new Date(r.occurred_at).toLocaleString('fr-CA', { hour12: false }).slice(5)}</td>
                      <td><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: BOT_LABELS[r.bot]?.color || '#888' }} />{r.bot}</td>
                      <td><span className="px-2 py-0.5 rounded text-xs" style={{ background: `${ACTION_COLORS[r.action]}30`, color: ACTION_COLORS[r.action] }}>{r.action}</span></td>
                      <td className="font-mono break-all">{r.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 border border-white/5" style={{ background: 'var(--background-secondary)' }}>
      <div className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || 'var(--foreground)' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{sub}</div>}
    </div>
  )
}
