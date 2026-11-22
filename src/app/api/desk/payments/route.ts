import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 1. Fetch payments for a specific lead
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Verify lead belongs to caller's tenant
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, orgId: user.orgId },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: { leadId: lead.id },
      orderBy: { receivedAt: 'desc' },
      include: {
        recordedBy: {
          select: { fullName: true },
        },
      },
    });

    const serialized = payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));

    const totalPaid = serialized.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      payments: serialized,
      totalPaid,
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// 2. Record a new payment (Advance Deposit, Milestone, or Final Settlement)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      leadId,
      amount,
      method = 'UPI',
      paymentType = 'ADVANCE_DEPOSIT',
      referenceNote = '',
      autoBookLead = true,
    } = await req.json();

    if (!leadId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid leadId and positive payment amount are required' }, { status: 400 });
    }

    const numericAmount = Number(amount);

    // Verify lead exists and belongs to current user's organization
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        organization: true,
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: true,
      },
    });

    if (!lead || lead.orgId !== user.orgId) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    // Create payment in PostgreSQL
    const payment = await prisma.payment.create({
      data: {
        leadId,
        amount: numericAmount,
        method,
        paymentType,
        referenceNote: referenceNote?.trim() || null,
        recordedById: user.id,
      },
      include: {
        recordedBy: {
          select: { fullName: true },
        },
      },
    });

    // If advance deposit is paid and lead is not yet BOOKED, auto-advance to BOOKED
    let newStatus = lead.status;
    if (autoBookLead && lead.status !== 'BOOKED' && lead.status !== 'ARCHIVED') {
      newStatus = 'BOOKED';
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'BOOKED' },
      });
    }

    // Calculate updated financials
    const allPayments = [...lead.payments.map((p) => Number(p.amount)), numericAmount];
    const totalPaid = allPayments.reduce((acc, curr) => acc + curr, 0);

    const latestProposal = lead.proposals[0];
    const agreedTotal = latestProposal ? Number(latestProposal.totalAmount) : 0;
    const remainingBalance = Math.max(0, agreedTotal - totalPaid);

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'Payment',
        entityId: payment.id,
        action: 'PAYMENT_RECORDED',
        changes: {
          amount: numericAmount,
          method,
          paymentType,
          leadName: lead.clientName,
          totalPaid,
          remainingBalance,
          recordedBy: user.fullName,
        },
      },
    });

    // Generate pre-composed WhatsApp Payment Receipt message for the client
    const cleanPhone = lead.clientPhone.replace(/[^0-9]/g, '');
    const typeLabel =
      paymentType === 'ADVANCE_DEPOSIT'
        ? 'Advance Booking Deposit'
        : paymentType === 'FINAL_BALANCE'
        ? 'Final Balance Settlement'
        : 'Milestone Payment';

    const orgName = lead.organization?.name && lead.organization.name !== 'Heavenly Events' ? lead.organization.name : 'Occasion Desk Workspace';
    const receiptMessage = encodeURIComponent(
      `Dear ${lead.clientName},\n\n` +
      `${orgName} has received your ${typeLabel} of ₹${numericAmount.toLocaleString('en-IN')} via ${method}` +
      (referenceNote ? ` (Ref: ${referenceNote})` : '') + `.\n\n` +
      `• Occasion: ${lead.occasionType}\n` +
      (agreedTotal > 0 ? `• Total Agreed Scope: ₹${agreedTotal.toLocaleString('en-IN')}\n` : '') +
      `• Total Received to Date: ₹${totalPaid.toLocaleString('en-IN')}\n` +
      (agreedTotal > 0 ? `• Remaining Balance: ₹${remainingBalance.toLocaleString('en-IN')}\n` : '') +
      `\nThank you for choosing ${orgName}. Your date is officially confirmed!`
    );

    const whatsappReceiptUrl = `https://wa.me/${cleanPhone}?text=${receiptMessage}`;

    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        amount: Number(payment.amount),
      },
      totalPaid,
      remainingBalance,
      leadStatus: newStatus,
      whatsappReceiptUrl,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
