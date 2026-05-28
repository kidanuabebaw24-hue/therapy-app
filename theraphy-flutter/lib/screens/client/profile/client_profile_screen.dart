import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:theraphy_flutter/features/auth/presentation/utils/register_validators.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../routes/app_routes.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';
import '../../../models/emergency_contact_model.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_card.dart';

class ClientProfileScreen extends ConsumerWidget {
  const ClientProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profileTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => context.push(AppRoutes.editProfile),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            Center(
              child: Column(
                children: [
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      gradient: AppColors.calmGradient,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        user?.name.isNotEmpty == true
                            ? user!.name[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                          fontFamily: 'Outfit',
                          color: Colors.white,
                          fontSize: 36,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(user?.name ?? '', style: AppTextStyles.headlineLarge),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '', style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      l10n.client,
                      style: const TextStyle(
                        fontFamily: 'Outfit',
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Info cards
            AppCard(
              child: Column(
                children: [
                  _InfoRow(
                    icon: Icons.cake_outlined,
                    label: l10n.age,
                    value: user?.age != null
                        ? l10n.yearsOld(user!.age!)
                        : l10n.notSet,
                  ),
                  const Divider(),
                  _InfoRow(
                    icon: Icons.phone_outlined,
                    label: l10n.phone,
                    value: user?.phone ?? l10n.notSet,
                  ),
                  const Divider(),
                  _InfoRow(
                    icon: Icons.wc_outlined,
                    label: l10n.gender,
                    value: user?.gender ?? l10n.notSet,
                  ),
                  const Divider(),
                  _InfoRow(
                    icon: Icons.psychology_outlined,
                    label: l10n.primaryConcern,
                    value: user?.primaryPhobia ?? l10n.notSet,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Anxiety level
            if (user?.currentAnxietyLevel != null)
              AppCard(
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.anxietyColor(user!.currentAnxietyLevel!)
                            .withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.favorite_outline,
                        color: AppColors.anxietyColor(user.currentAnxietyLevel!),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(l10n.anxietyLevelLabel,
                              style: AppTextStyles.titleMedium),
                          Text(
                            '${user.currentAnxietyLevel}/10',
                            style: TextStyle(
                              fontFamily: 'Outfit',
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: AppColors.anxietyColor(
                                  user.currentAnxietyLevel!),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Language settings entry
            AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.language, color: AppColors.secondary),
                ),
                title: Text(l10n.language, style: AppTextStyles.titleMedium),
                trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                onTap: () => context.push(AppRoutes.languageSettings),
              ),
            ),
            const SizedBox(height: 16),

            // Emergency Contacts
            const _EmergencyContactsCard(),
            const SizedBox(height: 28),

            // Logout
            AppButton(
              label: l10n.signOut,
              variant: AppButtonVariant.outlined,
              icon: Icons.logout,
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (dialogContext) => AlertDialog(
                    title: Text(l10n.signOutConfirmTitle),
                    content: Text(l10n.signOutConfirmMessage),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(dialogContext, false),
                        child: Text(l10n.cancel),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(dialogContext, true),
                        child: Text(l10n.signOut),
                      ),
                    ],
                  ),
                );
                if (confirmed == true && context.mounted) {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    context.go(AppRoutes.welcome);
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textHint),
          const SizedBox(width: 12),
          Text(label, style: AppTextStyles.bodyMedium),
          const Spacer(),
          Text(value, style: AppTextStyles.titleMedium),
        ],
      ),
    );
  }
}

class _EmergencyContactsCard extends ConsumerWidget {
  const _EmergencyContactsCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final l10n = AppLocalizations.of(context);
    if (user == null) return const SizedBox.shrink();

    final contacts = user.emergencyContacts;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(l10n.emergencyContacts, style: AppTextStyles.titleLarge),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                onPressed: () => _showContactSheet(context, ref, null),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (contacts.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  l10n.noEmergencyContacts,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textHint),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: contacts.length,
              separatorBuilder: (context, index) => const Divider(height: 24),
              itemBuilder: (context, index) {
                final contact = contacts[index];
                return _ContactTile(contact: contact, ref: ref);
              },
            ),
        ],
      ),
    );
  }

  void _showContactSheet(BuildContext context, WidgetRef ref, EmergencyContactModel? contact) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ContactSheet(contact: contact),
    );
  }
}

