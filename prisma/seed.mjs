import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database for Heavenly Events...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'heavenly-events' },
    update: {},
    create: {
      name: 'Heavenly Events',
      slug: 'heavenly-events',
      phone: '+919074624023',
      email: 'hello@heavenlyevents.in',
      settings: {
        city: 'Punalur',
        state: 'Kerala',
        currency: 'INR',
        whatsappEnabled: true,
      },
    },
  });

  console.log(`Organization ready: ${org.name} (${org.id})`);

  // 2. Partners
  const defaultPassword = hashPassword('Heavenly@2026!');

  const partner1 = await prisma.user.upsert({
    where: { email: 'jomit@heavenlyevents.in' },
    update: {
      fullName: 'Jomit (Partner)',
      phone: '+919074624023',
    },
    create: {
      orgId: org.id,
      email: 'jomit@heavenlyevents.in',
      fullName: 'Jomit (Partner)',
      phone: '+919074624023',
      role: 'SUPER_ADMIN',
      passwordHash: defaultPassword,
    },
  });

  const partner2 = await prisma.user.upsert({
    where: { email: 'savio@heavenlyevents.in' },
    update: {
      fullName: 'Savio (Partner)',
      phone: '+918921744145',
    },
    create: {
      orgId: org.id,
      email: 'savio@heavenlyevents.in',
      fullName: 'Savio (Partner)',
      phone: '+918921744145',
      role: 'PARTNER',
      passwordHash: defaultPassword,
    },
  });

  console.log(`Partners provisioned: ${partner1.email}, ${partner2.email}`);

  // 3. Initial Sample Inquiries
  const sampleLead = await prisma.lead.create({
    data: {
      orgId: org.id,
      clientName: 'Rahul & Ananya',
      clientPhone: '+919876543210',
      clientEmail: 'rahul.ananya@example.test',
      occasionType: 'Wedding Ceremony & Stage Décor',
      venueName: 'The River Palace Auditorium',
      venueCity: 'Punalur',
      guestCount: 650,
      budgetRange: '₹3,50,000 - ₹5,00,000',
      status: 'VISIT_SCHEDULED',
      assignedUserId: partner1.id,
      notes: 'Requested traditional Kerala floral entrance with contemporary pastel stage backdrop.',
      siteVisits: {
        create: {
          assignedToId: partner1.id,
          scheduledStart: new Date(Date.now() + 86400000 * 2), // 2 days from now
          scheduledEnd: new Date(Date.now() + 86400000 * 2 + 7200000), // 2 hours duration
          locationAddress: 'The River Palace Auditorium, Main Road, Punalur',
          notes: 'Inspect stage trussing points, sound console space, and bride entrance aisle dimensions.',
        },
      },
    },
  });

  console.log(`Sample lead created: ${sampleLead.clientName} (ID: ${sampleLead.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
