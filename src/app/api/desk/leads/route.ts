import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeNumber, isValidUUID } from '@/lib/sanitize';

// 1. Fetch leads for current organization with filtering & search
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const assignedUserId = searchParams.get('assignedUserId');

    const whereClause: Record<string, unknown> = {
      orgId: user.orgId,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (assignedUserId && assignedUserId !== 'ALL') {
      whereClause.assignedUserId = assignedUserId;
    }

    const cleanSearch = search ? sanitizeString(search, 100) : '';
    if (cleanSearch) {
      whereClause.OR = [
        { clientName: { contains: cleanSearch, mode: 'insensitive' } },
        { clientPhone: { contains: cleanSearch, mode: 'insensitive' } },
        { venueName: { contains: cleanSearch, mode: 'insensitive' } },
        { occasionType: { contains: cleanSearch, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, fullName: true, role: true },
        },
        siteVisits: true,
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize Decimal amounts for Next.js RSC safety
    const serializedLeads = leads.map((l) => ({
      ...l,
      proposals: l.proposals.map((p) => ({
        ...p,
        totalAmount: Number(p.totalAmount),
        depositRequired: Number(p.depositRequired),
      })),
      payments: l.payments.map((pm) => ({
        ...pm,
        amount: Number(pm.amount),
      })),
    }));

    return NextResponse.json({ success: true, leads: serializedLeads });
  } catch (error) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// 2. Manual Booking Creation (+ Add Booking)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      status = 'NEW',
      assignedUserId,
      metadata = {},
    } = body;

    const validStatuses = ['NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'PROPOSAL_SENT', 'BOOKED', 'ARCHIVED', 'LOST'];
    const safeStatus = validStatuses.includes(status) ? (status as any) : 'NEW';

    const cleanClientName = sanitizeString(clientName, 120);
    const cleanClientPhone = sanitizePhone(clientPhone);
    const cleanOccasionType = sanitizeString(occasionType, 120);

    if (!cleanClientName || !cleanClientPhone || !cleanOccasionType) {
      return NextResponse.json(
        { error: 'Valid client name, client phone number, and occasion type are required.' },
        { status: 400 }
      );
    }

    const newLead = await prisma.lead.create({
      data: {
        orgId: user.orgId,
        clientName: cleanClientName,
        clientPhone: cleanClientPhone,
        clientEmail: clientEmail ? sanitizeEmail(clientEmail) : null,
        occasionType: cleanOccasionType,
        targetDate: targetDate ? new Date(targetDate) : null,
        venueName: venueName ? sanitizeString(venueName, 150) : null,
        venueCity: venueCity ? sanitizeString(venueCity, 100) : null,
        guestCount: guestCount ? sanitizeNumber(guestCount, 1, 100_000) : null,
        budgetRange: budgetRange ? sanitizeString(budgetRange, 60) : null,
        notes: notes ? sanitizeString(notes, 4000) : null,
        status: safeStatus,
        assignedUserId: assignedUserId || user.id,
        metadata: {
          ...metadata,
          source: 'MANUAL_ENTRY',
          enteredBy: user.email,
        },
      },
      include: {
        assignedTo: {
          select: { id: true, fullName: true, role: true },
        },
        siteVisits: true,
        proposals: true,
        payments: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'Lead',
        entityId: newLead.id,
        action: 'LEAD_CREATED_MANUALLY',
        changes: {
          clientName: newLead.clientName,
          clientPhone: newLead.clientPhone,
          occasionType: newLead.occasionType,
          status: newLead.status,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead: {
          ...newLead,
          proposals: [],
          payments: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Manual booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking. Please check parameters and try again.' },
      { status: 500 }
    );
  }
}

// 3. Delete Lead/Event Booking with Audit Record
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid event booking ID is required.' }, { status: 400 });
    }

    // Verify lead exists and belongs to the authenticated user's organization
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, orgId: true, clientName: true, occasionType: true },
    });

    if (!lead || lead.orgId !== user.orgId) {
      return NextResponse.json({ error: 'Event booking not found or permission denied.' }, { status: 404 });
    }

    // Cascade delete in Prisma schema: siteVisits, proposals, payments will cascade delete
    await prisma.lead.delete({
      where: { id },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'Lead',
        entityId: id,
        action: 'LEAD_PERMANENTLY_DELETED',
        changes: {
          clientName: lead.clientName,
          occasionType: lead.occasionType,
          deletedBy: user.email,
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Event booking permanently deleted.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ error: 'Failed to delete event booking.' }, { status: 500 });
  }
}

