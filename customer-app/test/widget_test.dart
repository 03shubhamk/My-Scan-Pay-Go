import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/main.dart';

void main() {
  testWidgets('Customer App renders without crashing', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ScanPayGoCustomerApp());

    // Verify that app widget renders
    expect(find.byType(ScanPayGoCustomerApp), findsOneWidget);
  });
}
