import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_ROUTES = ['/crm', '/contabilidade', '/pfx', '/quadros', '/solicitacoes-clientes']
const HUB_ROUTES = ['/hub']

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

function redirectPreservingCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url))
  response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))
  return redirectResponse
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES)
  const isHubRoute = matchesRoute(pathname, HUB_ROUTES)

  if (!isAdminRoute && !isHubRoute) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectPreservingCookies(request, response, '/login')
  }

  if (isAdminRoute) {
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    const isConfirmedAdmin = adminError === null && isAdmin === true

    if (!isConfirmedAdmin) {
      return redirectPreservingCookies(request, response, '/hub')
    }
  }

  return response
}

export const config = {
  matcher: [
    '/hub',
    '/hub/:path*',
    '/crm',
    '/crm/:path*',
    '/contabilidade',
    '/contabilidade/:path*',
    '/pfx',
    '/pfx/:path*',
    '/quadros',
    '/quadros/:path*',
    '/solicitacoes-clientes',
    '/solicitacoes-clientes/:path*',
  ],
}
