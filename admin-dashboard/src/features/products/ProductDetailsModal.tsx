import React from 'react';
import { Product } from '../../services/productService';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { QrCode, Tag, Package, Calendar, Edit3, Trash2 } from 'lucide-react';

export interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!product) return null;

  const isLowStock = product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Specification Details"
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onDelete(product);
            }}
          >
            Delete Item
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            Edit Product
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Top Product Preview Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border border-surface-border rounded-lg">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg border border-surface-border bg-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-slate-200 border border-surface-border flex items-center justify-center text-slate-400">
              <Package className="w-8 h-8" />
            </div>
          )}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{product.category}</Badge>
              {isOutOfStock ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="warning">Low Stock ({product.stock_quantity})</Badge>
              ) : (
                <Badge variant="success">In Stock ({product.stock_quantity})</Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-text-primary">{product.name}</h3>
            <p className="text-xs text-text-secondary">{product.description || 'No product description provided.'}</p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-white border border-surface-border rounded-lg space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Tag className="w-3 h-3 text-primary" /> Selling Price
            </span>
            <p className="text-lg font-bold text-text-primary tnum">₹{product.price.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-white border border-surface-border rounded-lg space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Package className="w-3 h-3 text-emerald-600" /> Stock Quantity
            </span>
            <p className="text-lg font-bold text-text-primary tnum">{product.stock_quantity} units</p>
          </div>

          <div className="p-3 bg-white border border-surface-border rounded-lg space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <QrCode className="w-3 h-3 text-purple-600" /> Barcode Code
            </span>
            <p className="text-sm font-mono font-bold text-primary truncate">{product.barcode}</p>
          </div>
        </div>

        {/* Audit Details */}
        <div className="text-xs text-text-muted pt-2 border-t border-surface-border flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Added: {new Date(product.created_at).toLocaleDateString()}
          </span>
          <span>Reorder Threshold: {product.low_stock_threshold} units</span>
        </div>
      </div>
    </Modal>
  );
};
