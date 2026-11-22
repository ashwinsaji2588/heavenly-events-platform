import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Lead ID and status required' }, { status: 400 });
    }

    const validStatuses = ['NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'PROPOSAL_SENT', 'BOOKED', 'ARCHIVED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid lead status value' }, { status: 400 });
    }

    // Verify lead belongs to caller's tenant
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, orgId: user.orgId },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: { status: status as any },
    });

    await prisma.auditLog.create({
      data: {
        orgId: updated.orgId,
        userId: user.id,
        entityName: 'Lead',
        entityId: updated.id,
        action: 'STATUS_UPDATED',
        changes: { oldStatus: lead.status, newStatus: status },
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
