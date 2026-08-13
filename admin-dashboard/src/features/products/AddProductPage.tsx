import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/MainLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BarcodeScannerInput } from './BarcodeScannerInput';
import { productService } from '../../services/productService';
import { ArrowLeft, Save, AlertCircle, Package } from 'lucide-react';

const CATEGORIES = [
  'Dairy',
  'Snacks',
  'Beverages',
  'Personal Care',
  'Bakery',
  'Confectionery',
  'Groceries',
  'Household',
];

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockQuantity, 10);
    const parsedThreshold = parseInt(lowStockThreshold, 10) || 10;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid non-negative selling price.');
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setError('Please enter a valid non-negative stock quantity.');
      return;
    }

    if (!barcode.trim()) {
      setError('Product barcode is required.');
      return;
    }

    setIsLoading(true);

    try {
      await productService.createProduct({
        name,
        description,
        barcode: barcode.trim(),
        category,
        price: parsedPrice,
        stockQuantity: parsedStock,
        lowStockThreshold: parsedThreshold,
        imageUrl: imageUrl.trim() || undefined,
      });

      navigate('/products', { state: { successMessage: `Product '${name}' created successfully!` } });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create product. Check barcode or network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout pageTitle="Add New Supermarket Product">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/products')}
          >
            Back to Products Catalog
          </Button>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Admin Catalog Creator
          </span>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-3 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Add Product Form Card */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-primary rounded-md">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Product Details & Stock Setup</h2>
                  <p className="text-xs text-text-muted">Assign barcode, set price and initial inventory stock level.</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-5">
              {/* Product Name */}
              <Input
                label="Product Name *"
                placeholder="e.g. Amul Taaza Toned Milk (500ml)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Category & Barcode Scanner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Product Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-surface-border text-text-primary text-sm rounded h-10 px-3 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <BarcodeScannerInput
                  value={barcode}
                  onChange={setBarcode}
                  required
                />
              </div>

              {/* Price & Stock Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Selling Price (₹) *"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <Input
                  label="Initial Stock Quantity *"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />

                <Input
                  label="Low Stock Threshold"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  helperText="Triggers low-stock alert"
                />
              </div>

              {/* Image URL */}
              <Input
                label="Image URL"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                helperText="Public image link for Customer app & checkout view"
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter details, net weight, or ingredients..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-surface-border text-text-primary text-sm rounded p-3 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardBody>

            <CardFooter className="justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isLoading}
              >
                Save Product & Barcode
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};
