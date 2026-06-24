import { fetchZombieStatus, fetchZombieConversions, fetchHistoryStats } from '@/lib/normies-api'
import { StatCard } from '@/components/StatCard'
import Link from 'next/link'
import { Skull } from 'lucide-react'

export const revalidate = 60

export default async function ZombiesPage() {
  const [status, conversions, stats] = await Promise.all([
    fetchZombieStatus(),
    fetchZombieConversions(),
    fetchHistoryStats(),
  ])

  const totalZombies = stats?.totalZombies ?? 0
  const poolSize = status?.poolSize ?? 0
  const poolSealed = status?.poolSealed ?? false
  const paused = status?.paused ?? false

  // Sort conversions by commitId descending (most recent first)
  const sortedConversions = Array.isArray(conversions)
    ? [...conversions].sort((a, b) => Number(b.commitId) - Number(a.commitId))
    : []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">ZOMBIES</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Zombies" value={totalZombies} icon={<Skull className="w-4 h-4 text-green-500" />} />
        <StatCard title="Pool Size" value={poolSize} icon={<Skull className="w-4 h-4" />} />
        <StatCard title="Pool Sealed" value={poolSealed ? 'Yes' : 'No'} />
        <StatCard title="Conversions Paused" value={paused ? 'Yes' : 'No'} />
      </div>

      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
        <h3 className="font-medium text-white mb-1">Zombie Conversions</h3>
        <p className="text-sm text-[#e3e5e4]/50 mb-5">
          All on-chain zombie conversion events, most recent first.
        </p>

        {sortedConversions.length === 0 ? (
          <div className="text-center py-8 text-[#e3e5e4]/50 text-sm">No conversions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#48494b]/40 text-[#e3e5e4]/70 text-left">
                  <th className="py-3 pr-4">Normie</th>
                  <th className="py-3 pr-4">Image</th>
                  <th className="py-3 pr-4">Wallet</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3">Tx</th>
                </tr>
              </thead>
              <tbody>
                {sortedConversions.map((c) => {
                  const date = c.revealTimestamp
                    ? new Date(Number(c.revealTimestamp) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : c.timestamp
                    ? new Date(Number(c.timestamp) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'
                  const statusText = c.cancelled ? 'Cancelled' : c.revealed ? 'Revealed' : 'Pending'
                  const statusColor = c.cancelled ? 'text-red-400' : c.revealed ? 'text-green-400' : 'text-yellow-400'
                  const txHash = c.revealTxHash || c.txHash
                  const wallet = c.qualifyingWallet || ''

                  return (
                    <tr key={c.commitId} className="border-b border-[#48494b]/20 hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 pr-4">
                        <Link href={`/normie/${c.tokenId}`} className="text-white font-mono hover:underline">
                          #{c.tokenId}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <Link href={`/normie/${c.tokenId}`}>
                          <img
                            src={`https://api.normies.art/normie/${c.tokenId}/image.svg`}
                            alt={`Normie #${c.tokenId}`}
                            className="w-10 h-10 rounded-md rendering-pixelated"
                          />
                        </Link>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[#e3e5e4]/70 text-xs">
                        {wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : '—'}
                      </td>
                      <td className={`py-3 pr-4 font-medium ${statusColor}`}>
                        {statusText}
                      </td>
                      <td className="py-3 pr-4 text-[#e3e5e4]/70">{date}</td>
                      <td className="py-3">
                        {txHash ? (
                          <a
                            href={`https://etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e3e5e4]/50 hover:text-white font-mono text-xs"
                          >
                            {txHash.slice(0, 8)}…
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
