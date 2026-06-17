'use client';

import { Download } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNo: string;
  guestName: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  pending: { label: 'Pending', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  overdue: { label: 'Overdue', classes: 'bg-red-500/15 text-red-400 border-red-500/25' },
  partial: { label: 'Partial', classes: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

export default function InvoicesList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const s = STATUS_MAP[inv.status] ?? STATUS_MAP['pending'];
              return (
                <tr
                  key={inv.id}
                  className={`hover:bg-secondary/40 transition-colors ${i < invoices.length - 1 ? 'border-b border-border/50' : ''}`}
                >
                  <td className="px-6 py-4 font-mono text-sm text-foreground font-medium">{inv.invoiceNo}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{inv.guestName}</td>
                  <td className="px-4 py-4 text-sm font-bold text-primary">{formatNaira(inv.amount)}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground capitalize">{inv.paymentMethod}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.classes}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="flex items-center gap-1.5 text-xs text-primary hover:text-accent font-medium transition-colors">
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
