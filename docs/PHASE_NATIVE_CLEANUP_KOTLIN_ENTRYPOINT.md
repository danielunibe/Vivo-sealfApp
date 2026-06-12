# PHASE_NATIVE_CLEANUP_KOTLIN_ENTRYPOINT

- Fecha: 2026-06-07
- Proyecto: Vivo Promotor
- Estado: limpieza nativa segura aplicada

## 1. Objetivo

Hacer el proyecto Android lo mas nativo posible sin perder la app validada, los datos ni la ruta de actualizacion.

## 2. Cambios aplicados

- `MainActivity` paso de Java a Kotlin.
- El launcher conserva `BridgeActivity`, por lo que sigue abriendo la experiencia Capacitor/WebView validada.
- `NativeMigrationPreviewActivity` quedo registrada en el Manifest como Activity interna no exportada.
- La capa Compose sigue disponible como laboratorio nativo, no como reemplazo del producto completo.

## 3. Preservado

- `applicationId`: `com.davidsanchez.vivopromotor`
- Firma/identidad Android
- Datos locales `vivo_*`
- Backup/import/export
- Orden del dock
- Long-press de registro
- App Next/Capacitor como fuente funcional hasta paridad Kotlin

## 4. Por que no se borra WebView todavia

La app Kotlin aun no tiene paridad funcional de las 5 secciones. Borrar Capacitor o convertir Compose en launcher principal ahora haria perder flujo de ventas, calendario, catalogo, puerquito, ajustes y backup.

## 5. Siguiente fase recomendada

Portar el shell nativo en Compose con dock real y lectura de DataStore/Room, manteniendo una accion de retorno a la app actual hasta que Registrar Venta y Backup esten listos.

## 6. Validacion ejecutada

| Validacion | Resultado | Nota |
|---|---|---|
| `.\gradlew.bat testDebugUnitTest --console=plain` | OK | Parser backup Kotlin y compilacion de test |
| `.\gradlew.bat assembleDebug --console=plain` | OK | APK compila con launcher Kotlin + BridgeActivity |

## 7. Artefacto

- APK actualizada: `dist-apk/vivo-promotor-debug.apk`
- Peso aproximado: 16.85 MB
- QA real en telefono/AVD: pendiente.
