import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum AppButtonVariant { primary, secondary, outline, text }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final IconData? icon;
  final double height;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.height = 54.0,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return SizedBox(
        height: height,
        width: double.infinity,
        child: Center(
          child: CircularProgressIndicator(
            color: variant == AppButtonVariant.primary ? AppColors.primary : AppColors.onSurface,
            strokeWidth: 2.5,
          ),
        ),
      );
    }

    switch (variant) {
      case AppButtonVariant.secondary:
        return SizedBox(
          height: height,
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.surfaceContainer,
              foregroundColor: AppColors.onSurface,
              elevation: 0,
            ),
            child: _buildChild(),
          ),
        );
      case AppButtonVariant.outline:
        return SizedBox(
          height: height,
          width: double.infinity,
          child: OutlinedButton(
            onPressed: onPressed,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: _buildChild(),
          ),
        );
      case AppButtonVariant.text:
        return TextButton(
          onPressed: onPressed,
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
          ),
          child: Text(text),
        );
      case AppButtonVariant.primary:
        return SizedBox(
          height: height,
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onPressed,
            child: _buildChild(),
          ),
        );
    }
  }

  Widget _buildChild() {
    if (icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 8),
          Text(text),
        ],
      );
    }
    return Text(text);
  }
}
