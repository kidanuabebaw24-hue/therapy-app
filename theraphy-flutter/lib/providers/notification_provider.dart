import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/network_providers.dart';
import '../models/notification_model.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class NotificationState {
  final List<NotificationModel> notifications;
  final bool isLoading;
  final String? error;

  const NotificationState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
  });

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  NotificationState copyWith({
    List<NotificationModel>? notifications,
    bool? isLoading,
    String? error,
  }) =>
      NotificationState(
        notifications: notifications ?? this.notifications,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class NotificationNotifier extends StateNotifier<NotificationState> {
  final Ref _ref;
  Timer? _pollTimer;

  NotificationNotifier(this._ref) : super(const NotificationState());

  /// Fetch notifications from the server.
  Future<void> fetchNotifications() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get(ApiEndpoints.myNotifications);
      final data = response.data['data'] as List;
      final notifications =
          data.map((j) => NotificationModel.fromJson(j as Map<String, dynamic>)).toList();
      state = state.copyWith(notifications: notifications, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Mark a single notification as read.
  Future<void> markRead(String id) async {
    try {
      final api = _ref.read(apiClientProvider);
      await api.patch(ApiEndpoints.markNotificationRead(id));
      state = state.copyWith(
        notifications: state.notifications
            .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
            .toList(),
      );
    } catch (_) {}
  }

  /// Mark all notifications as read.
  Future<void> markAllRead() async {
    try {
      final api = _ref.read(apiClientProvider);
      await api.patch(ApiEndpoints.markAllNotificationsRead);
      state = state.copyWith(
        notifications:
            state.notifications.map((n) => n.copyWith(isRead: true)).toList(),
      );
    } catch (_) {}
  }

  /// Start polling every 30 seconds for new notifications.
  void startPolling() {
    _pollTimer?.cancel();
    fetchNotifications();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      fetchNotifications();
    });
  }

  /// Stop polling.
  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>(
  (ref) => NotificationNotifier(ref),
);
