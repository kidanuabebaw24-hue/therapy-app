import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../../models/user_model.dart';
import '../../../../models/emergency_contact_model.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

// --- Simplified Notifier ---
class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
}

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final SecureStorageService _storage;

  AuthNotifier(this._apiClient, this._storage) : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    print('🔑 AuthNotifier: Initializing background check...');
    
    // GUARD: If we are already loading or authenticated (from a manual login/register),
    // do not let the background init overwrite the state.
    if (state.status == AuthStatus.loading || state.status == AuthStatus.authenticated) {
      print('🔑 AuthNotifier: Skipping background init - already in active state: ${state.status}');
      return;
    }

    final token = await _storage.getToken();
    if (token == null) {
      print('🔑 AuthNotifier: No token found. Status -> unauthenticated');
      // Only set to unauthenticated if we haven't started a manual process in the meantime
      if (state.status == AuthStatus.initial) {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
      return;
    }

    print('🔑 AuthNotifier: Token found. Fetching profile...');
    if (state.status == AuthStatus.initial) {
      state = state.copyWith(status: AuthStatus.loading);
    }

    try {
      final response = await _apiClient.get(ApiConstants.profile);
      print('🔑 AuthNotifier: Profile response: ${response.statusCode}');
      
      final data = response.data['data'];
      if (data == null || data['user'] == null) {
        print('🔑 AuthNotifier: Profile data missing user field!');
        throw Exception('Invalid profile data');
      }

      final user = UserModel.fromJson(data['user']);
      print('🔑 AuthNotifier: Profile fetch success. User: ${user.name}');
      
      // FINAL GUARD: Only update state if we are still in a state that should be overwritten
      if (state.status == AuthStatus.loading || state.status == AuthStatus.initial) {
        state = AuthState(status: AuthStatus.authenticated, user: user);
      }
    } catch (e) {
      print('🔑 AuthNotifier: Profile fetch failed: $e');
      
      // Only delete token if it's an authentication error (401)
      if (e.toString().contains('401')) {
        print('🔑 AuthNotifier: 401 error. Deleting token.');
        await _storage.deleteToken();
      } else {
        print('🔑 AuthNotifier: Non-401 error. Keeping token for retry.');
      }
      
      if (state.status == AuthStatus.loading || state.status == AuthStatus.initial) {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      print('🌐 Attempting login for $email...');
      final response = await _apiClient.post(ApiConstants.login, data: {
        'email': email,
        'password': password,
      });
      
      print('📩 Login response received: ${response.statusCode}');
      print('📩 Response data: ${response.data}');

      final data = response.data['data'];
      if (data == null) {
        throw Exception('Login failed: Invalid response from server');
      }
      
      final user = UserModel.fromJson(data['user']);
      final token = data['token'];
      
      if (token == null) {
        throw Exception('Login failed: Token not provided');
      }
      
      print('✅ Login successful for ${user.name}. Token: ${token.toString().substring(0, 10)}...');
      
      await _storage.saveToken(token);
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } catch (e, stack) {
      print('❌ Login failed: $e');
      print('❌ Stack trace: $stack');
      state = state.copyWith(status: AuthStatus.error, error: e.toString());
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required int age,
    required String gender,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      print('🌐 Attempting registration for $email...');
      final response = await _apiClient.post(ApiConstants.register, data: {
        'name': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'role': 'client',
        'age': age,
        'gender': gender,
      });
      
      print('📩 Register response received: ${response.statusCode}');
      print('📩 Response data: ${response.data}');

      final data = response.data['data'];
      if (data == null) {
        throw Exception('Registration failed: Invalid response from server');
      }
      
      final user = UserModel.fromJson(data['user']);
      final token = data['token'];
      
      if (token == null) {
        throw Exception('Registration failed: Token not provided');
      }
      
      print('✅ Registration successful for ${user.name}. Token: ${token.toString().substring(0, 10)}...');
      
      await _storage.saveToken(token);
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } catch (e, stack) {
      print('❌ Registration failed: $e');
      print('❌ Stack trace: $stack');
      state = state.copyWith(status: AuthStatus.error, error: e.toString());
      // Ensure we don't stay in error status indefinitely if we want to allow retry
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.deleteToken();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void updateUser(UserModel user) {
    state = state.copyWith(user: user);
  }

  Future<bool> updateUserProfile(UserModel updatedUser) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      print('🌐 Persisting profile updates to backend...');
      final response = await _apiClient.put('/users/profile', data: {
        'name': updatedUser.name,
        'phone': updatedUser.phone,
        'patientProfile': {
          'age': updatedUser.age,
          'gender': updatedUser.gender,
          'primaryPhobia': updatedUser.primaryPhobia,
        }
      });
      
      final data = response.data['data'];
      final user = UserModel.fromJson(data);
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } catch (e) {
      print('❌ Failed to persist profile updates: $e');
      state = state.copyWith(status: AuthStatus.authenticated, error: e.toString());
      return false;
    }
  }

  Future<bool> addEmergencyContact({
    required String name,
    required String phone,
    required String relationship,
  }) async {
    try {
      print('🌐 Adding emergency contact to database...');
      final response = await _apiClient.post(
        '/users/profile/emergency-contacts',
        data: {
          'name': name,
          'phone': phone,
          'relationship': relationship,
        },
      );
      
      final contactData = response.data['data'];
      final newContact = EmergencyContactModel.fromJson(contactData);
      
      if (state.user != null) {
        final updatedContacts = List<EmergencyContactModel>.from(state.user!.emergencyContacts)
          ..add(newContact);
        final updatedUser = state.user!.copyWith(emergencyContacts: updatedContacts);
        state = state.copyWith(user: updatedUser);
      }
      return true;
    } catch (e) {
      print('❌ Error adding emergency contact: $e');
      return false;
    }
  }

  Future<bool> updateEmergencyContact({
    required String contactId,
    required String name,
    required String phone,
    required String relationship,
  }) async {
    try {
      print('🌐 Updating emergency contact $contactId...');
      final response = await _apiClient.put(
        '/users/profile/emergency-contacts/$contactId',
        data: {
          'name': name,
          'phone': phone,
          'relationship': relationship,
        },
      );
      
      final contactData = response.data['data'];
      final updatedContact = EmergencyContactModel.fromJson(contactData);
      
      if (state.user != null) {
        final updatedContacts = state.user!.emergencyContacts.map((c) {
          return c.id == contactId ? updatedContact : c;
        }).toList();
        final updatedUser = state.user!.copyWith(emergencyContacts: updatedContacts);
        state = state.copyWith(user: updatedUser);
      }
      return true;
    } catch (e) {
      print('❌ Error updating emergency contact: $e');
      return false;
    }
  }

  Future<bool> deleteEmergencyContact(String contactId) async {
    try {
      print('🌐 Deleting emergency contact $contactId...');
      await _apiClient.delete('/users/profile/emergency-contacts/$contactId');
      
      if (state.user != null) {
        final updatedContacts = state.user!.emergencyContacts
            .where((c) => c.id != contactId)
            .toList();
        final updatedUser = state.user!.copyWith(emergencyContacts: updatedContacts);
        state = state.copyWith(user: updatedUser);
      }
      return true;
    } catch (e) {
      print('❌ Error deleting emergency contact: $e');
      return false;
    }
  }
}

// --- Providers ---
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(apiClient, storage);
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

