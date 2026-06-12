# CURRENT_STATE_FULL_AUDIT

- Fecha: 2026-06-05
- Proyecto: Vivo Promotor
- Ruta: `C:\Desarrollos DEV daniel\app vivo`
- Fuente de verdad usada: código actual del repositorio y build real

## Actualización 2026-06-05

- Se ejecutó una matriz responsive real en `360x740`, `375x812`, `390x844`, `412x915` y `430x932`.
- No se detectó overflow horizontal en la pasada realizada.
- Se aplicaron ajustes pequeños para aprovechar mejor la altura en Calendario, Puerquito y Perfil de Ajustes.
- El warning de `app/globals.css` quedó mejor acotado: ya no arrastra dotfiles del root, pero sigue presente como ruido de tooling de `Tailwind v4 beta + @tailwindcss/postcss + Next 15`.
- `npm run lint`: OK.
- `npm run build`: OK con el warning heredado ya documentado.

## Actualización 2026-06-05 - Catálogo, calendario y Android

- Catálogo: se creó `lib/deviceKnowledge.ts` como fuente comercial para cards y ficha.
- Catálogo: Y29 queda tratado como Y29 4G Mexico; no debe mostrarse como 5G sin confirmar variante.
- Catálogo: Y04 Mexico queda documentado con 5150 mAh segun vivo Mexico; 5500 mAh queda como variante regional.
- Calendario: los estados de meta ahora se calculan por unidades vendidas contra `dailyDeviceGoal`.
- Ajustes > Dispositivos: se reforzó altura de filas y padding inferior para reducir clipping frente al dock.
- Android: Capacitor 8 quedó instalado/configurado con `appId` `com.davidsanchez.vivopromotor` y plataforma `android/` generada.
- Android: `npm run android:prepare` pasa.
- APK debug: generada en `android/app/build/outputs/apk/debug/app-debug.apk`.
- Android QA sin emulador: `testDebugUnitTest` y `lintDebug` pasan.
- Android QA en emulador/dispositivo: pendiente; `adb devices` no lista dispositivos y no hay AVDs creados.

## Actualización 2026-06-05 - Entrega APK debug

- Rebuild limpio Android ejecutado: `gradlew clean`, `assembleDebug`, `testDebugUnitTest` y `lintDebug`.
- APK copiada a `dist-apk/vivo-promotor-debug.apk`.
- Guia WhatsApp creada en `docs/ANDROID_WHATSAPP_INSTALL_GUIDE.md`.
- Reporte final de entrega creado en `docs/ANDROID_APK_FINAL_DELIVERY.md`.
- Release firmada queda pendiente: no existe `android/key.properties`, `.jks`, `.keystore` ni `signingConfig release`.
- QA real en telefono sigue pendiente porque no hay dispositivo en `adb devices`.

## 1. Stack Real

- Framework: Next.js 15.0.3
- React: 19.0.0-rc.1
- Lenguaje: TypeScript 6.0.3
- Runtime objetivo: navegador / localhost
- Package manager: npm
- Estilos: Tailwind CSS v4 beta + CSS global en `app/globals.css`
- Animación: `motion`
- 3D: `three`
- Persistencia: `localStorage` + `IndexedDB` para datos criticos y metadatos de respaldo
- Modo de app: cliente con `app/` router
- Build target: `output: 'standalone'`

## 2. Estado General

- La app está estructurada y funcional en sus 5 secciones principales.
- Build de producción: pasa.
- Lint: ejecutable y pasando con `eslint`
- La navegación principal, el catálogo, el registro de venta, el puerquito, los ajustes y el backup están implementados.
- Hay varios componentes y datos que ya son maduros, pero todavía quedan riesgos de documentación histórica, validación responsive continua y warnings de tooling.

## 3. Inventario del Proyecto

### Carpetas activas

- `app/`
- `components/`
- `components/sections/`
- `components/settings/`
- `components/catalog/`
- `components/calendar/`
- `components/sales/`
- `components/piggybank/`
- `components/ui/`
- `lib/`
- `types/`
- `docs/`
- `public/assets/devices/`

### Componentes principales activos

