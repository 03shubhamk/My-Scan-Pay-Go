import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/widgets/app_button.dart';

class ProductFoundSheet extends StatefulWidget {
  final ProductModel product;
  final Function(int quantity) onConfirmAddToCart;

  const ProductFoundSheet({
    super.key,
    required this.product,
    required this.onConfirmAddToCart,
  });

  @override
  State<ProductFoundSheet> createState() => _ProductFoundSheetState();
}

class _ProductFoundSheetState extends State<ProductFoundSheet> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final isOutOfStock = widget.product.stockQuantity <= 0;

    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.outlineVariant,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header Badge Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  widget.product.category.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isOutOfStock ? AppColors.errorBg : AppColors.successBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK (${widget.product.stockQuantity})',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isOutOfStock ? AppColors.error : AppColors.success,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Product Image & Title Row
          Row(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.outlineVariant),
                ),
                child: widget.product.imageUrl != null && widget.product.imageUrl!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(
                          widget.product.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Icon(Icons.shopping_bag_outlined, color: AppColors.outline, size: 32),
                        ),
                      )
                    : const Icon(Icons.shopping_bag_outlined, color: AppColors.outline, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.product.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.onSurface,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Barcode: ${widget.product.barcode}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (widget.product.description != null && widget.product.description!.isNotEmpty) ...[
            Text(
              widget.product.description!,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 16),
          ],

          const Divider(color: AppColors.outlineVariant),
          const SizedBox(height: 16),

          // Price & Quantity Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'UNIT PRICE',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '₹${widget.product.price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),

              // Quantity Selector
              if (!isOutOfStock)
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.outlineVariant),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove, size: 18),
                        onPressed: _quantity > 1
                            ? () {
                                setState(() {
                                  _quantity--;
                                });
                              }
                            : null,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          '$_quantity',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.onSurface,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add, size: 18),
                        onPressed: _quantity < widget.product.stockQuantity
                            ? () {
                                setState(() {
                                  _quantity++;
                                });
                              }
                            : null,
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 24),

          // Confirm Add to Cart Button
          AppButton(
            text: isOutOfStock
                ? 'Product Out of Stock'
                : 'Add to Cart — ₹${(widget.product.price * _quantity).toStringAsFixed(2)}',
            onPressed: isOutOfStock ? null : () => widget.onConfirmAddToCart(_quantity),
            icon: Icons.add_shopping_cart,
          ),
        ],
      ),
    );
  }
}
