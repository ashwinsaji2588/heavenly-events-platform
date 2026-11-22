import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { hashPassword } from '@/lib/auth';

const SESSION_SECRET = process.env.SESSION_SECRET || 'occasion-desk-super-secure-production-secret-2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resetTicket, otp, newPassword } = body;

    if (!resetTicket || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Verification code, reset ticket, and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    // Verify reset ticket HMAC signature
    const parts = resetTicket.split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Invalid or malformed reset ticket.' }, { status: 400 });
    }

    const [payloadB64, signature] = parts;
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid or tampered reset token.' }, { status: 403 });
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    // Check expiration
    if (Date.now() > payload.exp) {
      return NextResponse.json(
        { error: 'Verification code has expired (valid 10 minutes). Please request a new code.' },
        { status: 410 }
      );
    }

    // Verify OTP code
    if (String(payload.otp).trim() !== String(otp).trim()) {
      return NextResponse.json(
        { error: 'Incorrect verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Update password in database
    const newHash = hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        passwordHash: newHash,
      },
      select: {
        id: true,
        email: true,
        orgId: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        orgId: updatedUser.orgId,
        userId: updatedUser.id,
        entityName: 'User',
        entityId: updatedUser.id,
        action: 'PASSWORD_RESET_SUCCESSFUL',
        changes: {
          resetMethod: 'OTP_VERIFICATION',
          resetAt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new credentials.',
    });
  } catch (error) {
    console.error('Password reset verify error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please request a new code.' },
      { status: 500 }
    );
  }
}
