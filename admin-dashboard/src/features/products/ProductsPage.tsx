import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProductDetailsModal } from './ProductDetailsModal';
import { productService, Product } from '../../services/productService';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Package,
  QrCode,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Dairy',
  'Snacks',
  'Beverages',
  'Personal Care',
  'Bakery',
  'Confectionery',
  'Groceries',
  'Household',
];

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as any)?.successMessage || null
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts({
        search: search.trim() || undefined,
        category: category !== 'All Categories' ? category : undefined,
        page,
        limit,
      });

      setProducts(data.products || []);
      setTotalProducts(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setSuccessMessage(`Product '${productToDelete.name}' deleted successfully.`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      cell: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-10 h-10 object-cover rounded border border-surface-border bg-slate-50 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-slate-100 border border-surface-border flex items-center justify-center text-slate-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedProduct(item); setIsDetailsOpen(true); }}>
              {item.name}
            </p>
            <p className="text-xs text-text-muted truncate max-w-xs">{item.description || 'No description'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (item) => <Badge variant="neutral">{item.category}</Badge>,
    },
    {
      header: 'Barcode',
      cell: (item) => (
        <span className="font-mono text-xs font-semibold text-primary flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5 text-slate-400" />
          {item.barcode}
        </span>
      ),
    },
    {
      header: 'Price (₹)',
      cell: (item) => <span className="font-semibold text-text-primary tnum">₹{item.price.toFixed(2)}</span>,
    },
    {
      header: 'Stock Status',
      cell: (item) => {
        const qty = item.stock_quantity;
        const threshold = item.low_stock_threshold || 10;
        if (qty <= 0) return <Badge variant="danger">Out of Stock</Badge>;
        if (qty <= threshold) return <Badge variant="warning">Low Stock ({qty})</Badge>;
        return <Badge variant="success">In Stock ({qty})</Badge>;
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            title="View Details"
            onClick={() => { setSelectedProduct(item); setIsDetailsOpen(true); }}
            className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            title="Edit Product"
            onClick={() => navigate(`/products/edit/${item.id}`)}
            className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            title="Delete Product"
            onClick={() => setProductToDelete(item)}
            className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout pageTitle="Products & Inventory Catalog">
      <div className="space-y-6">
        {/* Top Header Banner & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Supermarket Inventory Management</h2>
            <p className="text-xs text-text-secondary">
              Manage product codes, live barcode inventory, and stock thresholds.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/products/new')}
          >
            Add New Product
          </Button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-xs text-emerald-700 underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls & Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
              {/* Search Bar */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search name, barcode, description..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  className="h-9 text-xs"
                />
              </div>

              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5" /> Filter Category:
                </div>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="bg-white border border-surface-border text-text-primary text-xs rounded h-9 px-3 font-medium transition-colors focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {error ? (
              <div className="p-6">
                <ErrorState message={error} onRetry={fetchProducts} />
              </div>
            ) : (
              <Table
                data={products}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id}
                emptyTitle="No Products Found"
                emptyDescription="No items match your search or filter parameters. Try clearing filters or add a new product."
                className="border-none rounded-none shadow-none"
              />
            )}
          </CardBody>

          {/* Pagination Footer */}
          {!error && !isLoading && totalProducts > 0 && (
            <div className="px-6 py-4 border-t border-surface-border bg-slate-50/50 flex items-center justify-between text-xs text-text-secondary">
              <div>
                Showing <span className="font-semibold text-text-primary tnum">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold text-text-primary tnum">{Math.min(page * limit, totalProducts)}</span> of{' '}
                <span className="font-semibold text-text-primary tnum">{totalProducts}</span> products
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="px-2 font-medium">
                  Page <span className="font-bold text-text-primary tnum">{page}</span> of{' '}
                  <span className="font-bold text-text-primary tnum">{totalPages}</span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={(prod) => navigate(`/products/edit/${prod.id}`)}
        onDelete={(prod) => setProductToDelete(prod)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Product Deletion"
        maxWidth="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProductToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isDeleting}>
              Delete Product
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-text-primary">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <p className="text-xs font-semibold">Warning: This action cannot be undone.</p>
          </div>
          <p>
            Are you sure you want to delete <span className="font-bold text-text-primary">{productToDelete?.name}</span>?
          </p>
          <p className="text-xs text-text-muted">Barcode: <span className="font-mono text-primary">{productToDelete?.barcode}</span></p>
        </div>
      </Modal>
    </MainLayout>
  );
};
