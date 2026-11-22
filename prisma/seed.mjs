import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database for Occasion Desk multi-tenant platform...');

  // 1. Primary Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'occasion-desk-demo' },
    update: {
      name: 'Occasion Desk Demo Studio',
      phone: '+919188444859',
      email: 'demo@occasiondesk.com',
    },
    create: {
      name: 'Occasion Desk Demo Studio',
      slug: 'occasion-desk-demo',
      phone: '+919188444859',
      email: 'demo@occasiondesk.com',
      settings: {
        city: 'Kollam',
        state: 'Kerala',
        currency: 'INR',
        whatsappEnabled: true,
      },
    },
  });

  console.log(`Demo Organization ready: ${org.name} (${org.id})`);

  // 2. Lead Planner / Super Admin Demo Account
  const demoPassword = hashPassword('Demo@2026!');

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@occasiondesk.com' },
    update: {
      fullName: 'Alex Morgan (Principal Planner)',
      phone: '+919188444859',
      role: 'SUPER_ADMIN',
      orgId: org.id,
      passwordHash: demoPassword,
    },
    create: {
      orgId: org.id,
      email: 'demo@occasiondesk.com',
      fullName: 'Alex Morgan (Principal Planner)',
      phone: '+919188444859',
      role: 'SUPER_ADMIN',
      passwordHash: demoPassword,
    },
  });

  console.log(`Demo administrator provisioned: ${demoUser.email}`);

  // 3. Purge legacy Heavenly Events / Jomit / Savio accounts if present
  try {
    const legacyUsers = await prisma.user.findMany({
      where: {
        email: { in: ['jomit@heavenlyevents.in', 'savio@heavenlyevents.in'] },
      },
    });

    for (const legacyUser of legacyUsers) {
      // Reassign any leads or visits to the demo user before removing
      await prisma.lead.updateMany({
        where: { assignedUserId: legacyUser.id },
        data: { assignedUserId: demoUser.id },
      });
      await prisma.siteVisit.updateMany({
        where: { assignedToId: legacyUser.id },
        data: { assignedToId: demoUser.id },
      });
      await prisma.user.delete({ where: { id: legacyUser.id } });
      console.log(`Purged legacy user: ${legacyUser.email}`);
    }

    // Rename legacy org if found
    await prisma.organization.updateMany({
      where: { slug: 'heavenly-events' },
      data: {
        name: 'Occasion Desk Studio',
        slug: 'occasion-desk-demo',
        email: 'demo@occasiondesk.com',
        phone: '+919876543210',
      },
    });
  } catch (err) {
    console.log('Legacy cleanup check:', err?.message || err);
  }

  // 4. Initial Sample Booking / Inquiry for new setups
  const existingLead = await prisma.lead.findFirst({
    where: { orgId: org.id },
  });

  if (!existingLead) {
    const sampleLead = await prisma.lead.create({
      data: {
        orgId: org.id,
        clientName: 'Rahul & Ananya',
        clientPhone: '+919876543210',
        clientEmail: 'rahul.ananya@example.test',
        occasionType: 'Wedding Ceremony & Stage Décor',
        venueName: 'The Grand Waterfront Convention Centre',
        venueCity: 'Kollam',
        guestCount: 650,
        budgetRange: '₹3,50,000 - ₹5,00,000',
        status: 'VISIT_SCHEDULED',
        assignedUserId: demoUser.id,
        notes: 'Requested contemporary floral entrance with warm amber stage lighting.',
        siteVisits: {
          create: {
            assignedToId: demoUser.id,
            scheduledStart: new Date(Date.now() + 86400000 * 2), // 2 days from now
            scheduledEnd: new Date(Date.now() + 86400000 * 2 + 7200000), // 2 hours
            locationAddress: 'The Grand Waterfront Convention Centre, Kollam',
            notes: 'Inspect stage rigging points, sound mixer location, and guest entrance layout.',
          },
        },
      },
    });
    console.log(`Sample booking initialized: ${sampleLead.clientName} (ID: ${sampleLead.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
