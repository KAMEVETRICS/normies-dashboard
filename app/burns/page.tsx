'use client'

import { useState, useEffect, useMemo } from 'react'
import { Flame, Users, Hash } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts'
import { StatCard } from '@/components/StatCard'

type BurnEntry = {
  commitId: string
  owner: string
  receiverTokenId: string
  tokenCount: number
  timestamp: string
  txHash: string
  totalActions: string
  blockNumber: string
}

type TraitAttribute = { trait_type: string; value: string }
type TraitEntry = { raw: string; attributes: TraitAttribute[] }
type TraitsData = Record<string, TraitEntry | null>

export default function BurnsPage() {
  const [burns, setBurns] = useState<BurnEntry[]>([])
  const [burnedTokens, setBurnedTokens] = useState<{ tokenId: string; txHash?: string; timestamp?: string }[]>([])
  const [traits, setTraits] = useState<TraitsData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/burns.json').then(r => r.json()),
      fetch('/data/burned-tokens.json').then(r => r.json()),
      fetch('/data/traits.json').then(r => r.json())
    ]).then(([burnsData, burnedTokensData, traitsData]) => {
      setBurns(burnsData)
      setBurnedTokens(burnedTokensData)
      setTraits(traitsData)
      setLoading(false)
    })
  }, [])

  const totalBurns = burns.length
  const totalTokensBurned = burns.reduce((sum, b) => sum + (Number(b.tokenCount) || 1), 0)
  const uniqueBurners = new Set(burns.map(b => b.owner)).size

  // Burn Timeline Chart (grouped by week)
  const timelineData = useMemo(() => {
    if (!burns.length) return []
    const weekCounts: Record<string, number> = {}
    burns.forEach(b => {
      const date = new Date(Number(b.timestamp) * 1000)
      // Get start of week (Sunday)
      const day = date.getDay()
      const diff = date.getDate() - day
      const weekStart = new Date(date.setDate(diff))
      weekStart.setHours(0, 0, 0, 0)
      const weekKey = weekStart.toISOString()
      weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1
    })

    return Object.entries(weekCounts)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        timestamp: new Date(date).getTime(),
        count
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [burns])

  // Trait Distribution of Burned Normies (Type)
  const typeData = useMemo(() => {
    if (!burnedTokens.length || !Object.keys(traits).length) return []
    const counts: Record<string, number> = {}
    burnedTokens.forEach(token => {
      const tokenId = token.tokenId
      const normieTraits = traits[tokenId]
      if (normieTraits) {
        const type = normieTraits.attributes.find(a => a.trait_type === 'Type')?.value
        if (type) {
          counts[type] = (counts[type] || 0) + 1
        }
      }
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.count - b.count)
  }, [burnedTokens, traits])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[#e3e5e4]/50">
        Loading burn analytics...
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">BURN ANALYTICS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Burn Transactions" value={totalBurns.toLocaleString()} icon={<Flame className="w-4 h-4 text-orange-500" />} />
        <StatCard title="Total Tokens Burned" value={totalTokensBurned.toLocaleString()} icon={<Hash className="w-4 h-4" />} />
        <StatCard title="Unique Burners" value={uniqueBurners.toLocaleString()} icon={<Users className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-white mb-6">Burn Timeline (Weekly)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#48494b" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px', color: '#e3e5e4' }}
                  itemStyle={{ color: '#e3e5e4' }}
                />
                <Line type="monotone" name="Burns" dataKey="count" stroke="#e3e5e4" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-white mb-6">Burned Types</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#48494b', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px', color: '#e3e5e4' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#e3e5e4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
        <h3 className="text-sm font-medium text-[#e3e5e4]/70 uppercase mb-6 tracking-wider border-b border-[#48494b]/20 pb-2">
          The Graveyard (Recent Burns)
        </h3>
        
        {burnedTokens.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {burnedTokens.slice(0, 100).map(token => (
              <a href={`/normie/${token.tokenId}`} key={`${token.tokenId}-${token.txHash}`} className="group block">
                <div className="bg-[#1a1a1a] border border-[#48494b]/40 rounded-lg overflow-hidden transition-all duration-200 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:-translate-y-1">
                  <div className="aspect-square bg-[#0a0a0a] relative opacity-80 group-hover:opacity-100 transition-opacity">
                    <img 
                      src={`https://api.normies.art/history/burned/${token.tokenId}/image.svg`} 
                      alt={`Burned Normie ${token.tokenId}`}
                      className="w-full h-full object-cover rendering-pixelated grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <div className="w-full">
                        <div className="font-bold text-white text-sm mb-1 line-through decoration-red-500/50">#{token.tokenId}</div>
                        <div className="text-[10px] text-[#e3e5e4]/60 uppercase tracking-wider">
                          {new Date(Number(token.timestamp) * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#e3e5e4]/50">
            No burns recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
