import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

interface PublicMetadata {
  role?: string;
}

interface OrganizationMetadata {
  id: string;
  rol: string;
  slg: string;
}

interface SessionClaims {
  o?: OrganizationMetadata;
}

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/unauthorized"],
  ignoredRoutes: ["/api/webhook"],
  afterAuth(auth, req: NextRequest) {
    // Debug logs
    console.log('Auth object:', {
      userId: auth.userId,
      sessionClaims: auth.sessionClaims,
      publicMetadata: auth.sessionClaims?.publicMetadata
    });

    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Handle users who are authenticated but don't have a role
    const role = (auth.sessionClaims as SessionClaims)?.o?.rol;
    
    if (auth.userId && !role && req.nextUrl.pathname !== "/unauthorized") {
      console.log('Redirecting to unauthorized - no role found');
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  }
});

// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your middleware
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
