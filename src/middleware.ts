import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  // First update session to keep it active
  const response = await updateSession(request)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Handled by updateSession
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/register')
  
  const isProtectedRoute = url.pathname.startsWith('/seeker') || 
                           url.pathname.startsWith('/volunteer') || 
                           url.pathname.startsWith('/admin')

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role-based protection
    if (isProtectedRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role

      if (url.pathname.startsWith('/seeker') && role !== 'seeker') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      if (url.pathname.startsWith('/volunteer') && role !== 'volunteer') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      if (url.pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
