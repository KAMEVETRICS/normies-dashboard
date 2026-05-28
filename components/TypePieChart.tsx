'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface TypePieChartProps {
  data: { name: string; value: number }[]
}

const COLORS = ['#e3e5e4', '#a0a0a0', '#707070', '#48494b']

export function TypePieChart({ data }: TypePieChartProps) {
  return (
    <div className="h-80 w-full bg-[#111111] border border-[#48494b]/40 rounded-xl p-4">
      <h3 className="text-sm text-[#e3e5e4]/70 mb-4">Type Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #48494b', borderRadius: '8px' }}
            itemStyle={{ color: '#e3e5e4' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
