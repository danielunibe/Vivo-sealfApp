# PHASE_KOTLIN_NATIVE_MIGRATION_BASE

- Fecha: 2026-06-07
- Proyecto: Vivo Promotor
- Estado: base nativa Kotlin creada en paralelo

## 1. Objetivo

Iniciar la migracion a Kotlin nativo sin perder la app validada actual. La app Next/Capacitor sigue siendo la referencia funcional y el launcher activo.

## 2. Cambios aplicados

- Se agrego Kotlin al build Android.
- Se habilito Jetpack Compose como destino UI nativo experimental.
- Se agregaron dependencias de Room y DataStore.
- Se crearon entidades Room para ventas, movimientos, dispositivos, registros manuales y estado de migracion.
- Se creo `VivoBackupJsonParser` para importar backup JSON v1 exportado por la app web.
- Se creo una prueba unitaria del parser.
- Se creo una Activity Compose experimental no launcher.
- Se registro la Activity Compose como interna/no exportada.
- Se dejo `MainActivity.kt` como entrypoint Kotlin conservando `BridgeActivity`.
- Se documento el contrato maestro en `docs/KOTLIN_NATIVE_MIGRATION_PLAN.md`.

## 3. Preservado

- `applicationId`: `com.davidsanchez.vivopromotor`
- Launcher actual Capacitor/WebView
- Comportamiento actual de `BridgeActivity`
- App Next/TypeScript
- Backup/import/export web
- Datos `vivo_*`
- Dock, long-press, catalogo, calendario, puerquito y ajustes actuales

## 4. Pendiente

- Implementar importador UI de backup en Compose.
- Implementar puente WebView para leer almacenamiento heredado instalado encima.
- Portar Shell y Dock a Compose.
- Portar pantallas por fases.
- Ejecutar QA en telefono o AVD.

## 5. Validacion esperada

```powershell
npm run lint
npm run build
npm run android:prepare
Set-Location -LiteralPath 'C:\Desarrollos DEV daniel\app vivo\android'
.\gradlew.bat testDebugUnitTest --console=plain
.\gradlew.bat assembleDebug --console=plain
```

## 6. Validacion ejecutada

| Validacion | Resultado | Nota |
|---|---|---|
| `npm run lint` | OK | App web actual intacta |
| `npm run build` | OK | Mantiene warning heredado de `app/globals.css` |
| `npm run android:prepare` | OK | Export estatico + `cap sync android` |
| `.\gradlew.bat testDebugUnitTest --console=plain` | OK | Incluye parser Kotlin de backup JSON v1 |
| `.\gradlew.bat assembleDebug --console=plain` | OK | APK debug compila con Kotlin/Compose/Room/DataStore |

## 7. Artefacto

- APK actualizada: `dist-apk/vivo-promotor-debug.apk`
- Peso aproximado: 16.19 MB
- Nota: aumento esperado por incluir Compose, Room y DataStore en la base nativa paralela.

## 8. QA pendiente

- No se ejecuto QA real en telefono/AVD durante esta fase.
- La Activity Compose experimental no reemplaza el launcher.
- La app instalada sigue abriendo la experiencia Capacitor/WebView validada.
