
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua trang login
  if (pathname === '/admin/login') return NextResponse.next()

  // Bảo vệ tất cả route /admin/*
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}