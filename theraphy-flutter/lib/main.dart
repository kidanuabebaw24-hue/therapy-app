import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'core/localization/locale_provider.dart';
import 'core/theme/app_theme.dart';
import 'routes/app_router.dart';

/// Clears secure storage on the very first run after a fresh install.
/// SharedPreferences IS wiped on uninstall; Keystore is NOT — so we use
/// a SharedPreferences flag to detect a fresh install and wipe the keystore.
Future<void> _clearStaleTokenOnFreshInstall() async {
  const kInstallKey = 'app_installed_v1';
  final prefs = await SharedPreferences.getInstance();
  if (!(prefs.getBool(kInstallKey) ?? false)) {
    const storage = FlutterSecureStorage();
    await storage.deleteAll();
    await prefs.setBool(kInstallKey, true);
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  await _clearStaleTokenOnFreshInstall();

  // Load the persisted locale before building the widget tree.
  final savedLocale = await loadSavedLocale();

  runApp(
    ProviderScope(
      child: TherapyApp(initialLocale: savedLocale),
    ),
  );
}

class TherapyApp extends ConsumerStatefulWidget {
  final Locale initialLocale;
  const TherapyApp({super.key, required this.initialLocale});

  @override
  ConsumerState<TherapyApp> createState() => _TherapyAppState();
}

class _TherapyAppState extends ConsumerState<TherapyApp> {
  @override
  void initState() {
    super.initState();
    // Seed the locale provider safely after the ProviderScope is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(localeProvider.notifier).seedLocale(widget.initialLocale);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      title: 'Theraphy',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
