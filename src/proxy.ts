import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // We only gate paths starting with /admin
  if (pathname.startsWith('/admin')) {
    const isPublicAdminPath = pathname === '/admin/login' || pathname === '/admin/register';

    // If a token is not present and trying to access a protected admin route, redirect to login
    if (!token && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If a token is present and trying to access login or register, redirect to invoices
    if (token && isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/invoices', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (like hero-desktop.png, hero-mobile.png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|hero-desktop.png|hero-mobile.png|.*\\..*).*)',
  ],
};
