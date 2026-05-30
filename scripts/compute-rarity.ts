import fs from 'fs'
import path from 'path'

const CONTRACT = '0x9eb6e2025b64f340691e424b7fe7022ffde12438'
const CHAIN = 'ethereum'
const TOTAL_SUPPLY = 10000
const BATCH_SIZE = 50
const RATE_LIMIT_MS = 550 // ~2 req/sec with margin

async function fetchRarityFromOpenSea() {
  const key = process.env.OPENSEA_API_KEY
  if (!key) {
    console.error('OPENSEA_API_KEY not set in environment.')
    process.exit(1)
  }

  const dataDir = path.join(process.cwd(), 'public', 'data')
  const outPath = path.join(dataDir, 'rarity-scores.json')

  // Load existing scores to allow incremental updates
  let scores: Record<number, { rank: number }> = {}
  if (fs.existsSync(outPath)) {
    try {
      scores = JSON.parse(fs.readFileSync(outPath, 'utf8'))
    } catch {
      scores = {}
    }
  }

  // Find which IDs still need fetching
  const allIds = Array.from({ length: TOTAL_SUPPLY }, (_, i) => i)
  const missingIds = allIds.filter(id => !scores[id] || !scores[id].rank)

  if (missingIds.length === 0) {
    console.log('All 10,000 rarity scores already fetched. To re-fetch, delete rarity-scores.json.')
    return
  }

  console.log(`Fetching rarity for ${missingIds.length} Normies from OpenSea...`)

  let fetched = 0
  let failed = 0

  for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
    const batch = missingIds.slice(i, i + BATCH_SIZE)

    for (const id of batch) {
      try {
        const res = await fetch(
          `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT}/nfts/${id}`,
          { headers: { 'x-api-key': key, 'accept': 'application/json' } }
        )

        if (res.status === 429) {
          // Rate limited — wait 10 seconds and retry
          console.warn(`Rate limited at ID ${id}, waiting 10s...`)
          await new Promise(r => setTimeout(r, 10000))
          i -= BATCH_SIZE // Retry this batch
          break
        }

        if (!res.ok) {
          console.warn(`Failed to fetch ID ${id}: ${res.status}`)
          failed++
          await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
          continue
        }

        const data = await res.json()
        const rank = data.nft?.rarity?.rank

        if (rank) {
          scores[id] = { rank }
          fetched++
        } else {
          // NFT exists but has no rarity (e.g. burned)
          failed++
        }

        await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
      } catch (err) {
        console.error(`Error fetching ID ${id}:`, err)
        failed++
        await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
      }
    }

    // Save progress after each batch
    fs.writeFileSync(outPath, JSON.stringify(scores, null, 2))
    const total = fetched + failed
    console.log(`Progress: ${total}/${missingIds.length} (${fetched} ok, ${failed} failed)`)
  }

  console.log(`Done. Fetched ${fetched} rarity scores, ${failed} failed.`)
}

fetchRarityFromOpenSea()
