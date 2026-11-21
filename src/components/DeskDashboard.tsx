'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Plus,
  CheckCircle,
  Sparkles,
  User,
  ArrowRight,
  Filter,
  RefreshCw,
  FolderOpen,
  FileText,
  DollarSign,
  Trash2,
  ExternalLink,
  LogOut,
  Users,
  Key,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SiteVisit {
  id: string;
  scheduledStart: string | Date;
  scheduledEnd: string | Date;
  locationAddress: string;
  notes: string | null;
  completed: boolean;
}

interface ProposalItem {
  id: string;
  totalAmount: number;
  depositRequired: number;
  status: string;
  createdAt: string | Date;
}

interface PaymentItem {
  id: string;
  amount: number;
  method: string;
  paymentType: string;
  referenceNote: string | null;
  receivedAt: string | Date;
  recordedBy?: {
    fullName: string;
  } | null;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string | Date;
}

interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  occasionType: string;
  targetDate: string | Date | null;
  venueName: string | null;
  venueCity: string | null;
  guestCount: number | null;
  budgetRange: string | null;
  status: string;
  notes: string | null;
  createdAt: string | Date;
  siteVisits: SiteVisit[];
  proposals?: ProposalItem[];
  payments?: PaymentItem[];
  assignedTo?: {
    fullName: string;
  } | null;
}