- `components/AppShell.tsx`
- `components/SectionIconGrid.tsx`
- `components/sections/MainContent.tsx`
- `components/sections/RegisterSaleSection.tsx`
- `components/sections/CalendarSection.tsx`
- `components/sections/CatalogSection.tsx`
- `components/sections/PiggyBankSection.tsx`
- `components/sections/SettingsSection.tsx`
- `components/SettingsView.tsx`
- `components/ui/TopHeaderBar.tsx`
- `components/ui/AppOverlays.tsx`
- `components/ui/SafeImage.tsx`
- `components/ui/SectionCard.tsx`
- `components/ScreenTransition.tsx`

### Componentes nuevos o de valor reciente

- `components/catalog/DeviceCommercialGuide.tsx`
- `components/catalog/CatalogDeviceGrid.tsx`
- `components/catalog/CatalogDeviceCard.tsx`
- `components/settings/BackupSettings.tsx`
- `components/settings/DeviceManagerSettings.tsx`
- `components/settings/GoalsSettings.tsx`
- `components/settings/ScheduleSettings.tsx`
- `components/settings/HistorySettings.tsx`
- `components/piggybank/SavingsJar.tsx`
- `components/piggybank/PatternProgressBar.tsx`
- `components/piggybank/MovementHistory.tsx`
- `components/piggybank/AnimatedMoneyCounter.tsx`

### Componentes huérfanos o poco conectados

- `components/ChatView.tsx` no aparece enlazado desde el shell principal.
- `components/ui/SuccessSpinner.tsx` sí está en uso.
- `components/ScreenTransition.tsx` sí está en uso.

### Utilidades activas

- `lib/storage.ts`
- `lib/backup.ts`
- `lib/persistentStorage.ts`
- `lib/navigation.ts`
- `lib/constants.ts`
- `lib/modelPalettes.ts`
- `lib/deviceAssets.ts`
- `lib/calendarDailySummary.ts`
- `lib/calendarStatus.ts`
- `lib/piggyUtils.ts`
- `lib/demoData.ts`
- `lib/monthlyVisualPatterns.ts`
- `lib/dateUtils.ts`

### Tipos principales

- `types/device.ts`
- `types/navigation.ts`
- `types/sale.ts`
- `types/piggy.ts`
- `types/settings.ts`
- `types/goal.ts`

### Assets existentes

- `public/assets/devices/y04/{thumb,register,catalog}.png`
- `public/assets/devices/y21d/{thumb,register,catalog}.png`
- `public/assets/devices/y29/{thumb,register,catalog}.png`
- `public/assets/devices/v50-lite/{thumb,register,catalog}.png`
- `public/assets/devices/v60-lite/{thumb,register,catalog}.png`

### Documentos existentes relevantes

- `MASTER_AUDIT_RECOVERY.md`
- `PROJECT_BRIEF.md`
- `GUARDRAILS.md`
- `PIPELINE.md`
- `ROADMAP.md`
- `QA_CHECKLIST.md`
- `DATA_FLOW.md`
- `README.md`
- `docs/UI_CURRENT_STATE_AUDIT.md`
- `docs/TECHNICAL_CURRENT_STATE_AUDIT.md`
- `docs/FINALIZATION_PIPELINE.md`
- `docs/PHASE_1_STABILIZATION_REPORT.md`
- `docs/PHASE_2_VISUAL_UX_CORRECTIONS.md`
- `docs/PHASE_DEVICE_MEMORY_AND_HISTORY.md`
- `docs/PHASE_DEVICE_MODEL_MANAGEMENT.md`
- `docs/PHASE_MOBILE_RESPONSIVE_OPTIMIZATION.md`
- `docs/ASSETS_REQUIRED.md`
- `docs/DEVICE_MODEL_RESEARCH.md`
- `docs/DESIGN_GUARDRAILS.md`
- `docs/RESPONSIVE_LAYOUT_AUDIT.md`

### Documentos solicitados que no existen

- `docs/PHASE_CATALOG_DEVICE_DETAIL_GUIDES.md`
- `docs/PHASE_BACKUP_IMPORT_EXPORT.md`
- `docs/PHASE_LAYOUT_SPACING_AND_CALENDAR_REFINEMENT.md`
- `docs/PHASE_REGISTER_CONFIRMATION_ANIMATION.md`

## 4. Stack y Build

### package.json

