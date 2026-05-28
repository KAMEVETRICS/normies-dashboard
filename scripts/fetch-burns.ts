import fs from 'fs'
import path from 'path'

async function fetchPaginated(url: string, filename: string, dataDir: string) {
  let offset = 0
  const limit = 50
  const allData: unknown[] = []
  let hasMore = true

  console.log(`Fetching ${filename}...`)
  while (hasMore) {
    const res = await fetch(`${url}?limit=${limit}&offset=${offset}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${filename} at offset ${offset}: HTTP ${res.status}`)
    }
    const data = await res.json()
    
    const items = Array.isArray(data) ? data : data.items || data.burns || []
    
    if (items.length === 0) {
      hasMore = false
    } else {
      allData.push(...items)
      offset += limit
      console.log(`Fetched ${allData.length} items for ${filename}...`)
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  // Only write after a fully successful fetch
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(allData, null, 2))
  console.log(`Finished fetching ${allData.length} items for ${filename}.`)
}

async function fetchBurns() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  await fetchPaginated('https://api.normies.art/history/burns', 'burns.json', dataDir)
  await fetchPaginated('https://api.normies.art/history/burned-tokens', 'burned-tokens.json', dataDir)
}

fetchBurns()
