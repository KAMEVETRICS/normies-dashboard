import Link from 'next/link'
import { NormieSearch } from './NormieSearch'

export function Nav() {
  return (
    <nav className="border-b border-[#48494b]/40 bg-black text-[#e3e5e4] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
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
      <div>
        <NormieSearch />
      </div>
    </nav>
  )
}
