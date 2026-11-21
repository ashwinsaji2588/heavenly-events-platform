'use client';

import { Printer, Download } from 'lucide-react';

export default function PrintProposalButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={handlePrint}
        className="py-2.5 px-4 rounded-xl bg-brand-gold text-brand-dark font-semibold text-xs flex items-center gap-2 hover:bg-brand-goldHover transition-all shadow-lg shadow-brand-gold/15 cursor-pointer"
        title="Save this proposal as PDF or send to printer"
      >
        <Download className="w-3.5 h-3.5" /> Save as PDF / Print
      </button>
    </div>
  );
}
