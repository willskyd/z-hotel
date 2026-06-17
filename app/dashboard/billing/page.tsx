'use client';

import { useState } from 'react';
import InvoicesList from '@/components/billing/invoices-list';
import BillingStats from '@/components/billing/billing-stats';

export default function BillingPage() {
  const [invoices] = useState([
    { id: '1', invoiceNo: 'INV-2024-001', guestName: 'Emeka Okafor', amount: 765_000, date: '2024-06-15', status: 'paid', paymentMethod: 'Bank Transfer' },
    { id: '2', invoiceNo: 'INV-2024-002', guestName: 'Ngozi Adeyemi', amount: 520_000, date: '2024-06-16', status: 'paid', paymentMethod: 'POS' },
    { id: '3', invoiceNo: 'INV-2024-003', guestName: 'Chidi Nwosu', amount: 340_000, date: '2024-06-17', status: 'pending', paymentMethod: 'Bank Transfer' },
    { id: '4', invoiceNo: 'INV-2024-004', guestName: 'Aisha Bello', amount: 240_000, date: '2024-06-18', status: 'pending', paymentMethod: 'Pending' },
    { id: '5', invoiceNo: 'INV-2024-005', guestName: 'Biodun Fashola', amount: 320_000, date: '2024-06-10', status: 'overdue', paymentMethod: 'Cash' },
  ]);

  const [stats] = useState({
    totalCollected: 58_420_000,
    pendingPayments: 4_800_000,
    totalInvoices: 156,
    averageInvoice: 374_487,
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-0.5">Billing & Payments</h1>
        <p className="text-sm text-muted-foreground">Manage invoices, payments, and financial transactions</p>
      </div>

      {/* Billing Statistics */}
      <BillingStats stats={stats} />

      {/* Invoices List */}
      <InvoicesList invoices={invoices} />
    </div>
  );
}
