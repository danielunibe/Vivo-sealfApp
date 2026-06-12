# ANDROID_APK_CONVERSION_PLAN

- Fecha: 2026-06-05
- Estado: preparado con Capacitor; APK debug generada; QA en emulador bloqueada por falta de dispositivo/AVD

## Estrategia

Next.js web app actual -> export estatico `out/` -> Capacitor Android -> APK/AAB.

Se eligio Capacitor porque permite empaquetar la app web existente sin migrar a Flutter o React Native y mantiene una ruta futura para plugins nativos.

## Configuracion aplicada

- Dependencias agregadas: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
- Configuracion: `capacitor.config.ts`.
- App name: `Vivo Promotor`.
- App ID: `com.davidsanchez.vivopromotor`.
- Web dir: `out`.
- Plataforma Android creada en `android/`.

## Build web

- `npm run build` mantiene `output: 'standalone'`.
- `npm run android:build:web` ejecuta Next con `CAPACITOR_BUILD=true`.
- En modo Android, `next.config.ts` usa `output: 'export'`, `trailingSlash: true` e imagenes `unoptimized`.

## Scripts

- `npm run android:build:web`
- `npm run android:sync`
- `npm run android:copy`
- `npm run android:open`
- `npm run android:run`
- `npm run android:prepare`

## Persistencia y actualizaciones

- La app conserva `localStorage` + `IndexedDB`.
- Se agrego `vivo_schema_version` y `lib/migrations.ts`.
- No se borran datos en migraciones.
- No se usa `localStorage.clear()`.
- Para actualizar sin perder datos se debe instalar encima, con mismo `applicationId` y misma firma.

## APK debug

Comando previsto:

```powershell
Set-Location -LiteralPath 'C:\Desarrollos DEV daniel\app vivo\android'
.\gradlew.bat assembleDebug
```

Resultado actual: OK usando el JDK incluido en Android Studio:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"
.\gradlew.bat assembleDebug --console=plain
```

APK generada:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## QA Android ejecutada

- `npm run android:prepare`: OK.
- `.\gradlew.bat clean --console=plain`: OK.
- `.\gradlew.bat assembleDebug --console=plain`: OK.
- `.\gradlew.bat testDebugUnitTest lintDebug --console=plain`: OK.
- APK copiada a `dist-apk/vivo-promotor-debug.apk`.
- `adb devices`: OK, pero no hay dispositivos conectados.
- `emulator -list-avds`: OK, sin AVDs disponibles.
- Revision de SDK: hay plataformas Android instaladas, pero no hay system-images ni `avdmanager` disponible para crear emulador temporal sin instalar componentes.

## QA Android pendiente

Bloqueada hasta conectar un telefono con depuracion USB o crear un AVD desde Android Studio:

1. Instalar `app-debug.apk`.
2. Lanzar `com.davidsanchez.vivopromotor`.
3. Capturar screenshot.
4. Revisar logcat.
5. Validar Registrar, Calendario, Catálogo, Puerquito, Ajustes y Backup.

## Release

- Crear keystore fuera del repo.
- No versionar `.jks`, `.keystore` ni `android/key.properties`.
- Incrementar `versionCode` y `versionName` en futuras releases.
- Firmar siempre con la misma keystore para instalar actualizaciones encima.
