import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function getEffectiveRedirectUri(request: NextRequest): string {
  // If GOOGLE_REDIRECT_URI is explicitly set in env and is not matching localhost, use it
  if (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.includes('localhost')) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  // Otherwise, dynamically use the current request origin to support any local port (3000, 3001, etc.)
  const origin = request.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = getEffectiveRedirectUri(request);

  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
  }

  // Generate cryptographically random CSRF state
  const state = crypto.randomBytes(24).toString('hex');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authUrl.toString());
  
  // Store CSRF state & redirect URI in HttpOnly cookies
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  response.cookies.set('oauth_redirect_uri', redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
