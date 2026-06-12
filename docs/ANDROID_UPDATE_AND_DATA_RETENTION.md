# ANDROID_UPDATE_AND_DATA_RETENTION

## Como se conservan datos

Android conserva datos locales cuando una APK nueva se instala encima de la anterior y mantiene:

- mismo `applicationId`;
- misma firma/keystore compatible;
- mismas llaves de almacenamiento o migraciones idempotentes;
- instalacion como actualizacion, no desinstalacion.

## Que borra datos

- Desinstalar la app.
- Cambiar `applicationId`.
- Firmar con otra keystore al distribuir fuera de Play Store.
- Borrar o renombrar llaves `vivo_*` sin migracion.
- Usar `localStorage.clear()`.

## Regla para actualizar manualmente

1. Exportar respaldo JSON desde Ajustes > Respaldo.
2. Generar APK nueva con el mismo `applicationId`.
3. Firmar con la misma keystore.
4. Instalar encima.
5. Abrir la app y validar ventas, calendario, puerquito, catalogo y ajustes.

## Checklist de prueba Android

- Build web y sync: `npm run android:prepare`.
- APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`.
- Build nativo: `cd android && .\gradlew.bat assembleDebug --console=plain`.
- Pruebas nativas sin dispositivo: `cd android && .\gradlew.bat testDebugUnitTest lintDebug --console=plain`.
- Prueba en dispositivo/emulador: requiere `adb devices` con al menos un device en estado `device`.

## Restauracion

Si se pierde la instalacion o se cambia de telefono, importar el respaldo JSON desde Ajustes > Respaldo.

## No cambiar sin permiso

- `com.davidsanchez.vivopromotor`
- keystore de release
- llaves `vivo_*`
- schema sin migracion
