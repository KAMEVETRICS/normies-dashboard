'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DailySale } from '@/lib/dune-client'

interface SalesPriceChartProps {
  data: DailySale[]
}

export function SalesPriceChart({ data }: SalesPriceChartProps) {
  // Reverse the data so it reads left-to-right chronologically
  const chartData = [...data].reverse().map(d => ({
    ...d,
    floor_usd: Number(d.floor_usd || 0),
    avg_usd: Number(d.avg_usd || 0),
    dateStr: new Date(d.sale_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-sm font-medium text-white mb-6">Daily Floor vs Average Price (USD)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#48494b" vertical={false} />
            <XAxis dataKey="dateStr" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px', color: '#e3e5e4' }}
              itemStyle={{ color: '#e3e5e4' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`$${Math.round(Number(value || 0)).toLocaleString()}`, undefined]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line type="monotone" name="Floor Price" dataKey="floor_usd" stroke="#e3e5e4" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Average Price" dataKey="avg_usd" stroke="#888888" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
