'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Line,
  Bar,
  Legend
} from 'recharts'

interface MarketCapChartProps {
  data: {
    date: string
    marketCap: number
    floorPrice: number
    supply: number
    burns: number
    uniqueHolders: number | null
  }[]
}

export function MarketCapChart({ data }: MarketCapChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  return (
    <div className="h-[28rem] w-full bg-[#111111] border border-[#48494b]/40 rounded-xl p-6">
      <h3 className="font-medium text-white mb-6">Market Cap, Daily Burns & Unique Holders</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#48494b" vertical={false} opacity={0.4} />
          <XAxis 
            dataKey="date" 
            stroke="#e3e5e4" 
            opacity={0.5}
            tick={{ fill: '#e3e5e4', fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(str) => {
              const d = new Date(str)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#e3e5e4"
            opacity={0.5}
            tick={{ fill: '#e3e5e4', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
              return `$${value}`
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#e3e5e4"
            opacity={0.5}
            tick={{ fill: '#e3e5e4', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px' }}
            itemStyle={{ color: '#e3e5e4' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (name === 'Market Cap') return [formatCurrency(value), name]
              if (name === 'Daily Burns') return [value, name]
              if (name === 'Unique Holders') return [value, name]
              return [value, name]
            }}
            labelStyle={{ color: '#e3e5e4', marginBottom: '8px' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Area yAxisId="left" type="monotone" dataKey="marketCap" name="Market Cap" stroke="#22c55e" fillOpacity={1} fill="url(#colorMarketCap)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="uniqueHolders" name="Unique Holders" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Bar yAxisId="right" dataKey="burns" name="Daily Burns" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
