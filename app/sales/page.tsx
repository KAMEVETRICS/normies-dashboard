import { getDailySales, getRecentSales, getMarketplaceStats, getDailyHolders, DailySale, RecentSale, MarketplaceStat } from '@/lib/dune-client'
import { SalesPriceChart } from '@/components/SalesPriceChart'
import { SalesVolumeChart } from '@/components/SalesVolumeChart'
import { MarketCapChart } from '@/components/MarketCapChart'
import { fetchOpenSeaStats } from '@/lib/normies-api'
import { getBurns, getBurnedTokens } from '@/lib/data-loader'

export const revalidate = 3600 // Revalidate hourly from Dune

export default async function SalesPage() {
  const [daily, recent, marketplaces, osStats, holdersData] = await Promise.all([
    getDailySales(),
    getRecentSales(),
    getMarketplaceStats(),
    fetchOpenSeaStats(),
    getDailyHolders()
  ]) as [DailySale[], RecentSale[], MarketplaceStat[], any, any]

  const totalVolume = marketplaces.reduce((sum: number, m: MarketplaceStat) => sum + m.total_volume_usd, 0)
  
  const burns = getBurns()
  const totalBurned = getBurnedTokens().length

  // Create a map for fast lookup of daily holders by date string (e.g. "2024-05-12")
  const holdersMap = new Map<string, number>()
  for (const h of holdersData) {
    const dString = new Date(h.date).toISOString().split('T')[0]
    holdersMap.set(dString, h.unique_holders)
  }

  // Forward-fill floor_usd and avg_usd for charts to prevent drops to zero
  // daily is sorted newest to oldest. We iterate oldest to newest to forward-fill
  let lastFloor = 0
  let lastAvg = 0
  const processedDaily = daily.slice().reverse().map(d => {
    const floor = Number(d.floor_usd) || 0
    const avg = Number(d.avg_usd) || 0
    
    if (floor > 0) lastFloor = floor
    const finalFloor = floor > 0 ? floor : lastFloor
    
    if (avg > 0) lastAvg = avg
    const finalAvg = avg > 0 ? avg : lastAvg
    
    return {
      ...d,
      floor_usd: finalFloor,
      avg_usd: finalAvg
    }
  }).reverse() // back to newest-first

  const marketCapData = processedDaily.slice().reverse().map((day: DailySale) => {
    const dateObj = new Date(day.sale_date)
    const nextDateObj = new Date(dateObj)
    nextDateObj.setDate(nextDateObj.getDate() + 1)
    
    const timestampLimit = nextDateObj.getTime() / 1000
    let burnsUpToDate = 0
    let dailyBurns = 0
    
    for (const b of burns) {
      const ts = Number(b.timestamp)
      if (ts < timestampLimit) {
        burnsUpToDate += Number(b.tokenCount)
        if (ts >= dateObj.getTime() / 1000) {
          dailyBurns += Number(b.tokenCount)
        }
      }
    }
    
    const supply = 10000 - burnsUpToDate
    const currentFloor = day.floor_usd
    const marketCap = currentFloor * supply
    
    const dString = dateObj.toISOString().split('T')[0]
    const uniqueHolders = holdersMap.get(dString) || null
    
    return {
      date: day.sale_date,
      marketCap,
      floorPrice: currentFloor,
      supply,
      burns: dailyBurns,
      uniqueHolders
    }
  })

  // current market cap from open sea stats if available, otherwise fallback
  const currentFloor = daily[0]?.floor_usd || 0
  const osMarketCap = osStats?.total?.market_cap ? Math.round(osStats.total.market_cap) : (currentFloor * (10000 - totalBurned))
  const uniqueHolders = osStats?.total?.num_owners || (holdersData.length > 0 ? holdersData[0].unique_holders : 'N/A')

  const osOneDaySales = osStats?.intervals?.find((i: any) => i.interval === 'one_day')?.sales
  const last24hSales = osOneDaySales !== undefined ? osOneDaySales : (daily[0]?.num_sales || 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">SALES DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Total Volume</div>
          <div className="text-3xl font-bold text-white">${Math.round(totalVolume).toLocaleString()}</div>
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Last 24h Sales</div>
          <div className="text-3xl font-bold text-white">{last24hSales}</div>
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Active Markets</div>
          <div className="text-3xl font-bold text-white">{marketplaces.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80">
          <SalesPriceChart data={processedDaily} />
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80">
          <SalesVolumeChart data={processedDaily} />
        </div>
      </div>

      <MarketCapChart data={marketCapData} />

      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#48494b]/40">
          <h3 className="font-medium text-white">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#e3e5e4]/50 bg-[#1a1a1a] uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Token ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Marketplace</th>
                <th className="px-6 py-3 font-medium text-right">Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {recent.slice(0, 20).map((sale: RecentSale, i: number) => (
                <tr key={i} className="border-b border-[#48494b]/20 hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <a href={`/normie/${sale.token_id}`} className="hover:underline decoration-[#48494b]">
                      #{sale.token_id}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-[#e3e5e4]/70">
                    {new Date(sale.block_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-[#e3e5e4]/70 capitalize">
                    {sale.marketplace}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    ${Math.round(sale.amount_usd).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#e3e5e4]/50">
                    No sales data available. Make sure DUNE_API_KEY is set.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
