class TherapistModel {
  final String id;
  final String name;
  final String specialization;
  final double rating;
  final int reviewsCount;
  final String bio;
  final String imageUrl;
  final List<String> availableSlots;
  final double hourlyRate;

  const TherapistModel({
    required this.id,
    required this.name,
    required this.specialization,
    required this.rating,
    required this.reviewsCount,
    required this.bio,
    required this.imageUrl,
    required this.availableSlots,
    required this.hourlyRate,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'specialization': specialization,
    'rating': rating,
    'reviewsCount': reviewsCount,
    'bio': bio,
    'imageUrl': imageUrl,
    'availableSlots': availableSlots,
    'hourlyRate': hourlyRate,
  };

  factory TherapistModel.fromJson(Map<String, dynamic> json) => TherapistModel(
    id: json['id'] as String? ?? '',
    name: json['name'] as String? ?? '',
    specialization: json['specialization'] as String? ?? '',
    rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
    reviewsCount: json['reviewsCount'] as int? ?? 0,
    bio: json['bio'] as String? ?? '',
    imageUrl: json['imageUrl'] as String? ?? '',
    availableSlots: List<String>.from(json['availableSlots'] as List? ?? []),
    hourlyRate: (json['hourlyRate'] as num?)?.toDouble() ?? 0.0,
  );
}
