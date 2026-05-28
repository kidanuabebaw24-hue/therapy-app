import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:theraphy_flutter/features/auth/presentation/utils/register_validators.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_text_field.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _ageController;
  late TextEditingController _concernController;
  String? _selectedGender;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameController = TextEditingController(text: user?.name);
    _emailController = TextEditingController(text: user?.email);
    _phoneController = TextEditingController(text: user?.phone);
    _ageController = TextEditingController(text: user?.age?.toString());
    _selectedGender = _normalizeGender(user?.gender);
    _concernController = TextEditingController(text: user?.primaryPhobia);
  }

  String? _normalizeGender(String? raw) {
    if (raw == null) return null;
    final lower = raw.trim().toLowerCase();
    if (lower == 'male' || lower == 'female') return lower;
    return null;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _ageController.dispose();
    _concernController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
    );

    final updatedUser = user.copyWith(
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim().isEmpty
          ? null
          : _phoneController.text.trim(),
      age: int.parse(_ageController.text.trim()),
      gender: _selectedGender,
      primaryPhobia: _concernController.text.trim().isEmpty
          ? null
          : _concernController.text.trim(),
    );

    final success =
        await ref.read(authProvider.notifier).updateUserProfile(updatedUser);

    if (!mounted) return;
    Navigator.pop(context);

    if (success) {
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update profile. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Personal Information',
                style: AppTextStyles.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Keep your details up to date for a better experience.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),
              AppTextField(
                label: 'Full Name',
                controller: _nameController,
                prefixIcon: Icons.person_outline,
                inputFormatters: RegisterValidators.nameInputFormatters,
                validator: RegisterValidators.validateName,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Email (@gmail.com)',
                controller: _emailController,
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                enabled: false,
                validator: RegisterValidators.validateGmail,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Phone Number',
                controller: _phoneController,
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (v) => RegisterValidators.validatePhone(v, required: false),
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Age (18+)',
                controller: _ageController,
                prefixIcon: Icons.cake_outlined,
                keyboardType: TextInputType.number,
                inputFormatters: RegisterValidators.ageInputFormatters,
                validator: RegisterValidators.validateAge,
              ),
              const SizedBox(height: 20),
              _ProfileGenderField(
                value: _selectedGender,
                onChanged: (v) => setState(() => _selectedGender = v),
                validator: RegisterValidators.validateGender,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Primary Concern',
                controller: _concernController,
                prefixIcon: Icons.psychology_outlined,
                hint: 'e.g. Social Anxiety',
              ),
              const SizedBox(height: 48),
              AppButton(
                label: 'Save Changes',
                onPressed: _save,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileGenderField extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;
  final String? Function(String?)? validator;

  const _ProfileGenderField({
    required this.value,
    required this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Gender', style: AppTextStyles.labelLarge),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.wc_outlined, size: 20),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          style: AppTextStyles.bodyLarge,
          items: const [
            DropdownMenuItem(value: 'male', child: Text('Male')),
            DropdownMenuItem(value: 'female', child: Text('Female')),
          ],
          onChanged: onChanged,
          validator: validator,
        ),
      ],
    );
  }
}
