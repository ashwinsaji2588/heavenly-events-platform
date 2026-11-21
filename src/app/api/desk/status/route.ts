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

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        orgId: updated.orgId,
        entityName: 'Lead',
        entityId: updated.id,
        action: 'STATUS_UPDATED',
        changes: { newStatus: status },
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
