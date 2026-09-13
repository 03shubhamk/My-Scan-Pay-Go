import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/payment_model.dart';
import '../../../shared/widgets/app_button.dart';

class RazorpayCheckoutSheet extends StatefulWidget {
  final RazorpayOrderData orderData;
  final Function(String paymentId, String orderId, String signature) onSuccess;
  final Function(String code, String message) onFailure;

  const RazorpayCheckoutSheet({
    super.key,
    required this.orderData,
    required this.onSuccess,
    required this.onFailure,
  });

  static Future<void> show({
    required BuildContext context,
    required RazorpayOrderData orderData,
    required Function(String paymentId, String orderId, String signature) onSuccess,
    required Function(String code, String message) onFailure,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => RazorpayCheckoutSheet(
        orderData: orderData,
        onSuccess: onSuccess,
        onFailure: onFailure,
      ),
    );
  }

  @override
  State<RazorpayCheckoutSheet> createState() => _RazorpayCheckoutSheetState();
}

class _RazorpayCheckoutSheetState extends State<RazorpayCheckoutSheet> {
  String _selectedMethod = 'upi';
  bool _isSimulating = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
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
          const SizedBox(height: 16),

          // Razorpay Header & Security Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C2340),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'RAZORPAY',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primaryFixedLight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'TEST MODE',
                      style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppColors.outline),
                onPressed: () {
                  Navigator.pop(context);
                  widget.onFailure('PAYMENT_CANCELLED', 'Payment was cancelled by the customer');
                },
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Amount Row
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Amount to Pay', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    const SizedBox(height: 2),
                    Text(
                      '₹${widget.orderData.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.primary),
                    ),
                  ],
                ),
                Text(
                  'Order: ${widget.orderData.orderId.substring(0, widget.orderData.orderId.length > 8 ? 8 : widget.orderData.orderId.length)}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const Text(
            'Select Payment Method',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.onSurface),
          ),
          const SizedBox(height: 12),

          // Payment Options
          _buildMethodTile('upi', Icons.account_balance_wallet_outlined, 'UPI / QR / GPay', 'Instant payment via any UPI App'),
          const SizedBox(height: 8),
          _buildMethodTile('card', Icons.credit_card, 'Cards (Credit/Debit)', 'Visa, Mastercard, RuPay'),
          const SizedBox(height: 8),
          _buildMethodTile('netbanking', Icons.account_balance, 'Netbanking', 'All Indian banks supported'),

          const SizedBox(height: 24),

          // Pay Button
          AppButton(
            text: _isSimulating ? 'Contacting Gateway...' : 'Pay ₹${widget.orderData.amount.toStringAsFixed(2)}',
            icon: Icons.lock_outline,
            isLoading: _isSimulating,
            onPressed: _isSimulating
                ? null
                : () async {
                    setState(() => _isSimulating = true);

                    // Generate simulated payment result with client payment ID
                    final paymentId = 'pay_${DateTime.now().millisecondsSinceEpoch}_test';
                    final orderId = widget.orderData.razorpayOrderId;

                    // Note: Flutter client sends paymentId and orderId to backend.
                    // For test simulation, we calculate or send signature or trigger backend verification.
                    // In real Razorpay SDK, Razorpay native activity returns razorpay_signature.
                    // For our test simulation, we pass simulated signature or test signature.
                    await Future.delayed(const Duration(milliseconds: 600));

                    if (!mounted) return;
                    Navigator.pop(context);

                    widget.onSuccess(paymentId, orderId, 'test_signature_simulated');
                  },
          ),
          const SizedBox(height: 10),

          // Simulate Failure Option for Testing & Demo
          Center(
            child: TextButton(
              onPressed: () {
                Navigator.pop(context);
                widget.onFailure('PAYMENT_DECLINED', 'Simulated: Card was declined by issuer');
              },
              child: const Text(
                'Simulate Payment Failure (For Testing)',
                style: TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMethodTile(String id, IconData icon, String title, String subtitle) {
    final isSelected = _selectedMethod == id;
    return InkWell(
      onTap: () => setState(() => _selectedMethod = id),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryFixedLight.withOpacity(0.4) : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.outlineVariant,
            width: isSelected ? 1.5 : 0.8,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: isSelected ? AppColors.primary : AppColors.onSurface,
                    ),
                  ),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}
