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
      orgSlug,
    } = body;

    // Validation
    if (!clientName?.trim() || !clientPhone?.trim() || !occasionType?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone number, and occasion type are required.' },
        { status: 400 }
      );
    }

    // Resolve Organization (dynamically by slug or fallback to first active org)
    let org = null;
    if (orgSlug) {
      org = await prisma.organization.findUnique({
        where: { slug: orgSlug },
      });
    }
    if (!org) {
      org = await prisma.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!org) {
      return NextResponse.json(
        { error: 'Organization configuration error. No active workspace found.' },
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
        venueCity: venueCity?.trim() || 'Kollam',
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
          source: 'inquiry_api',
        },
      },
    });

    // Pre-compose WhatsApp confirmation link for the agency's primary contact
    const orgName = org.name && org.name !== 'Heavenly Events' ? org.name : 'Occasion Desk Workspace';
    const cleanPhone = (org.phone || '').replace(/[^0-9]/g, '');
    const greetingMsg = encodeURIComponent(
      `Hello ${orgName}! I just submitted an inquiry for my ${lead.occasionType} (Ref: ${lead.id.slice(0, 8)}). Looking forward to discussing details!`
    );
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${greetingMsg}` : '';

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Your inquiry has been received by our lead planners.',
      whatsappUrl,
    });
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return NextResponse.json(
      { error: 'Unable to process inquiry at this moment. Please try again.' },
      { status: 500 }
    );
  }
}
