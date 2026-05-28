'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RarityDistributionProps {
  data: { bin: string; count: number }[]
}

export function RarityDistribution({ data }: RarityDistributionProps) {
  return (
    <div className="h-80 w-full bg-[#111111] border border-[#48494b]/40 rounded-xl p-4">
      <h3 className="text-sm text-[#e3e5e4]/70 mb-4">Rarity Score Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#48494b" vertical={false} />
          <XAxis dataKey="bin" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#48494b', opacity: 0.2 }}
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px', color: '#e3e5e4' }}
          />
          <Bar dataKey="count" fill="#e3e5e4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
