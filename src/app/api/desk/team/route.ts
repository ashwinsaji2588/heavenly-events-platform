import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

// 1. Fetch all team members for current organization
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await prisma.user.findMany({
      where: { orgId: user.orgId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Fetch team error:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// 2. Add a new partner or planner to the organization
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN and PARTNER can provision new users
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges to invite users' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, phone, role = 'PLANNER', password } = body;

    const cleanFullName = sanitizeString(fullName, 100);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = phone ? sanitizePhone(phone) : null;

    if (!cleanFullName || !cleanEmail || !password?.trim()) {
      return NextResponse.json({ error: 'Valid full name, official email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const safeRole = (role === 'PARTNER' || role === 'SUPER_ADMIN') && user.role === 'SUPER_ADMIN' ? role : 'PLANNER';

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        orgId: user.orgId,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        role: safeRole,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'User',
        entityId: newUser.id,
        action: 'TEAM_MEMBER_INVITED',
        changes: {
          invitedBy: user.email,
          newMember: newUser.email,
          role: newUser.role,
        },
      },
    });

    // Pre-compose WhatsApp welcome credentials message if phone is provided
    let whatsappCredentialsUrl = null;
    if (newUser.phone) {
      const cleanPhone = newUser.phone.replace(/[^0-9]/g, '');
      const welcomeMsg = encodeURIComponent(
        `Hello ${newUser.fullName}! You have been added to the Heavenly Events Occasion Desk portal as ${newUser.role}.\n\nPortal: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login\nEmail: ${newUser.email}\nTemporary Password: ${password}\n\nPlease sign in to access your assigned leads and visit schedule.`
      );
      whatsappCredentialsUrl = `https://wa.me/${cleanPhone}?text=${welcomeMsg}`;
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      whatsappCredentialsUrl,
    });
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
