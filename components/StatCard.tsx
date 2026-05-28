import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex justify-between items-center text-sm text-[#e3e5e4]/70">
        <span>{title}</span>
        {icon && <span className="opacity-50">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[#e3e5e4]/50 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  )
}
