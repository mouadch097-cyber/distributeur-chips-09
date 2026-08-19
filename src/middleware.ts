import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtEdge } from '@/lib/jwt-edge';

const SESSION_COOKIE_NAME = 'chips09_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'default-distributeur-chips-09-secret-key-32-chars';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let sessionUser: { id: string; email: string; role: string; name: string } | null = null;

  if (token) {
    sessionUser = await verifyJwtEdge(token, JWT_SECRET_STRING);
  }

  // Admin route protection: server-side RBAC (exclude /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!sessionUser) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (sessionUser.role !== 'admin') {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }
  }

  // Protected customer routes
  const protectedCustomerRoutes = ['/checkout', '/profile', '/orders', '/invoices', '/addresses', '/favorites', '/notifications'];
  const isProtectedCustomerRoute = protectedCustomerRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedCustomerRoute) {
    if (!sessionUser) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Set security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/invoices/:path*',
    '/addresses/:path*',
    '/favorites/:path*',
    '/notifications/:path*',
  ],
};
