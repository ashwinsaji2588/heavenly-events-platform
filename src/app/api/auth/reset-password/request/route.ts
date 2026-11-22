import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac, randomInt } from 'node:crypto';
import { sanitizeEmail } from '@/lib/sanitize';
import { sendPasswordResetOtpEmail } from '@/lib/resend';

const SESSION_SECRET = process.env.SESSION_SECRET || 'occasion-desk-super-secure-production-secret-2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawIdentifier = body.identifier ? String(body.identifier).trim() : '';

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: 'Please enter your registered email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(rawIdentifier);
    const cleanPhoneDigits = rawIdentifier.replace(/[^0-9]/g, '');

    // Search user by email or registered phone
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
        fullName: true,
        orgId: true,
      },
    });

    if (!user) {
      // Security: do not leak whether account exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account matches your details, a verification code has been dispatched to your email.',
      });
    }

    // Generate cryptographically random 6-digit OTP
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

    // Masked Email for user UI confirmation
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts[0].slice(0, 2) + '***@' + (emailParts[1] || 'domain.com');

    // Dispatch OTP via Resend Transactional Email
    await sendPasswordResetOtpEmail({
      to: user.email,
      otp,
      userName: user.fullName,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        entityName: 'User',
        entityId: user.id,
        action: 'PASSWORD_RESET_OTP_REQUESTED',
        changes: {
          deliveryMethod: 'EMAIL_RESEND',
          requestedAt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      resetTicket,
      maskedEmail,
      message: `A 6-digit verification code has been sent to ${maskedEmail}.`,
      // Expose OTP in development if Resend is not configured yet for seamless zero-barrier testing
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Unable to process reset request. Please check your email and try again.' },
      { status: 500 }
    );
  }
}
