import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    if (search?.trim()) {
      whereClause.OR = [
        { clientName: { contains: search.trim(), mode: 'insensitive' } },
        { clientPhone: { contains: search.trim(), mode: 'insensitive' } },
        { venueName: { contains: search.trim(), mode: 'insensitive' } },
        { occasionType: { contains: search.trim(), mode: 'insensitive' } },
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

    if (!clientName?.trim() || !clientPhone?.trim() || !occasionType?.trim()) {
      return NextResponse.json(
        { error: 'Client name, client phone number, and occasion type are required.' },
        { status: 400 }
      );
    }

    const newLead = await prisma.lead.create({
      data: {
        orgId: user.orgId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail?.trim() || null,
        occasionType: occasionType.trim(),
        targetDate: targetDate ? new Date(targetDate) : null,
        venueName: venueName?.trim() || null,
        venueCity: venueCity?.trim() || null,
        guestCount: guestCount ? parseInt(String(guestCount), 10) : null,
        budgetRange: budgetRange?.trim() || null,
        notes: notes?.trim() || null,
        status,
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
