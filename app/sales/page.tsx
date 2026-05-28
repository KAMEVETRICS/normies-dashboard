import { getDailySales, getRecentSales, getMarketplaceStats } from '@/lib/dune-client'
import { SalesPriceChart } from '@/components/SalesPriceChart'
import { SalesVolumeChart } from '@/components/SalesVolumeChart'

export const revalidate = 3600 // Revalidate hourly from Dune

export default async function SalesPage() {
  const [daily, recent, marketplaces] = await Promise.all([
    getDailySales(),
    getRecentSales(),
    getMarketplaceStats(),
  ])

  const totalVolume = marketplaces.reduce((sum, m) => sum + m.total_volume_usd, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">SALES DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Total Volume (USD)</div>
          <div className="text-3xl font-bold text-white">${Math.round(totalVolume).toLocaleString()}</div>
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Last 24h Sales</div>
          <div className="text-3xl font-bold text-white">{daily[0]?.num_sales || 0}</div>
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="text-sm text-[#e3e5e4]/70">Active Marketplaces</div>
          <div className="text-3xl font-bold text-white">{marketplaces.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80">
          <SalesPriceChart data={daily} />
        </div>
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80">
          <SalesVolumeChart data={daily} />
        </div>
      </div>

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
              {recent.slice(0, 20).map((sale, i) => (
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
