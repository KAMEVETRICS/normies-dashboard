'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NormieSearch } from './NormieSearch'
import { Menu, X } from 'lucide-react'

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-[#48494b]/40 bg-black text-[#e3e5e4] sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold tracking-widest text-white">
            NORMIE ANALYTICS
          </Link>
          <div className="space-x-6 hidden md:flex text-sm font-medium text-[#e3e5e4]/70">
            <Link href="/traits" className="hover:text-white transition-colors">Traits</Link>
            <Link href="/burns" className="hover:text-white transition-colors">Burns</Link>
            <Link href="/canvas" className="hover:text-white transition-colors">Canvas</Link>
            <Link href="/sales" className="hover:text-white transition-colors">Sales</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <NormieSearch />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#48494b]/40 px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-[#e3e5e4]/70">
            <Link href="/traits" onClick={() => setMenuOpen(false)} className="hover:text-white transition-colors py-2">Traits</Link>
            <Link href="/burns" onClick={() => setMenuOpen(false)} className="hover:text-white transition-colors py-2">Burns</Link>
            <Link href="/canvas" onClick={() => setMenuOpen(false)} className="hover:text-white transition-colors py-2">Canvas</Link>
            <Link href="/sales" onClick={() => setMenuOpen(false)} className="hover:text-white transition-colors py-2">Sales</Link>
          </div>
          <div className="pt-2 border-t border-[#48494b]/20">
            <NormieSearch />
          </div>
        </div>
      )}
    </nav>
  )
}
