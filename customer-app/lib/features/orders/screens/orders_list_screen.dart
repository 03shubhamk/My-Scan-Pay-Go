import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../auth/auth_provider.dart';
import '../orders_provider.dart';
import 'order_details_screen.dart';

class OrdersListScreen extends StatefulWidget {
  const OrdersListScreen({super.key});

  @override
  State<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends State<OrdersListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadOrders();
    });
  }

  void _loadOrders() {
    final auth = context.read<AuthProvider>();
    context.read<OrdersProvider>().fetchUserOrders(token: auth.token);
  }

  @override
  Widget build(BuildContext context) {
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
          'My Past Orders',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.onSurface),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.primary),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _loadOrders(),
        color: AppColors.primary,
        child: _buildContent(ordersProvider),
      ),
    );
  }

  Widget _buildContent(OrdersProvider ordersProvider) {
    // 1. Loading State
    if (ordersProvider.isLoading && ordersProvider.orders.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Loading your order history...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
          ],
        ),
      );
    }

    // 2. Error State
    if (ordersProvider.errorMessage != null && ordersProvider.orders.isEmpty) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Container(
          padding: const EdgeInsets.all(32),
          height: MediaQuery.of(context).size.height * 0.75,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.errorBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              ),
              const SizedBox(height: 20),
              const Text(
                'Unable to Load Orders',
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
                text: 'Try Again',
                icon: Icons.refresh,
                onPressed: _loadOrders,
              ),
            ],
          ),
        ),
      );
    }

    // 3. Empty State
    if (ordersProvider.orders.isEmpty) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Container(
          padding: const EdgeInsets.all(32),
          height: MediaQuery.of(context).size.height * 0.75,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.receipt_long_outlined, size: 56, color: AppColors.outline),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Orders Placed Yet',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.onSurface),
              ),
              const SizedBox(height: 8),
              const Text(
                'Start scanning item barcodes or adding products to cart to place your first self-checkout order!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 24),
              AppButton(
                text: 'Start Shopping',
                icon: Icons.shopping_bag_outlined,
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      );
    }

    // 4. Order List Loaded State
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: ordersProvider.orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final order = ordersProvider.orders[index];
        final itemCount = order.items.fold(0, (sum, i) => sum + i.quantity);

        return AppCard(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => OrderDetailsScreen(orderId: order.id),
              ),
            );
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order.orderNumber,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.onSurface),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: order.status == 'COMPLETED' || order.status == 'EXIT_VERIFIED'
                          ? AppColors.successBg
                          : AppColors.warningBg,
                      borderRadius: BorderRadius.circular(12),
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
              const SizedBox(height: 6),
              Text(
                '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year} at ${order.createdAt.hour}:${order.createdAt.minute.toString().padLeft(2, '0')}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const Divider(height: 20, thickness: 0.8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$itemCount ${itemCount == 1 ? 'item' : 'items'}',
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Text('Payment: ', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          Text(
                            order.paymentStatus,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: order.paymentStatus == 'PAID' ? AppColors.success : AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        '₹${order.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.primary),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.chevron_right, color: AppColors.outline),
                    ],
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
