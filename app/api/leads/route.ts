import { NextRequest, NextResponse } from 'next/server'
import { scrapeGoogleMaps } from '@/src/lib/apifyClient'

export async function POST(req: NextRequest) {
  try {
    const { nicho, cidade, maxItems = 20 } = await req.json()

    if (!nicho?.trim() || !cidade?.trim()) {
      return NextResponse.json(
        { error: 'Informe nicho e cidade' },
        { status: 400 }
      )
    }

    const query = `${nicho.trim()} em ${cidade.trim()}`
    const results = await scrapeGoogleMaps(query, Math.min(maxItems, 50))

    return NextResponse.json({ results, query })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
