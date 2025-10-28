import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1. Initialize a server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Extract the role from user metadata
  const role = user?.user_metadata?.app_role;
  const path = req.nextUrl.pathname;

  // 4. Implement authorization rules for specific routes

  // Developer Access Check
  if (path.startsWith('/developer-tools')) {
    if (role !== 'developer') {
      // Redirect to login or unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Teacher Access Check
  if (path.startsWith('/teacher-dashboard')) {
    if (role !== 'teacher' && role !== 'developer') { // Developers can access teacher tools
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Admin Access Check
  if (path.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'developer') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res; // Proceed to the requested page/API
}

export const config = {
  // Specify which paths the middleware should run on
  matcher: ['/developer-tools/:path*', '/teacher-dashboard/:path*', '/admin/:path*'],
};
