import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const savedState = request.cookies.get('oauth_state')?.value;
  const savedRedirectUri = request.cookies.get('oauth_redirect_uri')?.value;

  // Use saved redirect URI or compute from current origin
  const redirectUri = savedRedirectUri || `${request.nextUrl.origin}/api/auth/google/callback`;

  // CSRF state validation
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
    }

    // Exchange auth code for access token using exact matching redirectUri
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange error:', await tokenRes.text());
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase().trim();
    const googleId = googleUser.id;
    const name = googleUser.name || 'عميل';

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=no_email_provided', request.url));
    }

    // Find or create customer
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (!user) {
      // Create new customer (CRITICAL: Role is ALWAYS 'customer', never 'admin')
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          role: 'customer',
          active: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google ID if user already registered via email
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    if (!user.active) {
      return NextResponse.redirect(new URL('/login?error=account_disabled', request.url));
    }

    const sessionToken = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(sessionToken);

    // Redirect to catalog
    const response = NextResponse.redirect(new URL('/catalog', request.url));
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_redirect_uri');
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}
