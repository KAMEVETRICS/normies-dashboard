const BASE_URL = 'https://api.normies.art'

export async function fetchCanvasStatus() {
  try {
    const res = await fetch(`${BASE_URL}/canvas/status`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching canvas status:', error)
    return null
  }
}

export async function fetchCanvasStats() {
  try {
    const res = await fetch(`${BASE_URL}/history/stats`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching canvas stats:', error)
    return null
  }
}

export async function fetchNormieMetadata(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/normie/${id}/metadata`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error(`Error fetching metadata for normie ${id}:`, error)
    return null
  }
}

export async function fetchNormieOwner(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/normie/${id}/owner`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error(`Error fetching owner for normie ${id}:`, error)
    return null
  }
}

export async function fetchNormieVersions(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/history/normie/${id}/versions`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return await res.json()
  } catch (error) {
    console.error(`Error fetching versions for normie ${id}:`, error)
    return []
  }
}

export async function fetchNormiePixels(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/normie/${id}/pixels`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.text()
  } catch (error) {
    console.error(`Error fetching pixels for normie ${id}:`, error)
    return null
  }
}

export async function fetchHolderTokens(address: string) {
  try {
    const res = await fetch(`${BASE_URL}/holders/${address}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.tokenIds || []
  } catch (error) {
    console.error(`Error fetching tokens for holder ${address}:`, error)
    return []
  }
}

export async function fetchLiveOpenSeaRarity(id: number) {
  try {
    const apiKey = process.env.OPENSEA_API_KEY
    if (!apiKey) return null
    const res = await fetch(`https://api.opensea.io/api/v2/chain/ethereum/contract/0x9eb6e2025b64f340691e424b7fe7022ffde12438/nfts/${id}`, {
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json'
      },
      next: { revalidate: 60 } // Cache for 60 seconds so rapid refreshes don't spam the API
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.nft?.rarity?.rank || null
  } catch (error) {
    console.error(`Error fetching live rarity for ${id}:`, error)
    return null
  }
}

export async function fetchZombieStatus() {
  try {
    const res = await fetch(`${BASE_URL}/zombies/status`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching zombie status:', error)
    return null
  }
}

export async function fetchZombieConversions() {
  try {
    const res = await fetch(`${BASE_URL}/zombies/conversions?limit=100`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return await res.json()
  } catch (error) {
    console.error('Error fetching zombie conversions:', error)
    return []
  }
}

export async function fetchZombieToken(id: number) {
  try {
    const res = await fetch(`${BASE_URL}/zombies/token/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error(`Error fetching zombie info for ${id}:`, error)
    return null
  }
}

export async function fetchHistoryStats() {
  try {
    const res = await fetch(`${BASE_URL}/history/stats`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching history stats:', error)
    return null
  }
}

export async function fetchOpenSeaStats() {
  try {
    const apiKey = process.env.OPENSEA_API_KEY
    if (!apiKey) return null
    const res = await fetch('https://api.opensea.io/api/v2/collections/normies/stats', {
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json'
      },
      next: { revalidate: 60 }
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching OpenSea stats:', error)
    return null
  }
}


