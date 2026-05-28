import fs from 'fs'
import path from 'path'

export interface BurnEntry {
  commitId: string
  owner: string
  receiverTokenId: string
  tokenCount: string
  timestamp: string
  txHash: string
  totalActions: string
  blockNumber: string
}

export interface BurnedToken {
  tokenId: string
}

export function getBurns(): BurnEntry[] {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'burns.json')
    if (!fs.existsSync(filePath)) return []
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading burns:", error)
    return []
  }
}

export function getBurnedTokens(): BurnedToken[] {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'burned-tokens.json')
    if (!fs.existsSync(filePath)) return []
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading burned tokens:", error)
    return []
  }
}
