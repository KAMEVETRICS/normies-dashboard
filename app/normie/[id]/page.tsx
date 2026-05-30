import { getTraits, getRarityScores } from '@/lib/rarity'
import { fetchNormieMetadata, fetchNormieVersions, fetchNormiePixels, fetchLiveOpenSeaRarity } from '@/lib/normies-api'
import { NormieImageViewer } from '@/components/NormieImageViewer'
import { getBurnedTokens } from '@/lib/data-loader'
import { Flame } from 'lucide-react'

function computeTraitRarity(
  traitType: string,
  traitValue: string,
  allTraits: Record<number, { raw: string; attributes: { trait_type: string; value: string }[] } | null>
): number {
  const entries = Object.values(allTraits)
  const total = entries.length
  if (total === 0) return 0
  let count = 0
  for (const entry of entries) {
    if (!entry) continue
    for (const attr of entry.attributes) {
      if (attr.trait_type === traitType && attr.value === traitValue) {
        count++
        break
      }
    }
  }
  return (count / total) * 100
}

function getRarityColor(pct: number): string {
  if (pct < 5) return 'text-green-400'
  if (pct <= 20) return 'text-yellow-400'
  return 'text-[#e3e5e4]/60'
}

function getRarityBarColor(pct: number): string {
  if (pct < 5) return 'bg-green-400'
  if (pct <= 20) return 'bg-yellow-400'
  return 'bg-[#e3e5e4]/30'
}

export default async function NormieProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tokenId = parseInt(id)
  
  if (isNaN(tokenId) || tokenId < 0 || tokenId > 9999) {
    return <div className="p-8 text-center text-xl">Invalid Token ID</div>
  }

  const scores = getRarityScores()
  const traitsData = getTraits()
  
  const cachedRarity = scores[tokenId]
  const liveRank = await fetchLiveOpenSeaRarity(tokenId)
  const displayRank = liveRank ?? cachedRarity?.rank
  
  const normieTraits = traitsData[tokenId]
  const attributes = normieTraits?.attributes ?? []
  const metadata = await fetchNormieMetadata(tokenId)
  const versions = await fetchNormieVersions(tokenId)
  const pixels = await fetchNormiePixels(tokenId)
  const burnedTokens = getBurnedTokens()
  const isBurned = burnedTokens.some((b: { tokenId: string | number }) => Number(b.tokenId) === tokenId)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <h1 className="text-3xl font-bold tracking-widest text-white">NORMIE #{id}</h1>
        {isBurned && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-md border border-red-500/30 text-sm font-bold tracking-widest uppercase">
            <Flame className="w-4 h-4" /> Burned
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <NormieImageViewer id={id} pixels={pixels} />
          
          {metadata && metadata.attributes && (
             <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5">
               <h3 className="text-sm font-medium text-[#e3e5e4]/70 uppercase mb-4 tracking-wider border-b border-[#48494b]/20 pb-2">Canvas Status</h3>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[#e3e5e4]/70">Level</span>
                 <span className="text-white font-bold">{metadata.attributes.find((a: { trait_type: string; value: string }) => a.trait_type === 'Level')?.value || 0}</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[#e3e5e4]/70">Action Points</span>
                 <span className="text-white font-bold">{metadata.attributes.find((a: { trait_type: string; value: string }) => a.trait_type === 'Action Points')?.value || 0}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#e3e5e4]/70">Versions</span>
                 <span className="text-white font-bold">{versions.length}</span>
               </div>
             </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 text-center shadow-lg shadow-black/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#e3e5e4]/50 mb-2">Collection Rank</h2>
            <div className="text-6xl font-black text-white tracking-tighter mb-2">
              #{displayRank ? displayRank.toLocaleString() : '---'}
            </div>
            <div className="text-sm text-[#e3e5e4]/70">
              Powered by <span className="text-white font-mono">OpenRarity</span>
              {liveRank && <span className="ml-2 text-[10px] text-green-400/80 border border-green-400/30 px-1.5 py-0.5 rounded-full">LIVE</span>}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
             <h3 className="text-sm font-medium text-[#e3e5e4]/70 uppercase mb-4 tracking-wider border-b border-[#48494b]/20 pb-2">Traits</h3>
             {attributes.length > 0 ? (
               <div className="grid grid-cols-2 gap-3">
                 {attributes.map((attr) => {
                   const pct = computeTraitRarity(attr.trait_type, attr.value, traitsData)
                   return (
                     <div key={attr.trait_type} className="bg-[#1a1a1a] border border-[#48494b]/20 rounded-md p-3">
                       <div className="text-[10px] uppercase text-[#e3e5e4]/50 mb-1">{attr.trait_type}</div>
                       <div className="text-sm text-white font-medium truncate">{attr.value}</div>
                       <div className="mt-2 flex items-center gap-2">
                         <div className="flex-1 h-1 rounded-full bg-[#2a2a2a] overflow-hidden">
                           <div
                             className={`h-full rounded-full ${getRarityBarColor(pct)}`}
                             style={{ width: `${Math.max(pct, 2)}%` }}
                           />
                         </div>
                         <span className={`text-[10px] font-mono ${getRarityColor(pct)}`}>
                           {pct.toFixed(1)}%
                         </span>
                       </div>
                     </div>
                   )
                 })}
               </div>
             ) : (
               <div className="text-center py-8 text-[#e3e5e4]/50 text-sm">
                 Trait data is currently being fetched...
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
