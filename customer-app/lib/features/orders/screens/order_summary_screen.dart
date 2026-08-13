import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/order_model.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import 'order_details_screen.dart';

class OrderSummaryScreen extends StatelessWidget {
  final OrderModel order;

  const OrderSummaryScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Order Summary',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Success Icon Banner
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: AppColors.successBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 52),
            ),
            const SizedBox(height: 16),
            const Text(
              'Order Placed Successfully!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.onSurface),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'Order ${order.orderNumber}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary),
            ),
            const SizedBox(height: 24),

            // Order Status Badges & Total Card
            AppCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Order Status', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.warningBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          order.status,
                          style: const TextStyle(color: AppColors.warning, fontSize: 11, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Payment Status', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: order.paymentStatus == 'PAID' ? AppColors.successBg : AppColors.warningBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          order.paymentStatus,
                          style: TextStyle(
                            color: order.paymentStatus == 'PAID' ? AppColors.success : AppColors.warning,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24, thickness: 1),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount Paid / Due', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      Text(
                        '₹${order.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Purchased Items',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.onSurface),
              ),
            ),
            const SizedBox(height: 12),

            // Items breakdown
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: order.items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = order.items[index];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.outlineVariant, width: 0.8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.productName,
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '₹${item.priceAtPurchase.toStringAsFixed(2)} × ${item.quantity}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '₹${item.subtotal.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 36),

            // Navigation Action Buttons
            AppButton(
              text: 'View Full Order Details',
              icon: Icons.receipt_long,
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => OrderDetailsScreen(orderId: order.id),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            AppButton(
              text: 'Back to Home',
              variant: AppButtonVariant.outline,
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              },
            ),
          ],
        ),
      ),
    );
  }
}
