import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';

class ProductNotFoundSheet extends StatelessWidget {
  final String barcode;
  final String message;
  final VoidCallback onScanAnother;

  const ProductNotFoundSheet({
    super.key,
    required this.barcode,
    required this.message,
    required this.onScanAnother,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
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
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.errorBg,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.qr_code_2, size: 48, color: AppColors.error),
          ),
          const SizedBox(height: 20),

          const Text(
            'Product Not Recognized',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),

          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.outlineVariant),
            ),
            child: Text(
              'Scanned Code: $barcode',
              style: const TextStyle(
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w600,
                color: AppColors.onSurface,
              ),
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            text: 'Scan Another Item',
            onPressed: onScanAnother,
            icon: Icons.qr_code_scanner,
          ),
        ],
      ),
    );
  }
}
