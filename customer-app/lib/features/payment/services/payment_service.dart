import '../../../core/network/api_client.dart';
import '../../../models/payment_model.dart';

class PaymentService {
  /// Request backend to create Razorpay order for an existing or new order.
  /// Only receives public keyId and razorpayOrderId.
  static Future<RazorpayOrderData> createPaymentOrder({
    required String orderId,
    required String? token,
  }) async {
    final response = await ApiClient.post(
      '/checkout/create-payment-order',
      body: {'orderId': orderId},
      token: token,
    );

    if (response['success'] == true && response['data'] != null) {
      return RazorpayOrderData.fromJson(response['data'] as Map<String, dynamic>);
    } else {
      throw ApiException(response['message'] ?? 'Failed to initialize payment order');
    }
  }

  /// Request backend to cryptographically verify Razorpay signature and capture payment.
  static Future<PaymentResult> verifyPayment({
    required PaymentVerificationPayload payload,
    required String? token,
  }) async {
    final response = await ApiClient.post(
      '/payments/verify-payment',
      body: payload.toJson(),
      token: token,
    );

    if (response['success'] == true && response['data'] != null) {
      return PaymentResult.fromJson(response['data'] as Map<String, dynamic>);
    } else {
      throw ApiException(response['message'] ?? 'Payment signature verification failed');
    }
  }

  /// Report payment failure to backend
  static Future<void> reportPaymentFailure({
    required String orderId,
    String? razorpayPaymentId,
    String? reason,
    required String? token,
  }) async {
    try {
      await ApiClient.post(
        '/payments/failed',
        body: {
          'orderId': orderId,
          if (razorpayPaymentId != null) 'razorpayPaymentId': razorpayPaymentId,
          'reason': reason ?? 'Payment interrupted or cancelled by user',
        },
        token: token,
      );
    } catch (_) {
      // Non-blocking log
    }
  }
}
