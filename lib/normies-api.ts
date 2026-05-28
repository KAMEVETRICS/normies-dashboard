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