class _ContactTile extends StatelessWidget {
  final EmergencyContactModel contact;
  final WidgetRef ref;

  const _ContactTile({required this.contact, required this.ref});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.secondary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.person, color: AppColors.secondary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(contact.name, style: AppTextStyles.titleMedium),
              const SizedBox(height: 2),
              Row(
                children: [
                  if (contact.relationship != null && contact.relationship!.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        contact.relationship!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Text(contact.phone, style: AppTextStyles.bodyMedium),
                ],
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.phone, color: Colors.green),
          onPressed: () async {
            final uri = Uri.parse('tel:${contact.phone}');
            if (await canLaunchUrl(uri)) {
              await launchUrl(uri);
            } else {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(AppLocalizations.of(context).couldNotLaunchDialer)),
                );
              }
            }
          },
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: AppColors.textSecondary),
          onSelected: (value) async {
            final l10n = AppLocalizations.of(context);
            if (value == 'edit') {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (context) => _ContactSheet(contact: contact),
              );
            } else if (value == 'delete') {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: Text(l10n.deleteContact),
                  content: Text(l10n.deleteContactConfirm(contact.name)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: Text(l10n.cancel),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: Text(l10n.delete,
                          style: const TextStyle(color: AppColors.error)),
                    ),
                  ],
                ),
              );

              if (confirm == true && context.mounted) {
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (_) => const Center(child: CircularProgressIndicator()),
                );
                final success = await ref.read(authProvider.notifier).deleteEmergencyContact(contact.id);
                if (context.mounted) {
                  Navigator.pop(context);
                  if (!success) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(l10n.failedToDeleteContact)),
                    );
                  }
                }
              }
            }
          },
          itemBuilder: (context) {
            final l10n = AppLocalizations.of(context);
            return [
              PopupMenuItem(value: 'edit', child: Text(l10n.edit)),
              PopupMenuItem(
                value: 'delete',
                child: Text(l10n.delete,
                    style: const TextStyle(color: AppColors.error)),
              ),
            ];
          },
        ),
      ],
    );
  }
}

class _ContactSheet extends ConsumerStatefulWidget {
  final EmergencyContactModel? contact;

  const _ContactSheet({this.contact});

  @override
  ConsumerState<_ContactSheet> createState() => _ContactSheetState();
}

class _ContactSheetState extends ConsumerState<_ContactSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _relationshipController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.contact?.name);
    _phoneController = TextEditingController(text: widget.contact?.phone);
    _relationshipController = TextEditingController(text: widget.contact?.relationship);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _relationshipController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final l10n = AppLocalizations.of(context);

    setState(() => _isLoading = true);

    bool success;
    if (widget.contact == null) {
      success = await ref.read(authProvider.notifier).addEmergencyContact(
            name: _nameController.text.trim(),
            phone: _phoneController.text.trim(),
            relationship: _relationshipController.text.trim(),
          );
    } else {
      success = await ref.read(authProvider.notifier).updateEmergencyContact(
            contactId: widget.contact!.id,
            name: _nameController.text.trim(),
            phone: _phoneController.text.trim(),
            relationship: _relationshipController.text.trim(),
          );
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.failedToSaveContact)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.contact == null ? l10n.addContact : l10n.editContact,
                      style: AppTextStyles.headlineMedium,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _nameController,
                  inputFormatters: RegisterValidators.nameInputFormatters,
                  decoration: InputDecoration(
                    labelText: l10n.fullName,
                    prefixIcon: const Icon(Icons.person_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: RegisterValidators.validateName,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: l10n.phoneNumber,
                    prefixIcon: const Icon(Icons.phone_outlined),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: RegisterValidators.validatePhone,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _relationshipController,
                  inputFormatters: RegisterValidators.nameInputFormatters,
                  decoration: InputDecoration(
                    labelText: l10n.relationship,
                    hintText: l10n.relationshipHint,
                    prefixIcon: const Icon(Icons.family_restroom),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: RegisterValidators.validateRelationship,
                ),
                const SizedBox(height: 32),
                AppButton(
                  label: l10n.saveContact,
                  isLoading: _isLoading,
                  onPressed: _save,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
