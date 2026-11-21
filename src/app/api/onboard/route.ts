import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const {
      firmName,
      city,
      phone,
      adminName,
      adminEmail,
      adminPassword,
    } = await req.json();

    if (!firmName?.trim() || !adminName?.trim() || !adminEmail?.trim() || !adminPassword?.trim()) {
      return NextResponse.json(
        { error: 'Firm name, admin name, official email, and master password are required.' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { error: 'Master password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = adminEmail.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Generate unique slug for the organization
    const baseSlug = firmName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'agency';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Atomic creation of Organization + Admin User
    const passwordHash = hashPassword(adminPassword);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: firmName.trim(),
          slug: uniqueSlug,
          phone: phone?.trim() || '+91 ',
          email: cleanEmail,
          settings: {
            city: city?.trim() || 'Kerala, India',
            defaultCurrency: 'INR',
            timezone: 'Asia/Kolkata',
          },
        },
      });

      const superAdmin = await tx.user.create({
        data: {
          orgId: organization.id,
          fullName: adminName.trim(),
          email: cleanEmail,
          phone: phone?.trim() || null,
          role: 'SUPER_ADMIN',
          passwordHash,
        },
      });

      // Create an initial Welcome Lead to demonstrate the pipeline
      await tx.lead.create({
        data: {
          orgId: organization.id,
          clientName: 'Welcome Inquirer (Sample)',
          clientPhone: '+91 90000 00000',
          clientEmail: 'client@example.com',
          occasionType: 'Luxury Wedding & Reception',
          venueCity: city?.trim() || 'Kerala',
          budgetRange: '₹10,00,000 - ₹25,00,000',
          guestCount: 500,
          status: 'NEW',
          notes: 'System generated sample lead. You can drag or update its status to test your pipeline.',
          assignedUserId: superAdmin.id,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          orgId: organization.id,
          userId: superAdmin.id,
          entityName: 'Organization',
          entityId: organization.id,
          action: 'ORGANIZATION_ONBOARDED',
          changes: {
            name: organization.name,
            slug: organization.slug,
            admin: superAdmin.email,
          },
        },
      });

      return { organization, superAdmin };
    });

    // Create session token
    const sessionUser = {
      id: result.superAdmin.id,
      email: result.superAdmin.email,
      fullName: result.superAdmin.fullName,
      role: result.superAdmin.role,
      orgId: result.organization.id,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: 'Firm successfully onboarded!',
      organization: result.organization,
      user: sessionUser,
    });

    // Set HTTP-only session cookie
    response.cookies.set('heavenly_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Firm onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete firm onboarding' }, { status: 500 });
  }
}
