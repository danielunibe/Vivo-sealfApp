# PRODUCT_IMPROVEMENT_OPPORTUNITY_AUDIT

- Fecha: 2026-06-05
- Proyecto: Vivo Promotor
- Motivo: evaluar que conviene sumar o mejorar sobre el estado actual.
- Modo: auditoria y recomendacion; no se implementaron cambios funcionales.

## 1. Resumen ejecutivo

La app ya tiene una base fuerte: ventas, calendario, catalogo, puerquito, ajustes, backup local, APK debug, assets optimizados, intro de marca e icono Android. Lo siguiente que conviene sumar no es mas decoracion aislada, sino tres capas:

1. Experiencia nativa Android: haptics, sonido opcional, preferencias de interaccion y splash/preboot mas controlado.
2. Seguridad operativa: flujo de venta menos propenso a errores, venta en otra fecha, legal/acerca de y proteccion visible de datos.
3. Mantenibilidad: separar monolitos, tipar datos criticos y cerrar codigo muerto sin tocar zonas protegidas.

## 2. Estado confirmado

| Area | Estado |
|---|---|
| Stack | Next.js 15 + React 19 RC + Tailwind v4 + Capacitor Android |
| APK debug | `dist-apk/vivo-promotor-debug.apk` |
| Performance inicial | First Load JS ~170 KB |
| Assets de producto | WebP optimizados |
| Intro de marca | WebM + MP4 |
| Icono app | Squircle web + Android mipmaps |
| Validacion actual | `npm run lint` OK |
| QA Android real | pendiente; no hay dispositivo/AVD conectado |

## 3. Prioridades recomendadas

### P1 - Feedback nativo configurable

Que sumar:

- Haptics en navegacion, seleccion de modelo, confirmacion de venta, toggles y acciones importantes.
- Sonidos muy sutiles y configurables desde Ajustes.
- Ajustes de interaccion: haptics on/off, sonidos on/off, reducir animaciones, intensidad.

Por que conviene:

- Es la mejora con mayor sensacion de app nativa Android sin redisenar la estructura.
- Ayuda a que vender, cambiar tabs y confirmar acciones se sienta fisico.

Archivos probables:

- `lib/nativeFeedback.ts`
- `components/SectionIconGrid.tsx`
- `components/sections/RegisterSaleSection.tsx`
- `components/SettingsView.tsx`
- `components/settings/InteractionSettings.tsx`

Riesgo:

- Medio si se instala `@capacitor/haptics`; requiere permiso explicito si se va a agregar dependencia.
- Bajo si se implementa primero con Web APIs/fallback sin plugin.

### P1 - Nuevo flujo de venta segura

Que sumar:

- Boton claro de `Confirmar venta`.
- Pantalla/bottom-sheet final con resumen: modelo, color, comision, fecha.
- Boton final `Agregar venta`.
- Opcion `Venta en otra fecha`.

Por que conviene:

- El long-press actual esta protegido y funciona, pero para usuarios reales puede sentirse poco obvio.
- Permite corregir ventas atrasadas sin manipular calendario manualmente.

Regla:

- No eliminar el long-press sin autorizacion; puede quedar como gesto premium/secundario.

Archivos probables:

- `components/sections/RegisterSaleSection.tsx`
- `components/sales/SaleConfirmButton.tsx`
- `components/sales/SaleConfirmationSheet.tsx`
- `components/AppShell.tsx`
- `types/sale.ts`

Riesgo:

- Medio/alto porque toca registro, calendario, puerquito e historial. Debe implementarse con pruebas.

### P1 - Legal / Acerca de / Datos locales

Que sumar:

- Nueva pestaña en Ajustes: `Legal` o `Acerca de`.
- Explicacion simple: app local, datos guardados en el dispositivo, importancia de backup, APK debug/no release formal.
- Version, fecha de build y ruta de respaldo.

Por que conviene:

- La app ya maneja datos de ventas y respaldo; hace falta transparencia visible para el usuario final.
- Reduce confusion si se instala por WhatsApp o fuera de Play Store.

Archivos probables:

- `components/SettingsView.tsx`
- `components/settings/LegalSettings.tsx`
- `docs/ANDROID_UPDATE_AND_DATA_RETENTION.md`

Riesgo:

- Bajo.

### P2 - Splash/preboot por tema y control de intro

Que sumar:

- Preferencia para mostrar/no mostrar intro.
- Intro solo en primer arranque del dia o primer arranque tras instalacion, no necesariamente cada apertura.
- Preboot de color inmediato segun `vivo_theme` para evitar flash blanco en tema oscuro.

Por que conviene:

- La intro de marca ya existe, pero en uso diario 6 segundos puede sentirse larga.
- Controlar la frecuencia mantiene branding sin castigar velocidad.

Archivos probables:

- `components/IntroSplash.tsx`
- `components/hooks/useAppShellState.ts`
- `app/layout.tsx`
- `app/globals.css`

