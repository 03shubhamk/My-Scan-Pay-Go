class ProductModel {
  final String id;
  final String barcode;
  final String name;
  final String? description;
  final double price;
  final double? discountedPrice;
  final String? imageUrl;
  final int stockQuantity;
  final String unit;

  ProductModel({
    required this.id,
    required this.barcode,
    required this.name,
    this.description,
    required this.price,
    this.discountedPrice,
    this.imageUrl,
    required this.stockQuantity,
    required this.unit,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      barcode: json['barcode'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      discountedPrice: json['discounted_price'] != null
          ? (json['discounted_price'] as num).toDouble()
          : null,
      imageUrl: json['image_url'] as String?,
      stockQuantity: json['stock_quantity'] as int? ?? 0,
      unit: json['unit'] as String? ?? 'pcs',
    );
  }

  double get effectivePrice => discountedPrice ?? price;
}
