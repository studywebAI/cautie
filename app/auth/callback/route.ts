
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      throw new Error(authError.message)
    }

    // Verify successful session creation
    // Immediately refresh cookies
    const { data: { session } } = await supabase.auth.getSession()
    const sessionCookie = cookies().get('sb-access-token')
    if (!session || !sessionCookie) {
      throw new Error('Session creation failed - cookies not set')
    }
    
    // Set helper cookie for client-side detection
    cookies().set('login-complete', 'true', {
      maxAge: 60 * 2, // 2 minutes
      path: '/',
    })

    // Always redirect to dashboard after successful login
    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error('Authentication callback error:', err)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent((err as Error).message)}`, request.url))
  }
}
