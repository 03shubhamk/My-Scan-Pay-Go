import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';

class PaymentFailedScreen extends StatelessWidget {
  final String orderId;
  final double amount;
  final String errorMessage;
  final VoidCallback onRetry;

  const PaymentFailedScreen({
    super.key,
    required this.orderId,
    required this.amount,
    required this.errorMessage,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
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
          'Payment Status',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Red Error Circle Banner
            Container(
              width: 76,
              height: 76,
              decoration: const BoxDecoration(
                color: AppColors.errorBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 48),
            ),

            const SizedBox(height: 18),

            const Text(
              'Payment Unsuccessful',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: AppColors.onSurface,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Your transaction could not be verified by the payment gateway',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Error Detail Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.info_outline, size: 18, color: AppColors.error),
                      const SizedBox(width: 8),
                      const Text(
                        'Reason for Failure',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.error),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.errorBg.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      errorMessage.isNotEmpty ? errorMessage : 'Transaction timed out or signature was declined.',
                      style: const TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1, thickness: 0.8),
                  const SizedBox(height: 16),
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
                      const Text('Attempted Amount', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        '₹${amount.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Helpful Tips Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.outlineVariant, width: 0.8),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Troubleshooting Suggestions',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.onSurface),
                  ),
                  SizedBox(height: 8),
                  Text('• Check your UPI app notifications and approve within time limit', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  SizedBox(height: 4),
                  Text('• Ensure sufficient account balance or try another debit/credit card', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  SizedBox(height: 4),
                  Text('• If amount was deducted, it will be automatically refunded in 24-48 hours', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Action Buttons
            AppButton(
              text: 'Retry Payment',
              icon: Icons.refresh_rounded,
              onPressed: onRetry,
            ),
            const SizedBox(height: 12),
            AppButton(
              text: 'Back to Cart',
              variant: AppButtonVariant.outline,
              icon: Icons.shopping_cart_outlined,
              onPressed: () {
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
