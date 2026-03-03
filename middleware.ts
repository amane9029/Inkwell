import { InsforgeMiddleware } from '@insforge/nextjs/middleware';

export default InsforgeMiddleware({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://8r6r5ty5.us-east.insforge.app',
  publicRoutes: ['/', '/explore', '/about', '/privacy', '/terms', '/p/(.*)', '/u/(.*)', '/api/auth/webhook'],
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
