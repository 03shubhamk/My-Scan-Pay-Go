import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class BarcodeScannerScreen extends StatelessWidget {
  const BarcodeScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Scan Product Barcode', style: TextStyle(color: Colors.white)),
      ),
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Center(
                child: Text(
                  'Camera Viewfinder\nPoint at Barcode',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: ElevatedButton.icon(
              onPressed: () {
                // Stub manual barcode trigger
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Barcode scanner active')),
                );
              },
              icon: const Icon(Icons.keyboard),
              label: const Text('Enter Barcode Manually'),
            ),
          ),
        ],
      ),
    );
  }
}
