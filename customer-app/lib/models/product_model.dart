class ProductModel {
  final String id;
  final String barcode;
  final String name;
  final String? description;
  final double price;
  final double? discountedPrice;
  final String? imageUrl;
  final int stockQuantity;
  final int lowStockThreshold;
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
    this.lowStockThreshold = 10,
    required this.unit,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: (json['id'] ?? '') as String,
      barcode: (json['barcode'] ?? '') as String,
      name: (json['name'] ?? 'Unknown Product') as String,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discountedPrice: json['discounted_price'] != null
          ? (json['discounted_price'] as num).toDouble()
          : null,
      imageUrl: json['image_url'] as String?,
      stockQuantity: (json['stock_quantity'] as num?)?.toInt() ?? 0,
      lowStockThreshold: (json['low_stock_threshold'] as num?)?.toInt() ?? 10,
      unit: (json['unit'] ?? 'pcs') as String,
    );
  }

  double get effectivePrice => discountedPrice ?? price;

  bool get isOutOfStock => stockQuantity <= 0;
  bool get isLowStock => stockQuantity > 0 && stockQuantity <= lowStockThreshold;
  bool get isInStock => stockQuantity > lowStockThreshold;

  String get stockStatusText {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Only $stockQuantity left';
    return 'In Stock ($stockQuantity)';
  }
}
