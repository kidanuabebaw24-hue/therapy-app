import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../routes/app_routes.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      title: "Breath & Calm",
      description: "Discover scientifically proven techniques to manage anxiety and find your inner peace.",
      icon: Icons.air_rounded,
      color: AppColors.primary,
    ),
    OnboardingData(
      title: "Face Your Fears",
      description: "Gentle, guided exposure therapy to help you overcome phobias at your own pace.",
      icon: Icons.auto_graph_rounded,
      color: AppColors.secondary,
    ),
    OnboardingData(
      title: "Expert Support",
      description: "Connect with licensed therapists and AI assistants available 24/7 for your journey.",
      icon: Icons.psychology_rounded,
      color: AppColors.accent,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _pages.length,
            itemBuilder: (context, index) {
              final data = _pages[index];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      height: 200,
                      width: 200,
                      decoration: BoxDecoration(
                        color: data.color.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        data.icon,
                        size: 100,
                        color: data.color,
                      ),
                    ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack).fade(),
                    const SizedBox(height: 60),
                    Text(
                      data.title,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.headlineLarge.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ).animate().fade(delay: 200.ms).slideY(begin: 0.2, end: 0),
                    const SizedBox(height: 20),
                    Text(
                      data.description,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ).animate().fade(delay: 400.ms).slideY(begin: 0.2, end: 0),
                  ],
                ),
              );
            },
          ),
          
          // Navigation controls
          Positioned(
            bottom: 60,
            left: 40,
            right: 40,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Indicators
                Row(
                  children: List.generate(_pages.length, (index) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: 8,
                      width: _currentPage == index ? 24 : 8,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        color: _currentPage == index ? AppColors.primary : AppColors.primary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),
                
                // Next/Get Started Button
                IconButton.filled(
                  onPressed: () {
                    if (_currentPage < _pages.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeInOutCubic,
                      );
                    } else {
                      context.go(AppRoutes.welcome); 
                    }
                  },
                  icon: Icon(
                    _currentPage == _pages.length - 1 ? Icons.check : Icons.arrow_forward_ios_rounded,
                    size: 20,
                  ),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(56, 56),
                  ),
                ).animate(key: ValueKey(_currentPage)).scale(),
              ],
            ),
          ),
          
          // Skip button
          Positioned(
            top: 60,
            right: 20,
            child: TextButton(
              onPressed: () => context.go(AppRoutes.welcome),
              child: const Text("Skip"),
            ),
          ),
        ],
      ),
    );
  }
}

class OnboardingData {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  OnboardingData({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}
