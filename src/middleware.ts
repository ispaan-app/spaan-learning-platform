// Temporarily disabled middleware to fix build manifest error
// import { NextRequest, NextResponse } from 'next/server'

// // Simple middleware without server-side dependencies
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl

//   // Add security headers
//   const response = NextResponse.next()
  
//   // Basic security headers
//   response.headers.set('X-Frame-Options', 'DENY')
//   response.headers.set('X-Content-Type-Options', 'nosniff')
//   response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
//   response.headers.set('X-XSS-Protection', '1; mode=block')

//   // Basic route protection (simplified)
//   if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
//     // These routes will be protected by their individual page components
//     // For now, just pass through
//   }

//   return response
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }
