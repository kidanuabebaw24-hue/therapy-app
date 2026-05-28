import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/network/network_providers.dart';
import '../../../models/therapist_model.dart';
import '../../../widgets/app_image.dart';

class TherapistListScreen extends ConsumerStatefulWidget {
  const TherapistListScreen({super.key});

  @override
  ConsumerState<TherapistListScreen> createState() =>
      _TherapistListScreenState();
}

class _TherapistListScreenState extends ConsumerState<TherapistListScreen> {
  List<TherapistModel> therapists = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchTherapists();
  }

  Future<void> _fetchTherapists() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/therapists');
      final rows = (response.data['data'] as List? ?? []);

      final mapped = rows.map((item) {
        final map = item as Map<String, dynamic>;
        final user = map['user'] as Map<String, dynamic>? ?? {};
        final rawHours = map['workingHours'];
        final normalizedHours = _normalizeWorkingHours(rawHours);

        // Keep existing UI intact: use backend data, with sensible defaults.
        return TherapistModel(
          id: (map['id'] ?? '').toString(),
          name: (user['name'] ?? map['name'] ?? 'Therapist').toString(),
          specialization:
              (map['specialization'] ?? 'General Therapy').toString(),
          rating: (map['rating'] as num?)?.toDouble() ?? 4.5,
          reviewsCount: (map['reviewsCount'] as num?)?.toInt() ?? 0,
          bio: (map['about'] ?? map['bio'] ?? 'Professional therapist')
              .toString(),
          imageUrl: (map['imageUrl'] ?? 'assets/images/doctor_placeholder.png')
              .toString(),
          availableSlots: _extractSlots(normalizedHours),
          workingHours: normalizedHours,
          hourlyRate: (map['hourlyRate'] as num?)?.toDouble() ?? 100,
        );
      }).toList();

      setState(() {
        therapists = mapped;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Failed to load therapists';
        isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> _normalizeWorkingHours(dynamic workingHours) {
    if (workingHours is! List) return const [];
    return workingHours
        .whereType<Map>()
        .map((entry) => Map<String, dynamic>.from(entry))
        .toList();
  }

  List<String> _extractSlots(List<Map<String, dynamic>> workingHours) {
    if (workingHours.isNotEmpty) {
      final firstEnabled = workingHours.firstWhere(
            (entry) => entry['enabled'] == true,
            orElse: () => {},
          );
      final start = firstEnabled['startTime']?.toString();
      final end = firstEnabled['endTime']?.toString();
      if (start != null && end != null) {
        return _generateDisplaySlots(start, end);
      }
    }
    return const ['09:00 AM', '01:00 PM', '05:00 PM'];
  }

  String _toAmPm(String hhmm) {
    final parts = hhmm.split(':');
    if (parts.length < 2) return hhmm;
    var hour = int.tryParse(parts[0]) ?? 0;
    final minute = parts[1];
    final suffix = hour >= 12 ? 'PM' : 'AM';
    if (hour == 0) hour = 12;
    if (hour > 12) hour -= 12;
    return '${hour.toString().padLeft(2, '0')}:$minute $suffix';
  }

  String _midpoint(String start, String end) {
    final s = start.split(':').map((v) => int.tryParse(v) ?? 0).toList();
    final e = end.split(':').map((v) => int.tryParse(v) ?? 0).toList();
    final sMin = s[0] * 60 + s[1];
    final eMin = e[0] * 60 + e[1];
    final mid = (sMin + eMin) ~/ 2;
    final h = (mid ~/ 60).toString().padLeft(2, '0');
    final m = (mid % 60).toString().padLeft(2, '0');
    return _toAmPm('$h:$m');
  }

  List<String> _generateDisplaySlots(String start, String end) {
    const sessionMinutes = 50;
    final s = start.split(':').map((v) => int.tryParse(v) ?? 0).toList();
    final e = end.split(':').map((v) => int.tryParse(v) ?? 0).toList();
    final startMin = s[0] * 60 + s[1];
    final endMin = e[0] * 60 + e[1];
    final latestStart = endMin - sessionMinutes;

    if (latestStart < startMin) return const [];

    String asLabel(int minuteOfDay) {
      final h = (minuteOfDay ~/ 60).toString().padLeft(2, '0');
      final m = (minuteOfDay % 60).toString().padLeft(2, '0');
      return _toAmPm('$h:$m');
    }

    final first = startMin;
    final middle = (startMin + latestStart) ~/ 2;
    final last = latestStart;
    return [asLabel(first), asLabel(middle), asLabel(last)].toSet().toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Find a Therapist'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by name or specialization',
                prefixIcon: const Icon(Icons.search_rounded),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),

          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : error != null
                    ? Center(
                        child: Text(error!, style: AppTextStyles.bodyMedium),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        itemCount: therapists.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          return _TherapistCard(therapist: therapists[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _TherapistCard extends StatelessWidget {
  final TherapistModel therapist;

  const _TherapistCard({required this.therapist});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push('/scheduling/profile', extra: therapist),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppColors.cardShadow,
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AppImage(
                imageUrl: therapist.imageUrl,
                width: 80,
                height: 80,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(therapist.name,
                      style: AppTextStyles.titleMedium
                          .copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(therapist.specialization,
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.primary)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text('${therapist.rating}',
                          style: AppTextStyles.bodySmall
                              .copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 4),
                      Text('(${therapist.reviewsCount} reviews)',
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.textHint)),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
