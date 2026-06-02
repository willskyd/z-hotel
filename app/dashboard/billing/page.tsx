'use client';

import { useState } from 'react';
import InvoicesList from '@/components/billing/invoices-list';
import BillingStats from '@/components/billing/billing-stats';

export default function BillingPage() {
  const [invoices] = useState([
    {
      id: '1',
      invoiceNo: 'INV-001',
      guestName: 'John Smith',
      amount: 360,
      date: '2024-06-15',
      status: 'paid',
      paymentMethod: 'Credit Card',
    },
    {
      id: '2',
      invoiceNo: 'INV-002',
      guestName: 'Sarah Johnson',
      amount: 520,
      date: '2024-06-16',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '3',
      invoiceNo: 'INV-003',
      guestName: 'Michael Chen',
      amount: 280,
      date: '2024-06-17',
      status: 'pending',
      paymentMethod: 'Credit Card',
    },
    {
      id: '4',
      invoiceNo: 'INV-004',
      guestName: 'Emma Davis',
      amount: 480,
      date: '2024-06-18',
      status: 'pending',
      paymentMethod: 'Pending',
    },
  ]);

  const [stats] = useState({
    totalCollected: 1160,
    pendingPayments: 760,
    totalInvoices: 4,
    averageInvoice: 400,
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Billing</h1>
        <p className="text-muted-foreground">
          Manage invoices, payments, and financial transactions
        </p>
      </div>

      {/* Billing Statistics */}
      <BillingStats stats={stats} />

      {/* Invoices List */}
      <InvoicesList invoices={invoices} />
    </div>
  );
}
