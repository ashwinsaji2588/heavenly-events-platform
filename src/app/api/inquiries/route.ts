import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      occasionType,
      targetDate,
      venueName,
      venueCity,
      guestCount,
      budgetRange,
      notes,
    } = body;

    // Validation
    if (!clientName?.trim() || !clientPhone?.trim() || !occasionType?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone number, and occasion type are required.' },
        { status: 400 }
      );
    }

    // Resolve Organization (Default: heavenly-events)
    const org = await prisma.organization.findUnique({
      where: { slug: 'heavenly-events' },
    });

    if (!org) {
      return NextResponse.json(
        { error: 'Organization configuration error.' },
        { status: 500 }
      );
    }

    // Create Lead in PostgreSQL
    const lead = await prisma.lead.create({
      data: {
        orgId: org.id,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail?.trim() || null,
        occasionType: occasionType.trim(),
        targetDate: targetDate ? new Date(targetDate) : null,
        venueName: venueName?.trim() || null,
        venueCity: venueCity?.trim() || 'Punalur',
        guestCount: guestCount ? parseInt(guestCount, 10) : null,
        budgetRange: budgetRange?.trim() || null,
        notes: notes?.trim() || null,
        status: 'NEW',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        entityName: 'Lead',
        entityId: lead.id,
        action: 'WEB_INQUIRY_CREATED',
        changes: {
          clientName: lead.clientName,
          occasionType: lead.occasionType,
          source: 'public_portfolio',
        },
      },
    });

    // Pre-compose WhatsApp direct confirmation links for both partners
    const greetingMsg = encodeURIComponent(
      `Hello Heavenly Events! I just submitted an inquiry for my ${lead.occasionType} (Ref: ${lead.id.slice(0, 8)}). Looking forward to discussing details!`
    );
    const whatsappUrl1 = `https://wa.me/919074624023?text=${greetingMsg}`;
    const whatsappUrl2 = `https://wa.me/918921744145?text=${greetingMsg}`;

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Your inquiry has been received by our lead planners.',
      whatsappUrl: whatsappUrl1,
      whatsappPartner1: whatsappUrl1,
      whatsappPartner2: whatsappUrl2,
    });
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return NextResponse.json(
      { error: 'Unable to process inquiry at this moment. Please try again.' },
      { status: 500 }
    );
  }
}
