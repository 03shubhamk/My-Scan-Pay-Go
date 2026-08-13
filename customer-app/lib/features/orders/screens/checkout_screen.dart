import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../auth/auth_provider.dart';
import '../../cart/cart_provider.dart';
import '../orders_provider.dart';
import 'order_summary_screen.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final auth = context.watch<AuthProvider>();
    final ordersProvider = context.watch<OrdersProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Checkout & Review',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
      ),
      body: cart.items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_bag_outlined, size: 64, color: AppColors.outline),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Return to Shopping'),
                  )
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Store & Customer Info Header
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.primaryFixedLight,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.storefront, color: AppColors.primary, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Scan. Pay. Go. Express Store',
                                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Self Checkout • Order by ${auth.user?['name'] ?? 'Shopper'}',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Text(
                    'Order Items',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.onSurface),
                  ),
                  const SizedBox(height: 12),

                  // Cart items list
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: cart.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.outlineVariant, width: 0.8),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceContainerLow,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: item.product.imageUrl != null && item.product.imageUrl!.isNotEmpty
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(
                                        item.product.imageUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => const Icon(Icons.inventory_2_outlined, color: AppColors.outline),
                                      ),
                                    )
                                  : const Icon(Icons.inventory_2_outlined, color: AppColors.outline),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '₹${item.product.price.toStringAsFixed(2)} × ${item.quantity}',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '₹${item.subtotal.toStringAsFixed(2)}',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.onSurface),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 24),
                  const Text(
                    'Payment & Price Calculation',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.onSurface),
                  ),
                  const SizedBox(height: 12),

                  // Price Breakdown Card
                  AppCard(
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Items Subtotal', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            Text('₹${cart.subtotalAmount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Estimated GST (5%)', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            Text('₹${cart.estimatedTax.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                        const Divider(height: 24, thickness: 1),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Estimated Order Total', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                Text('Recalculated authoritatively by backend', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                              ],
                            ),
                            Text(
                              '₹${cart.grandTotal.toStringAsFixed(2)}',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Submit Order Button
                  AppButton(
                    text: 'Confirm & Place Order',
                    icon: Icons.check_circle_outline,
                    isLoading: ordersProvider.isLoading,
                    onPressed: ordersProvider.isLoading
                        ? null
                        : () async {
                            final newOrder = await ordersProvider.createOrder(
                              items: cart.items,
                              token: auth.token,
                            );

                            if (newOrder != null && context.mounted) {
                              cart.clearCart();
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => OrderSummaryScreen(order: newOrder),
                                ),
                              );
                            } else if (context.mounted && ordersProvider.errorMessage != null) {
                              _showErrorDialog(context, ordersProvider.errorMessage!);
                            }
                          },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: AppColors.error),
            SizedBox(width: 8),
            Text('Order Failed', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          ],
        ),
        content: Text(message),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
