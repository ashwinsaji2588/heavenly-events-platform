import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const {
      firmName,
      businessCategory,
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
    const category = businessCategory || 'EVENT_MANAGEMENT';

    // Tailored sample data based on chosen industry
    let sampleOccasion = 'Luxury Wedding & Reception';
    let sampleNotes = 'Sample wedding inquiry. You can update or drag this card across your pipeline.';
    let sampleBudget = '₹10,00,000 - ₹25,00,000';
    let sampleGuestCount = 650;

    if (category === 'CATERING_AND_BANQUET') {
      sampleOccasion = 'Grand Banquet Feast & Live Counters';
      sampleNotes = 'Headcount: 650 plates (250 Traditional Veg Sadhya / 400 Non-Veg Dinner Buffet). Tasting booked for tomorrow.';
      sampleBudget = '₹5,00,000 - ₹8,50,000';
    } else if (category === 'STAGE_DECOR') {
      sampleOccasion = 'Lotus Mandap & Floral Ceiling Architecture';
      sampleNotes = 'Stage Dimensions: 40ft width, 16ft ceiling height. Color palette: Champagne Gold and Ivory Orchids.';
      sampleBudget = '₹3,50,000 - ₹6,00,000';
    } else if (category === 'LIGHT_AND_SOUND') {
      sampleOccasion = 'Gala Sangeet Stage Trussing & AV';
      sampleNotes = '12 Moving beam heads, digital LED wall matrix, 25kW generator requirement, and wireless microphones.';
      sampleBudget = '₹2,50,000 - ₹4,50,000';
    }

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
            businessCategory: category,
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

      // Create tailored sample lead
      await tx.lead.create({
        data: {
          orgId: organization.id,
          clientName: 'Welcome Client (Sample)',
          clientPhone: '+91 90000 00000',
          clientEmail: 'client@example.com',
          occasionType: sampleOccasion,
          venueName: 'The River Palace Auditorium',
          venueCity: city?.trim() || 'Kerala',
          budgetRange: sampleBudget,
          guestCount: sampleGuestCount,
          status: 'NEW',
          notes: sampleNotes,
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
            businessCategory: category,
            admin: superAdmin.email,
          },
        },
      });

      return { organization, superAdmin };
    });

    // Generate JWT session token
    const token = signToken({
      userId: result.superAdmin.id,
      orgId: result.organization.id,
      role: result.superAdmin.role,
      email: result.superAdmin.email,
    });

    const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ?? false;

    const response = NextResponse.json(
      {
        success: true,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
        user: {
          id: result.superAdmin.id,
          email: result.superAdmin.email,
          fullName: result.superAdmin.fullName,
          role: result.superAdmin.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Failed to onboard firm. Please check parameters and try again.' },
      { status: 500 }
    );
  }
}