Riesgo:

- Bajo/medio. Hay que evitar bloquear la app.

### P2 - Modo rendimiento visible

Que sumar:

- Toggle `Reducir animaciones / modo rendimiento`.
- Aplicarlo a dock, transiciones, fondo de registro, Puerquito 3D, intro y animaciones repetitivas.

Por que conviene:

- Ya hay low-power en `SavingsJar`, pero no hay control visible para el usuario.
- El usuario reporto lentitud en dispositivo; esto da salida directa sin quitar diseño premium a todos.

Archivos probables:

- `components/settings/InteractionSettings.tsx`
- `components/piggybank/SavingsJar.tsx`
- `components/SectionIconGrid.tsx`
- `components/sections/RegisterSaleSection.tsx`

Riesgo:

- Medio por cantidad de superficies visuales, bajo si se hace por fases.

### P2 - QA Android real y matriz de instalacion

Que sumar:

- Checklist ejecutable cuando haya telefono: install, launch, logcat, persistencia, backup, actualizar encima.
- Script `scripts/android-device-qa.ps1` para instalar/lanzar/capturar logs si ADB detecta equipo.
- Registro de evidencia en docs.

Por que conviene:

- El APK compila, pero la prueba real sigue pendiente.
- Sin esta fase no se puede afirmar fluidez real, haptics, splash ni persistencia en Android fisico.

Riesgo:

- Bajo. Depende de dispositivo/AVD.

### P2 - Release firmada

Que sumar:

- Ruta formal de release: keystore, `android/key.properties`, signingConfig release y guia de conservacion.
- Generar `vivo-promotor-release.apk` o AAB cuando se autorice.

Por que conviene:

- El debug APK sirve para test, pero no para distribucion estable.
- La misma firma es critica para actualizar encima sin perder continuidad.

Riesgo:

- Alto si se maneja mal la keystore. Requiere autorizacion y resguardo.

### P3 - Separar monolitos

Que mejorar:

- `components/settings/DeviceManagerSettings.tsx` es el archivo mas grande.
- `components/ui/TactileIcons.tsx` concentra 5 iconos complejos.
- `components/AppShell.tsx` todavia mezcla shell, venta, CSS global, overlays y derivaciones.

Propuesta:

- Extraer `DeviceEditorForm`, `DeviceListItem`, `ColorEditor`, `ImageUploadPreview`.
- Separar cada icono tactil a su archivo, sin cambiar el orden ni el comportamiento del dock.
- Extraer `useSalesRegistration` desde `AppShell`.
- Mover CSS global inline de `AppShell` a `app/globals.css`.

Riesgo:

- Medio/alto por zonas protegidas. Hacer en microfases con build/lint en cada paso.

### P3 - Tipos criticos y limpieza de codigo muerto

Que mejorar:

- `lib/storage.ts` y calendario aun usan `any` para metas/horarios.
- `components/ChatView.tsx`, `components/catalog/CatalogHeader.tsx`, `components/piggybank/PiggyBankVisual.tsx`, `components/settings/DeviceCommissions.tsx` parecen desconectados o de fases previas.

Propuesta:

- Crear tipos `PiggyGoals`, `WorkScheduleDay`, `GeneratedStar`.
- Hacer una fase solo de confirmacion de imports antes de eliminar.
- No borrar `calendarStatus.ts` sin revisar docs porque aparece documentado como parte de criterios de calendario.

Riesgo:

- Bajo si se hace como auditoria + retirada gradual; medio si se borra en lote.

## 4. Lo que NO recomiendo sumar ahora

- Redisenar toda la app antes de probarla en Android real.
- Agregar backend/nube/autenticacion.
- Cambiar framework o migrar a Flutter/React Native.
- Meter muchas animaciones nuevas.
- Activar sonido por defecto.
- Eliminar Three.js del Puerquito sin decision visual explicita.
- Cambiar el dock o su orden.

## 5. Orden recomendado de ejecucion

1. `Native Feedback & Interaction Settings`
   - haptics/fallback, sonidos off por defecto, reducir animaciones.
2. `Sales Confirmation & Past-Date Sale`
   - confirmacion clara y venta en otra fecha.
3. `Legal/About & Data Safety`
   - seccion legal/acerca de y explicacion de datos locales.
4. `Android Real Device QA`
   - instalar, abrir, logcat, persistencia, screenshot.
5. `Release Signing`
   - solo cuando se vaya a distribuir estable.
6. `Monolith Split & Dead Code Cleanup`
   - despues de tener pruebas suficientes.

## 6. Validacion ejecutada

- `npm run lint`: OK.

## 7. Criterio de avance

La siguiente fase deberia ser pequena pero visible: feedback nativo configurable + modo rendimiento + control de intro. Es el mejor balance entre sensacion de app nativa, mejora percibida y bajo riesgo sobre ventas/datos.