- `dev`: `next dev -p 3000`
- `build`: `next build`
- `start`: `next start -p 3000`
- `lint`: `eslint . --ext .js,.jsx,.ts,.tsx`

### next.config.ts

- `reactStrictMode: true`
- `eslint.ignoreDuringBuilds: true`
- `typescript.ignoreBuildErrors: false`
- `output: 'standalone'`
- `transpilePackages: ['motion']`
- `images.remotePatterns` habilita `picsum.photos`

### tsconfig.json

- `strict: true`
- `noEmit: true`
- `moduleResolution: bundler`
- alias `@/* -> ./`
- incluye `app/`, `components/`, `lib/`, `types/` y `.next/types`

### eslint.config.mjs

- Existe configuración ESLint y la dependencia ya está presente en `devDependencies`.

### Resultado real de build

- `npm run build`: pasa.
- Advertencia no bloqueante: invalid dependencies reportadas por loaders/plugins en `app/globals.css` por rutas absolutas/globs del entorno.

### Resultado real de lint

- `npm run lint`: pasa.
- Cobertura: chequea `js`, `jsx`, `ts` y `tsx` del proyecto con `eslint`.

## 5. Navegación

### Secciones reales

1. `calendar`
2. `catalog`
3. `register-sale`
4. `piggy-bank`
5. `settings`

### Orden real del dock

1. Calendario
2. Catálogo
3. Registrar
4. Puerquito
5. Ajustes

### Iconos y estado

- Calendario: `Calendar`
- Catálogo: `Compass`
- Registrar: `Smartphone`
- Puerquito: `PiggyBank`
- Ajustes: `Settings2`
- El dock mantiene estado activo y feedback visual.
- No hay secciones desconectadas dentro del shell principal.

### Subpantallas internas

- `SettingsView` tiene tabs internas: `profile`, `schedule`, `devices`, `goals`, `history`, `backup`, `appearance`.
- `CatalogSection` abre modal/ficha comercial por tarjeta.

### Observación funcional

- `activeTab` inicial: `register-sale`.
- `prevTab` y `TAB_INDICES` permiten transición direccional.
- La navegación no rompe el estado, pero depende de estado local persistente y de timers.

## 6. Auditoría por Sección

### 6.1 Calendario

Estado: implementado y funcional.

- Muestra mes actual, día seleccionado, resumen diario y cuadrícula de calendario.
- Calcula ventas del día a partir de `sales.date`.
- Usa `getPiggyGoals().dailyDeviceGoal` como meta de unidades.
- Marca días con venta por estado (`below-goal`, `goal-met`, `goal-exceeded`).
- Integra `MissedDayPrompt` para registrar si ayer se trabajó, descansó o no se asistió.
- Usa `manualDayRecords` para sobreescribir el estado laboral.

Fortalezas:

- El resumen diario está claro.
- Las badges de dispositivos dan contexto visual.
- El espacio está mejor aprovechado que una tabla simple.

Límites o riesgos:

- La navegación de meses tiene límites duros entre enero 2026 y diciembre 2027.
- El estado de jornada depende de datos manuales y de schedule, no de un backend central.
- La validación visual responsive no se ejecutó por viewport matrix en esta auditoría.

### 6.2 Registrar venta

Estado: implementado y bastante maduro.

- Selecciona dispositivo por carrusel.
- Cambia color por paleta del modelo.
- Permite navegación por swipe y teclado.
- Usa confirmación por long-press de 3 segundos.
- Genera venta, movimiento, notificación, banner superior y efecto de moneda.

Fortalezas:

- Tiene una experiencia de piso de venta bastante rica.
- La confirmación evita toques accidentales.
- La capa visual está alineada con el tono premium del proyecto.

Límites o riesgos:

- Es una secuencia pesada en animación y depende de timers.
- No hay evidencia de deduplicación dura de ventas idénticas en el mismo gesto.
- Los modelos personalizados funcionan, pero la guía comercial para ellos cae a fallback genérico.

### 6.3 Catálogo

Estado: implementado y funcional con ficha comercial.

- Las tarjetas son clickeables.
- Existe modal de ficha comercial por modelo.
- Hay argumentos de venta, specs y objeciones/respuestas.
- Las 5 unidades oficiales tienen identidad visual propia.
- `V60 LITE` se presenta como billboard horizontal.

Fortalezas:

