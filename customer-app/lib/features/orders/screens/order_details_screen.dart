import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../auth/auth_provider.dart';
import '../orders_provider.dart';
import 'digital_receipt_screen.dart';
import 'exit_qr_screen.dart';

class OrderDetailsScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDetails();
    });
  }

  void _loadDetails() {
    final auth = context.read<AuthProvider>();
    context.read<OrdersProvider>().fetchOrderDetails(
          orderId: widget.orderId,
          token: auth.token,
        );
  }

  @override
  Widget build(BuildContext context) {
    final ordersProvider = context.watch<OrdersProvider>();
    final order = ordersProvider.selectedOrder;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          order != null ? order.orderNumber : 'Order Details',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.primary),
            onPressed: _loadDetails,
          ),
        ],
      ),
      body: _buildBody(ordersProvider),
    );
  }

  Widget _buildBody(OrdersProvider ordersProvider) {
    if (ordersProvider.isLoading && ordersProvider.selectedOrder?.id != widget.orderId) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Fetching order details...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
          ],
        ),
      );
    }

    if (ordersProvider.errorMessage != null && (ordersProvider.selectedOrder == null || ordersProvider.selectedOrder?.id != widget.orderId)) {
      return Container(
        padding: const EdgeInsets.all(32),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 56, color: AppColors.error),
            const SizedBox(height: 16),
            const Text(
              'Order Not Found',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.onSurface),
            ),
            const SizedBox(height: 8),
            Text(
              ordersProvider.errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 24),
            AppButton(
              text: 'Retry',
              icon: Icons.refresh,
              onPressed: _loadDetails,
            ),
          ],
        ),
      );
    }

    final order = ordersProvider.selectedOrder;
    if (order == null) return const SizedBox.shrink();

    final formattedDate =
        '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year} at ${order.createdAt.hour}:${order.createdAt.minute.toString().padLeft(2, '0')}';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Header Summary Card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.orderNumber,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.onSurface),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          formattedDate,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                    Text(
                      '₹${order.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: AppColors.primary),
                    ),
                  ],
                ),
                const Divider(height: 24, thickness: 1),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Order Status', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: order.status == 'COMPLETED' || order.status == 'EXIT_VERIFIED'
                                  ? AppColors.successBg
                                  : AppColors.warningBg,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              order.status,
                              style: TextStyle(
                                color: order.status == 'COMPLETED' || order.status == 'EXIT_VERIFIED'
                                    ? AppColors.success
                                    : AppColors.warning,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Payment Status', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: order.paymentStatus == 'PAID' ? AppColors.successBg : AppColors.warningBg,
                              borderRadius: BorderRadius.circular(8),
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
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Exit Verification Information
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primaryFixedLight),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryFixedLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.qr_code_2_outlined, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Store Exit Verification Gate',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.onSurface),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Scan your digital receipt QR code at the exit turnstile upon checkout completion.',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text(
            'Itemized Products',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.onSurface),
          ),
          const SizedBox(height: 12),

          // Itemized list
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: order.items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = order.items[index];
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
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
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
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.onSurface),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Final Total Breakdown Card
          AppCard(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Amount', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    Text(
                      '₹${order.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.primary),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Digital Receipt and Exit Actions
          AppButton(
            text: 'View Full Digital Invoice',
            icon: Icons.receipt_long_outlined,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => DigitalReceiptScreen(
                    order: order,
                    exitQrToken: 'SPG-EXIT-${order.id.substring(0, order.id.length > 8 ? 8 : order.id.length).toUpperCase()}',
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          AppButton(
            text: 'Display Exit Turnstile QR',
            variant: AppButtonVariant.outline,
            icon: Icons.qr_code_2_rounded,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ExitQrScreen(
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    exitToken: 'SPG-EXIT-${order.id.substring(0, order.id.length > 8 ? 8 : order.id.length).toUpperCase()}',
                    itemCount: order.items.fold(0, (sum, item) => sum + item.quantity),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
