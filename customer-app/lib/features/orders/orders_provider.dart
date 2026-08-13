import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../models/order_model.dart';
import '../cart/cart_provider.dart';

class OrdersProvider extends ChangeNotifier {
  List<OrderModel> _orders = [];
  OrderModel? _selectedOrder;
  bool _isLoading = false;
  String? _errorMessage;

  List<OrderModel> get orders => List.unmodifiable(_orders);
  OrderModel? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<OrderModel?> createOrder({
    required List<CartItemModel> items,
    required String? token,
  }) async {
    if (items.isEmpty) {
      _errorMessage = 'Cart is empty. Cannot create order.';
      notifyListeners();
      return null;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        'items': items
            .map((item) => {
                  'productId': item.product.id,
                  'quantity': item.quantity,
                })
            .toList(),
      };

      final response = await ApiClient.post('/orders', body: payload, token: token);
      if (response['success'] == true && response['data'] != null) {
        final newOrder = OrderModel.fromJson(response['data']);
        _orders.insert(0, newOrder);
        _selectedOrder = newOrder;
        _isLoading = false;
        notifyListeners();
        return newOrder;
      } else {
        throw ApiException(response['message'] ?? 'Failed to create order');
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> fetchUserOrders({required String? token}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.get('/orders', token: token);
      if (response['success'] == true && response['data'] is List) {
        final List<dynamic> list = response['data'];
        _orders = list.map((json) => OrderModel.fromJson(json)).toList();
      } else {
        throw ApiException(response['message'] ?? 'Failed to load user orders');
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<OrderModel?> fetchOrderDetails({
    required String orderId,
    required String? token,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.get('/orders/$orderId', token: token);
      if (response['success'] == true && response['data'] != null) {
        final order = OrderModel.fromJson(response['data']);
        _selectedOrder = order;
        _isLoading = false;
        notifyListeners();
        return order;
      } else {
        throw ApiException(response['message'] ?? 'Order not found');
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }
}
