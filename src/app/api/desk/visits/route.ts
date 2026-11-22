import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, scheduledStart, scheduledEnd, locationAddress, notes, assignedToId } = await req.json();

    if (!leadId || !scheduledStart || !locationAddress) {
      return NextResponse.json({ error: 'Lead, scheduled start time, and location are required.' }, { status: 400 });
    }

    // Verify lead belongs to caller's tenant
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, orgId: user.orgId },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    const start = new Date(scheduledStart);
    const end = scheduledEnd ? new Date(scheduledEnd) : new Date(start.getTime() + 7200000); // 2 hours default

    const visit = await prisma.siteVisit.create({
      data: {
        leadId: lead.id,
        scheduledStart: start,
        scheduledEnd: end,
        locationAddress,
        notes: notes || null,
        assignedToId: assignedToId || null,
      },
    });

    // Automatically transition lead to VISIT_SCHEDULED if it is currently NEW or CONTACTED
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'VISIT_SCHEDULED' },
    });

    return NextResponse.json({ success: true, visit });
  } catch (error) {
    console.error('Failed to create visit:', error);
    return NextResponse.json({ error: 'Failed to schedule visit' }, { status: 500 });
  }
}
