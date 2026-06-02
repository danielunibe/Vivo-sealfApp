# Registro de Ventas (Flutter)

App Android-first para registro rápido de ventas con comisión automática por modelo, calendario visual mensual y persistencia local con Drift/SQLite.

## Requisitos

- Flutter SDK
- Dart SDK
- Android SDK

## Ejecutar

1. `flutter pub get`
2. `dart run build_runner build --delete-conflicting-outputs`
3. `flutter analyze`
4. `flutter run`

## Build APK

- Debug: `flutter build apk --debug`
- Release: `flutter build apk --release`

## Assets de dispositivos

Coloca PNGs en `assets/devices/`:
- `y04.png`
- `y21d.png`
- `y29.png`
- `v50_lite.png`
- `v60_lite.png`

Si faltan imágenes, la UI usa placeholder visual automáticamente.

## Ajustes de comisiones

Pantalla `Ajustes`:
- editar nombre de modelo,
- editar comisión,
- activar/desactivar modelo.

Los modelos inactivos no aparecen en `Registrar`.

## Export CSV

Pantalla `Calendario`:
- `Copiar CSV ventas`
- `Copiar CSV mensual`

Exporta al portapapeles por compatibilidad sin dependencias extra.

## Limitación conocida de este entorno

En esta sesión no hay `flutter` ni `dart` instalados, así que no fue posible ejecutar validaciones (`pub get`, `build_runner`, `analyze`, `test`, `build apk`).
