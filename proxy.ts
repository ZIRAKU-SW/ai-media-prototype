import { NextRequest, NextResponse } from 'next/server'

// /admin /api/admin を Basic 認証で保護。
// ADMIN_PASSWORD 未設定時はオープン（従来挙動）。設定したら認証必須。
export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER ?? 'admin'
  const pass = process.env.ADMIN_PASSWORD ?? ''
  if (!pass) return NextResponse.next()

  const auth = req.headers.get('authorization') ?? ''
  if (auth.startsWith('Basic ')) {
    try {
      const [u, p] = atob(auth.slice(6)).split(':')
      if (u === user && p === pass) return NextResponse.next()
    } catch {
      /* fall through */
    }
  }
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="ai-media-admin", charset="UTF-8"' },
  })
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
