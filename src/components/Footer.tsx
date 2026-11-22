import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/5 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1: Wordmark & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif text-lg font-bold border border-brand-gold/30">
                ✦
              </span>
              <span className="font-serif text-2xl text-brand-cream font-bold">Occasion Desk</span>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed max-w-sm">
              The multi-tenant Operating System engineered specifically for event management agencies, wedding planning studios, catering teams, and stage architecture crews.
            </p>
            <div className="pt-2 text-xs text-brand-gold font-mono">
              Zero WhatsApp Chaos • Guaranteed Cash Flow
            </div>
          </div>

          {/* Col 2: Solutions by Industry */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-cream">By Industry</div>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <a href="#industries" className="hover:text-brand-gold transition-colors">
                  Event Planners & Agencies
                </a>
              </li>
              <li>
                <a href="#industries" className="hover:text-brand-gold transition-colors">
                  Catering & Banquet Halls
                </a>
              </li>
              <li>
                <a href="#industries" className="hover:text-brand-gold transition-colors">
                  Stage Décor & Floral Studios
                </a>
              </li>
              <li>
                <a href="#industries" className="hover:text-brand-gold transition-colors">
                  Light, Sound & AV Crews
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Capabilities */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-cream">Product</div>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <Link href="/onboard" className="hover:text-brand-gold transition-colors">
                  Onboard Your Firm
                </Link>
              </li>
              <li>
                <Link href="/desk" className="hover:text-brand-gold transition-colors">
                  Occasion Desk Workspace
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-gold transition-colors">
                  Manual Booking Entry
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-gold transition-colors">
                  Partner Enrollment Hub
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-gold transition-colors">
                  WhatsApp Proposal Builder
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Access */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-cream">Access</div>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <Link href="/login" className="hover:text-brand-gold transition-colors">
                  Partner Sign In
                </Link>
              </li>
              <li>
                <Link href="/onboard" className="hover:text-brand-gold transition-colors">
                  Agency Sign Up (Free)
                </Link>
              </li>
              <li>
                <a href="https://wa.me/919074624023?text=Hello%20Occasion%20Desk!%20I%20would%20like%20to%20learn%20more%20about%20onboarding%20our%20firm." target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                  Direct Concierge Support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <div>
            &copy; {new Date().getFullYear()} Occasion Desk SaaS. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Encrypted Multi-Tenant Cloud</span>
            <span>•</span>
            <span>Hosted on Oracle Cloud Always Free</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
