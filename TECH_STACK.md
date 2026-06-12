# TECH_STACK.md

## 1. Resumen tecnico

- Tipo de proyecto: app local-first para promotor de ventas.
- Framework: Next.js 15.0.3 con App Router.
- Lenguaje: TypeScript 6.0.3.
- Runtime: navegador; Android WebView via Capacitor para APK.
- Package manager: npm.
- Estilos: Tailwind CSS v4 beta + `app/globals.css`.
- Animaciones: `motion`.
- 3D: `three`.
- Persistencia: `localStorage` + `IndexedDB` espejo para datos criticos.
- Mobile packaging: Capacitor 8 (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`).
- Native migration target: Kotlin + Jetpack Compose dentro de `android/`, aun paralelo a la app Capacitor.
- Native storage target: Room + DataStore, con backup JSON v1 como puente de migracion.
- Build web normal: `output: 'standalone'`.
- Build Android: `CAPACITOR_BUILD=true` activa `output: 'export'` y `webDir: out`.
- Sonidos UI: Web Audio API, sin dependencias ni assets de audio.
- Haptics Android: `navigator.vibrate` via WebView con permiso `android.permission.VIBRATE`.
- Version actual: `0.3.0`.

## 2. Comandos del proyecto

| Comando | Uso | Estado |
|---|---|---|
| `npm run dev` | Desarrollo local en `localhost:3000` | confirmado |
| `npm run lint` | ESLint de carpetas fuente (`app`, `components`, `hooks`, `lib`, `types`, `scripts`) | confirmado |
| `npm run build` | Build web normal | confirmado |
| `npm run android:build:web` | Export estatico para Capacitor | confirmado |
| `npm run android:prepare` | lint + export + `cap sync android` | confirmado |
| `npm run android:device-qa` | Instala/lanza APK con ADB y guarda evidencia si hay dispositivo | pendiente de device/AVD |
| `cd android && .\gradlew.bat assembleDebug --console=plain` | APK debug | confirmado con JDK de Android Studio |
| `cd android && .\gradlew.bat testDebugUnitTest lintDebug --console=plain` | Tests unitarios Android + Android lint | confirmado |

## 3. Restricciones tecnicas

- No cambiar package manager.
- No migrar a Flutter, React Native, backend o nube.
- No reemplazar el launcher WebView por Compose hasta tener paridad funcional y QA Android real.
- No cambiar `applicationId` Android: `com.davidsanchez.vivopromotor`.
- No renombrar llaves `vivo_*` sin migracion.
- No versionar keystores ni `android/key.properties`.
- Mantener sonidos y vibracion como feedback sutil configurable desde Ajustes > Interaccion.

## 4. Notas Android confirmadas

- `JAVA_HOME`: `C:\Program Files\Android\Android Studio\jbr`.
- `ANDROID_HOME`: `%LOCALAPPDATA%\Android\Sdk`.
- APK debug de entrega: `dist-apk/vivo-promotor-debug.apk`.
- La instalacion real requiere telefono conectado por ADB o AVD creado.
- Android `versionCode`: 3.
- Android `versionName`: `0.3.0`.
- Android Manifest: `hardwareAccelerated=true` y permiso `VIBRATE` para feedback tactil.
- Android launcher: `MainActivity.kt` en Kotlin extendiendo `BridgeActivity`.

## 5. Kotlin native migration

- Base creada en `android/app/src/main/kotlin/com/davidsanchez/vivopromotor/nativeapp/`.
- Compose se usa como destino UI nativo experimental, no como experiencia launcher principal todavia.
- Room modela ventas, movimientos, dispositivos, registros manuales y estado de migracion.
- DataStore modela tema, perfil, metas y preferencias de interaccion.
- `VivoBackupJsonParser` lee backup JSON v1 exportado por la app web para migracion segura.
- `Movement.effectiveDate` es opcional y conserva compatibilidad con backup JSON v1.
- Room usa esquema 2 con migracion no destructiva para `effectiveDate`.
