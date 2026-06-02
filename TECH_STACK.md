# TECH_STACK.md

## Resumen técnico

- Framework: Flutter
- Lenguaje: Dart
- Estado: Riverpod
- Persistencia: Drift + SQLite
- UI: Material 3 custom dark + glass

## Comandos

| Comando | Uso | Estado en este entorno |
|---|---|---|
| `flutter pub get` | dependencias | falló: `flutter` no instalado |
| `dart run build_runner build --delete-conflicting-outputs` | generar Drift | falló: `dart` no instalado |
| `flutter analyze` | análisis | falló: `flutter` no instalado |
| `flutter test` | pruebas | falló: `flutter` no instalado |
| `flutter build apk --debug` | apk debug | falló: `flutter` no instalado |

## Restricciones

- Mantener navegación: `Calendario | Registrar | Ajustes`.
- Mantener snapshots históricos de ventas.
- Sin dependencias nuevas sin autorización.
