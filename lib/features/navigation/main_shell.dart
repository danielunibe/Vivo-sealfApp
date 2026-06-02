import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../calendar/presentation/calendar_screen.dart';
import '../register/presentation/register_screen.dart';
import '../settings/presentation/settings_screen.dart';
import 'navigation_controller.dart';

class MainShell extends ConsumerWidget {
  const MainShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final idx = ref.watch(navigationIndexProvider);
    final screens = const [CalendarScreen(), RegisterScreen(), SettingsScreen()];

    return Scaffold(
      body: screens[idx],
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surface.withOpacity(0.9),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: Colors.white24),
          ),
          child: NavigationBar(
            selectedIndex: idx,
            backgroundColor: Colors.transparent,
            indicatorColor: AppColors.accentStrong.withOpacity(0.25),
            onDestinationSelected: (v) => ref.read(navigationIndexProvider.notifier).state = v,
            destinations: const [
              NavigationDestination(icon: Icon(Icons.calendar_month), label: 'Calendario'),
              NavigationDestination(icon: Icon(Icons.point_of_sale), label: 'Registrar'),
              NavigationDestination(icon: Icon(Icons.settings), label: 'Ajustes'),
            ],
          ),
        ),
      ),
    );
  }
}