- La ficha comercial está bien resuelta para el flujo de piso.
- Hay datos de venta reales y un layout premium.
- `SafeImage` evita ruptura visual si falta una imagen.

Límites o riesgos:

- Los modelos agregados manualmente usan fallback genérico para conocimiento comercial.
- No existe una fuente de knowledge extensa para modelos personalizados.

### 6.4 Puerquito

Estado: implementado y visualmente fuerte.

- Calcula ahorro por periodos Día, Semana, Mes y Año.
- Usa `calculatePeriodEarnings` y `getProgressPercent`.
- Muestra meta, progreso y movimientos recientes.
- Integra frasco 3D con Three.js.
- Tiene fallback visual si WebGL falla.

Fortalezas:

- La experiencia se siente premium.
- Hay empty states claros.
- La barra de progreso y el contador están bien integrados.

Límites o riesgos:

- Three.js aumenta peso y complejidad.
- Si WebGL no está disponible, el fallback es funcional pero mucho menos rico.

### 6.5 Ajustes

Estado: implementado con varias subpantallas útiles.

- Tabs internas: perfil, horarios, dispositivos, metas, historial, respaldo y apariencia.
- Se puede editar nombre y región.
- Se puede configurar horario de trabajo.
- Se pueden activar/desactivar modelos.
- Se pueden crear, editar y borrar modelos sin ventas.
- Se pueden exportar/importar respaldos JSON.
- Se puede guardar respaldo directo al dispositivo con File System Access API cuando el navegador lo soporta.
- Se puede exportar CSV de ventas.

Fortalezas:

- El módulo ya parece operativo para mantenimiento local.
- El panel de dispositivos tiene controles reales.

Límites o riesgos:

- La restauración sigue dependiendo de JSON con `app: 'vivo-promotor'` y `version: 1`.
- No hay barreras fuertes contra renombrar modelos con historial, lo que puede desalinear analítica visual futura.
- La sección puede quedar apretada en pantallas pequeñas si no se prueba bien el scroll.

## 7. Estado de Dispositivos

### Modelos actuales

1. `Y04`
2. `Y21D`
3. `Y29`
4. `V50 LITE`
5. `V60 LITE`

### Campos actuales de `Device`

- `id`
- `name`
- `margin`
- `active?`
- `series?`
- `description?`
- `specs?`
- `colors?`
- `imageDataUrl?`
- `imageUrl?`
- `knowledge?`
- `createdAt?`
- `updatedAt?`

### Capacidades reales

- Agregar modelos: sí
- Editar modelos: sí
- Desactivar modelos: sí
- Eliminar modelos: sí, pero se bloquea si hay ventas asociadas
- Subir imagen: sí, como `imageDataUrl`
- Persistencia de imagen al refrescar: sí, mientras permanezca en `localStorage`

### Observación importante

- Las ventas guardan `deviceId`, `deviceName`, `deviceColor`, `amountEarned`, `createdAt` y `day`.
- No guardan una imagen o snapshot completo del dispositivo en el momento de la venta.
- Eso protege parte del histórico, pero no inmortaliza toda la ficha del modelo.

## 8. Persistencia Local

### Arquitectura activa

- Persistencia ligera y de compatibilidad: `localStorage`.
- Persistencia critica y pesada: `IndexedDB` mediante `lib/persistentStorage.ts`.
- Estrategia: escritura espejo desde `localStorage` hacia `IndexedDB` para ventas, movimientos, dispositivos y metadatos clave.
- Migracion: no destructiva; si hay datos en `localStorage` y `IndexedDB` aun no tiene snapshot, se copian al primer arranque compatible.
- Fallback: si `IndexedDB` no esta disponible, la app sigue operando solo con `localStorage`.

### Llaves de `localStorage`

