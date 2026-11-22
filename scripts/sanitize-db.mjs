import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function sanitizeDatabase() {
  console.log('🔄 Starting Occasion Desk database sanitization...');

  try {
    // 1. Ensure primary Occasion Desk Demo Studio exists or update Heavenly Events org
    let defaultOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'occasion-desk-demo' },
          { slug: 'occasion-desk' },
          { slug: 'heavenly-events' },
          { name: 'Heavenly Events' },
        ],
      },
    });

    if (defaultOrg) {
      defaultOrg = await prisma.organization.update({
        where: { id: defaultOrg.id },
        data: {
          name: 'Occasion Desk Studio',
          slug: defaultOrg.slug === 'heavenly-events' ? 'occasion-desk-demo' : defaultOrg.slug,
          email: defaultOrg.email?.includes('heavenlyevents.in') ? 'demo@occasiondesk.com' : defaultOrg.email,
          phone: '+919188444859',
        },
      });
      console.log(`✅ Organization sanitized: ${defaultOrg.name} (${defaultOrg.id})`);
    } else {
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'Occasion Desk Studio',
          slug: 'occasion-desk-demo',
          email: 'demo@occasiondesk.com',
          phone: '+919188444859',
          settings: {
            city: 'Kollam',
            state: 'Kerala',
            currency: 'INR',
            whatsappEnabled: true,
          },
        },
      });
      console.log(`✅ Default Occasion Desk organization created: ${defaultOrg.id}`);
    }

    // Also update ANY other org named 'Heavenly Events'
    await prisma.organization.updateMany({
      where: { name: 'Heavenly Events' },
      data: {
        name: 'Occasion Desk Studio',
        email: 'demo@occasiondesk.com',
        phone: '+919188444859',
      },
    });

    // 2. Ensure Demo Super Admin exists with guaranteed password
    const demoPassword = hashPassword('Demo@2026!');
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@occasiondesk.com' },
      update: {
        fullName: 'Alex Morgan (Principal Planner)',
        role: 'SUPER_ADMIN',
        phone: '+919188444859',
        orgId: defaultOrg.id,
        passwordHash: demoPassword,
      },
      create: {
        orgId: defaultOrg.id,
        email: 'demo@occasiondesk.com',
        fullName: 'Alex Morgan (Principal Planner)',
        phone: '+919188444859',
        role: 'SUPER_ADMIN',
        passwordHash: demoPassword,
      },
    });
    console.log(`✅ Demo admin confirmed: ${demoUser.email}`);

    // 3. Purge legacy Jomit & Savio accounts
    const legacyUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['jomit@heavenlyevents.in', 'savio@heavenlyevents.in'],
        },
      },
    });

    for (const legacyUser of legacyUsers) {
      console.log(`🔄 Reassigning leads & visits from ${legacyUser.email} to demo admin...`);
      await prisma.lead.updateMany({
        where: { assignedUserId: legacyUser.id },
        data: { assignedUserId: demoUser.id },
      });
      await prisma.siteVisit.updateMany({
        where: { assignedToId: legacyUser.id },
        data: { assignedToId: demoUser.id },
      });
      await prisma.payment.updateMany({
        where: { recordedById: legacyUser.id },
        data: { recordedById: demoUser.id },
      });
      await prisma.user.delete({
        where: { id: legacyUser.id },
      });
      console.log(`✅ Purged ${legacyUser.email}`);
    }

    // 4. Sanitize payment reference notes and lead notes that mention Heavenly / Jomit / Savio
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { referenceNote: { contains: 'Jomit' } },
          { referenceNote: { contains: 'Savio' } },
          { referenceNote: { contains: 'Heavenly' } },
        ],
      },
    });

    for (const payment of payments) {
      const cleanNote = (payment.referenceNote || '')
        .replace(/Jomit/gi, 'Demo Planner')
        .replace(/Savio/gi, 'Demo Planner')
        .replace(/Heavenly Events/gi, 'Occasion Desk');
      await prisma.payment.update({
        where: { id: payment.id },
        data: { referenceNote: cleanNote },
      });
    }

    console.log('🎉 Database successfully sanitized for Occasion Desk!');
  } catch (err) {
    console.error('❌ Sanitization error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

sanitizeDatabase();
