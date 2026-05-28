import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleKey = 'selected_locale';

/// Reads the persisted locale from SharedPreferences.
/// Falls back to English if nothing is stored.
Future<Locale> loadSavedLocale() async {
  final prefs = await SharedPreferences.getInstance();
  final code = prefs.getString(_kLocaleKey);
  if (code == null) return const Locale('en');
  return Locale(code);
}

/// Notifier that holds the current [Locale] and persists changes.
class LocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() => const Locale('en');

  /// Called once at startup to set the initial locale without writing to prefs
  /// (it was already read from prefs).
  void seedLocale(Locale locale) {
    state = locale;
  }

  /// Called when the user explicitly picks a language.
  /// Updates state immediately (rebuilds the whole MaterialApp) and persists.
  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLocaleKey, locale.languageCode);
  }
}

final localeProvider = NotifierProvider<LocaleNotifier, Locale>(
  LocaleNotifier.new,
);