| Llave | Qué guarda | Quién la lee | Quién la escribe | Backup | Riesgo / fallback |
|---|---|---|---|---|---|
| `vivo_real_sales` | ventas reales | `useAppShellState`, `HistorySettings`, `backup.ts` | `AppShell`, `HistorySettings`, `backup.ts` | sí | fallback `[]` |
| `vivo_real_movements` | movimientos reales | `useAppShellState`, `PiggyBankSection`, `backup.ts` | `AppShell`, `demoData.ts`, `backup.ts` | sí | fallback `[]` |
| `vivo_piggy_goals` | metas monetarias y de unidades | `CalendarGrid`, `CalendarDaySummaryTop`, `GoalsSettings`, `PiggyBankSection` | `GoalsSettings` | sí | fallback con metas por defecto |
| `vivo_work_schedule` | horario laboral semanal | `CalendarGrid`, `calendarDailySummary.ts`, `ScheduleSettings`, `SettingsView` | `ScheduleSettings`, `SettingsView` | sí | fallback `null` / horario por defecto |
| `vivo_manual_day_records` | estado manual de días | `calendarDailySummary.ts`, `MissedDayPrompt` | `MissedDayPrompt` | sí | fallback `{}` |
| `vivo_user_profile` | perfil local de nombre/sucursal | funciones de storage | no se ve usado por UI actual | sí | fallback `{ name: '', store: '' }` |
| `vivo_devices` | catálogo de dispositivos | `useAppShellState`, `DeviceManagerSettings`, catálogo, registro, calendario, backup | `useAppShellState`, `DeviceManagerSettings`, `storage.ts` | sí | fallback `INITIAL_DEVICES` |
| `vivo_theme` | tema claro/oscuro | `useAppShellState` | `useAppShellState` | sí | fallback `light` |
| `vivo_userName` | nombre operativo | `useAppShellState` | `useAppShellState` | sí | fallback `Promotor de Campo` |
| `vivo_userStore` | tienda o zona | `useAppShellState` | `useAppShellState` | sí | fallback `Zona Centro` |
| `vivo_messages` | mensajes de chat/soporte | `useAppShellState` | `useAppShellState` | sí | fallback `INITIAL_CHATS` |
| `vivo_notifications` | notificaciones | `useAppShellState` | `useAppShellState` | sí | fallback `INITIAL_NOTIFICATIONS` |
| `vivo_selectedDay` | día seleccionado | `useAppShellState` | `useAppShellState` | sí | fallback hoy |
| `vivo_selectedMonth` | mes seleccionado | `useAppShellState` | `useAppShellState` | sí | fallback hoy |
| `vivo_selectedYear` | año seleccionado | `useAppShellState` | `useAppShellState` | sí | fallback hoy |
| `vivo_activeCarouselIndex` | índice del carrusel | `useAppShellState` | `useAppShellState` | sí | fallback `3` |
| `vivo_indexeddb_migration_v1_done` | flag de migración local a IndexedDB | `persistentStorage.ts`, `backup.ts` | `persistentStorage.ts` | sí | fallback `false` |
| `vivo_storage_driver` | driver activo reportado por la app | `persistentStorage.ts`, `backup.ts`, UI de respaldo | `persistentStorage.ts`, `backup.ts` | sí | fallback `localstorage-fallback` |
| `vivo_last_backup_export_at` | marca de tiempo del último respaldo exportado | `persistentStorage.ts`, `backup.ts`, UI de respaldo | `backup.ts` | sí | fallback `null` |

### Stores de `IndexedDB`

- `sales`: snapshot actual de ventas (`current-sales`)
- `movements`: snapshot actual de movimientos (`current-movements`)
- `devices`: snapshot actual de dispositivos (`current-devices`)
- `settings`: espejo de ajustes y banderas de migración
- `backups`: metadatos del último respaldo exportado y snapshot del último backup generado

### Respaldo / import / export

- Exportación JSON: sí
- Guardado directo al dispositivo: sí, con File System Access API cuando existe; si no, cae a descarga estándar
- Importación JSON: sí
- Validación de backup: sí
- Exportación CSV: sí, solo ventas
- Reset seguro: parcial en historial, y uno acotado por `demoTools.resetAppData()` que borra solo llaves de Vivo Promotor
- Restauración con confirmación: sí
- Restauración en `replace` o `merge`: sí
- `merge` une ventas, movimientos y dispositivos por `id` para evitar duplicados triviales

### Riesgos de persistencia

- La restauración sigue dependiendo de JSON con `app: 'vivo-promotor'` y `version: 1`.
- Los modelos renombrados pueden desalinear parte del histórico visual.
- No hay migración fuerte por versión de schema más allá de `v1`.
- No hay test automatizado de persistencia corriendo en CI; la validación sigue siendo local/manual.
- El borrado de storage ahora está acotado a llaves registradas de la app.