export default function DeskDashboard({
  initialLeads,
  partners,
  initialTeam = [],
  currentUser,
}: {
  initialLeads: Lead[];
  partners: { id: string; fullName: string }[];
  initialTeam?: TeamMember[];
  currentUser?: { id: string; email: string; fullName: string; role: string };
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'visits' | 'ledger' | 'team'>('pipeline');
  const [selectedLeadForVisit, setSelectedLeadForVisit] = useState<Lead | null>(null);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQuoteResult, setGeneratedQuoteResult] = useState<{ proposalUrl: string; clientWhatsAppUrl: string } | null>(null);

  // Payment Form State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLeadForPayment, setSelectedLeadForPayment] = useState<Lead | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'CARD'>('UPI');
  const [paymentType, setPaymentType] = useState<'ADVANCE_DEPOSIT' | 'MID_MILESTONE' | 'FINAL_BALANCE'>('ADVANCE_DEPOSIT');
  const [paymentRef, setPaymentRef] = useState('');
  const [autoBookLead, setAutoBookLead] = useState(true);
  const [recordedPaymentResult, setRecordedPaymentResult] = useState<{
    whatsappReceiptUrl: string;
    totalPaid: number;
    remainingBalance: number;
  } | null>(null);

  // New Team Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+91 ');
  const [newMemberRole, setNewMemberRole] = useState('PLANNER');
  const [newMemberPassword, setNewMemberPassword] = useState('Heavenly@2026!');
  const [createdMemberResult, setCreatedMemberResult] = useState<{ user: TeamMember; whatsappCredentialsUrl: string | null } | null>(null);

  // Password Change State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState('');
  const [visitLocation, setVisitLocation] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [assignedPlanner, setAssignedPlanner] = useState(partners[0]?.id || '');

  // Quote Form State
  const [lineItems, setLineItems] = useState<Array<{ title: string; amount: number; notes?: string }>>([
    { title: 'Main Stage Floral Mandap & Decor', amount: 150000, notes: 'Premium pastel florals and brass elements' },
    { title: 'Stage Lighting & Trussing Architecture', amount: 65000, notes: 'Warm ambient wash, moving heads, spotlights' },
    { title: 'Bridal Pathway & Floral Entrance Arch', amount: 45000, notes: 'Illuminated walkway with floral pedestals' },
  ]);
  const [depositPct, setDepositPct] = useState(30);

  const statuses = [
    { key: 'NEW', label: 'New Inquiries', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { key: 'CONTACTED', label: 'In Consultation', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { key: 'VISIT_SCHEDULED', label: 'Site Visit Booked', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { key: 'BOOKED', label: 'Confirmed Events', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  async function handleCreateTeamMember(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/desk/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newMemberName,
          email: newMemberEmail,
          phone: newMemberPhone,
          role: newMemberRole,
          password: newMemberPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team member');

      setTeam((prev) => [...prev, data.user]);
      setCreatedMemberResult({
        user: data.user,
        whatsappCredentialsUrl: data.whatsappCredentialsUrl,
      });
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert('Failed to create team member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLeadForPayment || !paymentAmount) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/desk/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadForPayment.id,
          amount: Number(paymentAmount),
          method: paymentMethod,
          paymentType,
          referenceNote: paymentRef,
          autoBookLead,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === selectedLeadForPayment.id) {
            const updatedPayments = [data.payment, ...(l.payments || [])];
            return {
              ...l,
              status: data.leadStatus || l.status,
              payments: updatedPayments,
            };
          }
          return l;
        })
      );

      setRecordedPaymentResult({
        whatsappReceiptUrl: data.whatsappReceiptUrl,
        totalPaid: data.totalPaid,
        remainingBalance: data.remainingBalance,
      });
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch('/api/desk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch {
      alert('Error updating status');
    }
  }

  async function handleScheduleVisit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLeadForVisit) return;
    setIsSubmitting(true);

    try {
      const start = new Date(visitDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

      const res = await fetch('/api/desk/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadForVisit.id,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          locationAddress: visitLocation,
          assignedToId: assignedPlanner || null,
          notes: visitNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to schedule visit');
      const data = await res.json();

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === selectedLeadForVisit.id) {
            return {
              ...l,
              status: 'VISIT_SCHEDULED',
              siteVisits: [...l.siteVisits, data.siteVisit],
            };
          }
          return l;
        })
      );

      setVisitModalOpen(false);
      setSelectedLeadForVisit(null);
      setVisitDate('');
      setVisitLocation('');
      setVisitNotes('');
    } catch {
      alert('Error scheduling visit');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLeadForQuote) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/desk/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadForQuote.id,
          lineItems,
          depositPercentage: depositPct,
        }),
      });

      if (!res.ok) throw new Error('Failed to create proposal');
      const data = await res.json();

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === selectedLeadForQuote.id) {
            return {
              ...l,
              status: 'PROPOSAL_SENT',
              proposals: [data.proposal, ...(l.proposals || [])],
            };
          }
          return l;
        })
      );

      setGeneratedQuoteResult({
        proposalUrl: data.proposalUrl,
        clientWhatsAppUrl: data.clientWhatsAppUrl,
      });
    } catch {
      alert('Error creating proposal');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordMsg(null);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordMsg({ type: 'error', text: err.message });
      } else {
        setPasswordMsg({ type: 'error', text: 'Password update failed' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  }

  const allVisits = leads.flatMap((lead) =>
    lead.siteVisits.map((v) => ({ ...v, leadName: lead.clientName, leadPhone: lead.clientPhone, occasion: lead.occasionType }))
  );

  const allPayments = leads.flatMap((lead) =>
    (lead.payments || []).map((pm) => ({
      ...pm,
      leadId: lead.id,
      leadName: lead.clientName,
      leadPhone: lead.clientPhone,
      occasion: lead.occasionType,
    }))
  ).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const totalCollectedRevenue = allPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalAgreedPipeline = leads.reduce((acc, lead) => {
    const quote = lead.proposals?.[0]?.totalAmount || 0;
    return acc + Number(quote);
  }, 0);
  const totalOutstanding = Math.max(0, totalAgreedPipeline - totalCollectedRevenue);

  const totalQuoteAmount = lineItems.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const requiredDeposit = (totalQuoteAmount * depositPct) / 100;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-brand-charcoal/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-lg text-brand-cream hover:text-brand-gold transition-colors flex items-center gap-2">
              <span className="text-brand-gold">✦</span>
              <span>Heavenly Events</span>
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold font-medium border border-brand-gold/20">
              Occasion Desk CRM
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-brand-cream">{currentUser.fullName}</div>
                  <div className="text-[10px] text-brand-gold uppercase tracking-wider">{currentUser.role}</div>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="py-1.5 px-3 rounded-lg bg-brand-surface hover:border-brand-gold/40 border border-white/10 text-xs text-brand-muted hover:text-brand-cream flex items-center gap-1.5 transition-colors"
                  title="Update Password"
                >
                  <Key className="w-3.5 h-3.5 text-brand-gold" />
                  <span className="hidden md:inline">Password</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-1.5 px-3 rounded-lg bg-brand-surface hover:bg-red-950/60 hover:text-red-300 border border-white/10 text-xs text-brand-muted flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
            <Link
              href="/"
              className="py-1.5 px-4 rounded-lg bg-brand-surface border border-white/10 text-xs text-brand-cream hover:bg-brand-charcoal transition-colors hidden sm:inline-block"
            >
              Portfolio ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-brand-charcoal/70 border border-white/5 rounded-2xl p-5 shadow-lg">
            <div className="text-xs uppercase tracking-wider text-brand-muted mb-1">Total Inquiries</div>
            <div className="text-3xl font-serif font-bold text-brand-cream">{leads.length}</div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/5 rounded-2xl p-5 shadow-lg">
            <div className="text-xs uppercase tracking-wider text-brand-muted mb-1">Scheduled Visits</div>
            <div className="text-3xl font-serif font-bold text-purple-400">{allVisits.length}</div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/5 rounded-2xl p-5 shadow-lg">
            <div className="text-xs uppercase tracking-wider text-brand-muted mb-1">Active Proposals</div>
            <div className="text-3xl font-serif font-bold text-indigo-400">
              {leads.filter((l) => l.status === 'PROPOSAL_SENT').length}
            </div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/5 rounded-2xl p-5 shadow-lg">
            <div className="text-xs uppercase tracking-wider text-brand-muted mb-1">Confirmed Bookings</div>
            <div className="text-3xl font-serif font-bold text-emerald-400">
              {leads.filter((l) => l.status === 'BOOKED').length}
            </div>
          </div>
          <div className="bg-brand-charcoal/70 border border-emerald-500/20 rounded-2xl p-5 shadow-lg col-span-2 sm:col-span-1">
            <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Advances Collected</div>
            <div className="text-2xl font-serif font-bold text-emerald-400">
              ₹{totalCollectedRevenue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-brand-gold text-brand-dark'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            Pipeline Board
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'visits'
                ? 'bg-brand-gold text-brand-dark'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Site Visit Agenda ({allVisits.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-brand-gold text-brand-dark'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Payments & Ledger ({allPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-brand-gold text-brand-dark'
                : 'text-brand-muted hover:text-brand-cream'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team & Planners ({team.length})
          </button>
        </div>

        {/* View 1: Pipeline Board */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {statuses.map((col) => {
              const colLeads = leads.filter((l) => l.status === col.key);
              return (
                <div key={col.key} className="flex flex-col bg-brand-charcoal/40 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-cream">
                      {col.label}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${col.color}`}>
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1">
                    {colLeads.length === 0 ? (
                      <div className="py-8 text-center text-xs text-brand-muted border border-dashed border-white/5 rounded-xl">
                        No inquiries
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-brand-charcoal border border-white/10 rounded-xl p-4 shadow-md hover:border-brand-gold/40 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-base font-serif font-medium text-brand-cream">
                                {lead.clientName}
                              </h4>
                              <span className="text-[10px] text-brand-muted">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-brand-gold font-medium mt-0.5">
                              {lead.occasionType}
                            </div>
                            <div className="text-xs text-brand-muted mt-2 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-brand-gold" />
                                {lead.venueName || lead.venueCity || 'Punalur'}
                              </div>
                              {lead.targetDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-brand-gold" />
                                  {new Date(lead.targetDate).toLocaleDateString()}
                                </div>
                              )}
                              {lead.budgetRange && (
                                <div className="text-[11px] text-brand-muted/80">
                                  Budget: {lead.budgetRange}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Existing Proposals & Financials */}
                          {((lead.proposals && lead.proposals.length > 0) || (lead.payments && lead.payments.length > 0)) && (
                            <div className="p-2 rounded-lg bg-brand-surface/70 border border-white/5 text-xs space-y-1">
                              {lead.proposals && lead.proposals.length > 0 && (
                                <div className="flex items-center justify-between text-indigo-300">
                                  <span>Quote: ₹{Number(lead.proposals[0].totalAmount).toLocaleString('en-IN')}</span>
                                  <Link
                                    href={`/proposals/${lead.proposals[0].id}`}
                                    target="_blank"
                                    className="text-brand-gold hover:underline flex items-center gap-1 text-[11px]"
                                  >
                                    View <ExternalLink className="w-2.5 h-2.5" />
                                  </Link>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-0.5">
                                <span className="text-[11px] text-brand-muted">Advance Paid:</span>
                                <span className="font-mono text-emerald-400 font-semibold">
                                  ₹{(lead.payments || []).reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${lead.clientPhone}`}
                                title="Call Client"
                                className="w-7 h-7 rounded-lg bg-brand-surface text-brand-cream hover:bg-brand-gold hover:text-brand-dark transition-colors flex items-center justify-center text-xs"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/${lead.clientPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open WhatsApp"
                                className="w-7 h-7 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center text-xs"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedLeadForPayment(lead);
                                  const quote = lead.proposals?.[0];
                                  const paid = (lead.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                                  const suggested = quote ? Math.max(0, Number(quote.depositRequired) - paid) : 0;
                                  setPaymentAmount(suggested > 0 ? String(suggested) : '');
                                  setPaymentRef('');
                                  setRecordedPaymentResult(null);
                                  setPaymentModalOpen(true);
                                }}
                                className="text-[10px] py-1 px-2 rounded-lg bg-emerald-950/60 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors font-medium flex items-center gap-1"
                                title="Record Advance or Milestone Payment"
                              >
                                <DollarSign className="w-2.5 h-2.5" /> ₹ Pay
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedLeadForVisit(lead);
                                  setVisitLocation(lead.venueName || `${lead.venueCity || 'Punalur'}`);
                                  setVisitModalOpen(true);
                                }}
                                className="text-[10px] py-1 px-2 rounded-lg bg-brand-surface text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition-colors font-medium flex items-center gap-1"
                              >
                                <Calendar className="w-2.5 h-2.5" /> Visit
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedLeadForQuote(lead);
                                  setGeneratedQuoteResult(null);
                                  setQuoteModalOpen(true);
                                }}
                                className="text-[10px] py-1 px-2 rounded-lg bg-brand-surface text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors font-medium flex items-center gap-1"
                              >
                                <FileText className="w-2.5 h-2.5" /> Quote
                              </button>
                            </div>
                          </div>

                          {/* Quick Stage Progression */}
                          {lead.status === 'NEW' && (
                            <button
                              onClick={() => updateStatus(lead.id, 'CONTACTED')}
                              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-brand-surface hover:bg-white/10 text-xs text-brand-muted hover:text-brand-cream transition-colors text-center font-medium"
                            >
                              Mark Contacted →
                            </button>
                          )}
                          {lead.status === 'CONTACTED' && (
                            <button
                              onClick={() => {
                                setSelectedLeadForVisit(lead);
                                setVisitLocation(lead.venueName || `${lead.venueCity || 'Punalur'}`);
                                setVisitModalOpen(true);
                              }}
                              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-brand-gold/10 hover:bg-brand-gold text-xs text-brand-gold hover:text-brand-dark transition-colors text-center font-medium"
                            >
                              Book Venue Visit →
                            </button>
                          )}
                          {lead.status === 'VISIT_SCHEDULED' && (
                            <button
                              onClick={() => {
                                setSelectedLeadForQuote(lead);
                                setGeneratedQuoteResult(null);
                                setQuoteModalOpen(true);
                              }}
                              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-xs text-indigo-300 hover:text-white transition-colors text-center font-medium"
                            >
                              Draft Official Quote →
                            </button>
                          )}
                          {lead.status === 'PROPOSAL_SENT' && (
                            <button
                              onClick={() => {
                                setSelectedLeadForPayment(lead);
                                const quote = lead.proposals?.[0];
                                const paid = (lead.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                                const suggested = quote ? Math.max(0, Number(quote.depositRequired) - paid) : 0;
                                setPaymentAmount(suggested > 0 ? String(suggested) : '');
                                setPaymentRef('');
                                setRecordedPaymentResult(null);
                                setPaymentModalOpen(true);
                              }}
                              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 text-xs text-emerald-300 hover:text-white transition-colors text-center font-medium"
                            >
                              Record Advance & Confirm (BOOKED) →
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 2: Site Visits Agenda */}
        {activeTab === 'visits' && (
          <div className="bg-brand-charcoal/50 border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-serif text-brand-cream mb-4">Upcoming Venue Visits</h3>
            {allVisits.length === 0 ? (
              <p className="text-xs text-brand-muted py-8 text-center">No venue visits currently scheduled.</p>
            ) : (
              <div className="space-y-4">
                {allVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-brand-charcoal border border-white/5 gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-gold font-semibold uppercase tracking-wider">
                          {new Date(v.scheduledStart).toLocaleString()}
                        </span>
                        <span className="text-xs text-brand-muted">· {v.occasion}</span>
                      </div>
                      <h4 className="text-base font-serif font-medium text-brand-cream mt-0.5">
                        {v.leadName} ({v.leadPhone})
                      </h4>
                      <p className="text-xs text-brand-muted flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold" /> {v.locationAddress}
                      </p>
                      {v.notes && <p className="text-xs text-brand-muted/80 mt-1 italic">“{v.notes}”</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/desk/visits/${v.id}/ics`}
                        download
                        className="py-2 px-3 rounded-lg bg-brand-surface hover:bg-brand-gold hover:text-brand-dark text-xs text-brand-gold flex items-center gap-1.5 transition-colors border border-white/5 font-medium"
                      >
                        <Calendar className="w-3.5 h-3.5" /> iCal / Google Calendar
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.locationAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg bg-brand-surface hover:bg-white/10 text-xs text-brand-cream flex items-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-brand-gold" /> Open Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 3: Payments & Financial Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Financial Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-brand-charcoal/70 border border-white/5 rounded-2xl p-5 shadow-lg">
                <div className="text-xs uppercase tracking-wider text-brand-muted mb-1">Total Pipeline Scope</div>
                <div className="text-2xl font-serif font-bold text-brand-cream">
                  ₹{totalAgreedPipeline.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-brand-muted mt-1">Sum of all published quotes</p>
              </div>

              <div className="bg-brand-charcoal/70 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
                <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Total Advances Collected</div>
                <div className="text-2xl font-serif font-bold text-emerald-400">
                  ₹{totalCollectedRevenue.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-emerald-500/80 mt-1">Confirmed payments received</p>
              </div>

              <div className="bg-brand-charcoal/70 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
                <div className="text-xs uppercase tracking-wider text-amber-400 mb-1">Outstanding Balance</div>
                <div className="text-2xl font-serif font-bold text-amber-400">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-amber-500/80 mt-1">Milestones & settlements pending</p>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div className="bg-brand-charcoal/50 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif text-brand-cream">Payment Transactions Ledger</h3>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Live audit trail of all advances, milestone payments, and settlements
                  </p>
                </div>
              </div>

              {allPayments.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-muted border border-dashed border-white/5 rounded-xl">
                  No payments recorded yet. Click “₹ Pay” on any lead card to log an advance deposit.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-brand-muted uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Client & Occasion</th>
                        <th className="py-3 px-3">Payment Stage</th>
                        <th className="py-3 px-3">Method</th>
                        <th className="py-3 px-3">Reference / Notes</th>
                        <th className="py-3 px-3 text-right">Amount (INR)</th>
                        <th className="py-3 px-3 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allPayments.map((p) => {
                        const cleanPhone = (p.leadPhone || '').replace(/[^0-9]/g, '');
                        const msg = encodeURIComponent(
                          `Dear ${p.leadName},\n\nPayment confirmation from Heavenly Events:\nReceived ₹${Number(p.amount).toLocaleString('en-IN')} via ${p.method}${p.referenceNote ? ` (Ref: ${p.referenceNote})` : ''} for ${p.occasion}.\n\nThank you for choosing Heavenly Events!`
                        );
                        const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;

                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-3 text-brand-muted">
                              {new Date(p.receivedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-medium text-brand-cream">{p.leadName}</div>
                              <div className="text-[11px] text-brand-gold">{p.occasion}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                                {p.paymentType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-brand-cream">
                              {p.method}
                            </td>
                            <td className="py-3.5 px-3 text-brand-muted max-w-[200px] truncate">
                              {p.referenceNote || '—'}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-emerald-400 font-semibold text-sm">
                              ₹{Number(p.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-colors text-[10px]"
                                title="Send WhatsApp receipt to client"
                              >
                                <MessageCircle className="w-3 h-3" /> Send
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 4: Team & Planners Management */}
        {activeTab === 'team' && (
          <div className="bg-brand-charcoal/50 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-xl font-serif text-brand-cream">Firm Team & User Logins</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Authorized partners and coordinators with access to Occasion Desk
                </p>
              </div>

              <button
                onClick={() => {
                  setCreatedMemberResult(null);
                  setNewMemberName('');
                  setNewMemberEmail('');
                  setNewMemberPhone('+91 ');
                  setNewMemberRole('PLANNER');
                  setNewMemberPassword('Heavenly@2026!');
                  setTeamModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs hover:bg-brand-goldHover transition-all flex items-center gap-1.5 shadow-md shadow-brand-gold/15"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="p-5 rounded-xl bg-brand-charcoal border border-white/10 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-serif font-medium text-brand-cream">{member.fullName}</h4>
                      <p className="text-xs text-brand-muted">{member.email}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {member.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-brand-muted">
                    <span>{member.phone || 'No phone recorded'}</span>
                    {member.phone && (
                      <a
                        href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Schedule Visit Modal */}
      {visitModalOpen && selectedLeadForVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-charcoal border border-brand-gold/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="text-2xl font-serif text-brand-cream">
              Schedule Venue Visit
            </h3>
            <p className="text-xs text-brand-muted">
              Coordination for {selectedLeadForVisit.clientName} ({selectedLeadForVisit.occasionType})
            </p>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Venue Location / Address *
                </label>
                <input
                  type="text"
                  required
                  value={visitLocation}
                  onChange={(e) => setVisitLocation(e.target.value)}
                  placeholder="e.g. Dream Hall, Near Railway Station, Punalur"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Assigned Partner / Coordinator *
                </label>
                <select
                  value={assignedPlanner}
                  onChange={(e) => setAssignedPlanner(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Preparation Notes
                </label>
                <textarea
                  rows={2}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Inspect main truss ceiling height, power supply points..."
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setVisitModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-brand-gold text-brand-dark text-xs font-semibold hover:bg-brand-goldHover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Confirm Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Generator Modal */}
      {quoteModalOpen && selectedLeadForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-charcoal border border-brand-gold/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif text-brand-cream">
                  Draft Event Proposal
                </h3>
                <p className="text-xs text-brand-muted">
                  Client: {selectedLeadForQuote.clientName} · {selectedLeadForQuote.occasionType}
                </p>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="text-brand-muted hover:text-brand-cream text-lg"
              >
                ✕
              </button>
            </div>

            {generatedQuoteResult ? (
              <div className="p-6 rounded-2xl bg-brand-dark border border-indigo-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-serif text-brand-cream">Official Proposal Published</h4>
                <p className="text-xs text-brand-muted">
                  The client-facing quote has been generated and is ready to share with your client.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href={generatedQuoteResult.proposalUrl}
                    target="_blank"
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-brand-surface hover:bg-white/10 text-xs text-brand-cream font-medium flex items-center justify-center gap-2 border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-brand-gold" /> Preview Client Page
                  </Link>
                  <a
                    href={generatedQuoteResult.clientWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Dispatch to Client via WhatsApp
                  </a>
                </div>

                <button
                  onClick={() => setQuoteModalOpen(false)}
                  className="mt-4 text-xs text-brand-muted hover:text-brand-cream"
                >
                  Close & Return to Pipeline
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateProposal} className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-brand-muted font-semibold">
                      Scope Line Items & Deliverables
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setLineItems([...lineItems, { title: '', amount: 0, notes: '' }])
                      }
                      className="text-xs text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl bg-brand-dark/70 border border-white/5 space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Deliverable Description (e.g. Floral Arch)"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...lineItems];
                              updated[index].title = e.target.value;
                              setLineItems(updated);
                            }}
                            className="flex-1 bg-brand-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs text-brand-cream focus:border-brand-gold outline-none"
                          />
                          <div className="flex items-center gap-1.5 w-32">
                            <span className="text-xs text-brand-muted">₹</span>
                            <input
                              type="number"
                              required
                              value={item.amount || ''}
                              onChange={(e) => {
                                const updated = [...lineItems];
                                updated[index].amount = Number(e.target.value);
                                setLineItems(updated);
                              }}
                              className="w-full bg-brand-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-brand-cream focus:border-brand-gold outline-none text-right"
                            />
                          </div>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                              className="text-brand-muted hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Optional specifications (e.g. White carnations + brass lamps)"
                          value={item.notes || ''}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[index].notes = e.target.value;
                            setLineItems(updated);
                          }}
                          className="w-full bg-brand-charcoal/50 border border-white/5 rounded-lg px-3 py-1 text-[11px] text-brand-muted focus:border-brand-gold outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-brand-dark border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-brand-muted">Total: <span className="font-mono text-brand-cream font-medium">₹{totalQuoteAmount.toLocaleString('en-IN')}</span></div>
                    <div className="text-xs text-brand-gold font-medium mt-0.5">
                      Advance Required: <span className="font-mono">₹{requiredDeposit.toLocaleString('en-IN')}</span> ({depositPct}%)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-muted">Advance %:</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={depositPct}
                      onChange={(e) => setDepositPct(Number(e.target.value))}
                      className="w-16 bg-brand-charcoal border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-brand-cream text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || totalQuoteAmount <= 0}
                    className="py-2.5 px-6 rounded-xl bg-brand-gold text-brand-dark text-xs font-semibold hover:bg-brand-goldHover transition-colors disabled:opacity-50 shadow-lg shadow-brand-gold/15"
                  >
                    {isSubmitting ? 'Generating...' : 'Save & Publish Quote Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedLeadForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ₹
                </span>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream">Record Client Payment</h3>
                  <p className="text-[11px] text-brand-muted">
                    {selectedLeadForPayment.clientName} · {selectedLeadForPayment.occasionType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setRecordedPaymentResult(null);
                }}
                className="text-brand-muted hover:text-brand-cream text-lg"
              >
                ✕
              </button>
            </div>

            {recordedPaymentResult ? (
              <div className="p-6 rounded-2xl bg-brand-dark border border-emerald-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="text-lg font-serif text-brand-cream">Payment Recorded Successfully</h4>
                <div className="text-xs text-brand-muted space-y-1">
                  <div>Total Collected to Date: <span className="text-emerald-400 font-mono font-semibold">₹{recordedPaymentResult.totalPaid.toLocaleString('en-IN')}</span></div>
                  <div>Remaining Balance: <span className="text-brand-cream font-mono">₹{recordedPaymentResult.remainingBalance.toLocaleString('en-IN')}</span></div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={recordedPaymentResult.whatsappReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Dispatch Receipt to Client via WhatsApp
                  </a>
                </div>

                <button
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setRecordedPaymentResult(null);
                  }}
                  className="mt-3 text-xs text-brand-muted hover:text-brand-cream"
                >
                  Done & Return to Desk
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4">
                {/* Financial Context */}
                <div className="p-3.5 rounded-xl bg-brand-dark/70 border border-white/5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-brand-muted text-[11px] block">Agreed Scope:</span>
                    <span className="font-mono text-brand-cream font-medium">
                      ₹{Number(selectedLeadForPayment.proposals?.[0]?.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-muted text-[11px] block">Already Paid:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      ₹{(selectedLeadForPayment.payments || []).reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Amount Received (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Payment Stage *
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="ADVANCE_DEPOSIT">Advance Booking Deposit</option>
                      <option value="MID_MILESTONE">Mid-Milestone Installment</option>
                      <option value="FINAL_BALANCE">Final Balance Settlement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="BANK_TRANSFER">Bank Transfer (IMPS / NEFT)</option>
                      <option value="CASH">Cash Payment</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CARD">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Transaction Ref / Note
                    </label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. GPay to Jomit, UTR #93847"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoBook"
                    checked={autoBookLead}
                    onChange={(e) => setAutoBookLead(e.target.checked)}
                    className="rounded bg-brand-dark border-white/10 text-brand-gold focus:ring-0"
                  />
                  <label htmlFor="autoBook" className="text-xs text-brand-cream cursor-pointer">
                    Automatically advance lead status to <span className="text-emerald-400 font-semibold">Confirmed Booking (BOOKED)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-emerald-500 text-brand-dark text-xs font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Recording...' : 'Record Payment & Generate Receipt'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Team Member & Provision Login Modal */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center text-sm font-semibold">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream">Add Team Member & Create Login</h3>
                  <p className="text-[11px] text-brand-muted">Provision portal credentials for partners & planners</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTeamModalOpen(false);
                  setCreatedMemberResult(null);
                }}
                className="text-brand-muted hover:text-brand-cream text-lg"
              >
                ✕
              </button>
            </div>

            {createdMemberResult ? (
              <div className="p-6 rounded-2xl bg-brand-dark border border-brand-gold/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="text-lg font-serif text-brand-cream">User Account Provisioned</h4>
                <p className="text-xs text-brand-muted">
                  Login credentials for <span className="text-brand-cream font-medium">{createdMemberResult.user.fullName}</span> ({createdMemberResult.user.email}) are now active.
                </p>

                {createdMemberResult.whatsappCredentialsUrl ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={createdMemberResult.whatsappCredentialsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] flex items-center justify-center gap-2 shadow-lg"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Send Credentials via WhatsApp
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-brand-gold">
                    No phone number provided. Please deliver credentials securely.
                  </p>
                )}

                <button
                  onClick={() => {
                    setTeamModalOpen(false);
                    setCreatedMemberResult(null);
                  }}
                  className="mt-3 text-xs text-brand-muted hover:text-brand-cream"
                >
                  Done & Return to Roster
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTeamMember} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Rahul Varma"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="planner@firm.com"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                      Role & Permissions *
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="PLANNER">Event Coordinator / Planner</option>
                      <option value="PARTNER">Managing Partner</option>
                      <option value="SUPER_ADMIN">Agency Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs uppercase tracking-wider text-brand-muted">
                        Initial Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewMemberPassword(`Heavenly@${Math.floor(1000 + Math.random() * 9000)}!`)}
                        className="text-[10px] text-brand-gold hover:underline"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setTeamModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-brand-gold text-brand-dark text-xs font-semibold hover:bg-brand-goldHover transition-colors disabled:opacity-50 shadow-lg shadow-brand-gold/15"
                  >
                    {isSubmitting ? 'Creating User...' : 'Provision Login & Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center text-sm font-semibold">
                  <Key className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-brand-cream">Change Your Password</h3>
                  <p className="text-[11px] text-brand-muted">Update your portal credentials securely</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordMsg(null);
                }}
                className="text-brand-muted hover:text-brand-cream text-lg"
              >
                ✕
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordMsg(null);
                  }}
                  className="py-2 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="py-2 px-5 rounded-xl bg-brand-gold text-brand-dark text-xs font-semibold hover:bg-brand-goldHover transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
