import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    // If logged in and trying to access login, redirect to home or setup
    if (token && pathname === '/login') {
      if (!token.username) {
        return NextResponse.redirect(new URL('/setup-username', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Not logged in - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in but no username - redirect to setup (except if already on setup page)
  if (!token.username && pathname !== '/setup-username') {
    return NextResponse.redirect(new URL('/setup-username', request.url));
  }

  // Has username but trying to access setup - redirect to home
  if (token.username && pathname === '/setup-username') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
