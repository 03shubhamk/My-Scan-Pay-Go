import 'product_model.dart';

class CartItemModel {
  final ProductModel product;
  int quantity;

  CartItemModel({
    required this.product,
    this.quantity = 1,
  });

  double get subtotal => product.effectivePrice * quantity;

  CartItemModel copyWith({
    ProductModel? product,
    int? quantity,
  }) {
    return CartItemModel(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': product.id,
      'quantity': quantity,
      'price': product.effectivePrice,
      'subtotal': subtotal,
    };
  }
}
