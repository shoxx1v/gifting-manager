/**
 * Clout Dashboard SSO認証ヘルパー
 * ADR-006: SSO認証基盤（Clout Dashboard統合）
 */

interface CloutUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  fullName: string
  imageUrl?: string
}

interface VerifyResponse {
  valid: boolean
  user?: CloutUser
  error?: string
}

interface PermissionResponse {
  allowed: boolean
  user?: Pick<CloutUser, 'id' | 'email' | 'fullName'>
  permissions?: string[]
  error?: string
}

const CLOUT_AUTH_URL = process.env.NEXT_PUBLIC_CLOUT_AUTH_URL || 'https://clout-dashboard.vercel.app'

/**
 * Clout DashboardのJWTトークンを検証
 */
export async function verifyCloutToken(token: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${CLOUT_AUTH_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data as VerifyResponse
  } catch (error) {
    console.error('Clout auth verification failed:', error)
    return { valid: false, error: 'Failed to verify token' }
  }
}

/**
 * アプリへのアクセス権限を確認
 */
export async function checkCloutPermission(token: string): Promise<PermissionResponse> {
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
    return data as PermissionResponse
  } catch (error) {
    console.error('Clout permission check failed:', error)
    return { allowed: false, error: 'Failed to check permissions' }
  }
}

/**
 * Clout Dashboardのサインインページへリダイレクト
 */
export function redirectToCloutSignIn(redirectUrl?: string): void {
  const currentUrl = redirectUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const signInUrl = `${CLOUT_AUTH_URL}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`

  if (typeof window !== 'undefined') {
    window.location.href = signInUrl
  }
}

/**
 * ログアウト処理
 */
export function cloutLogout(): void {
  // Cookieをクリア
  if (typeof document !== 'undefined') {
    document.cookie = '__session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'clout_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  // localStorageをクリア
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('clout_token')
    localStorage.removeItem('clout_user')
  }

  // Clout Dashboardへリダイレクト
  if (typeof window !== 'undefined') {
    window.location.href = CLOUT_AUTH_URL
  }
}

/**
 * Cookieからトークンを取得
 */
export function getCloutToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === '__session' || name === 'clout_token') {
      return value
    }
  }

  // localStorageからも確認
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('clout_token')
  }

  return null
}

/**
 * SSO認証が有効かどうか
 * 環境変数で切り替え可能
 */
export function isSSOEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SSO_ENABLED === 'true'
}

export { CLOUT_AUTH_URL }
