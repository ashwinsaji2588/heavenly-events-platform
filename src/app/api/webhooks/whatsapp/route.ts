import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. Meta Webhook Verification (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'heavenly_webhook_verify_secret_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Incoming Messages & Delivery Receipts (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check for WhatsApp status or messages payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;

    if (changes) {
      const statuses = changes.statuses;
      const messages = changes.messages;

      // Log delivery receipt or incoming client message in AuditLog
      await prisma.auditLog.create({
        data: {
          entityName: 'WhatsAppMessage',
          entityId: messages?.[0]?.id || statuses?.[0]?.id || 'unknown',
          action: messages ? 'WHATSAPP_INCOMING_MSG' : 'WHATSAPP_STATUS_UPDATE',
          changes: {
            from: messages?.[0]?.from,
            text: messages?.[0]?.text?.body,
            status: statuses?.[0]?.status,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook processing error:', error);
    // Meta requires 200 OK so it doesn't repeatedly retry malformed payloads
    return NextResponse.json({ status: 'error_logged' }, { status: 200 });
  }
}
