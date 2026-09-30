class ApiConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.175.113.153:5000/api/v1',
  );

  // Auth Endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String meEndpoint = '/auth/me';

  // Product & Barcode Endpoints
  static const String productsEndpoint = '/products';
  static const String barcodeEndpoint = '/products/barcode';

  // Checkout & Orders Endpoints
  static const String ordersEndpoint = '/orders';
  static const String checkoutEndpoint = '/checkout';
  static const String verifyPaymentEndpoint = '/payments/verify-payment';

  // Networking
  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 15000;
}

