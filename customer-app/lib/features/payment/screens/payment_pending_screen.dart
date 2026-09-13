import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../orders/screens/order_details_screen.dart';

class PaymentPendingScreen extends StatelessWidget {
  final String orderId;
  final double amount;
  final VoidCallback onCheckStatus;

  const PaymentPendingScreen({
    super.key,
    required this.orderId,
    required this.amount,
    required this.onCheckStatus,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Payment Status',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Amber Pending Circle Banner
            Container(
              width: 76,
              height: 76,
              decoration: const BoxDecoration(
                color: AppColors.warningBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.hourglass_top_rounded, color: AppColors.warning, size: 44),
            ),

            const SizedBox(height: 18),

            const Text(
              'Payment Pending',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: AppColors.onSurface,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Awaiting confirmation from your bank or payment provider',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Pending Details Card
            AppCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Order Reference', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        'ORD-${orderId.substring(0, orderId.length > 8 ? 8 : orderId.length).toUpperCase()}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Pending Amount', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        '₹${amount.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Current Status', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.warningBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'AWAITING CONFIRMATION',
                          style: TextStyle(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Store Assistant Alert
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.outlineVariant, width: 0.8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.support_agent_outlined, color: AppColors.primary, size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'If the amount was deducted from your bank, the status will update within 2 minutes. You can also show this order to the store assistant.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Action Buttons
            AppButton(
              text: 'Check Payment Status',
              icon: Icons.sync,
              onPressed: onCheckStatus,
            ),
            const SizedBox(height: 12),
            AppButton(
              text: 'View Order Details',
              variant: AppButtonVariant.outline,
              icon: Icons.receipt_long,
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => OrderDetailsScreen(orderId: orderId),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            AppButton(
              text: 'Back to Home',
              variant: AppButtonVariant.ghost,
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
