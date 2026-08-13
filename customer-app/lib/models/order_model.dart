class OrderItemModel {
  final String id;
  final String orderId;
  final String productId;
  final int quantity;
  final double priceAtPurchase;
  final double subtotal;
  final String productName;
  final String productBarcode;
  final String productImageUrl;

  OrderItemModel({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.quantity,
    required this.priceAtPurchase,
    required this.subtotal,
    this.productName = 'Product',
    this.productBarcode = '',
    this.productImageUrl = '',
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: (json['id'] ?? '') as String,
      orderId: (json['order_id'] ?? '') as String,
      productId: (json['product_id'] ?? '') as String,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      priceAtPurchase: (json['price_at_purchase'] as num?)?.toDouble() ?? 0.0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      productName: (json['product_name'] ?? 'Product') as String,
      productBarcode: (json['product_barcode'] ?? '') as String,
      productImageUrl: (json['product_image_url'] ?? '') as String,
    );
  }
}

class OrderModel {
  final String id;
  final String userId;
  final String orderNumber;
  final double totalAmount;
  final String status;
  final String paymentStatus;
  final String? exitQrToken;
  final DateTime createdAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.userId,
    required this.orderNumber,
    required this.totalAmount,
    required this.status,
    required this.paymentStatus,
    this.exitQrToken,
    required this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'];
    List<OrderItemModel> parsedItems = [];
    if (rawItems is List) {
      parsedItems = rawItems
          .whereType<Map<String, dynamic>>()
          .map((itemJson) => OrderItemModel.fromJson(itemJson))
          .toList();
    }

    final idStr = json['id'] as String? ?? '';
    final orderNumStr = json['order_number'] as String? ??
        (idStr.isNotEmpty ? 'ORD-${idStr.substring(0, idStr.length > 8 ? 8 : idStr.length).toUpperCase()}' : 'ORD-UNKNOWN');

    return OrderModel(
      id: idStr,
      userId: (json['user_id'] ?? '') as String,
      orderNumber: orderNumStr,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0.0,
      status: (json['status'] ?? 'PENDING') as String,
      paymentStatus: (json['payment_status'] ?? 'UNPAID') as String,
      exitQrToken: json['exit_qr_token'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      items: parsedItems,
    );
  }
}
