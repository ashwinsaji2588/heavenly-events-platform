import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized: Access to upcoming events requires authentication', { status: 401 });
    }

    const { id } = await params;

    const visit = await prisma.siteVisit.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            organization: true,
          },
        },
        assignedTo: true,
      },
    });

    if (!visit || visit.lead.orgId !== user.orgId) {
      return new NextResponse('Visit not found or unauthorized', { status: 404 });
    }

    const firmName = visit.lead.organization?.name || 'Occasion Desk';

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const start = formatDate(new Date(visit.scheduledStart));
    const end = formatDate(new Date(visit.scheduledEnd));
    const now = formatDate(new Date());

    const summary = `Site Visit: ${visit.lead.clientName} (${visit.lead.occasionType})`;
    const description = `${firmName} Venue Inspection\\nClient: ${visit.lead.clientName}\\nPhone: ${visit.lead.clientPhone}\\nPlanner: ${visit.assignedTo?.fullName || 'Assigned Planner'}\\nNotes: ${visit.notes || 'No extra notes'}`;
    const location = visit.locationAddress.replace(/,/g, '\\,');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Occasion Desk//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:visit-${visit.id}@occasiondesk.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="visit-${visit.id.slice(0, 8)}.ics"`,
      },
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
