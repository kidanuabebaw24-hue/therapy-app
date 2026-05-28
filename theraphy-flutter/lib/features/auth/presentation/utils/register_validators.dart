import 'package:flutter/services.dart';

/// Shared form validation for registration, profile, and emergency contacts.
class RegisterValidators {
  static List<TextInputFormatter> get nameInputFormatters => [
        FilteringTextInputFormatter.deny(RegExp(r'[0-9]')),
        FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z\s'.-]")),
      ];

  static List<TextInputFormatter> get ageInputFormatters => [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(3),
      ];
  static final RegExp _gmailEmail = RegExp(
    r'^[a-zA-Z0-9._%+-]+@gmail\.com$',
    caseSensitive: false,
  );

  static final RegExp _nameHasDigit = RegExp(r'\d');
  static final RegExp _nameAllowed = RegExp(r"^[a-zA-Z\s'.-]+$");

  static String? validateName(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return 'Please enter your full name';
    }
    if (_nameHasDigit.hasMatch(trimmed)) {
      return 'Name cannot contain numbers';
    }
    if (!_nameAllowed.hasMatch(trimmed)) {
      return 'Name can only contain letters, spaces, and . \' -';
    }
    if (trimmed.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  static String? validateGmail(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return 'Please enter your email address';
    }
    if (!_gmailEmail.hasMatch(trimmed)) {
      return 'Email must be a valid @gmail.com address';
    }
    return null;
  }

  static String? validateAge(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return 'Please enter your age';
    }
    final age = int.tryParse(trimmed);
    if (age == null) {
      return 'Please enter a valid age';
    }
    if (age < 18) {
      return 'You must be at least 18 years old';
    }
    if (age > 120) {
      return 'Please enter a valid age (18–120)';
    }
    return null;
  }

  static String? validateGender(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please select your gender';
    }
    if (value != 'male' && value != 'female') {
      return 'Please select male or female';
    }
    return null;
  }

  static String? validatePhone(String? value, {bool required = true}) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return required ? 'Please enter a phone number' : null;
    }
    final digits = trimmed.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 8 || digits.length > 15) {
      return 'Enter a valid phone number (8–15 digits)';
    }
    if (!RegExp(r'^[\d\s+\-()]+$').hasMatch(trimmed)) {
      return 'Phone number contains invalid characters';
    }
    return null;
  }

  static String? validateRelationship(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return null;
    if (trimmed.length < 2) {
      return 'Relationship must be at least 2 characters';
    }
    if (_nameHasDigit.hasMatch(trimmed)) {
      return 'Relationship cannot contain numbers';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }
}
