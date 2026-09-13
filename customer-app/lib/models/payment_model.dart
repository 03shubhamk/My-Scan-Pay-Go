import 'order_model.dart';

class RazorpayOrderData {
  final String orderId;
  final String razorpayOrderId;
  final double amount;
  final int amountInPaise;
  final String currency;
  final String keyId;
  final String customerName;
  final String customerEmail;

  RazorpayOrderData({
    required this.orderId,
    required this.razorpayOrderId,
    required this.amount,
    required this.amountInPaise,
    this.currency = 'INR',
    required this.keyId,
    this.customerName = '',
    this.customerEmail = '',
  });

  factory RazorpayOrderData.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>? ?? {};
    return RazorpayOrderData(
      orderId: (json['orderId'] ?? '') as String,
      razorpayOrderId: (json['razorpayOrderId'] ?? '') as String,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      amountInPaise: (json['amountInPaise'] as num?)?.toInt() ?? 0,
      currency: (json['currency'] ?? 'INR') as String,
      keyId: (json['keyId'] ?? '') as String,
      customerName: (customer['name'] ?? '') as String,
      customerEmail: (customer['email'] ?? '') as String,
    );
  }

  Map<String, dynamic> toRazorpayOptions() {
    return {
      'key': keyId,
      'amount': amountInPaise,
      'name': 'Scan. Pay. Go.',
      'description': 'Self-Checkout Order $orderId',
      'order_id': razorpayOrderId,
      'currency': currency,
      'timeout': 180,
      'prefill': {
        'name': customerName,
        'email': customerEmail,
      },
      'theme': {
        'color': '#004AC6',
      },
    };
  }
}

class PaymentVerificationPayload {
  final String orderId;
  final String razorpayOrderId;
  final String razorpayPaymentId;
  final String razorpaySignature;

  PaymentVerificationPayload({
    required this.orderId,
    required this.razorpayOrderId,
    required this.razorpayPaymentId,
    required this.razorpaySignature,
  });

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'razorpayOrderId': razorpayOrderId,
      'razorpayPaymentId': razorpayPaymentId,
      'razorpaySignature': razorpaySignature,
    };
  }
}

class PaymentResult {
  final String orderId;
  final String paymentStatus;
  final String razorpayPaymentId;
  final String exitQrToken;
  final OrderModel? order;

  PaymentResult({
    required this.orderId,
    required this.paymentStatus,
    required this.razorpayPaymentId,
    required this.exitQrToken,
    this.order,
  });

  factory PaymentResult.fromJson(Map<String, dynamic> json) {
    OrderModel? parsedOrder;
    if (json['order'] != null && json['order'] is Map<String, dynamic>) {
      parsedOrder = OrderModel.fromJson(json['order'] as Map<String, dynamic>);
    }

    return PaymentResult(
      orderId: (json['orderId'] ?? '') as String,
      paymentStatus: (json['paymentStatus'] ?? 'PAID') as String,
      razorpayPaymentId: (json['razorpayPaymentId'] ?? '') as String,
      exitQrToken: (json['exitQrToken'] ?? '') as String,
      order: parsedOrder,
    );
  }
}
