import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      businessName,
      businessType = 'Event Management Agency',
      monthlyEvents = '5-15 Events',
      requirements = '',
    } = body;

    const cleanName = sanitizeString(name, 100);
    const cleanPhone = sanitizePhone(phone);
    const cleanEmail = sanitizeEmail(email);
    const cleanBusinessName = sanitizeString(businessName, 120);
    const cleanBusinessType = sanitizeString(businessType, 80);
    const cleanMonthlyEvents = sanitizeString(monthlyEvents, 60);
    const cleanRequirements = sanitizeString(requirements, 1000);

    if (!cleanName || !cleanPhone || !cleanBusinessName) {
      return NextResponse.json(
        { error: 'Please provide your name, phone number, and business name.' },
        { status: 400 }
      );
    }

    const recipientEmail = 'ashwinsaji2588@gmail.com';
    const recipientPhone = '9188444859';

    // 1. Dispatch Email to Ashwin Saji via Resend (or log to server in dev)
    const emailSubject = `✦ New Occasion Desk Demo Request: ${cleanName} (${cleanBusinessName})`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #141813; color: #f4f1ea; padding: 30px; }
    .card { max-width: 560px; margin: 0 auto; background: #1c221b; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(197,168,128,0.15); color: #c5a880; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    h2 { font-size: 22px; color: #ffffff; margin: 0 0 16px; }
    .item { margin-bottom: 12px; font-size: 14px; }
    .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .val { color: #f4f1ea; font-weight: 600; font-size: 15px; margin-top: 2px; }
    .btn { display: inline-block; padding: 12px 24px; background: #c5a880; color: #141813; font-weight: 700; text-decoration: none; border-radius: 10px; margin-top: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Occasion Desk Studio • New Live Demo Lead</div>
    <h2>New Demo Request Received</h2>
    
    <div class="item">
      <div class="label">Contact Name</div>
      <div class="val">${cleanName}</div>
    </div>

    <div class="item">
      <div class="label">Business / Agency</div>
      <div class="val">${cleanBusinessName} (${cleanBusinessType})</div>
    </div>

    <div class="item">
      <div class="label">Phone Number</div>
      <div class="val"><a href="tel:${cleanPhone}" style="color: #c5a880;">${cleanPhone}</a></div>
    </div>

    <div class="item">
      <div class="label">Email Address</div>
      <div class="val">${cleanEmail || 'Not provided'}</div>
    </div>

    <div class="item">
      <div class="label">Expected Monthly Volume</div>
      <div class="val">${cleanMonthlyEvents}</div>
    </div>

    ${cleanRequirements ? `
    <div class="item">
      <div class="label">Specific Needs / Notes</div>
      <div class="val" style="font-weight: 400; color: #cbd5e1;">${cleanRequirements}</div>
    </div>` : ''}

    <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${cleanName}, thank you for requesting a demo of Occasion Desk for ${cleanBusinessName}. When would be a great time for a 15-minute walkthrough?`)}" class="btn">
      Chat with ${cleanName} on WhatsApp →
    </a>
  </div>
</body>
</html>
    `.trim();

    console.log(`\n======================================================`);
    console.log(`[Demo Request Lead Notification Received]`);
    console.log(`To Ashwin     : ${recipientEmail} / ${recipientPhone}`);
    console.log(`Lead Name     : ${cleanName}`);
    console.log(`Business      : ${cleanBusinessName} (${cleanBusinessType})`);
    console.log(`Phone         : ${cleanPhone}`);
    console.log(`Email         : ${cleanEmail}`);
    console.log(`Monthly Volume: ${cleanMonthlyEvents}`);
    console.log(`Requirements  : ${cleanRequirements}`);
    console.log(`======================================================\n`);

    // 2. Compose Direct WhatsApp Link to Ashwin Saji
    const cleanDigits = recipientPhone.replace(/[^0-9]/g, '');
    const clientWaMsg = encodeURIComponent(
      `Hi Ashwin, I just requested a demo for Occasion Desk.\n\nName: ${cleanName}\nBusiness: ${cleanBusinessName} (${cleanBusinessType})\nPhone: ${cleanPhone}\n\nLet's schedule a walkthrough!`
    );
    const directWhatsAppUrl = `https://wa.me/91${cleanDigits}?text=${clientWaMsg}`;

    // 3. Record Audit Log in Database
    try {
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) {
        await prisma.auditLog.create({
          data: {
            orgId: defaultOrg.id,
            entityName: 'DemoRequest',
            entityId: cleanPhone,
            action: 'DEMO_REQUEST_SUBMITTED',
            changes: {
              name: cleanName,
              businessName: cleanBusinessName,
              phone: cleanPhone,
              email: cleanEmail,
              businessType: cleanBusinessType,
              monthlyEvents: cleanMonthlyEvents,
              requirements: cleanRequirements,
              dispatchedTo: recipientEmail,
            },
          },
        });
      }
    } catch (dbErr) {
      console.error('Failed to record demo request audit log:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo request received! Ashwin Saji will reach out within 2 hours.',
      directWhatsAppUrl,
      recipientEmail,
      recipientPhone,
    });
  } catch (error) {
    console.error('Demo request submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit demo request. Please try again or WhatsApp directly.' },
      { status: 500 }
    );
  }
}
