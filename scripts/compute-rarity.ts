import fs from 'fs'
import path from 'path'

type TraitAttribute = { trait_type: string; value: string }
type NormieEntry = { raw: string; attributes: TraitAttribute[] } | null

function computeRarity() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const traitsPath = path.join(dataDir, 'traits.json')
  
  if (!fs.existsSync(traitsPath)) {
    console.error('traits.json not found. Run fetch-all-traits.ts first.')
    process.exit(1)
  }

  const traitsData: Record<string, NormieEntry> = JSON.parse(fs.readFileSync(traitsPath, 'utf8'))
  const totalSupply = Object.keys(traitsData).length
  
  // For each trait category, calculate frequency of each value
  const traitFrequency: Record<string, Record<string, number>> = {}

  for (const [, entry] of Object.entries(traitsData)) {
    if (!entry) continue
    for (const attr of entry.attributes) {
      if (!traitFrequency[attr.trait_type]) traitFrequency[attr.trait_type] = {}
      if (!traitFrequency[attr.trait_type][attr.value]) traitFrequency[attr.trait_type][attr.value] = 0
      traitFrequency[attr.trait_type][attr.value]++
    }
  }

  // Calculate inverse frequency score for each normie
  const scores: { id: number; score: number }[] = []

  for (const [idStr, normieTraits] of Object.entries(traitsData)) {
    if (!normieTraits) continue
    let score = 0
    for (const attr of normieTraits.attributes) {
      const frequency = traitFrequency[attr.trait_type]?.[attr.value]
      if (frequency) {
        score += totalSupply / frequency
      }
    }
    scores.push({ id: parseInt(idStr), score })
  }

  // Find min and max for normalization
  const minScore = Math.min(...scores.map(s => s.score))
  const maxScore = Math.max(...scores.map(s => s.score))

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score)

  // Map to final output format: { [id]: { score (0-100), rank (1-10000) } }
  const rarityScores: Record<number, { score: number; rank: number }> = {}

  scores.forEach((item, index) => {
    // Normalize to 0-100
    const normalizedScore = ((item.score - minScore) / (maxScore - minScore)) * 100
    rarityScores[item.id] = {
      score: parseFloat(normalizedScore.toFixed(2)),
      rank: index + 1
    }
  })

  fs.writeFileSync(path.join(dataDir, 'rarity-scores.json'), JSON.stringify(rarityScores, null, 2))
  console.log(`Computed rarity for ${scores.length} items.`)
}

computeRarity()
