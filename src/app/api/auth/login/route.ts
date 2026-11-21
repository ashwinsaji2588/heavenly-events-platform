import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Role check: Only partners and admins can access Occasion Desk
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'PARTNER' && user.role !== 'PLANNER') {
      return NextResponse.json({ error: 'Access denied: unauthorized role' }, { status: 403 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      orgId: user.orgId,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ?? false;

    // Set HTTP-only secure cookie
    response.cookies.set('heavenly_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Log sign-in in audit logs
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'User',
        entityId: user.id,
        action: 'PARTNER_LOGIN_SUCCESS',
        changes: { email: user.email },
      },
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
