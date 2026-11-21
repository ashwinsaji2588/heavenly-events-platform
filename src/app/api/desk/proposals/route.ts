import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, lineItems, validDays = 14, depositPercentage = 30 } = await req.json();

    if (!leadId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'Lead ID and at least one line item are required' }, { status: 400 });
    }

    const totalAmount = lineItems.reduce((acc: number, item: { amount: number }) => acc + Number(item.amount || 0), 0);
    const depositRequired = (totalAmount * Number(depositPercentage)) / 100;
    const validUntil = new Date(Date.now() + Number(validDays) * 86400000);

    const proposal = await prisma.proposal.create({
      data: {
        leadId,
        totalAmount,
        depositRequired,
        lineItems,
        validUntil,
        status: 'SENT',
      },
      include: {
        lead: {
          select: {
            clientName: true,
            clientPhone: true,
            occasionType: true,
          },
        },
      },
    });

    // Update lead status to PROPOSAL_SENT
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'PROPOSAL_SENT' },
    });

    // Generate client-facing link
    const proposalUrl = `/proposals/${proposal.id}`;

    // Generate prefilled WhatsApp notification for the client
    const encodedMsg = encodeURIComponent(
      `Hello ${proposal.lead.clientName}! Your bespoke event proposal for ${proposal.lead.occasionType} from Heavenly Events is ready for your review: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}${proposalUrl}`
    );
    const clientWhatsAppUrl = `https://wa.me/${proposal.lead.clientPhone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;

    return NextResponse.json({
      success: true,
      proposal,
      proposalUrl,
      clientWhatsAppUrl,
    });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
