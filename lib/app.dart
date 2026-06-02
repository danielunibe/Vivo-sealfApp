import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/navigation/main_shell.dart';

class RegistroVentasApp extends StatelessWidget {
  const RegistroVentasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Registro de Ventas',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainShell(),
    );
  }
}
