const BASE = 'https://api.apify.com/v2'

export interface GooglePlaceLead {
  title: string
  address?: string
  phone?: string
  website?: string
  totalScore?: number
  reviewsCount?: number
  categoryName?: string
  url?: string
  city?: string
  street?: string
}

export async function scrapeGoogleMaps(
  query: string,
  maxItems = 20,
  timeoutSecs = 150
): Promise<GooglePlaceLead[]> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN não configurado')

  const url = new URL(`${BASE}/acts/compass~crawler-google-places/run-sync-get-dataset-items`)
  url.searchParams.set('token', token)
  url.searchParams.set('limit', String(maxItems))
  url.searchParams.set('timeout', String(timeoutSecs))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), (timeoutSecs + 15) * 1000)

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: maxItems,
        language: 'pt-BR',
        maxImages: 0,
        maxReviews: 0,
        includeHistogram: false,
        includeOpeningHours: false,
        includePeopleAlsosearch: false,
      }),
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Apify ${res.status}: ${body}`)
    }

    const data = await res.json()
    return (Array.isArray(data) ? data : data.items ?? []) as GooglePlaceLead[]
  } finally {
    clearTimeout(timer)
  }
}
