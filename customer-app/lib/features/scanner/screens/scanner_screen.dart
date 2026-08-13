import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/services/product_api_service.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../auth/auth_provider.dart';
import '../../cart/cart_provider.dart';
import '../widgets/product_found_sheet.dart';
import '../widgets/product_not_found_sheet.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> with SingleTickerProviderStateMixin {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    facing: CameraFacing.back,
  );

  bool _isTorchOn = false;
  bool _isScanningPaused = false;
  bool _isLoading = false;

  late AnimationController _laserAnimationController;
  late Animation<double> _laserAnimation;

  @override
  void initState() {
    super.initState();
    _laserAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _laserAnimation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _laserAnimationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _laserAnimationController.dispose();
    super.dispose();
  }

  Future<void> _handleBarcodeDetected(String barcode) async {
    if (_isScanningPaused || _isLoading || barcode.trim().isEmpty) return;

    setState(() {
      _isScanningPaused = true;
      _isLoading = true;
    });

    final auth = context.read<AuthProvider>();

    try {
      final product = await ProductApiService.fetchProductByBarcode(
        barcode.trim(),
        token: auth.token,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      _showProductFoundSheet(product);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      if (e.statusCode == 404) {
        _showProductNotFoundSheet(barcode.trim(), 'Barcode not found in retail database.');
      } else {
        _showProductNotFoundSheet(barcode.trim(), e.message);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
      _showProductNotFoundSheet(barcode.trim(), 'Network connection error while fetching product details.');
    }
  }

  void _showProductFoundSheet(ProductModel product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return ProductFoundSheet(
          product: product,
          onConfirmAddToCart: (quantity) {
            final cart = context.read<CartProvider>();
            cart.addToCart(product, quantity: quantity);
            Navigator.pop(context);

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Added ${product.name} (x$quantity) to cart!'),
                backgroundColor: AppColors.primary,
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 2),
              ),
            );

            setState(() {
              _isScanningPaused = false;
            });
          },
        );
      },
    ).then((_) {
      if (mounted) {
        setState(() {
          _isScanningPaused = false;
        });
      }
    });
  }

  void _showProductNotFoundSheet(String barcode, String message) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return ProductNotFoundSheet(
          barcode: barcode,
          message: message,
          onScanAnother: () {
            Navigator.pop(context);
            setState(() {
              _isScanningPaused = false;
            });
          },
        );
      },
    ).then((_) {
      if (mounted) {
        setState(() {
          _isScanningPaused = false;
        });
      }
    });
  }

  void _showManualBarcodeDialog() {
    final controller = TextEditingController(text: '8901030000001');
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Manual Barcode Entry', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Enter or select a seed barcode from database:',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              AppTextField(
                label: 'Barcode Code',
                hint: 'e.g. 8901030000001',
                controller: controller,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: const Text('8901030000001 (Milk)'),
                    onPressed: () => controller.text = '8901030000001',
                  ),
                  ActionChip(
                    label: const Text('8901030000002 (Chips)'),
                    onPressed: () => controller.text = '8901030000002',
                  ),
                  ActionChip(
                    label: const Text('8901030000003 (Coke)'),
                    onPressed: () => controller.text = '8901030000003',
                  ),
                  ActionChip(
                    label: const Text('9999999999999 (Invalid 404)'),
                    onPressed: () => controller.text = '9999999999999',
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final code = controller.text.trim();
                Navigator.pop(context);
                if (code.isNotEmpty) {
                  _handleBarcodeDetected(code);
                }
              },
              child: const Text('Lookup Barcode'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // MobileScanner Camera View
          MobileScanner(
            controller: _scannerController,
            onDetect: (capture) {
              final barcodes = capture.barcodes;
              if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
                _handleBarcodeDetected(barcodes.first.rawValue!);
              }
            },
          ),

          // Dark Overlay with Cutout Window
          ColorFiltered(
            colorFilter: ColorFilter.mode(
              Colors.black.withOpacity(0.6),
              BlendMode.srcOut,
            ),
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    backgroundBlendMode: BlendMode.dstOut,
                  ),
                ),
                Align(
                  alignment: Alignment.center,
                  child: Container(
                    width: 280,
                    height: 280,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Animated Laser Line in Cutout
          Align(
            alignment: Alignment.center,
            child: SizedBox(
              width: 260,
              height: 260,
              child: AnimatedBuilder(
                animation: _laserAnimation,
                builder: (context, child) {
                  return Stack(
                    children: [
                      Positioned(
                        top: 260 * _laserAnimation.value,
                        left: 10,
                        right: 10,
                        child: Container(
                          height: 3,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.8),
                                blurRadius: 8,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),

          // Viewfinder Frame Corner Borders
          Align(
            alignment: Alignment.center,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 3),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),

          // Top Action Header Bar
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const Text(
                  'Barcode Scanner',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _isTorchOn ? Icons.flash_on : Icons.flash_off,
                    color: _isTorchOn ? Colors.yellow : Colors.white,
                  ),
                  onPressed: () {
                    _scannerController.toggleTorch();
                    setState(() {
                      _isTorchOn = !_isTorchOn;
                    });
                  },
                ),
              ],
            ),
          ),

          // Bottom Instruction & Manual Entry Button
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Column(
              children: [
                if (_isLoading) ...[
                  const CircularProgressIndicator(color: Colors.white),
                  const SizedBox(height: 12),
                  const Text(
                    'Querying database for barcode...',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 20),
                ] else ...[
                  const Text(
                    'Position product barcode inside the frame',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                AppButton(
                  text: 'Manual Code Entry / Test Barcodes',
                  onPressed: _showManualBarcodeDialog,
                  variant: AppButtonVariant.outline,
                  height: 48,
                  icon: Icons.keyboard_outlined,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
