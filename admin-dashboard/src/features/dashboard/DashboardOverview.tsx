import React, { useState } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
} from 'lucide-react';

interface SampleOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'PAID' | 'VERIFIED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export const DashboardOverview: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'loading' | 'empty' | 'error'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleOrders: SampleOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-98214',
      customerName: 'Alex Customer',
      itemsCount: 5,
      totalAmount: 154.0,
      status: 'VERIFIED',
      createdAt: '10 mins ago',
    },
    {
      id: '2',
      orderNumber: 'ORD-98215',
      customerName: 'Priya Shopper',
      itemsCount: 2,
      totalAmount: 47.0,
      status: 'PAID',
      createdAt: '25 mins ago',
    },
    {
      id: '3',
      orderNumber: 'ORD-98216',
      customerName: 'John Doe',
      itemsCount: 8,
      totalAmount: 420.5,
      status: 'PENDING',
      createdAt: '1 hour ago',
    },
    {
      id: '4',
      orderNumber: 'ORD-98217',
      customerName: 'Sara Connor',
      itemsCount: 1,
      totalAmount: 20.0,
      status: 'CANCELLED',
      createdAt: '2 hours ago',
    },
  ];

  const columns: Column<SampleOrder>[] = [
    {
      header: 'Order Reference',
      cell: (order) => (
        <span className="font-mono font-semibold text-primary">{order.orderNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
    },
    {
      header: 'Items Count',
      cell: (order) => <span className="tnum">{order.itemsCount} pcs</span>,
    },
    {
      header: 'Total Amount',
      cell: (order) => <span className="font-semibold text-text-primary tnum">₹{order.totalAmount.toFixed(2)}</span>,
    },
    {
      header: 'Exit Status',
      cell: (order) => {
        const variants: Record<SampleOrder['status'], 'success' | 'warning' | 'danger' | 'info'> = {
          VERIFIED: 'success',
          PAID: 'info',
          PENDING: 'warning',
          CANCELLED: 'danger',
        };
        return <Badge variant={variants[order.status]}>{order.status}</Badge>;
      },
    },
    {
      header: 'Time',
      accessorKey: 'createdAt',
      className: 'text-text-muted text-xs',
    },
    {
      header: 'Action',
      cell: () => (
        <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
          View Receipt
        </Button>
      ),
    },
  ];

  const filteredOrders = sampleOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout pageTitle="Dashboard Overview">
      <div className="space-y-6">
        {/* Top Operational Metrics KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Today's Revenue</span>
              <div className="p-2 bg-blue-50 text-primary rounded-md">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary tnum">₹24,850.00</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">↑ +14% from yesterday</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Self Checkout Orders</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary tnum">184</p>
            <p className="text-xs text-text-muted mt-1">Average 4.2 items/cart</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Exit Verifications</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary tnum">180</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">97.8% fast exit rate</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Low Stock Alerts</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary tnum">3 Items</p>
            <p className="text-xs text-amber-700 font-medium mt-1">Action required in inventory</p>
          </Card>
        </div>

        {/* Foundation UI Components Demonstration Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={activeTab === 'overview' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('overview')}
                >
                  Live Orders Table
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'loading' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('loading')}
                >
                  Loading State
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'empty' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('empty')}
                >
                  Empty State
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'error' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('error')}
                >
                  Error State
                </Button>
              </div>

              {activeTab === 'overview' && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="w-3.5 h-3.5" />}
                    className="h-8 text-xs w-48"
                  />
                  <Button
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    New Order Demo
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {activeTab === 'overview' && (
              <Table
                data={filteredOrders}
                columns={columns}
                keyExtractor={(item) => item.id}
                emptyTitle="No Orders Matching Search"
                emptyDescription="Try clearing your search query to see recent self-checkout orders."
                className="border-none rounded-none shadow-none"
              />
            )}

            {activeTab === 'loading' && <LoadingState message="Fetching live self-checkout metrics from server..." />}

            {activeTab === 'empty' && (
              <EmptyState
                title="No Product Stock Alerts"
                description="All inventory items are currently above their low-stock thresholds."
                actionLabel="View Product Catalog"
                onAction={() => alert('Navigating to Products...')}
              />
            )}

            {activeTab === 'error' && (
              <div className="p-6">
                <ErrorState
                  title="Database Connection Offline"
                  message="Could not establish connection to PostgreSQL instance on port 5432. Retrying..."
                  onRetry={() => setActiveTab('overview')}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Demo Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Digital Receipt Inspection"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close Window
              </Button>
              <Button leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => setIsModalOpen(false)}>
                Confirm Exit Token
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm text-text-primary">
            <div className="p-4 bg-slate-50 border border-surface-border rounded-lg space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-text-secondary">Order Reference:</span>
                <span className="font-mono font-bold text-primary">ORD-98214</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-text-secondary">Customer:</span>
                <span>Alex Customer (+91 9876543212)</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-text-secondary">Payment Method:</span>
                <Badge variant="info">Razorpay UPI</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Purchased Items</h4>
              <ul className="divide-y divide-surface-border border border-surface-border rounded-lg overflow-hidden">
                <li className="p-3 flex justify-between text-xs">
                  <span>Amul Taaza Milk (500ml) x 2</span>
                  <span className="font-semibold tnum">₹54.00</span>
                </li>
                <li className="p-3 flex justify-between text-xs bg-slate-50/50">
                  <span>Lay's Classic Salted Chips (50g) x 5</span>
                  <span className="font-semibold tnum">₹100.00</span>
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
