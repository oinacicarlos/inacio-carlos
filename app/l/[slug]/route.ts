import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MOCK_LINK_DESTINATIONS: Record<string, string> = {
  'instagram-bio': 'https://instagram.com/inaciocarlos',
  'whatsapp-comercial': 'https://wa.me/5511999999999',
  aplicacao: 'http://localhost:3000/',
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const requestUrl = new URL(request.url)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const fallbackDestinationUrl = getFallbackDestinationUrl(requestUrl, params.slug)
  let destinationUrl = fallbackDestinationUrl
  let linkId = ''

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
      })

      const { data: trackedLink } = await supabase
        .from('tracked_links')
        .select('id, destination_url')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .maybeSingle()

      if (trackedLink?.destination_url) {
        destinationUrl = trackedLink.destination_url
        linkId = trackedLink.id
      }

      if (linkId) {
        await supabase.from('tracked_link_clicks').insert({
          link_id: linkId,
          source: getTrafficSource(request),
          referrer: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent'),
          utm_source: requestUrl.searchParams.get('utm_source'),
          utm_medium: requestUrl.searchParams.get('utm_medium'),
          utm_campaign: requestUrl.searchParams.get('utm_campaign'),
        })
      }
    } catch {
      destinationUrl = fallbackDestinationUrl
    }
  }

  return NextResponse.redirect(destinationUrl)
}

function getFallbackDestinationUrl(requestUrl: URL, slug: string) {
  const destinationFromQuery = requestUrl.searchParams.get('to')

  if (destinationFromQuery && isSafeRedirectUrl(destinationFromQuery)) {
    return destinationFromQuery
  }

  return MOCK_LINK_DESTINATIONS[slug] ?? requestUrl.origin
}

function isSafeRedirectUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function getTrafficSource(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const utmSource = requestUrl.searchParams.get('utm_source')

  if (utmSource) {
    return normalizeSourceName(utmSource)
  }

  const referrer = request.headers.get('referer')

  if (!referrer) {
    return 'Direto'
  }

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, '')

    if (hostname.includes('instagram')) return 'Instagram'
    if (hostname.includes('tiktok')) return 'TikTok'
    if (hostname.includes('facebook') || hostname.includes('fb.')) return 'Facebook'
    if (hostname.includes('whatsapp') || hostname.includes('wa.me')) return 'WhatsApp'
    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('youtube')) return 'YouTube'
    if (hostname.includes('linkedin')) return 'LinkedIn'

    return hostname
  } catch {
    return 'Direto'
  }
}

function normalizeSourceName(source: string) {
  return source
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}
