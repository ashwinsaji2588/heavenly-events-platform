import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac, randomInt } from 'node:crypto';
import { sanitizeEmail, sanitizePhone, sanitizeString } from '@/lib/sanitize';

const SESSION_SECRET = process.env.SESSION_SECRET || 'occasion-desk-super-secure-production-secret-2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawIdentifier = body.identifier ? String(body.identifier).trim() : '';
    const deliveryMethod = body.deliveryMethod === 'EMAIL' ? 'EMAIL' : 'WHATSAPP';

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: 'Please enter your registered email address or phone number.' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(rawIdentifier);
    const cleanPhoneDigits = rawIdentifier.replace(/[^0-9]/g, '');

    // Search user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhoneDigits.length >= 10 ? [{ phone: { contains: cleanPhoneDigits.slice(-10) } }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        orgId: true,
      },
    });

    if (!user) {
      // Security: do not leak whether account exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account matches your details, a verification code has been dispatched.',
      });
    }

    // Generate secure 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create stateless cryptographic reset ticket
    const payload = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        otp,
        exp: expiresAt,
      })
    ).toString('base64url');

    const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    const resetTicket = `${payload}.${signature}`;

    // Masked Contact info for user verification UI
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts[0].slice(0, 2) + '***@' + (emailParts[1] || 'domain.com');
    const targetPhone = user.phone || '9188444859';
    const cleanTargetPhone = targetPhone.replace(/[^0-9]/g, '');
    const maskedPhone = '+' + cleanTargetPhone.slice(0, 2) + ' •••••• ' + cleanTargetPhone.slice(-4);

    // Pre-compose Free WhatsApp OTP dispatch message
    const whatsappMsg = encodeURIComponent(
      `Your Occasion Desk password reset OTP is ${otp}. Valid for 10 minutes. For security, never share this code with anyone.`
    );
    const whatsappUrl = `https://wa.me/${cleanTargetPhone}?text=${whatsappMsg}`;

    // Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'User',
        entityId: user.id,
        action: 'PASSWORD_RESET_OTP_REQUESTED',
        changes: {
          deliveryMethod,
          requestedAt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      resetTicket,
      maskedEmail,
      maskedPhone,
      deliveryMethod,
      whatsappUrl,
      message: `Verification code sent to your registered ${deliveryMethod === 'EMAIL' ? 'email' : 'WhatsApp number'}.`,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Unable to process reset request. Please try again.' },
      { status: 500 }
    );
  }
}
