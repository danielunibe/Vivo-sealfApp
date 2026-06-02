import 'dart:ui';

import 'package:flutter/material.dart';

import 'app_colors.dart';

class GlassStyles {
  static BoxDecoration card = BoxDecoration(
    color: AppColors.surface.withOpacity(0.55),
    borderRadius: BorderRadius.circular(18),
    border: Border.all(color: Colors.white.withOpacity(0.14)),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.25),
        blurRadius: 18,
        offset: const Offset(0, 10),
      ),
    ],
  );

  static Widget blur({required Widget child}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: child,
      ),
    );
  }
}
