import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_ROUTES = ['/admin', '/clientes', '/pfx', '/boletos', '/solicitacoes-clientes', '/onboarding-clientes']
const LEGACY_ADMIN_ROUTES = ['/crm', '/contabilidade']
const HUB_ROUTES = ['/hub']

function createNonce() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function buildContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production'
  const directives: Array<[string, string[]]> = [
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['object-src', ["'none'"]],
    ['frame-ancestors', ["'self'"]],
    [
      'script-src',
      [
        "'self'",
        `'nonce-${nonce}'`,
        ...(isDev ? ["'unsafe-eval'"] : []),
        'https://www.googletagmanager.com',
        'https://www.googleadservices.com',
        'https://www.google.com',
        'https://pagead2.googlesyndication.com',
        'https://googleads.g.doubleclick.net',
        'https://tagmanager.google.com',
        'https://connect.facebook.net',
      ],
    ],
    [
      'script-src-elem',
      [
        "'self'",
        `'nonce-${nonce}'`,
        'https://www.googletagmanager.com',
        'https://www.googleadservices.com',
        'https://www.google.com',
        'https://pagead2.googlesyndication.com',
        'https://googleads.g.doubleclick.net',
        'https://tagmanager.google.com',
        'https://connect.facebook.net',
      ],
    ],
    [
      'connect-src',
      [
        "'self'",
        'https://mxgiolzcpoekruuawiph.supabase.co',
        'https://www.googletagmanager.com',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://www.googleadservices.com',
        'https://googleads.g.doubleclick.net',
        'https://ad.doubleclick.net',
        'https://pagead2.googlesyndication.com',
        'https://www.google.com',
        'https://google.com',
        'https://www.facebook.com',
      ],
    ],
    [
      'img-src',
      [
        "'self'",
        'data:',
        'blob:',
        'https://mxgiolzcpoekruuawiph.supabase.co',
        'https://www.googletagmanager.com',
        'https://*.google-analytics.com',
        'https://googleads.g.doubleclick.net',
        'https://www.google.com',
        'https://google.com',
        'https://www.google.com.br',
        'https://www.googleadservices.com',
        'https://pagead2.googlesyndication.com',
        'https://ssl.gstatic.com',
        'https://www.gstatic.com',
        'https://www.facebook.com',
      ],
    ],
    ['frame-src', ["'self'", 'https://www.googletagmanager.com']],
    [
      'style-src',
      [
        "'self'",
        `'nonce-${nonce}'`,
        'https://www.googletagmanager.com',
        'https://tagmanager.google.com',
        'https://fonts.googleapis.com',
      ],
    ],
    ['style-src-attr', ["'unsafe-inline'"]],
    ['font-src', ["'self'", 'data:', 'https://fonts.gstatic.com']],
  ]

  return directives.map(([directive, values]) => `${directive} ${values.join(' ')}`).join('; ')
}

function setContentSecurityPolicy(response: NextResponse, contentSecurityPolicy: string | null) {
  if (contentSecurityPolicy) {
    response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  }
}

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

function redirectPreservingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  contentSecurityPolicy: string | null,
) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url))
  response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))
  setContentSecurityPolicy(redirectResponse, contentSecurityPolicy)
  return redirectResponse
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = createNonce()
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  setContentSecurityPolicy(response, contentSecurityPolicy)

  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES)
  const isLegacyAdminRoute = matchesRoute(pathname, LEGACY_ADMIN_ROUTES)
  const isHubRoute = matchesRoute(pathname, HUB_ROUTES)

  if (!isAdminRoute && !isLegacyAdminRoute && !isHubRoute) {
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        setContentSecurityPolicy(response, contentSecurityPolicy)
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectPreservingCookies(request, response, '/login', contentSecurityPolicy)
  }

  if (isHubRoute && pathname !== '/hub') {
    return redirectPreservingCookies(request, response, '/hub', contentSecurityPolicy)
  }

  if (isAdminRoute || isLegacyAdminRoute) {
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    const isConfirmedAdmin = adminError === null && isAdmin === true

    if (!isConfirmedAdmin) {
      return redirectPreservingCookies(request, response, '/hub', contentSecurityPolicy)
    }

    if (isLegacyAdminRoute) {
      return redirectPreservingCookies(request, response, '/clientes', contentSecurityPolicy)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|json|map|woff|woff2)$).*)',
  ],
}
