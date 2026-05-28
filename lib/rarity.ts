import fs from 'fs'
import path from 'path'

export type TraitAttribute = {
  trait_type: string
  value: string
}

export type NormieTraits = {
  raw: string
  attributes: TraitAttribute[]
}

export type RarityScore = {
  score: number
  rank: number
}

export function getRarityScores(): Record<number, RarityScore> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'rarity-scores.json')
    if (!fs.existsSync(filePath)) return {}
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading rarity scores:", error)
    return {}
  }
}

export function getTraits(): Record<number, NormieTraits> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'traits.json')
    if (!fs.existsSync(filePath)) return {}
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading traits:", error)
    return {}
  }
}
