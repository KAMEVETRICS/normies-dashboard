import { getRarityScores } from '@/lib/rarity'
import { fetchHolderTokens } from '@/lib/normies-api'
import { StatCard } from '@/components/StatCard'
import { Sparkles, Hash, Wallet } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60

export default async function HolderPortfolioPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  
  if (!address.startsWith('0x') || address.length !== 42) {
    return <div className="p-8 text-center text-xl text-white">Invalid Ethereum Address</div>
  }

  const tokenIds: number[] = await fetchHolderTokens(address)
  
  const scores = getRarityScores()

  const ownedTokens = tokenIds.map(id => {
    const rarity = scores[id]
    return {
      id,
      rank: rarity ? rarity.rank : Infinity
    }
  }).sort((a, b) => a.rank - b.rank)

  const bestToken = ownedTokens.length > 0 ? ownedTokens[0] : null

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-widest text-white mb-2">WALLET PORTFOLIO</h1>
        <p className="text-[#e3e5e4]/60 font-mono text-sm">{address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Owned" 
          value={tokenIds.length.toLocaleString()} 
          icon={<Wallet className="w-4 h-4 text-blue-500" />} 
        />
        <StatCard 
          title="Rarest Normie Held" 
          value={bestToken ? `#${bestToken.id}` : 'None'} 
          subtitle={bestToken && bestToken.rank !== Infinity ? `Rank #${bestToken.rank.toLocaleString()}` : ''}
          icon={<Sparkles className="w-4 h-4 text-yellow-500" />} 
        />
        <StatCard 
          title="Avg Rarity Rank" 
          value={ownedTokens.length > 0 ? `#${Math.round(ownedTokens.filter(t => t.rank !== Infinity).reduce((sum, t) => sum + t.rank, 0) / (ownedTokens.filter(t => t.rank !== Infinity).length || 1)).toLocaleString()}` : 'N/A'} 
          icon={<Hash className="w-4 h-4 text-purple-500" />} 
        />
      </div>

      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
        <h3 className="text-sm font-medium text-[#e3e5e4]/70 uppercase mb-6 tracking-wider border-b border-[#48494b]/20 pb-2">
          Tokens ({Math.min(ownedTokens.length, 100)} Displayed)
        </h3>
        
        {ownedTokens.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {ownedTokens.slice(0, 100).map(token => (
              <Link href={`/normie/${token.id}`} key={token.id} className="group block">
                <div className="bg-[#1a1a1a] border border-[#48494b]/40 rounded-lg overflow-hidden transition-all duration-200 hover:border-[#e3e5e4]/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-square bg-[#111] relative">
                    <img 
                      src={`https://api.normies.art/normie/${token.id}/image.svg`}
                      alt={`Normie ${token.id}`}
                      className="w-full h-full object-cover rendering-pixelated"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-white text-sm mb-1">#{token.id}</div>
                    <div className="text-[10px] text-[#e3e5e4]/60 uppercase tracking-wider flex justify-between">
                      <span>Rank</span>
                      <span className="text-yellow-400 font-mono">#{token.rank.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#e3e5e4]/50">
            This wallet does not hold any Normies.
          </div>
        )}
      </div>
    </div>
  )
}