## 9. Assets

### Qué existe físicamente

- 5 carpetas de modelos oficiales.
- 3 imágenes por modelo: `thumb.png`, `register.png`, `catalog.png`.

### Qué espera la app

- `getDeviceAsset()` apunta a rutas concretas para `thumb`, `register` y `catalog`.
- `SafeImage` cae a fallback si una ruta falta.

### Estado de cobertura

- Los assets actuales cubren el lineup oficial.
- No hay faltantes evidentes para los 5 modelos base.
- Para modelos personalizados, la app depende de `imageDataUrl`, `imageUrl` o fallback visual.

## 10. Estado Responsive y Espaciado

### Evaluación por código

- La app tiene safe-area y dock con padding inferior.
- `MainContent` agrega padding inferior para evitar que el dock tape el contenido.
- Calendario, Puerquito, Catálogo y Ajustes tienen scroll interno.
- `SectionIconGrid` está fijado abajo con `safe-area`.

### Riesgos detectados

- El calendario tiene límites de rango duros.
- Catálogo usa una grilla densa con tarjeta billboard especial, lo que puede apretar pantallas cortas.
- Ajustes mezcla varias capas de scroll; conviene seguir probándolo en anchos 360-430.
- La validación visual de los 5 viewports solicitados no se ejecutó con una matriz visual completa en esta corrida.
- Las superficies de producto ya comparten un marco visual consistente, pero aún conviene revisar el encuadre fino en 360 px.

### Estado visual por sección

- Ajustes > Dispositivos: fuerte, pero denso.
- Ajustes > Metas: correcto, con cálculos útiles.
- Calendario: bien resuelto visualmente.
- Puerquito: muy vistoso, con fallback claro.
- Catálogo detalle: funcional y premium.
- Registrar venta: la más compleja, pero también la más cuidada.

## 11. Estado Visual / UX

### Puntuación estimada por pantalla

- Calendario: 8/10
- Registrar venta: 9/10
- Catálogo: 8.8/10
- Puerquito: 9/10
- Ajustes: 8/10

### Diagnóstico

- Lo mejor resuelto: registrar venta y puerquito.
- Lo más sólido en operaciones diarias: calendario y catálogo.
- Lo más frágil para escalar: ajustes, por densidad y mantenimiento, aunque ya quedó mejor narrado con resumen operativo.
- Lo menos maduro de la app: automatización de validación visual multi-viewport.

## 12. Riesgos Clasificados

### Críticos

- El warning de `app/globals.css` sigue reportando dependencias inválidas del tooling.

### Altos

- No hay snapshot completo de dispositivo al registrar una venta.
- Renombrar modelos con ventas históricas puede crear desalineación semántica.
- La navegación del calendario está limitada por fechas fijas.

### Medios

- Hay documentación histórica faltante.
- La validación responsive no está automatizada.
- `ChatView.tsx` parece desconectado del flujo principal.
- Falta una validación visual multi-viewport completa de 360-430 px.

### Bajos

- Algunas pantallas tienen densidad alta.
- Hay warnings de tooling no bloqueantes.

## 13. Qué Está Listo

- Shell principal con navegación de 5 secciones.
- Registro de venta con confirmación por long-press.
- Catálogo con ficha comercial.
- Calendario con resumen diario y estados manuales.
- Puerquito con 3D y progreso.
- Ajustes con edición de dispositivos, metas, horarios, historial y backup.
- Persistencia híbrida local con `localStorage` + `IndexedDB` para datos críticos.
- Exportación CSV de ventas.
- Exportación e importación JSON de backup.
- Guardado directo de respaldo al dispositivo con fallback a descarga estándar.
- Assets oficiales completos para el lineup base.
- Reset de datos acotado solo a llaves de la app.
- Lint ejecutable con configuración estable.

## 14. Qué No Está Listo

- Validación responsive completa con matriz de 5 viewports.
- Documentación histórica completa.
- Hardening de snapshots históricos de dispositivo.
- Validación de datos por schema/version más robusta a futuro.
- Limpieza del warning de tooling de `app/globals.css`.

## 15. Qué No Se Debe Tocar Sin Permiso

