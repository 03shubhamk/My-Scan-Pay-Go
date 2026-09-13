import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/payment_model.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../orders/screens/digital_receipt_screen.dart';
import '../../orders/screens/order_details_screen.dart';

class PaymentSuccessScreen extends StatelessWidget {
  final PaymentResult paymentResult;
  final double amount;

  const PaymentSuccessScreen({
    super.key,
    required this.paymentResult,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.now());
    final orderNumber = paymentResult.order?.orderNumber ??
        'ORD-${paymentResult.orderId.substring(0, paymentResult.orderId.length > 8 ? 8 : paymentResult.orderId.length).toUpperCase()}';

    return WillPopScope(
      onWillPop: () async {
        Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        return false;
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.surface,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: const Text(
            'Payment Receipt',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.close, color: AppColors.onSurface),
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              },
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 12),

              // Success Circle Icon
              Container(
                width: 76,
                height: 76,
                decoration: const BoxDecoration(
                  color: AppColors.successBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
              ),

              const SizedBox(height: 16),

              const Text(
                'Payment Successful!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.onSurface,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Your self-checkout payment was verified by backend',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 24),

              // Transaction Summary Card
              AppCard(
                child: Column(
                  children: [
                    const Text(
                      'TOTAL PAID',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '₹${amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1, thickness: 0.8),
                    const SizedBox(height: 16),

                    _buildReceiptRow('Order Number', orderNumber),
                    const SizedBox(height: 10),
                    _buildReceiptRow('Payment ID', paymentResult.razorpayPaymentId),
                    const SizedBox(height: 10),
                    _buildReceiptRow('Payment Method', 'Razorpay Secure'),
                    const SizedBox(height: 10),
                    _buildReceiptRow('Date & Time', formattedDate),
                    const SizedBox(height: 10),
                    _buildReceiptRow('Payment Status', 'VERIFIED & PAID', isSuccess: true),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Exit QR Token Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.primaryFixedLight.withOpacity(0.35),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.qr_code_2, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Exit Gate Pass Ready',
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Scan this QR code at store exit turnstile',
                                style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // QR Code View
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.outlineVariant, width: 0.8),
                      ),
                      child: QrImageView(
                        data: paymentResult.exitQrToken,
                        version: QrVersions.auto,
                        size: 160,
                        backgroundColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Token: ${paymentResult.exitQrToken.length > 24 ? "${paymentResult.exitQrToken.substring(0, 24)}..." : paymentResult.exitQrToken}',
                      style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Navigation Action Buttons
              AppButton(
                text: 'View Digital Receipt',
                icon: Icons.receipt_long_outlined,
                onPressed: () {
                  if (paymentResult.order != null) {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DigitalReceiptScreen(
                          order: paymentResult.order!,
                          exitQrToken: paymentResult.exitQrToken,
                        ),
                      ),
                    );
                  } else {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => OrderDetailsScreen(orderId: paymentResult.orderId),
                      ),
                    );
                  }
                },
              ),
              const SizedBox(height: 12),
              AppButton(
                text: 'Continue Shopping',
                variant: AppButtonVariant.outline,
                icon: Icons.shopping_bag_outlined,
                onPressed: () {
                  Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isSuccess = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: isSuccess ? AppColors.success : AppColors.onSurface,
          ),
        ),
      ],
    );
  }
}
