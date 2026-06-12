# KOTLIN_NATIVE_MIGRATION_PLAN

- Fecha: 2026-06-07
- Proyecto: Vivo Promotor
- Estado: fase base iniciada; la app Next/Capacitor sigue siendo fuente funcional validada

## 1. Regla principal

La migracion nativa a Kotlin no reemplaza la app actual hasta alcanzar paridad funcional y QA real. No se elimina Next, Capacitor, backup/import/export, ni los datos `vivo_*` durante esta fase.

## 2. Stack destino

- Kotlin
- Jetpack Compose
- Room para datos criticos: ventas, movimientos, dispositivos y registros manuales de calendario
- DataStore Preferences para tema, perfil, metas, preferencias de interaccion y marca `native_migration_done`
- Backup JSON v1 actual como formato canonico de intercambio entre web y nativo

## 3. Estado aplicado en esta fase

- Se agrego soporte Kotlin/Compose al modulo Android.
- Se creo una base nativa paralela bajo `android/app/src/main/kotlin/com/davidsanchez/vivopromotor/nativeapp/`.
- Se crearon entidades Room equivalentes para `Device`, `Sale`, `Movement`, registros manuales y estado de migracion.
- Se creo `VivoBackupJsonParser` para leer respaldos JSON v1 de la app web.
- Se agrego una prueba unitaria del parser de backup.
- Se creo `NativeMigrationPreviewActivity` como vista Compose experimental no launcher.
- Se convirtio el entrypoint Android a `MainActivity.kt` en Kotlin conservando `BridgeActivity`.
- Validacion actual: `npm run lint`, `npm run build`, `npm run android:prepare`, `testDebugUnitTest` y `assembleDebug` pasan.
- Artefacto actualizado: `dist-apk/vivo-promotor-debug.apk`.

## 4. Contrato de datos preservado

| Web actual | Kotlin destino | Estado |
|---|---|---|
| `vivo_real_sales` | `sales` Room | modelado |
| `vivo_real_movements` | `movements` Room | modelado |
| `vivo_devices` | `devices` Room | modelado |
| `vivo_manual_day_records` | `manual_day_records` Room | modelado |
| `vivo_piggy_goals` | DataStore `vivo_piggy_goals_*` | modelado |
| `vivo_theme` | DataStore `vivo_theme` | modelado |
| `vivo_userName` / `vivo_userStore` | DataStore perfil | modelado |
| `vivo_sounds_enabled` | DataStore | modelado |
| `vivo_haptics_enabled` | DataStore | modelado |
| `vivo_reduced_motion` | DataStore | modelado |

## 5. Orden de port

1. Shell Compose, dock y tema.
2. Registrar venta con long-press y feedback nativo.
3. Calendario y metas por unidades.
4. Puerquito con acumulados.
5. Catalogo y ficha comercial.
6. Ajustes, dispositivos, historial y backup.

## 6. No tocar sin permiso

- `applicationId`: `com.davidsanchez.vivopromotor`
- Orden del dock.
- Comisiones y ventas historicas.
- Flujo de long-press.
- Backup/import/export JSON.
- `ProductImageFrame` y `SafeImage` mientras la UI web siga activa.
- App Next/Capacitor y comportamiento `BridgeActivity` hasta que Kotlin pase QA completa.

## 7. Validacion requerida

```powershell
npm run lint
npm run build
npm run android:prepare
Set-Location -LiteralPath 'C:\Desarrollos DEV daniel\app vivo\android'
.\gradlew.bat testDebugUnitTest --console=plain
.\gradlew.bat assembleDebug --console=plain
```

## 8. Criterio para reemplazar WebView

Kotlin solo puede convertirse en launcher principal cuando:

- el backup JSON web restaura en Kotlin;
- ventas, movimientos, dispositivos, metas, tema y perfil sobreviven;
- las 5 secciones existen en Compose;
- el long-press sigue protegido;
- el APK se instala encima sin desinstalar;
- hay QA real en telefono o AVD con evidencia.
