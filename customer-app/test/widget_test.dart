import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/main.dart';

void main() {
  testWidgets('Customer App renders without crashing', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ScanPayGoCustomerApp());

    // Verify that app widget renders
    expect(find.byType(ScanPayGoCustomerApp), findsOneWidget);

    // Pump past the 2-second splash screen timer
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
  });
}

