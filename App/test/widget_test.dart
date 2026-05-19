import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:trademaster/app.dart';

void main() {
  testWidgets('App renders smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: TradeMasterApp()),
    );

    // Verify the app renders without crashing
    expect(find.byType(TradeMasterApp), findsOneWidget);
  });
}
