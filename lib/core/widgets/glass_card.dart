import 'package:flutter/material.dart';

import '../theme/glass_styles.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({super.key, required this.child, this.padding = const EdgeInsets.all(16)});
  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return GlassStyles.blur(
      child: Container(
        decoration: GlassStyles.card,
        padding: padding,
        child: child,
      ),
    );
  }
}
