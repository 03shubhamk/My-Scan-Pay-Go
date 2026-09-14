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
  Users,
  Search,
  ShoppingBag,
  UserCheck,
  RefreshCw,
  Eye,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  orders_count: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await apiClient.get('/admin/customers', { params });
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setCustomers(data);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          setCustomers(data.customers || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch customer accounts');
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Could not load customer accounts from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // Metrics computation
  const totalCustomersCount = total || customers.length;
  const totalLifetimeSpend = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgCustomerSpend = customers.length > 0 ? (totalLifetimeSpend / customers.length).toFixed(2) : '0.00';
  const repeatCustomersCount = customers.filter((c) => c.orders_count > 1).length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCustomersCount / customers.length) * 100) : 0;

  return (
    <MainLayout pageTitle="Customer Accounts Directory">
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Registered Shoppers
              </p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">{totalCustomersCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Verified self-checkout accounts</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Lifetime Spend
              </p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                ₹{totalLifetimeSpend.toFixed(2)}
              </h3>
              <p className="text-xs text-emerald-600 font-bold mt-1">Direct store turnover</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Avg. Spend / Shopper
              </p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">₹{avgCustomerSpend}</h3>
              <p className="text-xs text-slate-400 mt-1">Cart value across sessions</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-slate-200/90 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Repeat Shopper Rate
              </p>
              <h3 className="text-2xl font-black text-blue-600 font-mono mt-1">{repeatRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">{repeatCustomersCount} multi-order shoppers</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Toolbar */}
        <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
            <Input
              placeholder="Search customers by name, email, or account ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 text-xs"
            />
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-4">
              Search
            </Button>
          </form>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setPage(1);
              fetchCustomers();
            }}
            className="text-xs font-bold self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Directory
          </Button>
        </Card>

        {/* Customers Table */}
        <Card className="overflow-hidden shadow-sm">
          {loading && (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-xs font-medium">Fetching customer directory...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8">
              <ErrorState title="Failed to load customer directory" message={error} onRetry={fetchCustomers} />
            </div>
          )}

          {!loading && !error && customers.length === 0 && (
            <div className="p-12">
              <EmptyState
                title="No Customers Found"
                description={
                  searchTerm
                    ? `No customer matches "${searchTerm}". Try resetting search.`
                    : 'No customer accounts registered yet.'
                }
              />
            </div>
          )}

          {!loading && !error && customers.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Account Role</TableHead>
                    <TableHead>Orders Placed</TableHead>
                    <TableHead>Lifetime Spend</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-extrabold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{customer.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium font-mono text-xs">{customer.email}</TableCell>
                      <TableCell>
                        <Badge variant={customer.role === 'ADMIN' ? 'danger' : 'info'}>
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 font-mono text-xs">
                        {customer.orders_count} orders
                      </TableCell>
                      <TableCell className="font-black text-slate-900 font-mono text-xs">
                        ₹{customer.total_spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {customer.last_order_date
                          ? new Date(customer.last_order_date).toLocaleDateString()
                          : 'No orders'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsModalOpen(true);
                          }}
                          className="text-xs font-bold bg-white text-slate-700 border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span className="font-medium">
                  Showing page <strong className="text-slate-900">{page}</strong> of{' '}
                  <strong className="text-slate-900">{totalPages}</strong> ({total} total customers)
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

        {/* Customer Profile Inspection Modal */}
        {selectedCustomer && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Customer Shopper Profile"
            footer={
              <div className="flex justify-between w-full items-center">
                <span className="text-xs text-slate-400 font-mono">User ID: {selectedCustomer.id}</span>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-4 text-slate-900 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-base font-black text-slate-900">{selectedCustomer.name}</h4>
                  <p className="text-slate-500 font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCustomer.email}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <Badge variant={selectedCustomer.role === 'ADMIN' ? 'danger' : 'info'}>
                      {selectedCustomer.role}
                    </Badge>
                    <span className="text-[11px] text-slate-400">Active Account</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders Placed</span>
                  <p className="text-lg font-black font-mono text-blue-600">{selectedCustomer.orders_count} orders</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Spending</span>
                  <p className="text-lg font-black font-mono text-emerald-700">
                    ₹{selectedCustomer.total_spent.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Registration Date:
                  </span>
                  <span className="font-semibold">{new Date(selectedCustomer.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Last Checkout Activity:
                  </span>
                  <span className="font-semibold">
                    {selectedCustomer.last_order_date
                      ? new Date(selectedCustomer.last_order_date).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};
