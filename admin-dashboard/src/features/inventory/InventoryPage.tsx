import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit3,
  Check,
  X,
  Package,
} from 'lucide-react';
import { MainLayout } from '../../components/MainLayout';
import { inventoryService, InventoryItem, InventoryStats } from '../../services/inventoryService';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [customQuantity, setCustomQuantity] = useState<number>(0);
  const [customThreshold, setCustomThreshold] = useState<number>(10);
  const [modalMode, setModalMode] = useState<'RESTOCK' | 'ADJUST'>('RESTOCK');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const [inventoryData, statsData] = await Promise.all([
        inventoryService.getInventory({
          search: search || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          status: selectedStatus,
        }),
        inventoryService.getInventoryStats(),
      ]);

      setItems(inventoryData.items);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      showToast('Failed to load inventory from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenRestockModal = (item: InventoryItem, mode: 'RESTOCK' | 'ADJUST' = 'RESTOCK') => {
    setActiveItem(item);
    setModalMode(mode);
    setRestockAmount(10);
    setCustomQuantity(item.quantity);
    setCustomThreshold(item.low_stock_threshold);
    setIsModalOpen(true);
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    try {
      setIsSubmitting(true);
      if (modalMode === 'RESTOCK') {
        const updated = await inventoryService.restockProduct(activeItem.product_id, restockAmount);
        showToast(`Successfully added ${restockAmount} units to ${updated.product_name}`);
      } else {
        const updated = await inventoryService.updateStock(activeItem.product_id, {
          quantity: customQuantity,
          lowStockThreshold: customThreshold,
        });
        showToast(`Updated stock & threshold for ${updated.product_name}`);
      }

      setIsModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update inventory';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Personal Care', 'Confectionery'];

  return (
    <MainLayout pageTitle="Inventory Management">
      <div className="space-y-6 max-w-7xl w-full mx-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-primary" />
              Inventory & Stock Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time store stock monitoring, automated low-stock warnings, and transaction-safe restock controls.
            </p>
          </div>
          <button
            onClick={fetchInventory}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </button>
        </div>

        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total SKUs */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</p>
              <div className="p-2 rounded bg-blue-50 text-blue-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalProducts ?? '—'}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats?.totalUnitsInStock.toLocaleString() ?? 0} total units in catalog
            </p>
          </div>

          {/* Card 2: In Stock */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Stock</p>
              <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{stats?.inStockCount ?? '—'}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Healthy inventory level</p>
          </div>

          {/* Card 3: Low Stock Warning */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Warning</p>
              <div className="p-2 rounded bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2">{stats?.lowStockCount ?? '—'}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Below safety threshold</p>
          </div>

          {/* Card 4: Out of Stock Alert */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <div className="p-2 rounded bg-rose-50 text-rose-600">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-700 mt-2">{stats?.outOfStockCount ?? '—'}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">Requires immediate restocking</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name or barcode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Tab Pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Items', count: stats?.totalProducts },
              { id: 'IN_STOCK', label: 'In Stock', count: stats?.inStockCount },
              { id: 'LOW_STOCK', label: 'Low Stock', count: stats?.lowStockCount },
              { id: 'OUT_OF_STOCK', label: 'Out of Stock', count: stats?.outOfStockCount },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      <p>Loading inventory records...</p>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No inventory records found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search query or filters.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const maxCapacity = Math.max(item.low_stock_threshold * 3, item.quantity, 100);
                    const fillPercent = Math.min(100, Math.round((item.quantity / maxCapacity) * 100));

                    return (
                      <tr key={item.product_id} className="hover:bg-slate-50/75 transition-colors group">
                        {/* Product Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.product_image_url ? (
                                <img
                                  src={item.product_image_url}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[220px]">{item.product_name}</p>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.product_barcode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                            {item.product_category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900 font-mono">
                          ₹{item.product_price.toFixed(2)}
                        </td>

                        {/* Stock Level Bar & Count */}
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span
                                className={`font-bold font-mono ${
                                  item.quantity === 0
                                    ? 'text-rose-600'
                                    : item.quantity <= item.low_stock_threshold
                                    ? 'text-amber-600'
                                    : 'text-slate-900'
                                }`}
                              >
                                {item.quantity} units
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.quantity === 0
                                    ? 'bg-rose-500'
                                    : item.quantity <= item.low_stock_threshold
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${item.quantity === 0 ? 0 : Math.max(fillPercent, 8)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Low Stock Threshold */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {item.low_stock_threshold} units
                        </td>

                        {/* Status Pill Badge */}
                        <td className="py-3.5 px-4">
                          {item.stock_status === 'IN_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              In Stock
                            </span>
                          )}
                          {item.stock_status === 'LOW_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          )}
                          {item.stock_status === 'OUT_OF_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenRestockModal(item, 'RESTOCK')}
                              title="Quick Restock"
                              className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                            >
                              + Restock
                            </button>
                            <button
                              onClick={() => handleOpenRestockModal(item, 'ADJUST')}
                              title="Adjust Stock or Threshold"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restock & Adjustment Modal */}
      {isModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {modalMode === 'RESTOCK' ? 'Restock Product' : 'Adjust Inventory & Threshold'}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[260px]">{activeItem.product_name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Mode Selector */}
            <div className="px-4 pt-3 flex gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setModalMode('RESTOCK')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                  modalMode === 'RESTOCK'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                + Quick Restock
              </button>
              <button
                type="button"
                onClick={() => setModalMode('ADJUST')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                  modalMode === 'ADJUST'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                ⚙️ Direct Set & Threshold
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveInventory} className="p-4 space-y-4">
              {/* Product summary pill */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">Current Stock:</span>{' '}
                  <span className="font-bold text-slate-900 font-mono">{activeItem.quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-500">Barcode:</span>{' '}
                  <span className="font-mono text-slate-600">{activeItem.product_barcode}</span>
                </div>
              </div>

              {modalMode === 'RESTOCK' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Add Units to Stock</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRestockAmount(amt)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          restockAmount === amt
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Custom Add Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 flex justify-between items-center">
                    <span>New Stock after Restock:</span>
                    <span className="font-bold font-mono text-xs">{activeItem.quantity + restockAmount} units</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Set Exact Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Warning Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={customThreshold}
                      onChange={(e) => setCustomThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      System will trigger "Low Stock" status when quantity is equal or below this number.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Inventory Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
