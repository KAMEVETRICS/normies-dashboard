import { StatCard } from '@/components/StatCard'
import { TypePieChart } from '@/components/TypePieChart'
import { getTraits, getRarityScores } from '@/lib/rarity'
import { getBurnedTokens } from '@/lib/data-loader'
import { fetchHistoryStats, fetchOpenSeaStats } from '@/lib/normies-api'
import { getDailyHolders, getDailySales } from '@/lib/dune-client'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function OverviewPage() {
  const traits = getTraits()
  const scores = getRarityScores()

  const totalSupply = Object.keys(traits).length || 10000
  const burnedTokens = getBurnedTokens()
  const totalBurned = burnedTokens.length
  
  const [historyStats, osStats, holdersData, daily] = await Promise.all([
    fetchHistoryStats(),
    fetchOpenSeaStats(),
    getDailyHolders(),
    getDailySales()
  ])
  
  const totalZombies = historyStats?.totalZombies ?? 0

  const currentFloor = daily[0]?.floor_usd || 0
  const osMarketCap = Math.round(osStats?.total?.market_cap ? osStats.total.market_cap : (currentFloor * (10000 - totalBurned)))
  const uniqueHolders = osStats?.total?.num_owners || (holdersData.length > 0 ? holdersData[0].unique_holders : 'N/A')


  // Count how many times each trait value appears across all Normies
  const traitValueCounts: Record<string, number> = {}
  // Calculate Type distribution
  const typeCounts: Record<string, number> = { Human: 0, Cat: 0, Alien: 0, Agent: 0, Zombie: 0 }

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

  // Override zombie count with live API data (traits.json won't have zombies yet)
  if (totalZombies > 0) {
    typeCounts['Zombie'] = totalZombies
  }

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
          <StatCard title="Market Cap" value={`$${osMarketCap.toLocaleString()}`} />
          <StatCard title="Total Supply" value={totalSupply.toLocaleString()} />
          
          <StatCard title="Unique Holders" value={uniqueHolders.toLocaleString()} />
          <StatCard title="Total Burned" value={totalBurned.toLocaleString()} />
          
          <StatCard title="Total Zombies" value={totalZombies.toLocaleString()} />
          <StatCard title="Rarest Combo" value={rarestCombo} subtitle={rank1Id ? `Normie #${rank1Id}` : undefined} />
          
          <StatCard title="Most Common Type" value={mostCommonType} />
        </div>
        <div className="lg:col-span-1">
          <TypePieChart data={typeData} />
        </div>
      </div>
    </div>
  )
}

