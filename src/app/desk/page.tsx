import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DeskDashboard from '@/components/DeskDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workspace — Occasion Desk',
  description: 'Enterprise event operations, booking pipeline, visit scheduling, and advance ledger.',
};

export default async function DeskPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current organization details
  const organization = await prisma.organization.findUnique({
    where: { id: user.orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      email: true,
      settings: true,
    },
  });

  // Strict tenant-isolated fetch for leads
  const leads = await prisma.lead.findMany({
    where: { orgId: user.orgId },
    orderBy: { createdAt: 'desc' },
    include: {
      siteVisits: {
        orderBy: { scheduledStart: 'asc' },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        orderBy: { receivedAt: 'desc' },
        include: {
          recordedBy: {
            select: { fullName: true },
          },
        },
      },
      assignedTo: {
        select: { fullName: true },
      },
    },
  });

  // Strict tenant-isolated fetch for team members
  const teamMembers = await prisma.user.findMany({
    where: { orgId: user.orgId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Convert Prisma Decimals to plain numbers and ensure pure POJO serialization
  const serializedLeads = JSON.parse(
    JSON.stringify(
      leads.map((lead) => ({
        ...lead,
        proposals: lead.proposals.map((p) => ({
          ...p,
          totalAmount: Number(p.totalAmount),
          depositRequired: Number(p.depositRequired),
        })),
        payments: (lead.payments || []).map((pm) => ({
          ...pm,
          amount: Number(pm.amount),
        })),
      }))
    )
  );

  return (
    <DeskDashboard
      initialLeads={serializedLeads}
      partners={teamMembers.map((m) => ({ id: m.id, fullName: m.fullName }))}
      initialTeam={JSON.parse(JSON.stringify(teamMembers))}
      currentUser={user}
      organization={organization || { name: 'My Business', slug: 'agency' }}
    />
  );
}
