import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { sanitizePhone } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, idToken, isDevMock } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Mobile phone number is required.' }, { status: 400 });
    }

    const cleanPhone = sanitizePhone(phone);
    const digitsOnly = cleanPhone.replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '');

    // 1. Verify Firebase ID Token if provided
    let verifiedPhoneNumber = cleanPhone;
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (idToken && firebaseApiKey) {
      try {
        const verifyRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }
        );

        if (!verifyRes.ok) {
          const errData = await verifyRes.json();
          return NextResponse.json(
            { error: errData.error?.message || 'Invalid or expired Firebase verification token.' },
            { status: 401 }
          );
        }

        const data = await verifyRes.json();
        const firebaseUser = data.users?.[0];
        if (!firebaseUser?.phoneNumber) {
          return NextResponse.json(
            { error: 'Phone verification token does not contain a verified phone number.' },
            { status: 401 }
          );
        }
        verifiedPhoneNumber = firebaseUser.phoneNumber;
      } catch (err) {
        console.error('Firebase token verification error:', err);
        return NextResponse.json(
          { error: 'Unable to communicate with phone verification service.' },
          { status: 502 }
        );
      }
    } else if (!isDevMock && process.env.NODE_ENV === 'production' && firebaseApiKey) {
      return NextResponse.json(
        { error: 'Missing phone verification token.' },
        { status: 400 }
      );
    }

    // 2. Query Prisma for Partner User by Phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: `+91${digitsOnly}` },
          { phone: `+91 ${digitsOnly}` },
          { phone: digitsOnly },
          { email: `${digitsOnly}@partner.occasiondesk.com` },
          // Allow demo user login for Ashwin's demo number
          ...(digitsOnly === '9188444859' ? [{ email: 'demo@occasiondesk.com' }] : []),
        ],
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          verifiedPhone: verifiedPhoneNumber,
          message: 'No registered partner account found for this mobile number. Please onboard your agency.',
        },
        { status: 404 }
      );
    }

    // 3. Issue Session Cookie
    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      orgId: user.orgId,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      redirect: '/desk',
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        agency: user.organization.name,
      },
    });
  } catch (err: unknown) {
    console.error('Phone login error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal authentication error' },
      { status: 500 }
    );
  }
}
