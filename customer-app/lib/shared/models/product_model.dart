class ProductModel {
  final String id;
  final String name;
  final String? description;
  final String barcode;
  final String category;
  final double price;
  final String? imageUrl;
  final int stockQuantity;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.barcode,
    required this.category,
    required this.price,
    this.imageUrl,
    required this.stockQuantity,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      barcode: json['barcode'] as String,
      category: json['category'] as String,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'] as String?,
      stockQuantity: (json['stock_quantity'] ?? json['stockQuantity'] ?? 0) as int,
    );
  }
}
