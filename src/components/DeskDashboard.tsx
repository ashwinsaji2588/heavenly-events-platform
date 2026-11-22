'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
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
  IndianRupee,
  Trash2,
  ExternalLink,
  LogOut,
  Users,
  Key,
  Utensils,
  Tag,
  Kanban,
  Send,
  Zap,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
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
  organization,
}: {
  initialLeads: Lead[];
  partners: { id: string; fullName: string }[];
  initialTeam?: TeamMember[];
  currentUser?: { id: string; email: string; fullName: string; role: string };
  organization?: { id?: string; name: string; slug: string; phone?: string; email?: string; settings?: any };
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'visits' | 'ledger' | 'team'>('pipeline');
  const [mobileStatusFilter, setMobileStatusFilter] = useState<string>('ALL');
  const [selectedLeadForVisit, setSelectedLeadForVisit] = useState<Lead | null>(null);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQuoteResult, setGeneratedQuoteResult] = useState<{ proposalUrl: string; clientWhatsAppUrl: string } | null>(null);

  // Manual Booking Form State
  const [addBookingModalOpen, setAddBookingModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+91 ');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newOccasionType, setNewOccasionType] = useState('Traditional & Modern Wedding');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCity, setNewVenueCity] = useState('');
  const [newGuestCount, setNewGuestCount] = useState('');
  const [newDiningType, setNewDiningType] = useState('Buffet & Live Counters');
  const [newBudgetRange, setNewBudgetRange] = useState('₹5,00,000 - ₹10,00,000');
  const [newInitialStatus, setNewInitialStatus] = useState('NEW');
  const [newAssignedUser, setNewAssignedUser] = useState(partners[0]?.id || '');
  const [newNotes, setNewNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/desk/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newClientName,
          clientPhone: newClientPhone,
          clientEmail: newClientEmail || null,
          occasionType: newOccasionType,
          targetDate: newTargetDate || null,
          venueName: newVenueName || null,
          venueCity: newVenueCity || null,
          guestCount: newGuestCount ? Number(newGuestCount) : null,
          budgetRange: newBudgetRange || null,
          status: newInitialStatus,
          assignedUserId: newAssignedUser || null,
          notes: newNotes ? `${newNotes}${newDiningType ? ` • Catering: ${newDiningType}` : ''}` : newDiningType ? `Catering: ${newDiningType}` : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      setLeads((prev) => [data.lead, ...prev]);
      setAddBookingModalOpen(false);
      setNewClientName('');
      setNewClientPhone('+91 ');
      setNewClientEmail('');
      setNewTargetDate('');
      setNewVenueName('');
      setNewVenueCity('');
      setNewGuestCount('');
      setNewNotes('');
    } catch (err: unknown) {
      if (err instanceof Error) setBookingError(err.message);
      else setBookingError('Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  }

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

  // Workflow Playbook State
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedLeadForWorkflow, setSelectedLeadForWorkflow] = useState<Lead | null>(null);

  // New Team Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+91 9188444859');
  const [newMemberRole, setNewMemberRole] = useState('PLANNER');
  const [newMemberPassword, setNewMemberPassword] = useState('Desk@2026!');
  const [createdMemberResult, setCreatedMemberResult] = useState<{ user: TeamMember; whatsappCredentialsUrl: string | null } | null>(null);

  // Password Visibility States
  const [showNewMemberPassword, setShowNewMemberPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Lead / Event Booking State
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [deleteLeadError, setDeleteLeadError] = useState<string | null>(null);

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

  function getWorkflowProgress(lead: Lead): number {
    let score = 20; // Stage 1 intake done
    if (lead.status !== 'NEW') score += 20;
    if (lead.siteVisits && lead.siteVisits.length > 0) score += 20;
    if (lead.proposals && lead.proposals.length > 0) score += 20;
    if ((lead.payments && lead.payments.length > 0) || lead.status === 'BOOKED') score += 20;
    return Math.min(score, 100);
  }

  function getWorkflowStepLabel(status: string): string {
    switch (status) {
      case 'NEW': return '1. Intake';
      case 'CONTACTED': return '2. Consultation';
      case 'VISIT_SCHEDULED': return '3. Site Visit';
      case 'PROPOSAL_SENT': return '4. Quoted';
      case 'BOOKED': return '5. Confirmed';
      default: return 'Active';
    }
  }

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

  async function handleDeleteBooking(leadId: string) {
    if (!leadId) return;
    setIsDeletingLead(true);
    setDeleteLeadError(null);
    try {
      const res = await fetch(`/api/desk/leads?id=${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete event booking');
      }

      // Remove from local leads state
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setLeadToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteLeadError(err.message);
      } else {
        setDeleteLeadError('An unexpected error occurred while deleting the booking.');
      }
    } finally {
      setIsDeletingLead(false);
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
      <header className="sticky top-0 z-40 bg-brand-charcoal/95 backdrop-blur-xl border-b border-white/10 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group min-w-0" title="Occasion Desk">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-serif text-base font-bold shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                ✦
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-base sm:text-lg text-brand-cream group-hover:text-brand-gold transition-colors leading-tight tracking-tight truncate">
                  Occasion Desk
                </span>
                <span className="text-[10px] sm:text-[11px] text-brand-gold font-medium leading-none truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                  <span className="truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[240px] text-brand-muted hover:text-brand-cream">
                    {organization?.name && organization.name !== 'Heavenly Events' ? organization.name : 'Workspace'}
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop + Add Booking Button */}
            <button
              onClick={() => {
                setBookingError(null);
                setAddBookingModalOpen(true);
              }}
              className="hidden sm:inline-flex h-9 px-3.5 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs hover:bg-brand-goldHover transition-all items-center gap-1.5 shadow-md shadow-brand-gold/15 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Booking</span>
            </button>

            {/* Desktop + Enroll Partner Button */}
            <button
              onClick={() => {
                setCreatedMemberResult(null);
                setNewMemberName('');
                setNewMemberEmail('');
                setNewMemberPhone('+91 ');
                setNewMemberRole('PLANNER');
                setNewMemberPassword('Partner@2026!');
                setTeamModalOpen(true);
              }}
              className="hidden lg:inline-flex h-9 px-3 rounded-xl bg-brand-surface text-brand-muted hover:text-brand-cream border border-white/10 font-medium text-xs transition-colors items-center gap-1.5 whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-brand-gold" />
              <span>+ Partner</span>
            </button>

            {/* Theme Toggle Button */}
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>

            {/* User Session Controls */}
            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-white/10">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-brand-cream leading-tight truncate max-w-[120px]">{currentUser.fullName}</div>
                  <div className="text-[9px] text-brand-gold uppercase tracking-wider font-medium">{currentUser.role}</div>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="w-8 h-8 rounded-lg bg-brand-surface hover:border-brand-gold/40 border border-white/10 text-brand-muted hover:text-brand-cream transition-colors flex items-center justify-center flex-shrink-0 active:scale-95"
                  title="Update Master Password"
                  aria-label="Update Master Password"
                >
                  <Key className="w-3.5 h-3.5 text-brand-gold" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-8 h-8 rounded-lg bg-brand-surface hover:bg-red-950/60 hover:text-red-300 border border-white/10 text-brand-muted transition-colors flex items-center justify-center flex-shrink-0 active:scale-95"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Quick Action Bar (Visible only on < sm screens) */}
        <div className="sm:hidden px-4 py-2 bg-brand-surface/90 border-t border-white/5 flex items-center gap-2">
          <button
            onClick={() => {
              setBookingError(null);
              setAddBookingModalOpen(true);
            }}
            className="flex-1 h-10 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-gold/15 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Booking</span>
          </button>
          <button
            onClick={() => {
              setCreatedMemberResult(null);
              setNewMemberName('');
              setNewMemberEmail('');
              setNewMemberPhone('+91 ');
              setNewMemberRole('PLANNER');
              setNewMemberPassword('Partner@2026!');
              setTeamModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl bg-brand-charcoal text-brand-muted hover:text-brand-cream border border-white/10 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-brand-gold" />
            <span>+ Partner</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
          <div className="bg-brand-charcoal/70 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm transition-all hover:border-brand-gold/20">
            <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider text-brand-muted mb-1.5">
              <span>Total Leads</span>
              <FileText className="w-3.5 h-3.5 text-brand-gold/70" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-brand-cream">{leads.length}</div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm transition-all hover:border-brand-gold/20">
            <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider text-brand-muted mb-1.5">
              <span>Visits &amp; Tastings</span>
              <Calendar className="w-3.5 h-3.5 text-purple-400/80" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-purple-400">{allVisits.length}</div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm transition-all hover:border-brand-gold/20">
            <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider text-brand-muted mb-1.5">
              <span>Quotes Sent</span>
              <Send className="w-3.5 h-3.5 text-indigo-400/80" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-indigo-400">
              {leads.filter((l) => l.status === 'PROPOSAL_SENT').length}
            </div>
          </div>
          <div className="bg-brand-charcoal/70 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm transition-all hover:border-brand-gold/20">
            <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider text-brand-muted mb-1.5">
              <span>Confirmed</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/80" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-emerald-400">
              {leads.filter((l) => l.status === 'BOOKED').length}
            </div>
          </div>
          <div className="bg-brand-charcoal/70 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider text-emerald-400 mb-1.5">
              <span>Advances Collected</span>
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold text-emerald-400 flex items-baseline gap-1">
              <span>₹{totalCollectedRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5 truncate">
              {allPayments.length} recorded • ₹{totalOutstanding.toLocaleString('en-IN')} balance
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/10 pb-2.5 mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3 px-3 sm:mx-0 sm:px-0 flex-1">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeTab === 'pipeline'
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'bg-brand-surface/60 text-brand-muted hover:text-brand-cream border border-white/5'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Pipeline</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'pipeline' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-brand-muted'}`}>
                  {leads.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeTab === 'visits'
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'bg-brand-surface/60 text-brand-muted hover:text-brand-cream border border-white/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Visits</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'visits' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-brand-muted'}`}>
                  {allVisits.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeTab === 'ledger'
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'bg-brand-surface/60 text-brand-muted hover:text-brand-cream border border-white/5'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Ledger</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'ledger' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-brand-muted'}`}>
                  {allPayments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeTab === 'team'
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'bg-brand-surface/60 text-brand-muted hover:text-brand-cream border border-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'team' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-brand-muted'}`}>
                  {team.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Pipeline Board */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            {/* Mobile Stage Selector */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
              <button
                onClick={() => setMobileStatusFilter('ALL')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  mobileStatusFilter === 'ALL'
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:text-brand-cream border border-white/5'
                }`}
              >
                All Stages ({leads.length})
              </button>
              {statuses.map((s) => {
                const count = leads.filter((l) => l.status === s.key).length;
                return (
                  <button
                    key={s.key}
                    onClick={() => setMobileStatusFilter(s.key)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      mobileStatusFilter === s.key
                        ? 'bg-brand-gold text-brand-dark shadow-sm'
                        : 'bg-brand-surface text-brand-muted hover:text-brand-cream border border-white/5'
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {statuses
                .filter((col) => mobileStatusFilter === 'ALL' || col.key === mobileStatusFilter)
                .map((col) => {
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
                          className="bg-brand-charcoal border border-white/10 rounded-xl p-4 shadow-md hover:border-brand-gold/40 transition-all flex flex-col justify-between space-y-3 overflow-hidden"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-base font-serif font-medium text-brand-cream">
                                {lead.clientName}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] text-brand-muted">
                                  {new Date(lead.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteLeadError(null);
                                    setLeadToDelete(lead);
                                  }}
                                  className="w-6 h-6 rounded-md text-brand-muted/70 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center active:scale-90"
                                  title="Delete Event Booking"
                                  aria-label={`Delete event booking for ${lead.clientName}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

                          {/* Workflow Stage Progress */}
                          <button
                            onClick={() => {
                              setSelectedLeadForWorkflow(lead);
                              setWorkflowModalOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-brand-surface/60 hover:bg-brand-surface border border-white/5 hover:border-brand-gold/30 transition-all text-left group"
                            title="Open 5-Step Operational Workflow Guide"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Zap className="w-3 h-3 text-brand-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-[11px] font-medium text-brand-cream truncate">
                                Workflow: {getWorkflowStepLabel(lead.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-gold rounded-full transition-all duration-300"
                                  style={{ width: `${getWorkflowProgress(lead)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-brand-gold">{getWorkflowProgress(lead)}%</span>
                            </div>
                          </button>

                          {/* Quick Actions Toolbar */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-1">
                            {/* Client Contact */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <a
                                href={`tel:${lead.clientPhone}`}
                                title={`Call ${lead.clientName} (${lead.clientPhone})`}
                                className="w-8 h-8 rounded-lg bg-brand-surface text-brand-cream hover:bg-brand-gold hover:text-brand-dark transition-colors flex items-center justify-center text-xs active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${lead.clientPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp ${lead.clientName}`}
                                className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center text-xs active:scale-95"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Operations: Pay / Visit / Quote */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
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
                                className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center font-bold text-xs active:scale-95"
                                title="Record Advance or Milestone Payment (₹)"
                              >
                                ₹
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedLeadForVisit(lead);
                                  setVisitLocation(lead.venueName || `${lead.venueCity || 'Punalur'}`);
                                  setVisitModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-brand-surface text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition-colors flex items-center justify-center text-xs active:scale-95"
                                title="Schedule Venue Site Visit"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedLeadForQuote(lead);
                                  setGeneratedQuoteResult(null);
                                  setQuoteModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-brand-surface text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center text-xs active:scale-95"
                                title="Draft Official Proposal Quote"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteLeadError(null);
                                  setLeadToDelete(lead);
                                }}
                                className="w-8 h-8 rounded-lg bg-brand-surface text-brand-muted hover:bg-red-950/60 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-colors flex items-center justify-center text-xs active:scale-95"
                                title="Delete Event Booking"
                                aria-label={`Delete event booking for ${lead.clientName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Stage Progression */}
                          {lead.status === 'NEW' && (
                            <button
                              onClick={() => updateStatus(lead.id, 'CONTACTED')}
                              className="w-full mt-2 h-9 rounded-xl bg-brand-surface hover:bg-white/10 text-xs text-brand-muted hover:text-brand-cream transition-colors flex items-center justify-center font-semibold active:scale-98"
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
                              className="w-full mt-2 h-9 rounded-xl bg-brand-gold/15 hover:bg-brand-gold text-xs text-brand-gold hover:text-brand-dark transition-colors flex items-center justify-center font-semibold active:scale-98"
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
                              className="w-full mt-2 h-9 rounded-xl bg-indigo-950/60 hover:bg-indigo-600 text-xs text-indigo-300 hover:text-white transition-colors flex items-center justify-center font-semibold active:scale-98"
                            >
                              Draft Official Quote →
                            </button>
                          )}
                          {lead.status === 'PROPOSAL_SENT' && (
                            <button
                              onClick={() => updateStatus(lead.id, 'BOOKED')}
                              className="w-full mt-2 h-9 rounded-xl bg-emerald-950/60 hover:bg-emerald-600 text-xs text-emerald-300 hover:text-white transition-colors flex items-center justify-center font-semibold active:scale-98"
                            >
                              Confirm Booking ✓
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
                        const firmDisplayName = organization?.name && organization.name !== 'Heavenly Events' ? organization.name : 'Occasion Desk Workspace';
                        const msg = encodeURIComponent(
                          `Dear ${p.leadName},\n\nPayment confirmation from ${firmDisplayName}:\nReceived ₹${Number(p.amount).toLocaleString('en-IN')} via ${p.method}${p.referenceNote ? ` (Ref: ${p.referenceNote})` : ''} for ${p.occasion}.\n\nThank you for choosing ${firmDisplayName}!`
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
                  setNewMemberPassword('Desk@2026!');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-gold/40 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-serif text-brand-cream">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-gold/40 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
                      placeholder="e.g. GPay, Bank Transfer, UTR #93847"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
                        onClick={() => setNewMemberPassword(`Desk@${Math.floor(1000 + Math.random() * 9000)}!`)}
                        className="text-[10px] text-brand-gold hover:underline"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewMemberPassword ? "text" : "password"}
                        required
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        className="w-full bg-brand-dark border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm font-mono text-brand-cream focus:border-brand-gold outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewMemberPassword(!showNewMemberPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream transition-colors p-1"
                        title={showNewMemberPassword ? "Hide password" : "Show password"}
                        aria-label={showNewMemberPassword ? "Hide password" : "Show password"}
                      >
                        {showNewMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream transition-colors p-1"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream transition-colors p-1"
                    title={showNewPassword ? "Hide password" : "Show password"}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream transition-colors p-1"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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

      {/* Manual Booking Creation Modal (+ Add Booking) */}
      {addBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-charcoal border border-brand-gold/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold text-lg border border-brand-gold/30">
                  +
                </span>
                <div>
                  <h3 className="font-serif text-xl text-brand-cream font-medium">Add New Booking</h3>
                  <p className="text-xs text-brand-muted">Log phone calls, office walk-ins, and direct partner referrals</p>
                </div>
              </div>
              <button
                onClick={() => setAddBookingModalOpen(false)}
                className="text-brand-muted hover:text-brand-cream text-lg"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-5">
              
              {/* Section 1: Client Info */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-gold pb-1 border-b border-white/5 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> 1. Client Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Client / Couple Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. Rahul &amp; Ananya"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                    Client Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Event & Venue Details */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-gold pb-1 border-b border-white/5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> 2. Event &amp; Venue Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Occasion Type *
                    </label>
                    <select
                      value={newOccasionType}
                      onChange={(e) => setNewOccasionType(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="Traditional &amp; Modern Wedding">Traditional &amp; Modern Wedding</option>
                      <option value="Grand Reception &amp; Gala">Grand Reception &amp; Gala</option>
                      <option value="Catering &amp; Banquet Feast">Catering &amp; Banquet Feast</option>
                      <option value="Stage Architecture &amp; Décor">Stage Architecture &amp; Décor</option>
                      <option value="Sound, Lighting &amp; AV Production">Sound, Lighting &amp; AV Production</option>
                      <option value="Ring Ceremony &amp; Engagement">Ring Ceremony &amp; Engagement</option>
                      <option value="Corporate Event &amp; Conference">Corporate Event &amp; Conference</option>
                      <option value="Birthday &amp; Milestone Celebration">Birthday &amp; Milestone Celebration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Target Event Date
                    </label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Auditorium / Venue Name
                    </label>
                    <input
                      type="text"
                      value={newVenueName}
                      onChange={(e) => setNewVenueName(e.target.value)}
                      placeholder="e.g. The River Palace Auditorium"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={newVenueCity}
                      onChange={(e) => setNewVenueCity(e.target.value)}
                      placeholder="e.g. Punalur, Kollam"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Scope, Catering & Budget */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-gold pb-1 border-b border-white/5 flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5" /> 3. Scope &amp; Catering Format
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Guest Headcount
                    </label>
                    <input
                      type="number"
                      value={newGuestCount}
                      onChange={(e) => setNewGuestCount(e.target.value)}
                      placeholder="e.g. 800"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Catering / Scope Style
                    </label>
                    <input
                      type="text"
                      value={newDiningType}
                      onChange={(e) => setNewDiningType(e.target.value)}
                      placeholder="e.g. 300 Veg / 500 Non-Veg"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Estimated Budget (₹)
                    </label>
                    <input
                      type="text"
                      value={newBudgetRange}
                      onChange={(e) => setNewBudgetRange(e.target.value)}
                      placeholder="e.g. ₹5,00,000 - ₹10,00,000"
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Stage & Assignment */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-gold pb-1 border-b border-white/5 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> 4. Pipeline Stage &amp; Assignment
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Initial Status in Pipeline
                    </label>
                    <select
                      value={newInitialStatus}
                      onChange={(e) => setNewInitialStatus(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="NEW">New Inquiry (Uncontacted)</option>
                      <option value="CONTACTED">In Consultation</option>
                      <option value="VISIT_SCHEDULED">Site Visit / Tasting Booked</option>
                      <option value="PROPOSAL_SENT">Proposal Quote Sent</option>
                      <option value="BOOKED">Confirmed Event (Advance Paid)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                      Assign Lead Partner / Coordinator
                    </label>
                    <select
                      value={newAssignedUser}
                      onChange={(e) => setNewAssignedUser(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-brand-cream focus:border-brand-gold outline-none"
                    >
                      <option value="">Unassigned</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-muted mb-1 font-medium">
                    Internal Notes &amp; Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Specific requests, dietary restrictions, flower preferences, power loads..."
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-brand-cream focus:border-brand-gold outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setAddBookingModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs text-brand-muted hover:text-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 rounded-xl bg-brand-gold text-brand-dark text-xs sm:text-sm font-bold hover:bg-brand-goldHover transition-all shadow-md shadow-brand-gold/15 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Booking...' : '+ Save &amp; Inject into Pipeline'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5-Step Operational Workflow Modal */}
      {workflowModalOpen && selectedLeadForWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-brand-charcoal border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xs font-bold">
                    ⚡
                  </span>
                  <span className="text-xs uppercase tracking-wider text-brand-gold font-semibold">
                    Event Operational Workflow
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-brand-cream">
                  {selectedLeadForWorkflow.clientName}
                </h3>
                <div className="text-xs text-brand-muted">
                  {selectedLeadForWorkflow.occasionType} • {selectedLeadForWorkflow.venueName || selectedLeadForWorkflow.venueCity || 'Kerala'}
                </div>
              </div>
              <button
                onClick={() => setWorkflowModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-brand-surface text-brand-muted hover:text-brand-cream flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Overall Progress Bar */}
            <div className="p-4 rounded-xl bg-brand-dark/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted font-medium">Lifecycle Completion</span>
                <span className="font-mono text-brand-gold font-bold">{getWorkflowProgress(selectedLeadForWorkflow)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-500"
                  style={{ width: `${getWorkflowProgress(selectedLeadForWorkflow)}%` }}
                />
              </div>
            </div>

            {/* Step-by-Step Interactive Playbook */}
            <div className="space-y-3">
              {/* Step 1: Client Intake & Consultation */}
              <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-brand-cream">Step 1: Intake & Consultation</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">COMPLETED</span>
                </div>
                <p className="text-[11px] text-brand-muted pl-7">
                  Client inquiry logged. Direct phone: {selectedLeadForWorkflow.clientPhone}.
                </p>
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <a
                    href={`tel:${selectedLeadForWorkflow.clientPhone}`}
                    className="py-1 px-2.5 rounded-lg bg-brand-charcoal hover:bg-brand-gold hover:text-brand-dark text-brand-cream text-[11px] font-medium border border-white/10 transition-colors inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call Client
                  </a>
                  <a
                    href={`https://wa.me/${selectedLeadForWorkflow.clientPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-emerald-950/60 text-emerald-300 hover:bg-emerald-600 hover:text-white text-[11px] font-medium border border-emerald-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Step 2: Site Walkthrough & Tasting */}
              <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      selectedLeadForWorkflow.siteVisits && selectedLeadForWorkflow.siteVisits.length > 0
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-brand-muted border-white/10'
                    }`}>
                      {selectedLeadForWorkflow.siteVisits && selectedLeadForWorkflow.siteVisits.length > 0 ? '✓' : '2'}
                    </span>
                    <span className="text-xs font-semibold text-brand-cream">Step 2: Site Visit & Tasting</span>
                  </div>
                  <span className={`text-[10px] font-mono ${
                    selectedLeadForWorkflow.siteVisits && selectedLeadForWorkflow.siteVisits.length > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedLeadForWorkflow.siteVisits && selectedLeadForWorkflow.siteVisits.length > 0 ? `${selectedLeadForWorkflow.siteVisits.length} SCHEDULED` : 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted pl-7">
                  Venue dimensions, ceiling truss rigging, and food tasting schedule.
                </p>
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <button
                    onClick={() => {
                      setWorkflowModalOpen(false);
                      setSelectedLeadForVisit(selectedLeadForWorkflow);
                      setVisitLocation(selectedLeadForWorkflow.venueName || `${selectedLeadForWorkflow.venueCity || 'Kerala'}`);
                      setVisitModalOpen(true);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-brand-charcoal hover:bg-purple-600 hover:text-white text-purple-300 text-[11px] font-medium border border-purple-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" /> + Schedule Site Visit
                  </button>
                  {selectedLeadForWorkflow.siteVisits && selectedLeadForWorkflow.siteVisits.length > 0 && (
                    <a
                      href={`/api/desk/visits/${selectedLeadForWorkflow.siteVisits[0].id}/ics`}
                      download
                      className="py-1 px-2.5 rounded-lg bg-brand-charcoal hover:text-brand-gold text-brand-muted text-[11px] font-medium border border-white/10 transition-colors inline-flex items-center gap-1"
                    >
                      Export .ICS
                    </a>
                  )}
                </div>
              </div>

              {/* Step 3: Itemized Proposal */}
              <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-brand-muted border-white/10'
                    }`}>
                      {selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0 ? '✓' : '3'}
                    </span>
                    <span className="text-xs font-semibold text-brand-cream">Step 3: Itemized Proposal</span>
                  </div>
                  <span className={`text-[10px] font-mono ${
                    selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0
                      ? `QUOTE: ₹${Number(selectedLeadForWorkflow.proposals[0].totalAmount).toLocaleString('en-IN')}`
                      : 'NOT SENT'}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted pl-7">
                  Mandap, floral styling, banquet catering per-plate split, and deposit requirements.
                </p>
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <button
                    onClick={() => {
                      setWorkflowModalOpen(false);
                      setSelectedLeadForQuote(selectedLeadForWorkflow);
                      setGeneratedQuoteResult(null);
                      setQuoteModalOpen(true);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-brand-charcoal hover:bg-indigo-600 hover:text-white text-indigo-300 text-[11px] font-medium border border-indigo-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> {selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0 ? 'Create New Revision' : '+ Draft Proposal'}
                  </button>
                  {selectedLeadForWorkflow.proposals && selectedLeadForWorkflow.proposals.length > 0 && (
                    <Link
                      href={`/proposals/${selectedLeadForWorkflow.proposals[0].id}`}
                      target="_blank"
                      className="py-1 px-2.5 rounded-lg bg-brand-charcoal hover:text-brand-gold text-brand-muted text-[11px] font-medium border border-white/10 transition-colors inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View Proposal
                    </Link>
                  )}
                </div>
              </div>

              {/* Step 4: Advance Booking Deposit */}
              <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      selectedLeadForWorkflow.payments && selectedLeadForWorkflow.payments.length > 0
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-brand-muted border-white/10'
                    }`}>
                      {selectedLeadForWorkflow.payments && selectedLeadForWorkflow.payments.length > 0 ? '✓' : '4'}
                    </span>
                    <span className="text-xs font-semibold text-brand-cream">Step 4: Advance Deposit & Lock-in</span>
                  </div>
                  <span className={`text-[10px] font-mono ${
                    selectedLeadForWorkflow.payments && selectedLeadForWorkflow.payments.length > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedLeadForWorkflow.payments && selectedLeadForWorkflow.payments.length > 0
                      ? `COLLECTED: ₹${(selectedLeadForWorkflow.payments || []).reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('en-IN')}`
                      : 'AWAITING ADVANCE'}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted pl-7">
                  Record advance deposit via UPI, bank transfer, or cash. Auto-advances booking to BOOKED.
                </p>
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <button
                    onClick={() => {
                      setWorkflowModalOpen(false);
                      setSelectedLeadForPayment(selectedLeadForWorkflow);
                      const quote = selectedLeadForWorkflow.proposals?.[0];
                      const paid = (selectedLeadForWorkflow.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                      const suggested = quote ? Math.max(0, Number(quote.depositRequired) - paid) : 0;
                      setPaymentAmount(suggested > 0 ? String(suggested) : '');
                      setPaymentRef('');
                      setRecordedPaymentResult(null);
                      setPaymentModalOpen(true);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-600 hover:text-white text-emerald-300 text-[11px] font-medium border border-emerald-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <IndianRupee className="w-3 h-3" /> Record Advance Payment
                  </button>
                </div>
              </div>

              {/* Step 5: Confirmed & Day-of Execution */}
              <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      selectedLeadForWorkflow.status === 'BOOKED'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-brand-muted border-white/10'
                    }`}>
                      {selectedLeadForWorkflow.status === 'BOOKED' ? '✓' : '5'}
                    </span>
                    <span className="text-xs font-semibold text-brand-cream">Step 5: Event Confirmed & Day-of Ready</span>
                  </div>
                  <span className={`text-[10px] font-mono ${
                    selectedLeadForWorkflow.status === 'BOOKED' ? 'text-emerald-400' : 'text-brand-muted'
                  }`}>
                    {selectedLeadForWorkflow.status === 'BOOKED' ? 'LOCKED IN' : 'IN PROGRESS'}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted pl-7">
                  All milestones set. Partner execution handover ready for execution day.
                </p>
                {selectedLeadForWorkflow.status !== 'BOOKED' && (
                  <div className="pl-7 pt-1">
                    <button
                      onClick={() => {
                        updateStatus(selectedLeadForWorkflow.id, 'BOOKED');
                        setWorkflowModalOpen(false);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-brand-gold text-brand-dark text-[11px] font-bold hover:bg-brand-goldHover transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3" /> Mark Officially Booked
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[11px] text-brand-muted">
                Direct Line: +91 91884 44859
              </span>
              <button
                onClick={() => setWorkflowModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-brand-surface text-brand-cream text-xs font-medium border border-white/10 hover:bg-brand-charcoal"
              >
                Close Workflow
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-brand-charcoal border border-red-500/30 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-brand-cream leading-snug">
                  Delete Event Booking?
                </h3>
                <p className="text-xs text-red-400/90 font-medium">
                  This destructive action cannot be undone.
                </p>
              </div>
            </div>

            {/* Event Summary Details */}
            <div className="p-3.5 rounded-xl bg-brand-surface/70 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Client:</span>
                <span className="font-medium text-brand-cream">{leadToDelete.clientName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Occasion:</span>
                <span className="font-medium text-brand-gold">{leadToDelete.occasionType}</span>
              </div>
              {leadToDelete.targetDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">Event Date:</span>
                  <span className="font-medium text-brand-cream">
                    {new Date(leadToDelete.targetDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Current Stage:</span>
                <span className="font-mono text-[11px] text-amber-300">
                  {leadToDelete.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed">
              Deleting this booking will permanently erase the event record along with all associated timeline visits, client proposals, and logged payments from the database.
            </p>

            {deleteLeadError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300">
                {deleteLeadError}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={isDeletingLead}
                onClick={() => {
                  setLeadToDelete(null);
                  setDeleteLeadError(null);
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-medium text-brand-muted hover:text-brand-cream hover:bg-brand-surface transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingLead}
                onClick={() => handleDeleteBooking(leadToDelete.id)}
                className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
              >
                {isDeletingLead ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
