'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

const CATEGORIES = [
  'Type',
  'Gender',
  'Age',
  'Hair Style',
  'Facial Feature',
  'Eyes',
  'Expression',
  'Accessory',
] as const

type TraitAttribute = { trait_type: string; value: string }
type TraitEntry = { raw: string; attributes: TraitAttribute[] }
type TraitsData = Record<string, TraitEntry>

export default function TraitsExplorerPage() {
  const [traits, setTraits] = useState<TraitsData | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Type')
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/data/traits.json')
      .then((r) => r.json())
      .then((data: TraitsData) => setTraits(data))
  }, [])

  // Pre-compute: for each category, the sorted list of unique values
  const categoryValues = useMemo(() => {
    if (!traits) return {} as Record<string, string[]>
    const map: Record<string, Set<string>> = {}
    for (const cat of CATEGORIES) map[cat] = new Set()
    for (const entry of Object.values(traits)) {
      if (!entry) continue;
      for (const attr of entry.attributes) {
        map[attr.trait_type]?.add(attr.value)
      }
    }
    const result: Record<string, string[]> = {}
    for (const cat of CATEGORIES) {
      result[cat] = Array.from(map[cat] ?? []).sort()
    }
    return result
  }, [traits])

  // Bar chart data for active category: count per value, sorted ascending (rarest at top)
  const chartData = useMemo(() => {
    if (!traits) return []
    const counts: Record<string, number> = {}
    for (const entry of Object.values(traits)) {
      if (!entry) continue;
      const val = entry.attributes.find((a) => a.trait_type === activeCategory)?.value
      if (val) counts[val] = (counts[val] || 0) + 1
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.count - b.count)
  }, [traits, activeCategory])

  // Intersection filter: count normies matching ALL selected filters
  const matchCount = useMemo(() => {
    if (!traits) return 0
    const activeFilters = Object.entries(filters).filter(([, v]) => v !== '')
    if (activeFilters.length === 0) return Object.keys(traits).length
    let count = 0
    for (const entry of Object.values(traits)) {
      if (!entry) continue;
      const matches = activeFilters.every(([cat, val]) =>
        entry.attributes.some((a) => a.trait_type === cat && a.value === val)
      )
      if (matches) count++
    }
    return count
  }, [traits, filters])

  const totalCount = traits ? Object.keys(traits).length : 0

  if (!traits) {
    return (
      <div className="flex items-center justify-center h-96 text-[#e3e5e4]/50">
        Loading traits data…
      </div>
    )
  }

  const barHeight = Math.max(chartData.length * 32, 300)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-widest text-white">TRAIT EXPLORER</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-sm font-medium text-[#e3e5e4]/70 uppercase tracking-wider mb-4 border-b border-[#48494b]/40 pb-2">
            Categories
          </h3>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-left px-4 py-2 border rounded-lg text-sm transition-colors ${
                  activeCategory === category
                    ? 'bg-[#e3e5e4] text-black border-[#e3e5e4] font-medium'
                    : 'bg-[#111111] hover:bg-[#1a1a1a] border-[#48494b]/40 text-[#e3e5e4]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="md:col-span-3 space-y-8">
          {/* Bar chart card */}
          <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">
              {activeCategory} Distribution
            </h3>
            <div style={{ width: '100%', height: barHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 120, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fill: '#e3e5e4', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #48494b',
                      borderRadius: 8,
                      color: '#e3e5e4',
                      fontSize: 13,
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      `${Number(value || 0).toLocaleString()} (${((Number(value || 0) / totalCount) * 100).toFixed(1)}%)`,
                      'Count',
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList 
                      dataKey="count" 
                      position="right" 
                      fill="#e3e5e4" 
                      fontSize={12} 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => `${Number(value || 0).toLocaleString()} (${((Number(value || 0) / totalCount) * 100).toFixed(1)}%)`} 
                    />
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="#e3e5e4" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Intersection filter */}
          <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
            <h3 className="font-medium text-white mb-1">Trait Intersection Filter</h3>
            <p className="text-sm text-[#e3e5e4]/50 mb-5">
              Select traits across categories to see how many Normies share the exact combination.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <div key={cat}>
                  <label className="block text-xs text-[#e3e5e4]/70 mb-1">{cat}</label>
                  <select
                    value={filters[cat] ?? ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [cat]: e.target.value }))
                    }
                    className="w-full bg-[#1a1a1a] border border-[#48494b]/40 rounded-lg px-3 py-2 text-sm text-[#e3e5e4] focus:outline-none focus:border-[#e3e5e4]/60"
                  >
                    <option value="">Any</option>
                    {(categoryValues[cat] ?? []).map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#48494b]/40 pt-4">
              <div>
                <span className="text-4xl font-bold text-white">
                  {matchCount.toLocaleString()}
                </span>
                <span className="text-sm text-[#e3e5e4]/70 ml-2">
                  / {totalCount.toLocaleString()} Normies match
                </span>
              </div>
              <button
                onClick={() => setFilters({})}
                className="text-sm text-[#e3e5e4]/50 hover:text-[#e3e5e4] transition-colors px-3 py-1 border border-[#48494b]/40 rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
