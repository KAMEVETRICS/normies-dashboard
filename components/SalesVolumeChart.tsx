'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailySale } from '@/lib/dune-client'

interface SalesVolumeChartProps {
  data: DailySale[]
}

export function SalesVolumeChart({ data }: SalesVolumeChartProps) {
  // Reverse the data so it reads left-to-right chronologically
  const chartData = [...data].reverse().map(d => ({
    ...d,
    dateStr: new Date(d.sale_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-sm font-medium text-white mb-6">Daily Trade Volume (USD)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#48494b" vertical={false} />
            <XAxis dataKey="dateStr" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} />
            <Tooltip 
              cursor={{ fill: '#48494b', opacity: 0.2 }}
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px', color: '#e3e5e4' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`$${Math.round(Number(value || 0)).toLocaleString()}`, undefined]}
            />
            <Bar dataKey="volume_usd" fill="#e3e5e4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
