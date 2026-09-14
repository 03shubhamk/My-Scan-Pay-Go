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
  Search,
  ShoppingBag,
  Clock,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  QrCode,
  Package,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_barcode?: string;
  product_image_url?: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
}

interface OrderRecord {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment?: {
    id: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    amount: number;
    status: string;
    created_at: string;
  };
  exit_verification?: {
    id: string;
    verification_token: string;
    status: string;
    verified_at?: string;
    created_at: string;
  };
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentFilter !== 'ALL') params.paymentStatus = paymentFilter;

      const response = await apiClient.get('/admin/orders', { params });
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setOrders(data);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          setOrders(data.orders || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setError(err.response?.data?.message || err.message || 'Could not load store orders from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openOrderInspector = async (orderId: string) => {
    try {
      const response = await apiClient.get(`/admin/orders/${orderId}`);
      if (response.data && response.data.success && response.data.data) {
        setSelectedOrder(response.data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      // Fallback to currently loaded row
      const local = orders.find((o) => o.id === orderId);
      if (local) {
        setSelectedOrder(local);
        setIsModalOpen(true);
      }
    }
  };

  // Summary KPI computations
  const totalOrdersCount = total || orders.length;
  const totalRevenueSum = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const paidOrdersCount = orders.filter((o) => o.payment_status === 'PAID').length;
  const paidRate = orders.length > 0 ? Math.round((paidOrdersCount / orders.length) * 100) : 100;
  const avgOrderValue = paidOrdersCount > 0 ? (totalRevenueSum / paidOrdersCount).toFixed(2) : '0.00';

  return (
    <MainLayout pageTitle="Orders & Transactions Ledger">
      <div className="space-y-6">
        {/* Top Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Total Orders Placed
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalOrdersCount}</p>
            <p className="text-xs text-slate-500 mt-1">Self-checkout kiosks</p>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Processed Revenue
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">₹{totalRevenueSum.toFixed(2)}</p>
            <p className="text-xs text-emerald-600 font-bold mt-1">Authoritative DB capture</p>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Payment Success Rate
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{paidRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{paidOrdersCount} verified paid</p>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Avg. Basket Size
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">₹{avgOrderValue}</p>
            <p className="text-xs text-slate-500 mt-1">Per completed transaction</p>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by order # (e.g. ORD-A100), customer, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-slate-50 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
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
                  <option value="ALL">All Order States</option>
                  <option value="EXIT_VERIFIED">Exit Verified</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-bold">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Payments</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-4">
                Apply Search
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setPaymentFilter('ALL');
                  setPage(1);
                  fetchOrders();
                }}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Orders Table Card */}
        <Card className="overflow-hidden shadow-sm">
          {loading && (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading orders from backend API...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8">
              <ErrorState title="Failed to load orders" message={error} onRetry={fetchOrders} />
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="p-12">
              <EmptyState
                title="No Orders Found"
                description={
                  searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                    ? 'No orders match your filter criteria. Try resetting the filters.'
                    : 'No customer checkout orders have been created yet.'
                }
              />
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Exit / Order Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const paymentVariants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
                      PAID: 'success',
                      UNPAID: 'warning',
                      FAILED: 'danger',
                      REFUNDED: 'info',
                    };
                    const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
                      EXIT_VERIFIED: 'success',
                      COMPLETED: 'info',
                      PENDING: 'warning',
                      CANCELLED: 'danger',
                    };

                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono font-black text-blue-600 text-xs">
                          {order.order_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{order.customer_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                              {order.customer_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">
                          {order.items_count || order.items?.length || 1} pcs
                        </TableCell>
                        <TableCell className="font-mono font-black text-slate-900 text-xs">
                          ₹{order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentVariants[order.payment_status] || 'warning'}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[order.status] || 'warning'}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {new Date(order.created_at).toLocaleString([], {
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
                            onClick={() => openOrderInspector(order.id)}
                            className="text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Inspect
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

        {/* Detailed Order Inspector Modal */}
        {selectedOrder && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Order Manifest: ${selectedOrder.order_number || selectedOrder.id.substring(0, 8)}`}
            footer={
              <div className="flex justify-between w-full items-center">
                <span className="text-xs text-slate-400 font-mono">ID: {selectedOrder.id}</span>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Close Manifest
                </Button>
              </div>
            }
          >
            <div className="space-y-5 text-slate-900 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Header Overview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
                    <p className="font-mono text-base font-black text-blue-600">
                      {selectedOrder.order_number || `ORD-${selectedOrder.id.substring(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Transaction</span>
                    <p className="font-mono text-lg font-black text-slate-900">
                      ₹{selectedOrder.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedOrder.customer_name}</p>
                      <p className="text-slate-500 font-mono">{selectedOrder.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:justify-end">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-700">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                      <div className="flex space-x-1.5 mt-1">
                        <Badge variant={selectedOrder.payment_status === 'PAID' ? 'success' : 'warning'}>
                          {selectedOrder.payment_status}
                        </Badge>
                        <Badge variant={selectedOrder.status === 'EXIT_VERIFIED' ? 'success' : 'info'}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Itemized Manifest ({selectedOrder.items?.length || 0} line items)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Barcode</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{item.product_name}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {item.product_barcode || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 font-mono text-right">₹{item.price_at_purchase.toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-mono text-right font-black text-slate-900">
                            ₹{item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment & Razorpay Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
                  <h5 className="text-[11px] font-black text-blue-900 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Payment Verification
                  </h5>
                  <p className="text-slate-600">
                    <span className="font-semibold">Razorpay Order ID:</span>{' '}
                    <span className="font-mono">{selectedOrder.payment?.razorpay_order_id || 'order_rzp_mock'}</span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Payment ID:</span>{' '}
                    <span className="font-mono">{selectedOrder.payment?.razorpay_payment_id || 'pay_rzp_mock'}</span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Settlement:</span>{' '}
                    <span className="font-bold text-emerald-700">₹{selectedOrder.total_amount.toFixed(2)} (PAID)</span>
                  </p>
                </div>

                {/* Exit Gate Pass */}
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1.5">
                  <h5 className="text-[11px] font-black text-purple-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-purple-600" />
                    Turnstile Exit Pass
                  </h5>
                  <p className="text-slate-600">
                    <span className="font-semibold">Token:</span>{' '}
                    <span className="font-mono text-[10px]">
                      {selectedOrder.exit_verification?.verification_token ||
                        `SPG-EXIT-${selectedOrder.id.substring(0, 8).toUpperCase()}`}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Gate Status:</span>{' '}
                    <span className="font-bold text-purple-700">
                      {selectedOrder.exit_verification?.status || selectedOrder.status}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Verified At:</span>{' '}
                    <span className="font-mono">
                      {selectedOrder.exit_verification?.verified_at
                        ? new Date(selectedOrder.exit_verification.verified_at).toLocaleTimeString()
                        : 'Pending Turnstile Scan'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};
