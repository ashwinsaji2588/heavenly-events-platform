import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sparkles, Calendar, MapPin, CheckCircle2, Phone } from 'lucide-react';
import Link from 'next/link';
import PrintProposalButton from '@/components/PrintProposalButton';

export const dynamic = 'force-dynamic';

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      lead: {
        include: {
          organization: true,
          assignedTo: true,
        },
      },
    },
  });

  if (!proposal) {
    notFound();
  }

  const { lead } = proposal;
  const lineItems = (proposal.lineItems as Array<{ title: string; category?: string; amount: number; notes?: string }>) || [];

  const orgName = lead.organization?.name && lead.organization.name !== 'Heavenly Events' ? lead.organization.name : 'Occasion Desk Workspace';
  const plannerName = lead.assignedTo?.fullName || orgName;
  const contactPhone = (lead.assignedTo?.phone || lead.organization?.phone || '').replace(/[^0-9]/g, '');
  const acceptanceMsg = encodeURIComponent(
    `Hello ${plannerName}! I would like to accept Proposal ${proposal.id.slice(0, 8).toUpperCase()} for ${lead.occasionType}. Let's proceed with the booking agreement!`
  );
  const waAcceptUrl = contactPhone ? `https://wa.me/${contactPhone}?text=${acceptanceMsg}` : null;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-4">
        {/* Action Bar (Top) */}
        <div className="flex items-center justify-between print:hidden">
          <Link href="/" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold transition-colors">
            <span className="text-brand-gold font-serif">✦</span>
            <span>{lead.organization?.name || 'Occasion Desk'}</span>
          </Link>
          <PrintProposalButton />
        </div>

        {/* The Proposal Document */}
        <div className="bg-brand-charcoal/90 border border-white/10 rounded-3xl p-8 sm:p-14 shadow-2xl backdrop-blur-xl space-y-10 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print-clean-doc">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-white/10 print:border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Official Event Proposal &amp; Quote
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-brand-cream print:text-black">
                {lead.organization?.name || 'Occasion Desk'}
              </h1>
              <p className="text-xs text-brand-muted print:text-gray-600 mt-1">
                {lead.organization?.phone || ''} {lead.organization?.email ? `· ${lead.organization.email}` : ''}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs">
              <div className="text-brand-muted print:text-gray-500">Proposal ID</div>
              <div className="font-mono text-brand-gold print:text-black font-medium">{proposal.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-brand-muted print:text-gray-500 pt-1">Valid Until</div>
              <div className="text-brand-cream print:text-black font-medium">{new Date(proposal.validUntil).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Client & Occasion Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-brand-dark/60 print:bg-gray-50 border border-white/5 print:border-gray-200">
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-brand-muted print:text-gray-500 font-semibold">Prepared For</span>
              <div className="text-lg font-serif font-medium text-brand-cream print:text-black">{lead.clientName}</div>
              <div className="text-xs text-brand-muted print:text-gray-600 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-brand-gold" /> {lead.clientPhone}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-brand-muted print:text-gray-500 font-semibold">Event Specification</span>
              <div className="text-lg font-serif font-medium text-brand-gold print:text-black">{lead.occasionType}</div>
              <div className="text-xs text-brand-muted print:text-gray-600 flex items-center gap-3">
                {lead.targetDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-gold" /> {new Date(lead.targetDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-gold" /> {lead.venueName || lead.venueCity || 'Punalur'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-muted print:text-gray-700">
              Scope of Decor & Architecture
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 print:border-gray-300 text-xs text-brand-muted print:text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-2">Item Description</th>
                    <th className="py-3 px-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-2">
                        <div className="font-serif font-medium text-brand-cream print:text-black">{item.title}</div>
                        {item.notes && <div className="text-xs text-brand-muted print:text-gray-600 mt-0.5">{item.notes}</div>}
                      </td>
                      <td className="py-4 px-2 text-right font-mono text-brand-cream print:text-black">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="pt-6 border-t border-white/10 print:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-xs text-brand-muted print:text-gray-600 space-y-1">
              <div>• Deposit locks the execution date and materials procurement.</div>
              <div>• Balance disbursement schedule: 50% 1 week prior, balance upon setup completion.</div>
              <div>• Custom adjustments are welcome upon site inspection.</div>
            </div>

            <div className="bg-brand-dark/80 print:bg-gray-100 p-6 rounded-2xl border border-white/5 print:border-gray-300 text-right space-y-2 min-w-[280px]">
              <div className="flex justify-between text-xs text-brand-muted print:text-gray-600">
                <span>Total Scope</span>
                <span className="font-mono text-brand-cream print:text-black text-sm">₹{Number(proposal.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-brand-gold print:text-black pt-2 border-t border-white/10">
                <span>Required Deposit (30%)</span>
                <span className="font-mono text-base">₹{Number(proposal.depositRequired).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Acceptance Callout */}
          <div className="p-6 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 print:hidden text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif text-brand-cream font-medium">Ready to reserve your date?</h4>
            <p className="text-xs text-brand-muted max-w-md mx-auto">
              Confirm your acceptance directly with your assigned planner on WhatsApp or phone to finalize the agreement.
            </p>
            {waAcceptUrl ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waAcceptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-brand-gold text-brand-dark text-xs font-semibold hover:bg-brand-goldHover transition-colors shadow-lg active:scale-95"
                >
                  Accept Proposal via WhatsApp ↗
                </a>
              </div>
            ) : (
              <div className="pt-2 text-xs text-brand-gold font-medium">
                Please contact {plannerName} to finalize and confirm your reservation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
