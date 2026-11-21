import { NextResponse } from 'next/server';

export async function POST() {
  const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ?? false;
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });

  // Clear cookie
  response.cookies.set('heavenly_session', '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
