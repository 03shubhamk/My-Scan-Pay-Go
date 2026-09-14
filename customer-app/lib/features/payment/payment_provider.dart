import 'package:flutter/material.dart';
import '../../models/payment_model.dart';
import 'services/payment_service.dart';

enum PaymentState {
  initial,
  initializingGateway,
  readyForGateway,
  verifying,
  success,
  failed,
  pending,
}

class PaymentProvider extends ChangeNotifier {
  PaymentState _state = PaymentState.initial;
  RazorpayOrderData? _razorpayOrder;
  PaymentResult? _paymentResult;
  String? _errorMessage;
  String? _currentOrderId;

  PaymentState get state => _state;
  RazorpayOrderData? get razorpayOrder => _razorpayOrder;
  PaymentResult? get paymentResult => _paymentResult;
  String? get errorMessage => _errorMessage;
  String? get currentOrderId => _currentOrderId;

  bool get isProcessing =>
      _state == PaymentState.initializingGateway || _state == PaymentState.verifying;

  void reset() {
    _state = PaymentState.initial;
    _razorpayOrder = null;
    _paymentResult = null;
    _errorMessage = null;
    _currentOrderId = null;
    notifyListeners();
  }

  /// Step 1: Request backend to create Razorpay Order
  Future<RazorpayOrderData?> initiatePayment({
    required String orderId,
    required String? token,
  }) async {
    _state = PaymentState.initializingGateway;
    _errorMessage = null;
    _currentOrderId = orderId;
    notifyListeners();

    try {
      final orderData = await PaymentService.createPaymentOrder(
        orderId: orderId,
        token: token,
      );
      _razorpayOrder = orderData;
      _state = PaymentState.readyForGateway;
      notifyListeners();
      return orderData;
    } catch (e) {
      _state = PaymentState.failed;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Step 2: Handle Gateway Success & Trigger Backend Cryptographic Verification
  Future<PaymentResult?> handlePaymentSuccess({
    required String razorpayPaymentId,
    required String razorpayOrderId,
    required String razorpaySignature,
    required String? token,
  }) async {
    _state = PaymentState.verifying;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = PaymentVerificationPayload(
        orderId: _currentOrderId ?? '',
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      );

      final result = await PaymentService.verifyPayment(
        payload: payload,
        token: token,
      );

      _paymentResult = result;
      _state = PaymentState.success;
      notifyListeners();
      return result;
    } catch (e) {
      _state = PaymentState.failed;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Step 3: Handle Gateway Failure or Cancellation
  Future<void> handlePaymentError({
    required String code,
    required String message,
    required String? token,
    String? razorpayPaymentId,
  }) async {
    _state = PaymentState.failed;
    _errorMessage = message.isNotEmpty ? message : 'Payment could not be completed ($code)';
    notifyListeners();

    if (_currentOrderId != null) {
      await PaymentService.reportPaymentFailure(
        orderId: _currentOrderId!,
        razorpayPaymentId: razorpayPaymentId,
        reason: _errorMessage,
        token: token,
      );
    }
  }

  /// Mark as Pending (for asynchronous bank / UPI confirmations)
  void markPending({String? reason}) {
    _state = PaymentState.pending;
    _errorMessage = reason ?? 'Payment is under processing by the banking gateway';
    notifyListeners();
  }

  /// Retry Payment for current order
  Future<RazorpayOrderData?> retryPayment({required String? token}) async {
    if (_currentOrderId == null) return null;
    return await initiatePayment(orderId: _currentOrderId!, token: token);
  }
}
