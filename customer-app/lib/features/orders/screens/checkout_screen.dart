import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/order_model.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../auth/auth_provider.dart';
import '../../cart/cart_provider.dart';
import '../../payment/payment_provider.dart';
import '../../payment/screens/payment_failed_screen.dart';
import '../../payment/screens/payment_processing_screen.dart';
import '../../payment/screens/payment_success_screen.dart';
import '../../payment/screens/razorpay_checkout_sheet.dart';
import '../orders_provider.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  bool _isProcessingCheckout = false;

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final auth = context.watch<AuthProvider>();
    final ordersProvider = context.watch<OrdersProvider>();
    final paymentProvider = context.watch<PaymentProvider>();

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
          'Checkout & Pay',
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
                                        errorBuilder: (_, __, ___) =>
                                            const Icon(Icons.inventory_2_outlined, color: AppColors.outline),
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
                              style: const TextStyle(
                                  fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.onSurface),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 24),
                  const Text(
                    'Payment Summary',
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
                            const Text('Items Subtotal',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            Text('₹${cart.subtotalAmount.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Estimated GST (5%)',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            Text('₹${cart.estimatedTax.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                        const Divider(height: 24, thickness: 1),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Grand Total', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                Text('Recalculated authoritatively by backend',
                                    style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                              ],
                            ),
                            Text(
                              '₹${cart.grandTotal.toStringAsFixed(2)}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Razorpay badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.shield_outlined, color: AppColors.primary, size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Secured by Razorpay • 256-bit SSL Cryptographic Verification',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Pay with Razorpay Button
                  AppButton(
                    text: 'Pay ₹${cart.grandTotal.toStringAsFixed(2)} with Razorpay',
                    icon: Icons.lock_outline,
                    isLoading: _isProcessingCheckout || ordersProvider.isLoading || paymentProvider.isProcessing,
                    onPressed: (_isProcessingCheckout || ordersProvider.isLoading || paymentProvider.isProcessing)
                        ? null
                        : _startPaymentFlow,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Future<void> _startPaymentFlow() async {
    final cart = context.read<CartProvider>();
    final auth = context.read<AuthProvider>();
    final ordersProvider = context.read<OrdersProvider>();
    final paymentProvider = context.read<PaymentProvider>();

    setState(() => _isProcessingCheckout = true);

    try {
      // Step 1: Create Order on Backend
      final newOrder = await ordersProvider.createOrder(
        items: cart.items,
        token: auth.token,
      );

      if (newOrder == null) {
        if (!mounted) return;
        setState(() => _isProcessingCheckout = false);
        if (ordersProvider.errorMessage != null) {
          _showErrorDialog(ordersProvider.errorMessage!);
        }
        return;
      }

      // Step 2: Create Razorpay Order on Backend
      final razorpayOrder = await paymentProvider.initiatePayment(
        orderId: newOrder.id,
        token: auth.token,
      );

      if (!mounted) return;
      setState(() => _isProcessingCheckout = false);

      if (razorpayOrder == null) {
        if (paymentProvider.errorMessage != null) {
          _showErrorDialog(paymentProvider.errorMessage!);
        }
        return;
      }

      // Step 3: Open Razorpay Checkout Sheet
      await RazorpayCheckoutSheet.show(
        context: context,
        orderData: razorpayOrder,
        onSuccess: (paymentId, orderId, signature) async {
          _processVerification(
            order: newOrder,
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            razorpaySignature: signature,
          );
        },
        onFailure: (code, message) {
          if (!mounted) return;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PaymentFailedScreen(
                orderId: newOrder.id,
                amount: newOrder.totalAmount,
                errorMessage: message,
                onRetry: () {
                  Navigator.pop(context);
                  _startPaymentFlow();
                },
              ),
            ),
          );
        },
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessingCheckout = false);
      _showErrorDialog(e.toString());
    }
  }

  Future<void> _processVerification({
    required OrderModel order,
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
  }) async {
    final cart = context.read<CartProvider>();
    final auth = context.read<AuthProvider>();
    final paymentProvider = context.read<PaymentProvider>();

    // Open Processing Screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PaymentProcessingScreen(
          orderId: order.id,
          totalAmount: order.totalAmount,
        ),
      ),
    );

    // Call Backend Cryptographic Verification
    final result = await paymentProvider.handlePaymentSuccess(
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      razorpaySignature: razorpaySignature,
      token: auth.token,
    );

    if (!mounted) return;

    if (result != null) {
      // Clear Cart on verified success
      cart.clearCart();

      // Navigate to Success Screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentSuccessScreen(
            paymentResult: result,
            amount: order.totalAmount,
          ),
        ),
      );
    } else {
      // Navigate to Failed Screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentFailedScreen(
            orderId: order.id,
            amount: order.totalAmount,
            errorMessage: paymentProvider.errorMessage ?? 'Payment signature verification failed.',
            onRetry: () {
              Navigator.pop(context);
              _startPaymentFlow();
            },
          ),
        ),
      );
    }
  }

  void _showErrorDialog(String message) {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.error_outline, color: AppColors.error),
            SizedBox(width: 8),
            Text('Checkout Error', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
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
