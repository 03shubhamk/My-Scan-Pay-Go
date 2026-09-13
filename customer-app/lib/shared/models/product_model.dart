class ProductModel {
  final String id;
  final String name;
  final String? description;
  final String barcode;
  final String category;
  final double price;
  final String? imageUrl;
  final int stockQuantity;
  final int lowStockThreshold;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.barcode,
    required this.category,
    required this.price,
    this.imageUrl,
    required this.stockQuantity,
    this.lowStockThreshold = 10,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: (json['id'] ?? '') as String,
      name: (json['name'] ?? 'Product') as String,
      description: json['description'] as String?,
      barcode: (json['barcode'] ?? '') as String,
      category: (json['category'] ?? 'General') as String,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['image_url'] as String?,
      stockQuantity: (json['stock_quantity'] ?? json['stockQuantity'] ?? 0) as int,
      lowStockThreshold: (json['low_stock_threshold'] ?? 10) as int,
    );
  }

  bool get isOutOfStock => stockQuantity <= 0;
  bool get isLowStock => stockQuantity > 0 && stockQuantity <= lowStockThreshold;
  bool get isInStock => stockQuantity > lowStockThreshold;

  String get stockStatusText {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Only $stockQuantity left';
    return 'In Stock ($stockQuantity)';
  }
}
