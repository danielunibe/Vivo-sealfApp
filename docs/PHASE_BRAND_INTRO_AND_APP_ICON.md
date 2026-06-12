# PHASE_BRAND_INTRO_AND_APP_ICON

- Fecha: 2026-06-05
- Proyecto: Vivo Promotor
- Alcance: integrar video de marca como intro visual y convertir imagen JPEG del usuario en icono squircle para web/Android.

## 1. Assets de entrada

| Asset original | Uso |
|---|---|
| `C:\Users\danie\Downloads\Logo_animation_Vivo_By_David_202606052214.mp4` | Intro visual de la app |
| `C:\Users\danie\Downloads\ChatGPT_Image_5_jun_2026,_202606052215.jpeg` | Icono squircle de la app |

## 2. Assets generados

| Archivo | Uso |
|---|---|
| `public/brand/vivo-logo-animation.mp4` | video original copiado para compatibilidad |
| `public/brand/vivo-logo-animation.webm` | version WebM comprimida, sin audio |
| `public/brand/vivo-app-icon-squircle.png` | icono de marca principal |
| `public/icon.png` | icono web/metadata |
| `public/apple-icon.png` | icono Apple/web |
| `android/app/src/main/res/mipmap-*/ic_launcher*.png` | iconos Android por densidad |

## 3. Implementacion

- `components/IntroSplash.tsx` muestra la animacion al iniciar la app.
- El overlay se cierra al terminar el video, al tocarlo o al presionar Enter/Espacio.
- `components/AppShell.tsx` monta la intro dentro del shell principal.
- `app/layout.tsx` registra `public/icon.png` y `public/apple-icon.png` en metadata.
- `scripts/generate-brand-assets.mjs` permite regenerar el icono squircle desde el JPEG original.

## 4. Decisiones

- Se conserva MP4 porque pesa menos de 1 MB y es compatible.
- Se agrega WebM comprimido como primera fuente del `<video>`.
- El sonido del MP4 no se usa en la intro; el video se reproduce `muted` para evitar autoplay bloqueado y no molestar al usuario.
- El icono se recorta con mascara squircle real y se exporta a las densidades Android necesarias.

## 5. Validacion pendiente

| Validacion | Resultado |
|---|---|
| `npm run lint` | OK |
| `npm run build` | OK con warning CSS heredado |
| `npm run android:prepare` | OK |
| `.\gradlew.bat assembleDebug --console=plain` | OK |
| `.\gradlew.bat testDebugUnitTest lintDebug --console=plain` | OK |

## 6. Entrega Android

- APK final: `dist-apk/vivo-promotor-debug.apk`.
- Peso: 12.32 MB.
- Generacion confirmada: 2026-06-05 22:31:11.
- QA Android real: pendiente porque `adb devices` no lista dispositivos conectados.
