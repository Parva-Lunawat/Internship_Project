// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const PUBLIC_ROUTES = ['/login', '/signup'];


// export function proxy(req: NextRequest) {
//     const { pathname } = req.nextUrl;

//     // Get auth cookie
//     const token = req.cookies.get('access_token')?.value;

//     // If user is NOT logged in
//     if (!token) {
//         // Allow public routes
//         if (PUBLIC_ROUTES.includes(pathname)) {
//             return NextResponse.next();
//         }

//         // Redirect to login
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     // If user IS logged in and tries to access auth pages
//     if (token && PUBLIC_ROUTES.includes(pathname)) {
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     return NextResponse.next();
// }

// // Apply middleware to protected routes
// export const config = {
//     matcher: [
//         '/dashboard/:path*',
//         '/profile/:path*',
//         '/admin/:path*',
//         '/login',
//         '/signup',
//     ],
// };