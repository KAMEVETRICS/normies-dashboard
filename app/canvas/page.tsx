import { fetchCanvasStats } from '@/lib/normies-api'
import { getBurns } from '@/lib/data-loader'
import { Brush, Zap } from 'lucide-react'
import { StatCard } from '@/components/StatCard'

export const revalidate = 60

async function getSampleCanvasData() {
  const burns = getBurns()
  const uniqueIds = Array.from(new Set(burns.map(b => b.receiverTokenId))).slice(0, 50)
  
  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const res = await fetch(`https://api.normies.art/normie/${id}/canvas/info`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const data = await res.json()
        return { id, data }
      } catch {
        return null
      }
    })
  )

  return results.filter((r): r is { id: string; data: Record<string, unknown> } => r !== null)
}

export default async function CanvasLeaderboardPage() {
  const stats = await fetchCanvasStats()
  const leaderboardSample = await getSampleCanvasData()

  // Sort by action points spent or level
  leaderboardSample.sort((a, b) => {
    const aPoints = Number(a.data?.actionPoints || 0)
    const bPoints = Number(b.data?.actionPoints || 0)
    return bPoints - aPoints
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">CANVAS ACTIVITY</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Total Transforms" 
          value={stats?.totalTransforms?.toLocaleString() || '---'} 
          icon={<Brush className="w-4 h-4 text-purple-500" />} 
        />
        <StatCard 
          title="Action Points Distributed" 
          value={Number(stats?.totalActionPointsDistributed || 0).toLocaleString() || '---'} 
          icon={<Zap className="w-4 h-4 text-yellow-500" />} 
        />
      </div>

      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#48494b]/40 flex justify-between items-center">
          <h3 className="font-medium text-white">Canvas Leaderboard (Sample of Burners)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#e3e5e4]/50 bg-[#1a1a1a] uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Normie</th>
                <th className="px-6 py-3 font-medium">Level</th>
                <th className="px-6 py-3 font-medium">Action Points Spent</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardSample.map((entry, index) => (
                <tr key={entry.id} className="border-b border-[#48494b]/20 hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#e3e5e4]/70">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img 
                      src={`https://api.normies.art/normie/${entry.id}/image.svg`} 
                      alt={`Normie ${entry.id}`}
                      className="w-10 h-10 rounded-md rendering-pixelated bg-[#1a1a1a]"
                      loading="lazy"
                    />
                    <a href={`/normie/${entry.id}`} className="font-medium text-white hover:underline decoration-[#48494b]">
                      #{entry.id}
                    </a>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {String(entry.data?.level ?? 0)}
                  </td>
                  <td className="px-6 py-4 font-mono text-yellow-400">
                    {String(entry.data?.actionPoints ?? 0)} AP
                  </td>
                  <td className="px-6 py-4">
                    {entry.data?.customized ? (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium border border-purple-500/30">
                        Customized
                      </span>
                    ) : (
                      <span className="text-[#e3e5e4]/50 text-xs">Original</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaderboardSample.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#e3e5e4]/50">
                    Loading leaderboard data...
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
