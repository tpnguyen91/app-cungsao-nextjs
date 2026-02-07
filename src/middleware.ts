import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { URL_AUTH, URL_AUTH_SIGN_IN, URL_GIA_DINH } from './constants/url';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Check if user is authenticated
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Protected routes - require authentication
  const protectedRoutes = [URL_GIA_DINH];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If no user and trying to access protected routes, redirect to signin
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = URL_AUTH_SIGN_IN;
    return NextResponse.redirect(url);
  }

  // If user exists and trying to access auth pages, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith(URL_AUTH)) {
    const url = request.nextUrl.clone();
    url.pathname = URL_GIA_DINH;
    return NextResponse.redirect(url);
  }

  // Redirect root to dashboard if authenticated, signin if not
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? URL_GIA_DINH : URL_AUTH_SIGN_IN;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
