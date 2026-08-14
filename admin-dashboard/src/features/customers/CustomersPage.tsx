import React, { useState } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Users, Search, ShoppingBag, ShieldCheck, UserCheck } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleCustomers: CustomerRecord[] = [
    {
      id: 'u-1001-customer',
      name: 'John Shopper',
      email: 'john@scanpaygo.com',
      role: 'CUSTOMER',
      ordersCount: 12,
      totalSpent: 1845.50,
      createdAt: '2026-01-15T10:30:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'u-1002-customer',
      name: 'Ananya Sharma',
      email: 'ananya.s@gmail.com',
      role: 'CUSTOMER',
      ordersCount: 8,
      totalSpent: 920.00,
      createdAt: '2026-02-01T14:20:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'u-1003-customer',
      name: 'Rahul Verma',
      email: 'rahul.verma@domain.com',
      role: 'CUSTOMER',
      ordersCount: 5,
      totalSpent: 480.00,
      createdAt: '2026-03-10T11:00:00Z',
      status: 'ACTIVE',
    },
    {
      id: 'u-1004-admin',
      name: 'Store Administrator',
      email: 'admin@scanpaygo.com',
      role: 'ADMIN',
      ordersCount: 0,
      totalSpent: 0.00,
      createdAt: '2025-12-01T09:00:00Z',
      status: 'ACTIVE',
    },
  ];

  const filteredCustomers = sampleCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpentAll = sampleCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <MainLayout pageTitle="Customer Accounts">
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Registered Shoppers</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{sampleCustomers.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Lifetime Customer Spend</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalSpentAll.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Repeat Customer Rate</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">87.5%</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Authentication Security</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">JWT + bcrypt</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Toolbar */}
        <Card className="p-4 flex items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </Card>

        {/* Customers Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Account Role</TableHead>
                <TableHead>Orders Placed</TableHead>
                <TableHead>Lifetime Spend</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-slate-50">
                  <TableCell className="font-extrabold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <span>{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{customer.email}</TableCell>
                  <TableCell>
                    <Badge variant={customer.role === 'ADMIN' ? 'danger' : 'info'}>
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{customer.ordersCount} orders</TableCell>
                  <TableCell className="font-black text-slate-900">₹{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">{customer.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};
