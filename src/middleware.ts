import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CLOUT_AUTH_URL = process.env.NEXT_PUBLIC_CLOUT_AUTH_URL || 'https://clout-dashboard.vercel.app'

// SSO有効化フラグ（環境変数で制御）
const SSO_ENABLED = process.env.NEXT_PUBLIC_SSO_ENABLED === 'true'

// 公開パス（認証不要）
const PUBLIC_PATHS = ['/auth', '/api/', '/_next/', '/favicon.ico']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 公開パスはスキップ
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // SSO無効の場合はSupabase Auth（既存の認証）を使用
  if (!SSO_ENABLED) {
    return NextResponse.next()
  }

  // SSO有効の場合: Clout Dashboard認証を使用
  const token = request.cookies.get('__session')?.value || request.cookies.get('clout_token')?.value

  if (!token) {
    // トークンがない場合はClout Dashboardへリダイレクト
    const redirectUrl = `${CLOUT_AUTH_URL}/sign-in?redirect_url=${encodeURIComponent(request.url)}`
    return NextResponse.redirect(redirectUrl)
  }

  // トークン検証
  try {
    const response = await fetch(`${CLOUT_AUTH_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app: 'ggcrm' }),
    })

    const data = await response.json()

    if (!data.allowed) {
      // 権限がない場合
      const redirectUrl = `${CLOUT_AUTH_URL}/sign-in?redirect_url=${encodeURIComponent(request.url)}&error=unauthorized`
      return NextResponse.redirect(redirectUrl)
    }

    // 認証成功 - ユーザー情報をヘッダーに追加
    const requestHeaders = new Headers(request.headers)
    if (data.user) {
      requestHeaders.set('x-clout-user-id', data.user.id)
      requestHeaders.set('x-clout-user-email', data.user.email)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('SSO verification error:', error)
    // 検証エラーの場合もリダイレクト
    const redirectUrl = `${CLOUT_AUTH_URL}/sign-in?redirect_url=${encodeURIComponent(request.url)}&error=auth_failed`
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
