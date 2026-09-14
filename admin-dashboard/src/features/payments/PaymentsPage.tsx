import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface PaymentRecord {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await apiClient.get('/admin/payments', { params });
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setPayments(data);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          setPayments(data.payments || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch payments ledger');
      }
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || err.message || 'Could not load payments ledger from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  // KPI Calculations
  const totalTransactions = total || payments.length;
  const totalVolume = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  const successfulPayments = payments.filter((p) => p.status === 'PAID').length;
  const successRate = payments.length > 0 ? Math.round((successfulPayments / payments.length) * 100) : 100;

  return (
    <MainLayout pageTitle="Payments & Settlement Ledger">
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Total Transactions
              </p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">{totalTransactions}</h3>
              <p className="text-xs text-slate-400 mt-1">Razorpay gateway passes</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Processed Volume
              </p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                ₹{totalVolume.toFixed(2)}
              </h3>
              <p className="text-xs text-emerald-600 font-bold mt-1">Direct merchant settlement</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Gateway Success Rate
              </p>
              <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">{successRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">{successfulPayments} captured payments</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                HMAC Security
              </p>
              <h3 className="text-2xl font-black text-indigo-600 font-mono mt-1">SHA-256</h3>
              <p className="text-xs text-slate-400 mt-1">Zero-Trust Signature Verifier</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 space-y-3 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search transaction ID, Razorpay ID, order #, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-slate-50 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-bold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Payment States</option>
                  <option value="PAID">Paid / Captured</option>
                  <option value="CREATED">Created</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-4">
                Filter
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setPage(1);
                  fetchPayments();
                }}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Payments Table */}
        <Card className="overflow-hidden shadow-sm">
          {loading && (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-xs font-medium">Fetching payments ledger from backend...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8">
              <ErrorState title="Failed to load payments ledger" message={error} onRetry={fetchPayments} />
            </div>
          )}

          {!loading && !error && payments.length === 0 && (
            <div className="p-12">
              <EmptyState
                title="No Transactions Found"
                description={
                  searchTerm || statusFilter !== 'ALL'
                    ? 'No payments match your filter criteria. Try resetting filters.'
                    : 'No payment transactions recorded yet.'
                }
              />
            </div>
          )}

          {!loading && !error && payments.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Ref</TableHead>
                    <TableHead>Razorpay Payment ID</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Settled Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
                      PAID: 'success',
                      CAPTURED: 'success',
                      CREATED: 'warning',
                      FAILED: 'danger',
                      REFUNDED: 'info',
                    };

                    return (
                      <TableRow key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono font-bold text-slate-800 text-xs">
                          {payment.id.length > 16 ? `${payment.id.substring(0, 16)}...` : payment.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-blue-600 font-black">
                          {payment.razorpay_payment_id || 'pay_rzp_mock'}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-extrabold text-slate-900">
                          {payment.order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{payment.customer_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                              {payment.customer_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-black text-slate-900 text-xs">
                          ₹{payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[payment.status] || 'warning'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {new Date(payment.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsModalOpen(true);
                            }}
                            className="text-xs font-bold bg-white text-slate-700 border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span className="font-medium">
                  Showing page <strong className="text-slate-900">{page}</strong> of{' '}
                  <strong className="text-slate-900">{totalPages}</strong> ({total} total transactions)
                </span>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-bold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Previous
                  </Button>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-900">
                    {page}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="text-xs font-bold"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Payment Receipt Inspector Modal */}
        {selectedPayment && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Payment Gateway Voucher"
            footer={
              <div className="flex justify-between w-full items-center">
                <span className="text-xs text-slate-400 font-mono">TXN: {selectedPayment.id}</span>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-4 text-slate-900 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Authorized Settlement</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    ₹{selectedPayment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">Payment Status</span>
                    <div className="mt-0.5">
                      <Badge variant={selectedPayment.status === 'PAID' ? 'success' : 'warning'}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Order Reference</span>
                    <p className="font-mono font-bold text-blue-600 mt-0.5">{selectedPayment.order_number}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Customer Name:</span>
                  <span className="font-bold">{selectedPayment.customer_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Customer Email:</span>
                  <span className="font-mono">{selectedPayment.customer_email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Razorpay Order ID:</span>
                  <span className="font-mono text-blue-600">{selectedPayment.razorpay_order_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Razorpay Payment ID:</span>
                  <span className="font-mono text-blue-600">{selectedPayment.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Transaction Timestamp:</span>
                  <span className="font-mono">{new Date(selectedPayment.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};
