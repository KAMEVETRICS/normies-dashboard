'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NormieSearch() {
  const [id, setId] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = id.trim()
    if (!trimmed) return
    
    if (trimmed.startsWith('0x')) {
      router.push(`/holder/${trimmed}`)
    } else if (!isNaN(Number(trimmed))) {
      router.push(`/normie/${trimmed}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e3e5e4]/50" />
        <input 
          type="text" 
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Token ID or 0x..." 
          className="bg-[#1a1a1a] border border-[#48494b] rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-[#e3e5e4] transition-colors w-48 text-[#e3e5e4]"
        />
      </div>
      <button 
        type="submit" 
        className="bg-[#e3e5e4] text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white transition-colors"
      >
        Search
      </button>
    </form>
  )
}
