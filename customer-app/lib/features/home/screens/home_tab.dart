import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/product_card.dart';
import '../../auth/auth_provider.dart';

class HomeTab extends StatelessWidget {
  final Function(int) onNavigateTab;

  const HomeTab({
    super.key,
    required this.onNavigateTab,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final userName = auth.user?['name'] ?? 'Shopper';

    // Sample Featured Supermarket Products
    final sampleProducts = [
      ProductModel(
        id: 'p1',
        name: 'Amul Taaza Milk (500ml)',
        category: 'Dairy',
        barcode: '8901030000001',
        price: 27.0,
        stockQuantity: 150,
      ),
      ProductModel(
        id: 'p2',
        name: "Lay's Classic Salted Chips",
        category: 'Snacks',
        barcode: '8901030000002',
        price: 20.0,
        stockQuantity: 80,
      ),
      ProductModel(
        id: 'p3',
        name: 'Coca-Cola Can (300ml)',
        category: 'Beverages',
        barcode: '8901030000003',
        price: 40.0,
        stockQuantity: 200,
      ),
      ProductModel(
        id: 'p4',
        name: 'Britannia Good Day Biscuits',
        category: 'Bakery',
        barcode: '8901030000004',
        price: 30.0,
        stockQuantity: 95,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Greeting & Avatar Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hello, $userName 👋',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.onSurface,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Ready to shop queue-free today?',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person_outline,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Store Banner Card
              AppCard(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'SELF CHECKOUT READY',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        const Icon(Icons.qr_code_scanner, color: Colors.white, size: 28),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Scan Barcode to Add Items',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'No waiting in counter queues. Tap below to launch scanner.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => onNavigateTab(1),
                      icon: const Icon(Icons.camera_alt, size: 18),
                      label: const Text('Open Barcode Scanner'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        minimumSize: const Size(0, 44),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Quick Action Grid
              const Text(
                'QUICK ACTIONS',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: AppCard(
                      onTap: () => onNavigateTab(1),
                      padding: const EdgeInsets.all(16),
                      child: const Column(
                        children: [
                          Icon(Icons.qr_code_scanner, color: AppColors.primary, size: 32),
                          SizedBox(height: 8),
                          Text(
                            'Scan Item',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppCard(
                      onTap: () => onNavigateTab(2),
                      padding: const EdgeInsets.all(16),
                      child: const Column(
                        children: [
                          Icon(Icons.shopping_cart_outlined, color: AppColors.primary, size: 32),
                          SizedBox(height: 8),
                          Text(
                            'View Cart',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppCard(
                      onTap: () => onNavigateTab(3),
                      padding: const EdgeInsets.all(16),
                      child: const Column(
                        children: [
                          Icon(Icons.verified_outlined, color: AppColors.success, size: 32),
                          SizedBox(height: 8),
                          Text(
                            'Exit QR',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Featured Products Grid Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'FEATURED PRODUCTS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  TextButton(
                    onPressed: () => onNavigateTab(1),
                    child: const Text('See All'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Grid of Product Cards
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.72,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: sampleProducts.length,
                itemBuilder: (context, index) {
                  return ProductCard(
                    product: sampleProducts[index],
                    onAddToCart: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${sampleProducts[index].name} added to cart!'),
                          duration: const Duration(seconds: 2),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
