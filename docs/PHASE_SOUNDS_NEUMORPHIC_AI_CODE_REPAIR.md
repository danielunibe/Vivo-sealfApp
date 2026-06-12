# PHASE_SOUNDS_NEUMORPHIC_AI_CODE_REPAIR

- Fecha: 2026-06-05
- Version: 0.2.0
- Proyecto: Vivo Promotor
- Alcance: sonidos sutiles, vibracion Android, preferencias de interaccion, base neumorfica blanco/negro, version visible, reparacion de inconsistencias tipicas de codigo generado con IA y complemento de datos comerciales.

## 1. Objetivos ejecutados

- Integrar sonidos sutiles sin dependencias nuevas.
- Reparar activacion de sonido en Web Audio y agregar vibracion Android ligera.
- Agregar panel de interaccion en Ajustes.
- Establecer version visible de la app.
- Crear tokens y clases base de neumorfismo blanco hueso / negro carbon.
- Reparar duplicacion de datos comerciales de dispositivos.
- Reducir riesgos tipicos de codigo generado por IA.

## 2. Sonidos sutiles

Archivo central:

- `lib/nativeFeedback.ts`

Preferencias:

- `vivo_sounds_enabled`
- `vivo_haptics_enabled`
- `vivo_reduced_motion`
- `vivo_feedback_intensity`
- `vivo_intro_enabled`

Implementacion:

- Web Audio API.
- Sin archivos de audio pesados.
- Sin autoplay al iniciar.
- `AudioContext.resume()` dentro de gesto de usuario para evitar bloqueo de WebView/navegador.
- Vibracion ligera con `navigator.vibrate`.
- Sonidos breves para navegacion, seleccion, warning, success y venta.
- Throttle minimo para evitar spam sonoro.
- Fallo silencioso si el navegador/WebView no permite audio.

## 3. Ajustes nuevos

Archivo:

- `components/settings/InteractionSettings.tsx`

Incluye:

- Sonidos sutiles on/off.
- Vibracion Android on/off.
- Reducir animaciones.
- Intro de marca on/off.
- Intensidad: suave, normal, fuerte.
- Boton `Probar sonido`.
- Version visible: `Vivo Promotor v0.2.0`.
- Canal: `debug-android`.

## 4. Sistema neumorfico base

Archivo:

- `app/globals.css`

Tokens:

- `--neo-bg`
- `--neo-surface`
- `--neo-surface-soft`
- `--neo-text`
- `--neo-muted`
- `--neo-accent`
- `--neo-shadow-raised`
- `--neo-shadow-soft`
- `--neo-shadow-pressed`
- `--neo-shadow-inset`

Clases:

- `neo-app`
- `neo-section`
- `neo-card`
- `neo-card-soft`
- `neo-button`
- `neo-button-primary`
- `neo-button-pressed`
- `neo-inset`
- `neo-dock`
- `neo-toggle`
- `neo-toggle-on`
- `neo-nav-icon`
- `neo-input`

Modo claro:

- Blanco hueso / superficie suave.

Modo oscuro:

- Negro carbon / superficie profunda.

## 5. Fallas tipicas de programar con IA detectadas y reparadas

| Falla | Evidencia | Reparacion |
|---|---|---|
| Versiones contradictorias | `package.json` 0.1.0, Android 1.0, notificacion v3.0.0 | Unificado a 0.2.0 y `APP_VERSION_NAME` |
| Datos duplicados de dispositivos | `INITIAL_DEVICES.knowledge` tenia claims viejos frente a `deviceKnowledge.ts` | Se retiro knowledge duplicado de defaults y se deja `deviceKnowledge.ts` como fuente comercial |
| Herramientas demo expuestas | `window.demoTools` se montaba siempre | Solo se expone en desarrollo |
| Feedback sensorial sin control | No habia preferencias de sonido/interaccion | Nuevo panel de Interaccion |
| Sonido no disparaba en WebView | `AudioContext` podia quedar suspendido | `resume()` asincrono en gesto y boton de prueba que activa sonido |
| Feedback poco nativo | Solo habia audio web | Permiso `VIBRATE` y vibracion tactil ligera |
| Estilo premium disperso | Sombras/cards sin tokens centrales | Tokens neumorficos globales |
| Animaciones sin preferencia | Puerquito solo leia Android/prefers-reduced-motion | Ahora respeta `vivo_reduced_motion` |
| Intro siempre forzada | No habia preferencia visible | `vivo_intro_enabled` permite apagarla |

## 6. Informacion de dispositivos complementada

Fuentes verificadas:

- Y04 Mexico: vivo Mexico confirma 5150 mAh, 44W, IP64, SGS y beneficios posventa.
- Y29 4G: fuente oficial regional confirma 6500 mAh, Snapdragon 685, 44W y AI Erase.
- V60 Lite Panama: vivo Panama confirma Snapdragon 6s Gen 2 4G, Android 15/Funtouch OS 15, 6500 mAh, 90W e IP65.

Cambios:

- Y04 suma argumento posventa y SGS.
- Y29 suma AI Erase como argumento practico.
- V60 Lite suma Android 15/Funtouch OS 15 como argumento de vigencia.
- Se mantiene la regla: no vender Y29 ni V60 Lite como 5G sin variante confirmada.

## 7. Validacion

- `npm run lint`: OK.
- `npm run build`: OK con warning heredado de Tailwind/PostCSS/Next.
- `npm run android:prepare`: OK con export estatico y `cap sync android`.
- `.\gradlew.bat assembleDebug --console=plain`: OK.
- `.\gradlew.bat testDebugUnitTest lintDebug --console=plain`: OK.

APK generada:

- Ruta: `dist-apk/vivo-promotor-debug.apk`.
- Peso: 8.45 MB.
- Ultima generacion confirmada: 2026-06-06 00:23:54.
- Version Android: `versionCode 2`, `versionName 0.2.0`.

Pendiente:

- QA Android real con dispositivo/AVD, porque `adb devices` no lista dispositivos.
