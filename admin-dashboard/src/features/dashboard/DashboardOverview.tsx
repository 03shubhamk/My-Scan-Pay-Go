import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { SalesOverviewChart, SalesDataPoint } from '../../components/charts/SalesOverviewChart';
import { OrderStatusChart, OrderStatusStat } from '../../components/charts/OrderStatusChart';
import { apiClient } from '../../services/apiClient';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DashboardKpis {
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  revenueTrendPercentage: number;
  ordersTrendPercentage: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
}

interface DashboardStatsData {
  kpis: DashboardKpis;
  salesOverview: SalesDataPoint[];
  orderStatusDistribution: OrderStatusStat[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/dashboard-stats');
      if (response.data && response.data.success && response.data.data) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to load dashboard metrics');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard statistics:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not connect to the backend analytics engine. Please ensure backend server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const recentOrdersColumns: Column<RecentOrder>[] = [
    {
      header: 'Order Reference',
      cell: (order) => (
        <span className="font-mono font-bold text-blue-600 text-xs">
          {order.orderNumber}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: (order) => (
        <div>
          <p className="font-bold text-slate-800 text-xs">{order.customerName}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (order) => <span className="font-mono text-xs font-semibold">{order.itemsCount} pcs</span>,
    },
    {
      header: 'Total Paid',
      cell: (order) => (
        <span className="font-mono font-black text-slate-900 text-xs">
          ₹{order.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Order Status',
      cell: (order) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          EXIT_VERIFIED: 'success',
          COMPLETED: 'info',
          PAID: 'info',
          PENDING: 'warning',
          CANCELLED: 'danger',
        };
        const variant = variants[order.status] || 'warning';
        return <Badge variant={variant}>{order.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Time Placed',
      cell: (order) => {
        const date = new Date(order.createdAt);
        return (
          <span className="text-slate-500 text-[11px] font-mono">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
  ];

  const filteredOrders = (data?.recentOrders || []).filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout pageTitle="Executive Dashboard">
      <div className="space-y-6">
        {/* Top Header Bar with Refresh Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Store Real-Time Intelligence</h2>
            <p className="text-xs text-slate-500">
              Live automated self-checkout, turnover metrics, and inventory health
            </p>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <Button
              size="sm"
              variant="secondary"
              onClick={fetchDashboardStats}
              isLoading={isLoading}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Data
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/exit-verifier')}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Turnstile Verifier
            </Button>
          </div>
        </div>

        {/* State 1: Loading Skeleton */}
        {isLoading && <DashboardSkeleton />}

        {/* State 2: Error State */}
        {!isLoading && error && (
          <Card className="p-6">
            <ErrorState
              title="Failed to Load Dashboard Intelligence"
              message={error}
              onRetry={fetchDashboardStats}
            />
          </Card>
        )}

        {/* State 3: Populated Dashboard Content */}
        {!isLoading && !error && data && (
          <>
            {/* Top 4 Authoritative KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Products */}
              <Card className="p-5 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Total Products
                  </span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {data.kpis.totalProducts}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Active catalog items</span>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-blue-600 font-bold hover:underline flex items-center"
                  >
                    View <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </Card>

              {/* 2. Today's Orders */}
              <Card className="p-5 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Today's Orders
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {data.kpis.todayOrders}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center">
                    ↑ +{data.kpis.ordersTrendPercentage}% vs last week
                  </span>
                  <span className="text-slate-400">Self-checkout</span>
                </div>
              </Card>

              {/* 3. Today's Revenue */}
              <Card className="p-5 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Today's Revenue
                  </span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ₹{data.kpis.todayRevenue.toFixed(2)}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-emerald-600 font-bold">
                    ↑ +{data.kpis.revenueTrendPercentage}% velocity
                  </span>
                  <span className="text-slate-400">Verified Paid</span>
                </div>
              </Card>

              {/* 4. Total Customers */}
              <Card className="p-5 border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Total Customers
                  </span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {data.kpis.totalCustomers}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Registered shoppers</span>
                  <button
                    onClick={() => navigate('/customers')}
                    className="text-blue-600 font-bold hover:underline flex items-center"
                  >
                    Directory <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </Card>
            </div>

            {/* Analytics Row: Sales Velocity Area Chart (2 Cols) + Order Status Donut Chart (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <SalesOverviewChart data={data.salesOverview} />
              </Card>

              <Card className="p-6">
                <OrderStatusChart data={data.orderStatusDistribution} />
              </Card>
            </div>

            {/* Operational Tables Row: Recent Self-Checkout Orders (2 Cols) + Low Stock Alerts (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders Table */}
              <Card className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Recent Self-Checkout Orders</h3>
                      <p className="text-xs text-slate-500">Real-time point-of-sale order activity</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search recent orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                        className="h-8 text-xs w-44 bg-white"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/orders')}
                        className="text-xs font-bold"
                      >
                        All Orders
                      </Button>
                    </div>
                  </div>

                  {filteredOrders.length > 0 ? (
                    <Table
                      data={filteredOrders}
                      columns={recentOrdersColumns}
                      keyExtractor={(item) => item.id}
                      className="border-none rounded-none shadow-none"
                    />
                  ) : (
                    <div className="p-8">
                      <EmptyState
                        title="No Orders Found"
                        description={
                          searchTerm
                            ? `No orders matching query "${searchTerm}". Try resetting the search.`
                            : 'No self-checkout orders recorded yet.'
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing {filteredOrders.length} recent transactions</span>
                  <button
                    onClick={() => navigate('/orders')}
                    className="font-bold text-blue-600 hover:underline flex items-center"
                  >
                    View Complete Orders Ledger <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </Card>

              {/* Low Stock Alerts Card */}
              <Card className="overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Low Stock Alerts</h3>
                        <p className="text-[11px] text-slate-500">Items below replenishment threshold</p>
                      </div>
                    </div>
                    <Badge variant="warning">{data.lowStockProducts.length} Items</Badge>
                  </div>

                  <div className="p-4 space-y-3">
                    {data.lowStockProducts.length > 0 ? (
                      data.lowStockProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70 rounded-xl flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs font-extrabold text-slate-900 truncate max-w-[150px]">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Barcode: {prod.barcode} • ₹{prod.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                                prod.stock <= 2
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {prod.stock} left
                            </span>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Limit: {prod.lowStockThreshold}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="Inventory Healthy"
                        description="All items are currently above their low-stock thresholds."
                      />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Automatic threshold alerts</span>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="font-bold text-blue-600 hover:underline flex items-center"
                  >
                    Manage Inventory <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};
