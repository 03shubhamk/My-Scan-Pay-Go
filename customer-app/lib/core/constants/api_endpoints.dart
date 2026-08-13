class ApiEndpoints {
  static const String baseUrl = 'http://10.0.2.2:5000/api/v1';

  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String getProfile = '$baseUrl/auth/me';

  static String barcodeLookup(String code) => '$baseUrl/products/barcode/$code';
  static const String searchProducts = '$baseUrl/products';

  static const String validateCart = '$baseUrl/checkout/validate-cart';
  static const String createPaymentOrder = '$baseUrl/checkout/create-payment-order';
  static const String verifyPayment = '$baseUrl/payments/verify-payment';

  static const String userOrders = '$baseUrl/orders';
  static String orderDetail(String id) => '$baseUrl/orders/$id';
}
