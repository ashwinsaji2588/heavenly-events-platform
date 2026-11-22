import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /desk and all /api/desk/* endpoints
  if (pathname.startsWith('/desk') || pathname.startsWith('/api/desk')) {
    const sessionCookie =
      request.cookies.get('occasion_session')?.value ||
      request.cookies.get('heavenly_session')?.value;

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required to access workspace' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/desk/:path*', '/api/desk/:path*'],
};