- Orden y sentido de las 5 secciones del dock.
- Flujo de long-press del registro de venta.
- Los 3 assets por modelo oficial.
- La estructura de backup JSON ya establecida.
- El fallback visual de `SafeImage`.
- La lógica de persistencia ya confirmada.
- El 3D del puerquito.
- Los datos iniciales de modelos oficiales salvo instrucción expresa.

## 16. Próximas Fases Recomendadas

### Fase 1: Tooling y estabilidad

- Objetivo: reducir warnings de tooling y dejar la integración de build más limpia.
- Archivos probables: `package.json`, config de lint, posibles ajustes menores de build.
- Riesgo: bajo.
- Criterio de aceptación: `npm run build` pasa sin errores, `npm run lint` corre y el warning heredado de `app/globals.css` queda identificado pero no bloqueante.

### Fase 2: Seguridad de datos

- Objetivo: ampliar versionado de schema, pruebas repetibles y recuperación más verificable.
- Archivos probables: `lib/backup.ts`, `lib/storage.ts`, `lib/persistentStorage.ts`, `components/settings/BackupSettings.tsx`, `lib/demoData.ts`.
- Riesgo: medio.
- Criterio de aceptación: restore seguro, reset menos destructivo, schema más claro y validación repetible de migración.

### Fase 3: Validación responsive real

- Objetivo: revisar 360-430px y evitar recortes.
- Archivos probables: `components/sections/*`, `components/ui/*`, `app/globals.css`.
- Riesgo: medio.
- Criterio de aceptación: no hay overflow horizontal ni dock tapando contenido.

### Fase 4: Catálogo y datos de campo

- Objetivo: mejorar el detalle comercial de catálogo y el tratamiento de modelos personalizados.
- Archivos probables: `components/catalog/*`, `lib/deviceAssets.ts`, `lib/modelPalettes.ts`.
- Riesgo: medio.
- Criterio de aceptación: ficha comercial más consistente para modelos custom.

### Fase 5: Pulido visual

- Objetivo: afinar densidad, tipografía, jerarquía y microespaciado.
- Archivos probables: componentes de secciones y `app/globals.css`.
- Riesgo: bajo.
- Criterio de aceptación: interfaz más equilibrada en móvil.

### Fase 6: Futuro

- Objetivo: automatización de pruebas y schema versioning.
- Archivos probables: `package.json`, scripts de QA, validadores.
- Riesgo: medio.
- Criterio de aceptación: validación repetible antes de cambios mayores.

## 17. Roadmap Actualizado

### Prioridad 1: Crítico para uso diario

1. Reducir o documentar el warning de dependencias inválidas en `app/globals.css`.
2. Verificar que el dev server se recupere limpio tras cambios.
3. Confirmar navegación y overlays en móvil real en los puntos más densos.

### Prioridad 2: Seguridad de datos

1. Añadir versionado/validación de backup más explícita.
2. Blindar mejor el histórico frente a renombres o cambios de modelo.
3. Añadir una prueba repetible de migración `localStorage` -> `IndexedDB`.

### Prioridad 3: Ventas en piso

1. Validar `RegisterSaleSection` y `DeviceCommercialGuide` en móvil real.
2. Revisar catálogo y ajuste de cards/detalle en ancho 360-430.
3. Confirmar que calendario y puerquito no quedan tapados por el dock.

### Prioridad 4: Pulido visual

1. Afinar densidad de Ajustes.
2. Revisar jerarquía de textos y espaciado en Calendar y Catalog.
3. Revisar fallback visual de `SafeImage` y estados vacíos.

### Prioridad 5: Optimización

1. Reducir peso de animaciones o aislar más el 3D del puerquito.
2. Revisar render de icon grid y overlays.
3. Preparar una capa de pruebas mínimas.

### Prioridad 6: Futuro

1. Automatizar viewport QA.
2. Añadir tests básicos de persistencia.
3. Formalizar schema de datos y migraciones.

## 18. Porcentaje Estimado de Avance

- Avance estimado: 80%

## 19. Veredicto Final

- La app ya está suficientemente armada para trabajo real de campo en modo local.
- El corazón funcional está listo.
- La deuda principal hoy no es de features; es de tooling, validación responsive y endurecimiento de datos.
- No se recomienda seguir sumando funcionalidad antes de cerrar `lint`, documentar el estado y blindar persistencia.
