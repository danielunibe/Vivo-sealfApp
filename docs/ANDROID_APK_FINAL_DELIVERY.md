# ANDROID_APK_FINAL_DELIVERY

## Estado

La nueva base de app viene de `C:\Users\danie\Downloads\vivoapp.zip` y se empaqueta con Capacitor Android para actualizar la app previa.

## Identidad Android

- `applicationId`: `com.davidsanchez.vivopromotor`
- `versionCode`: 9
- `versionName`: `0.4.4`
- Web build: `dist/`
- APK raw: `android/app/build/outputs/apk/debug/app-debug.apk`
- APK para enviar: `dist-apk/vivo-promotor-debug.apk`

## Comando de entrega

```powershell
npm run android:deliver
```

Si Windows tiene abierto `dist-apk/vivo-promotor-debug.apk`, el script genera un APK alternativo versionado en la misma carpeta.

## Correccion 0.4.3

- Se endurecio `MainActivity.kt` para evitar cierres por fullscreen agresivo en capas OEM como ColorOS/Oppo.
- Se retiro `FLAG_LAYOUT_NO_LIMITS`.
- Se usa `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` en lugar de `ALWAYS`.
- La configuracion fullscreen ahora falla suave y queda registrada en log sin cerrar la app.

## Correccion 0.4.4

- Se agrego fallback HTML visible antes de que React cargue para evitar pantalla negra vacia.
- Se agrego error boundary de React con recuperacion.
- Se protegieron migraciones y normalizacion de modelos/variantes heredados para que storage mal formado no rompa el arranque.
- Registro muestra un estado de recuperacion si no encuentra catalogo activo en vez de devolver `null`.

## Condicion para actualizar encima

La APK debe instalarse sobre la anterior solo si mantiene el mismo `applicationId` y la misma firma. Para la APK debug, eso depende de conservar la misma debug keystore de esta maquina.
