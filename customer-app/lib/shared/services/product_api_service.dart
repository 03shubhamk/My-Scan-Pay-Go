import '../../core/network/api_client.dart';
import '../models/product_model.dart';

class ProductApiService {
  static Future<ProductModel> fetchProductByBarcode(String barcode, {String? token}) async {
    try {
      final response = await ApiClient.get('/products/barcode/$barcode', token: token);
      if (response['success'] == true && response['data'] != null && response['data']['product'] != null) {
        return ProductModel.fromJson(response['data']['product']);
      }
      throw ApiException('Product not found for barcode: $barcode', statusCode: 404);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to lookup barcode. Please check your network connection.');
    }
  }

  static Future<List<ProductModel>> fetchProducts({String? token}) async {
    try {
      final response = await ApiClient.get('/products', token: token);
      if (response['success'] == true && response['data'] != null && response['data']['products'] != null) {
        final List<dynamic> list = response['data']['products'];
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to fetch product catalog.');
    }
  }
}
