import { StatCard } from '@/components/StatCard'
import { TypePieChart } from '@/components/TypePieChart'
import { getTraits, getRarityScores } from '@/lib/rarity'
import { getBurnedTokens } from '@/lib/data-loader'
import { Flame, Sparkles, Hash, Ghost } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function OverviewPage() {
  const traits = getTraits()
  const scores = getRarityScores()

  const totalSupply = Object.keys(traits).length || 10000
  const burnedTokens = getBurnedTokens()
  const totalBurned = burnedTokens.length

  // Count how many times each trait value appears across all Normies
  const traitValueCounts: Record<string, number> = {}
  // Calculate Type distribution
  const typeCounts: Record<string, number> = { Human: 0, Cat: 0, Alien: 0, Agent: 0 }

  Object.values(traits).forEach(t => {
    if (!t) return
    const type = t.attributes.find(a => a.trait_type === 'Type')?.value
    if (type && typeCounts[type] !== undefined) {
      typeCounts[type]++
    }
    
    // Accumulate per-value counts for rarest combo computation
    t.attributes.forEach(attr => {
      const key = `${attr.trait_type}: ${attr.value}`
      traitValueCounts[key] = (traitValueCounts[key] || 0) + 1
    })
  })

  const typeData = Object.entries(typeCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const mostCommonType = typeData.length > 0 ? typeData[0].name : 'N/A'

  // Compute rarest combo: find rank-1 Normie, then pick its two rarest traits
  let rarestCombo = 'N/A'
  const rank1Id = Object.entries(scores).find(([, s]) => s.rank === 1)?.[0]
  if (rank1Id) {
    const rank1Traits = traits[Number(rank1Id)]
    if (rank1Traits) {
      // Sort this Normie's traits by global frequency (ascending = rarest first)
      const sorted = [...rank1Traits.attributes]
        .map(attr => ({ label: attr.value, count: traitValueCounts[`${attr.trait_type}: ${attr.value}`] || 0 }))
        .sort((a, b) => a.count - b.count)
      const top2 = sorted.slice(0, 2).map(t => t.label)
      rarestCombo = top2.join(' + ')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Total Supply" value={totalSupply.toLocaleString()} icon={<Hash className="w-4 h-4" />} />
          <StatCard title="Total Burned" value={totalBurned.toLocaleString()} icon={<Flame className="w-4 h-4 text-orange-500" />} />
          <StatCard title="Rarest Combo" value={rarestCombo} subtitle={rank1Id ? `Normie #${rank1Id}` : undefined} icon={<Sparkles className="w-4 h-4 text-yellow-500" />} />
          <StatCard title="Most Common Type" value={mostCommonType} icon={<Ghost className="w-4 h-4" />} />
        </div>
        <div className="lg:col-span-1">
          <TypePieChart data={typeData} />
        </div>
      </div>
    </div>
  )
}
