import fs from 'fs'
import path from 'path'

const BATCH_SIZE = 50
const RATE_LIMIT_DELAY = 62_000 // 62 seconds

async function updateModifiedTraits() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const traitsFile = path.join(dataDir, 'traits.json')
  const burnsFile = path.join(dataDir, 'burns.json')

  if (!fs.existsSync(traitsFile) || !fs.existsSync(burnsFile)) {
    console.error("Missing traits.json or burns.json.")
    return
  }

  const traits: Record<number, unknown> = JSON.parse(fs.readFileSync(traitsFile, 'utf8'))
  const burns = JSON.parse(fs.readFileSync(burnsFile, 'utf8'))

  // Extract all unique tokens that have been customized
  const editedIds = Array.from(new Set(burns.map((b: { receiverTokenId: string }) => parseInt(b.receiverTokenId))))
  
  console.log(`Found ${editedIds.length} unique tokens that have been customized.`)
  
  for (let start = 0; start < editedIds.length; start += BATCH_SIZE) {
    const batch = editedIds.slice(start, start + BATCH_SIZE)
    console.log(`Fetching batch ${start + 1} to ${start + batch.length} of ${editedIds.length}...`)
    
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
    let updatedCount = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settled.forEach((result: any) => { 
      const { id, data } = result
      if (data) {
        traits[id] = data 
        updatedCount++
      }
    })

    // Save incrementally
    fs.writeFileSync(traitsFile, JSON.stringify(traits, null, 2))
    console.log(`Saved ${updatedCount} successful fetches to traits.json.`)
    
    if (start + BATCH_SIZE < editedIds.length) {
      console.log(`Waiting ${RATE_LIMIT_DELAY / 1000}s for rate limit...`)
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY))
    }
  }

  console.log('Finished updating modified traits.')
}

updateModifiedTraits()
