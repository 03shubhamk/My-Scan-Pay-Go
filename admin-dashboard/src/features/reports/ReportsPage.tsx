import React, { useState } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { BarChart3, TrendingUp, DollarSign, Award, Zap, Package } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  const topProducts = [
    { name: 'Amul Taaza Milk (500ml)', barcode: '8901030000001', category: 'Dairy', salesQty: 420, revenue: 11340.00 },
    { name: 'Coca-Cola Original Taste (750ml)', barcode: '8901764012345', category: 'Beverages', salesQty: 310, revenue: 12400.00 },
    { name: 'Lay\'s Classic Salted Chips (50g)', barcode: '8901491100010', category: 'Snacks', salesQty: 295, revenue: 5900.00 },
    { name: 'Britannia Good Day Biscuits', barcode: '8901063000105', category: 'Snacks', salesQty: 180, revenue: 5400.00 },
  ];

  const peakHours = [
    { period: '08:00 AM - 12:00 PM', percentage: 22, color: 'bg-blue-500' },
    { period: '12:00 PM - 04:00 PM', percentage: 38, color: 'bg-indigo-600' },
    { period: '04:00 PM - 08:00 PM', percentage: 76, color: 'bg-emerald-500' },
    { period: '08:00 PM - 10:00 PM', percentage: 44, color: 'bg-amber-500' },
  ];

  return (
    <MainLayout pageTitle="Reports & Analytics">
      <div className="space-y-6">
        {/* Header Control */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Retail Performance & Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time revenue metrics, peak hour footfall, and product velocity.</p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '7d' ? 'Last 7 Days' : t === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Gross Self-Checkout Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹35,040.00</h3>
              <span className="text-xs text-emerald-600 font-bold flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% vs last week
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Avg Order Basket Value</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹142.50</h3>
              <span className="text-xs text-blue-600 font-bold flex items-center mt-1">
                <Zap className="w-3.5 h-3.5 mr-1" /> 4.2 items / cart
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Checkout Speed Avg</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">42 seconds</h3>
              <span className="text-xs text-slate-500 mt-1">Scan to Exit Gate</span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment Success Rate</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">99.4%</h3>
              <span className="text-xs text-emerald-600 font-bold mt-1">Razorpay Verified</span>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Visual Peak Hours & Distribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              Peak Hourly Traffic Distribution
            </h3>
            <div className="space-y-4 pt-2">
              {peakHours.map((item) => (
                <div key={item.period} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.period}</span>
                    <span>{item.percentage}% Load</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className={`${item.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center">
              <Package className="w-5 h-5 text-emerald-600 mr-2" />
              Category Sales Volume Share
            </h3>
            <div className="space-y-4 pt-2">
              {[
                { category: 'Dairy & Eggs', share: 45, color: 'bg-emerald-500' },
                { category: 'Beverages & Soft Drinks', share: 30, color: 'bg-blue-500' },
                { category: 'Snacks & Confectionery', share: 25, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.category}</span>
                    <span>{item.share}% Share</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className={`${item.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Selling Products Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Top Selling Products Velocity</h3>
            <Badge variant="info">INVENTORY TURNOVER</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead className="text-right">Total Revenue Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.barcode} className="hover:bg-slate-50">
                  <TableCell className="font-extrabold text-slate-900">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{p.barcode}</TableCell>
                  <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell className="font-bold text-slate-800">{p.salesQty} units</TableCell>
                  <TableCell className="text-right font-black text-emerald-600">₹{p.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};
