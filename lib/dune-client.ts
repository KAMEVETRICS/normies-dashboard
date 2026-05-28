import { unstable_cache } from 'next/cache'

const BASE = 'https://api.dune.com/api/v1/query'
const KEY = process.env.DUNE_API_KEY || ''

/**
 * Execute a Dune query and poll until it completes, then return fresh rows.
 * Falls back to cached results if execution fails or times out.
 */
async function duneExecuteAndPoll<T>(queryId: string): Promise<T[]> {
  if (!KEY) {
    console.warn('DUNE_API_KEY not set. Returning empty array for Dune query:', queryId)
    return []
  }

  try {
    // 1. Trigger a fresh execution
    const execRes = await fetch(`${BASE}/${queryId}/execute`, {
      method: 'POST',
      headers: { 'x-dune-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ performance: 'medium' }),
      cache: 'no-store',
    })

    if (!execRes.ok) {
      console.warn(`Dune execute failed (${execRes.status}), falling back to cached results`)
      return duneCachedResults<T>(queryId)
    }

    const { execution_id } = await execRes.json()

    // 2. Poll for completion (max ~2 minutes)
    const maxAttempts = 24
    const pollInterval = 5000 // 5 seconds
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, pollInterval))

      const statusRes = await fetch(
        `https://api.dune.com/api/v1/execution/${execution_id}/status`,
        { headers: { 'x-dune-api-key': KEY }, cache: 'no-store' }
      )

      if (!statusRes.ok) continue

      const statusData = await statusRes.json()
      const state = statusData.state

      if (state === 'QUERY_STATE_COMPLETED') {
        // 3. Fetch fresh results
        const resultRes = await fetch(
          `https://api.dune.com/api/v1/execution/${execution_id}/results?limit=1000`,
          { headers: { 'x-dune-api-key': KEY }, cache: 'no-store' }
        )
        if (!resultRes.ok) break
        const json = await resultRes.json()
        return (json.result?.rows ?? []) as T[]
      }

      if (state === 'QUERY_STATE_FAILED' || state === 'QUERY_STATE_CANCELLED') {
        console.warn(`Dune execution ${state} for query ${queryId}`)
        break
      }
      // Otherwise still pending/executing, keep polling
    }
  } catch (err) {
    console.warn('Dune execute+poll error, falling back to cached:', err)
  }

  // Fallback: return last cached results
  return duneCachedResults<T>(queryId)
}

/**
 * Read the last cached results for a query (no fresh execution).
 */
async function duneCachedResults<T>(queryId: string): Promise<T[]> {
  if (!KEY) return []
  try {
    const res = await fetch(`${BASE}/${queryId}/results?limit=1000`, {
      headers: { 'x-dune-api-key': KEY },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.result?.rows ?? []) as T[]
  } catch {
    return []
  }
}

export type DailySale = {
  sale_date: string
  num_sales: number
  floor_usd: number
  avg_usd: number
  max_usd: number
  volume_usd: number
  unique_buyers: number
}

export type RecentSale = {
  block_time: string
  token_id: string
  amount_usd: number
  marketplace: string
  buyer: string
  seller: string
  tx_hash: string
}

export type MarketplaceStat = {
  marketplace: string
  num_sales: number
  total_volume_usd: number
  avg_sale_usd: number
  floor_usd: number
}

/**
 * Cached Dune query fetchers.
 * unstable_cache ensures the expensive execute+poll cycle only runs
 * once per revalidation window (3600s = 1 hour), regardless of how
 * many requests hit /sales in that period.
 */
export const getDailySales = unstable_cache(
  () => duneExecuteAndPoll<DailySale>(process.env.DUNE_QUERY_DAILY_SALES || '7560868'),
  ['dune-daily-sales'],
  { revalidate: 3600 }
)

export const getRecentSales = unstable_cache(
  () => duneExecuteAndPoll<RecentSale>(process.env.DUNE_QUERY_RECENT_SALES || '7560897'),
  ['dune-recent-sales'],
  { revalidate: 3600 }
)

export const getMarketplaceStats = unstable_cache(
  () => duneExecuteAndPoll<MarketplaceStat>(process.env.DUNE_QUERY_MARKETPLACES || '7560904'),
  ['dune-marketplace-stats'],
  { revalidate: 3600 }
)
