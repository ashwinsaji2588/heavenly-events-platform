import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-brand-gold font-serif text-lg">✦</span>
          <span className="font-serif text-lg text-brand-cream font-medium">Heavenly Events</span>
          <span className="text-xs text-brand-muted">· Punalur, Kerala</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted">
          <a href="tel:+919074624023" className="hover:text-brand-gold transition-colors">
            +91 90746 24023
          </a>
          <span className="text-white/20">·</span>
          <a href="tel:+918921744145" className="hover:text-brand-gold transition-colors">
            +91 89217 44145
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://www.instagram.com/__heavenly_events___/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-gold transition-colors"
          >
            Instagram ↗
          </a>
          <Link href="/desk" className="hover:text-brand-gold transition-colors">
            Occasion Desk Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
