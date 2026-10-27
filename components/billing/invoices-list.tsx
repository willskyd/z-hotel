'use client';

import { ChevronDown, Download } from 'lucide-react';
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
  const downloadInvoice = (invoice: Invoice) => {
    const status = STATUS_MAP[invoice.status]?.label ?? invoice.status;
    const lines = [
      'Zinuel Hotel - Invoice',
      `Invoice: ${invoice.invoiceNo}`,
      `Guest: ${invoice.guestName}`,
      `Amount: NGN ${invoice.amount.toLocaleString('en-NG')}`,
      `Date: ${invoice.date}`,
      `Payment method: ${invoice.paymentMethod}`,
      `Status: ${status}`,
    ];
    const escapePdfText = (value: string) => value
      .replace(/[^\x20-\x7E]/g, '?')
      .replace(/[\\()]/g, '\\$&');
    const textCommands = lines.map((line, index) =>
      `BT /F1 ${index === 0 ? 16 : 11} Tf 50 ${790 - index * 32} Td (${escapePdfText(line)}) Tj ET`,
    ).join('\n');
    const content = `${textCommands}\n`;
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/20">
      <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{invoices.length} invoice{invoices.length === 1 ? '' : 's'} · open an invoice for activity details</p>
      </div>
      <div className="divide-y divide-border/60">
        {invoices.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted-foreground">No recent invoices.</p>
        ) : invoices.map((invoice) => {
          const status = STATUS_MAP[invoice.status] ?? STATUS_MAP.pending;
          return (
            <details key={invoice.id} className="group min-w-0">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block break-all font-mono text-xs font-semibold text-foreground">{invoice.invoiceNo}</span>
                  <span className="mt-1 block break-words text-sm text-muted-foreground">{invoice.guestName}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-sm font-bold text-primary sm:inline">{formatNaira(invoice.amount)}</span>
                  <span className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold ${status.classes}`}>{status.label}</span>
                  <ChevronDown size={16} className="text-muted-foreground transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <div className="border-t border-border bg-secondary/20 px-4 py-3 sm:px-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
                  <div><p className="text-muted-foreground">Guest</p><p className="mt-0.5 break-words text-sm text-foreground">{invoice.guestName}</p></div>
                  <div><p className="text-muted-foreground">Amount</p><p className="mt-0.5 text-sm font-bold text-primary">{formatNaira(invoice.amount)}</p></div>
                  <div><p className="text-muted-foreground">Status</p><p className="mt-0.5 text-sm text-foreground">{status.label}</p></div>
                  <div><p className="text-muted-foreground">Activity date</p><p className="mt-0.5 text-sm text-foreground">{invoice.date}</p></div>
                  <div><p className="text-muted-foreground">Payment method</p><p className="mt-0.5 break-words text-sm capitalize text-foreground">{invoice.paymentMethod}</p></div>
                  <div><p className="text-muted-foreground">Invoice reference</p><p className="mt-0.5 break-all font-mono text-sm text-foreground">{invoice.invoiceNo}</p></div>
                </div>
                <div className="mt-3 flex justify-end border-t border-border/60 pt-2">
                  <button type="button" onClick={() => downloadInvoice(invoice)} className="flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-accent">
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
