# TECH_STACK.md

## Resumen tecnico

- Tipo de proyecto: app local-first para promotor de ventas Vivo.
- Framework: React 19 con Vite 6.
- Lenguaje: TypeScript.
- Package manager: npm.
- Estilos: Tailwind CSS 4 via `@tailwindcss/vite` + CSS global en `src/index.css`.
- Animaciones: `motion`.
- Persistencia: `localStorage` con backup/import/export JSON para datos ligeros; IndexedDB para imagenes de galeria y cache web pesada.
- Android: Capacitor 8 usando el proyecto `android/` existente.
- Android app id: `com.davidsanchez.vivopromotor`.
- Android versionCode: 12.
- Android versionName: `0.4.7`.
- Build web: `dist/`.
- APK debug de entrega: `dist-apk/vivo-promotor-debug.apk`.

## Comandos

| Comando | Uso | Estado |
|---|---|---|
| `npm run dev` | Dev server Vite en puerto 3000 | configurado |
| `npm run lint` | TypeScript sin emitir archivos | configurado |
| `npm run build` | Build web Vite | configurado |
| `npm run android:sync` | Sincroniza `dist/` con Capacitor Android | configurado |
| `npm run android:build` | Build web + sync + APK debug usando `scripts/android-build-debug.ps1` | confirmado |
| `npm run android:deliver` | Genera y copia APK a `dist-apk/`; si Windows bloquea el nombre fijo, crea APK versionado de fallback | confirmado |

## Restricciones

- No cambiar `applicationId` si se quiere actualizar encima de la app anterior.
- No cambiar package manager sin autorizacion.
- No borrar llaves `vivo_*` sin migracion.
- No versionar keystores ni `android/key.properties`.
- La app nueva vino de `C:\Users\danie\Downloads\vivoapp.zip`; el codigo web fuente vive en `src/`.
