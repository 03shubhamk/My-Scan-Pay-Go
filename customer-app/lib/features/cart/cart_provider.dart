import 'package:flutter/material.dart';
import '../../shared/models/product_model.dart';

class CartItemModel {
  final ProductModel product;
  int quantity;

  CartItemModel({
    required this.product,
    this.quantity = 1,
  });

  double get subtotal => product.price * quantity;
}

class CartProvider extends ChangeNotifier {
  final List<CartItemModel> _items = [];

  List<CartItemModel> get items => List.unmodifiable(_items);

  int get totalItemCount {
    return _items.fold(0, (sum, item) => sum + item.quantity);
  }

  double get subtotalAmount {
    return _items.fold(0.0, (sum, item) => sum + item.subtotal);
  }

  // Estimated GST (5%) for preview display only
  double get estimatedTax {
    return subtotalAmount * 0.05;
  }

  // Grand Total for preview display only (backend recalculates from DB)
  double get grandTotal {
    return subtotalAmount + estimatedTax;
  }

  // Returns null on success, or a warning message if stock limit reached
  String? addToCart(ProductModel product, {int quantity = 1}) {
    if (product.stockQuantity <= 0) {
      return 'Sorry, ${product.name} is currently out of stock.';
    }

    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      final currentQty = _items[existingIndex].quantity;
      if (currentQty + quantity > product.stockQuantity) {
        _items[existingIndex].quantity = product.stockQuantity;
        notifyListeners();
        return 'Max available stock (${product.stockQuantity} units) reached for ${product.name}.';
      } else {
        _items[existingIndex].quantity += quantity;
      }
    } else {
      final initialQty = quantity > product.stockQuantity ? product.stockQuantity : quantity;
      _items.add(CartItemModel(product: product, quantity: initialQty));
      if (quantity > product.stockQuantity) {
        notifyListeners();
        return 'Added $initialQty units (max available stock) of ${product.name}.';
      }
    }

    notifyListeners();
    return null;
  }

  String? increaseQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      final item = _items[index];
      if (item.quantity + 1 > item.product.stockQuantity) {
        return 'Cannot add more. Max stock is ${item.product.stockQuantity} units.';
      }
      item.quantity += 1;
      notifyListeners();
    }
    return null;
  }

  void decreaseQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      _items[index].quantity -= 1;
      if (_items[index].quantity <= 0) {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  void removeFromCart(String productId) {
    _items.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
