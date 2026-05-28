'use client'

import { useState } from 'react'

interface NormieImageViewerProps {
  id: string
  pixels: string | null
}

export function NormieImageViewer({ id, pixels }: NormieImageViewerProps) {
  const [view, setView] = useState<'current' | 'original' | 'pixels'>('current')

  // The 1600 character string needs to be broken into 40 lines of 40 characters
  const renderPixelMatrix = () => {
    if (!pixels) return <div className="text-[#e3e5e4]/50 flex items-center justify-center h-full">Pixel data not available</div>
    
    // Create an array of 40 rows
    const rows = []
    for (let i = 0; i < 40; i++) {
      rows.push(pixels.substring(i * 40, (i + 1) * 40))
    }

    return (
      <div className="w-full h-full bg-[#111] flex items-center justify-center font-mono text-[10px] leading-[10px]">
        <div style={{ letterSpacing: '0.4em' }}>
          {rows.map((row, i) => (
            <div key={i} className="flex">
              {row.split('').map((char, j) => (
                <span 
                  key={j} 
                  className={char === '1' ? 'text-green-500' : 'text-[#e3e5e4]/20'}
                >
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-[#111111] border border-[#48494b]/40 rounded-xl overflow-hidden aspect-square relative flex-1">
        {view === 'current' && (
          <img 
            src={`https://api.normies.art/normie/${id}/image.svg`} 
            alt={`Normie ${id}`}
            className="w-full h-full object-cover rendering-pixelated absolute inset-0"
          />
        )}
        {view === 'original' && (
          <img 
            src={`https://api.normies.art/normie/${id}/original/image.svg`} 
            alt={`Normie ${id} Original`}
            className="w-full h-full object-cover rendering-pixelated absolute inset-0"
          />
        )}
        {view === 'pixels' && renderPixelMatrix()}
      </div>
      
      <div className="flex p-1 bg-[#1a1a1a] border border-[#48494b]/40 rounded-lg">
        <button 
          onClick={() => setView('current')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${view === 'current' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-[#e3e5e4]/60 hover:text-white'}`}
        >
          Current
        </button>
        <button 
          onClick={() => setView('original')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${view === 'original' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-[#e3e5e4]/60 hover:text-white'}`}
        >
          Original
        </button>
        <button 
          onClick={() => setView('pixels')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${view === 'pixels' ? 'bg-[#2a2a2a] text-green-400 shadow-sm' : 'text-[#e3e5e4]/60 hover:text-green-400'}`}
        >
          Raw Pixels
        </button>
      </div>
    </div>
  )
}
