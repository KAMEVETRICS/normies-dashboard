import fs from 'fs'
import path from 'path'

const BATCH_SIZE = 50
const RATE_LIMIT_DELAY = 62_000 // 62 seconds between batches

async function fetchAllTraits() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const traitsFile = path.join(dataDir, 'traits.json')
  let results: Record<number, unknown> = {}

  if (fs.existsSync(traitsFile)) {
    results = JSON.parse(fs.readFileSync(traitsFile, 'utf8'))
    console.log(`Loaded ${Object.keys(results).length} existing traits. Resuming...`)
  }

  for (let start = 0; start < 10_000; start += BATCH_SIZE) {
    // Check if this batch is already done (no missing or null entries)
    const isBatchDone = Array.from({ length: BATCH_SIZE }, (_, i) => start + i).every(id => results[id] !== undefined && results[id] !== null)
    if (isBatchDone) {
      console.log(`Skipping batch ${start} - ${start + BATCH_SIZE - 1}, already fetched.`)
      continue
    }

    const batch = Array.from({ length: BATCH_SIZE }, (_, i) => start + i)
    const promises = batch.map(id =>
      fetch(`https://api.normies.art/normie/${id}/traits`)
        .then(async r => {
          if (!r.ok) {
            console.error(`Error fetching ID ${id}: ${r.status}`)
            return { id, data: null }
          }
          const data = await r.json()
          return { id, data }
        })
        .catch(err => {
          console.error(`Network error for ID ${id}:`, err)
          return { id, data: null }
        })
    )

    const settled = await Promise.all(promises)
    settled.forEach(({ id, data }) => { results[id] = data })

    // Save incrementally
    fs.writeFileSync(traitsFile, JSON.stringify(results, null, 2))
    console.log(`Fetched and saved up to ${Math.min(start + BATCH_SIZE, 10_000)} / 10000`)

    if (start + BATCH_SIZE < 10_000) {
      console.log(`Waiting ${RATE_LIMIT_DELAY / 1000}s for rate limit...`)
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY))
    }
  }

  console.log('Done fetching all traits.')
}

fetchAllTraits()
