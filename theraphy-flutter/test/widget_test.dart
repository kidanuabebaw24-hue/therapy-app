import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:theraphy_flutter/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TherapyApp(initialLocale: Locale('en')));
    expect(find.byType(TherapyApp), findsOneWidget);
  });
}
