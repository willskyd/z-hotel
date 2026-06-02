interface Invoice {
  id: string;
  invoiceNo: string;
  guestName: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'overdue':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function InvoicesList({ invoices }: InvoicesListProps) {
  return (
    <div className="card-premium">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recent Invoices
      </h3>
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Guest Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="font-medium text-foreground">
                  {invoice.invoiceNo}
                </td>
                <td className="text-foreground">{invoice.guestName}</td>
                <td className="font-semibold text-primary">
                  ${invoice.amount}
                </td>
                <td className="text-muted-foreground">{invoice.date}</td>
                <td className="text-muted-foreground">
                  {invoice.paymentMethod}
                </td>
                <td>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
