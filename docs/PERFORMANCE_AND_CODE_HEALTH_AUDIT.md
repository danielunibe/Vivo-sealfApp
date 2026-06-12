# PERFORMANCE_AND_CODE_HEALTH_AUDIT

- Fecha: 2026-06-05
- Proyecto: Vivo Promotor
- Motivo: el usuario reporta lentitud en dispositivo Android durante testeo.
- Alcance: auditoria de rendimiento, codigo muerto, monolitos y riesgos visibles en el codigo actual.
- Modo: solo auditoria; no se aplicaron optimizaciones destructivas.

## 1. Resumen ejecutivo

La app funciona y compila, pero hay tres causas probables de lentitud en Android WebView:

1. El bundle inicial carga casi toda la app de golpe, incluyendo secciones que el usuario no ha abierto.
2. Las imagenes de dispositivos pesan demasiado para uso movil: 15 PNG de 1024x1024 suman ~7.52 MB.
3. La UI tiene varias animaciones permanentes o de alta frecuencia, incluyendo Three.js en el Puerquito y timers de 16 ms en Registrar Venta.

## 1.1 Reparacion aplicada - 2026-06-05

Se aplico el primer bloque de optimizacion de alto impacto y bajo riesgo:

- `components/sections/MainContent.tsx`: Registro queda como seccion inicial; Calendario, Catalogo, Puerquito y Ajustes se cargan con `next/dynamic`.
- `public/assets/devices/*`: imagenes oficiales regeneradas como WebP transparentes con variantes reales (`thumb` 320px, `catalog` 640px, `register` 768px).
- `lib/deviceAssets.ts`: rutas actualizadas de PNG a WebP.
- `components/piggybank/SavingsJar.tsx`: modo Android/low-power con menor pixel ratio, antialias/sombras reducidos y loop a 30fps.
- `components/sections/RegisterSaleSection.tsx`: progreso de long-press reducido de 16 ms a 50 ms para bajar re-renders sin cambiar el flujo protegido.

Metricas despues de la reparacion:

| Metrica | Antes | Despues |
|---|---:|---:|
| First Load JS reportado por Next | ~340 KB | ~170 KB |
| Export Android `out/` | ~9.55 MB | ~2.20 MB |
| Assets en `out/assets` | ~7.52 MB | ~0.17 MB |
| Assets fuente en `public/assets` | ~7.52 MB | ~0.17 MB |

El APK debug final queda en `dist-apk/vivo-promotor-debug.apk`.

## 2. Evidencia tecnica

### Build / export

- `npm run lint`: OK.
- `npm run build`: OK con warning CSS heredado de Tailwind/PostCSS/Next.
- Export Android `out/`: ~9.55 MB.
- JS/CSS exportado en `out/_next`: ~1.98 MB.
- Assets de producto en `out/assets`: ~7.52 MB.

### Chunks principales en export Android

| Chunk | Peso aprox. |
|---|---:|
| `out/_next/static/chunks/b536...js` | 339.3 KB |
| `out/_next/static/chunks/bd904...js` | 213.2 KB |
| `out/_next/static/chunks/app/page...js` | 195.9 KB |
| `framework...js` | 177.4 KB |
| `517...js` | 177.2 KB |
| `4bd...js` | 162.2 KB |
| `741...js` | 142.5 KB |
| `main...js` | 111.2 KB |
| `polyfills...js` | 110 KB |

### Imagenes

Todas las imagenes oficiales en `public/assets/devices/*` son `1024x1024`.

| Grupo | Peso por archivo |
|---|---:|
| Y21D | ~601 KB x 3 |
| Y04 | ~522 KB x 3 |
| V50 Lite | ~521 KB x 3 |
| Y29 | ~469 KB x 3 |
| V60 Lite | ~454 KB x 3 |

Riesgo: se cargan como `thumb`, `register` y `catalog`, pero las tres variantes son del mismo tamano/peso.

## 3. Hallazgos de prioridad alta

### P1 - Bundle inicial demasiado amplio

Archivo: `components/sections/MainContent.tsx`

Evidencia:

- Importa estaticamente todas las secciones en las lineas 7-11.
- Aunque solo se renderiza una seccion activa, el bundle de la pagina incluye Registro, Calendario, Catalogo, Puerquito y Ajustes.
- Esto arrastra `three`, `motion`, catalogo, settings y backup hacia el paquete inicial.

Impacto probable:

- Arranque mas lento en Android WebView.
- Mayor tiempo hasta primera interaccion.
- Mas memoria JS al abrir la app.

Recomendacion:

- Convertir secciones no iniciales a `next/dynamic`.
- Mantener `RegisterSaleSection` como seccion inicial prioritaria.
- Cargar `PiggyBankSection`, `SettingsSection`, `CatalogSection` y posiblemente `CalendarSection` bajo demanda.

Riesgo:

- Medio. Hay que preservar transiciones y estado.

### P1 - Assets de producto sobredimensionados

Archivos:

- `public/assets/devices/*/{thumb,register,catalog}.png`

Evidencia:

- 15 imagenes `1024x1024`.
- ~7.52 MB de assets copiados al APK.
- Las variantes `thumb`, `register` y `catalog` pesan igual por modelo.

Impacto probable:

- Mas tiempo de carga.
- Mas decodificacion de imagen en WebView.
- Mayor memoria grafica.

Recomendacion:

- Regenerar variantes reales:
  - `thumb`: 256px o 320px.
  - `catalog`: 512px o 640px.
  - `register`: 768px maximo si se necesita hero.
- Mantener PNG si hace falta transparencia; evaluar WebP con transparencia si el target Android lo soporta correctamente.
- No reemplazar originales sin respaldo.

Riesgo:

- Bajo/medio. Es una optimizacion de assets con rollback simple si se conserva copia.

### P1 - Three.js siempre corre a 60fps en Puerquito

Archivo: `components/piggybank/SavingsJar.tsx`

Evidencia:

- Importa `three` en linea 4.
- Renderer usa `powerPreference: 'high-performance'` en linea 39.
- `setPixelRatio(Math.min(window.devicePixelRatio, 2))` en linea 48.
- `shadowMap.enabled = true` y `PCFSoftShadowMap` en lineas 49-50.
- Loop permanente con `requestAnimationFrame` en linea 70.

Impacto probable:

- Alto consumo GPU/CPU cuando el usuario abre Puerquito.
- Posible calentamiento o tirones en equipos Android de gama media/baja.

Recomendacion:

- Reducir `pixelRatio` a 1 o 1.25 en Android/WebView.
- Desactivar sombras suaves o hacerlas opcionales.
- Pausar loop si la seccion no esta visible.
- Renderizar bajo demanda o bajar FPS si no hay cambios.
- Agregar modo `reducedMotion`/`lowPower`.

Riesgo:

- Medio. Afecta visual premium del Puerquito.

## 4. Hallazgos de prioridad media

### P2 - Timer de 16 ms en confirmacion de venta

Archivo: `components/sections/RegisterSaleSection.tsx`

Evidencia:

- `setInterval(..., 16)` para progreso de hold en linea 139.
- Otro `setInterval(..., 16)` para drenaje en linea 152.

Impacto probable:

- Re-render frecuente durante long-press.
- Puede sentirse pesado en Android si coincide con animaciones de fondo y DeviceCard.

Recomendacion:

- Cambiar a `requestAnimationFrame` con actualizacion visual via CSS transform cuando sea posible.
- Reducir frecuencia de estado React a 10-15 fps y dejar CSS interpolar.
- Mantener la logica de long-press intacta.

Riesgo:

- Medio. El flujo de venta esta protegido.

### P2 - TactileIcons es monolito visual

Archivo: `components/ui/TactileIcons.tsx`

Evidencia:

- 509 lineas.
- Contiene 5 iconos complejos con estados, timers, estilos inline y SVG grandes.
- Cada icono tiene su propio `useEffect` y `<style>`.

Impacto probable:

- Mas JS inicial.
- Mas recalculo/DOM en dock, que esta siempre visible.
- Dificulta mantenimiento.

Recomendacion:

- Separar cada icono en archivo propio.
- Extraer estilos CSS comunes a `app/globals.css` o componente base.
- Considerar fallback mas liviano para Android low-end.

Riesgo:

- Medio. Dock es zona protegida visualmente.

### P2 - `AppShell` concentra demasiadas responsabilidades

Archivo: `components/AppShell.tsx`

Evidencia:

- 257 lineas.
- Gestiona navegacion, ventas, movimientos, notificaciones, estilos globales inline, fondos dinamicos, overlays y dock.
- Incluye `dangerouslySetInnerHTML` para CSS global en lineas 196-220.

Impacto probable:

- Re-render amplio cuando cambian ventas, movimientos, notificaciones, tema o carousel.
- Dificulta aislar rendimiento por seccion.

Recomendacion:

- Extraer `handleConfirmSale` a hook dedicado.
- Memoizar valores derivados (`currentEarnings`, `activeDevices`, `activePalette`, `isLightBg`).
- Mover CSS global a `app/globals.css`.

Riesgo:

- Medio/alto. Es shell central.

### P2 - Ajustes > Dispositivos es monolito

Archivo: `components/settings/DeviceManagerSettings.tsx`

Evidencia:

- 484 lineas.
- Mezcla lista, formulario, upload/compression, colores, validacion, borrado y UI.

Impacto probable:

- Coste de render alto al abrir Ajustes.
- Mantenimiento dificil.

Recomendacion:

- Separar `DeviceEditorForm`, `DeviceListItem`, `ColorEditor`, `ImageUploadPreview`.
- Mantener API actual y comportamiento.

Riesgo:

- Bajo/medio si se hace por piezas.

## 5. Codigo muerto o sospechoso

Sospechosos sin referencias directas por busqueda de nombre:

| Archivo | Estado recomendado |
|---|---|
| `components/ChatView.tsx` | confirmar si se usara; parece desconectado |
| `components/catalog/CatalogHeader.tsx` | parece no usado |
| `components/piggybank/PiggyBankVisual.tsx` | parece reemplazado por `SavingsJar` |
| `components/settings/DeviceCommissions.tsx` | parece reemplazado por `DeviceManagerSettings` |
| `hooks/use-mobile.ts` | parece no usado |
| `lib/calendarStatus.ts` | duplicado conceptual de `calendarDailySummary.ts` |
| `lib/utils.ts` | confirmar utilidad real |

Recomendacion:

- No borrar aun.
- Primero abrir cada archivo y confirmar si no esta enlazado por imports dinamicos, docs o planes futuros.
- Si se elimina, hacerlo en una fase separada con `npm run lint`, `npm run build`, `npm run android:prepare`.

## 6. Fallas de calidad / deuda tecnica

### Tipos `any`

Evidencia:

- `lib/storage.ts`: `getPiggyGoals(): any`, `savePiggyGoals(goals: any)`, schedule `any[]`.
- `components/calendar/CalendarGrid.tsx`: state de `goals` y `schedule` como `any`.
- `components/sales/DeviceCarousel.tsx` y `DeviceCard.tsx`: `cardStars: any[]`, `backdropStars: any[]`.
- `components/settings/HistorySettings.tsx`: `setMovements` usa `any[]`.

Impacto:

- Menos seguridad al optimizar.
- Riesgo de errores silenciosos en persistencia/calendario.

Recomendacion:

- Crear tipos para `PiggyGoals`, `WorkScheduleDay`, `GeneratedStar`.
- Aplicar en fases pequeñas.

### Animaciones permanentes

Evidencia:

- `repeat: Infinity` en dock/calendario/registro.
- Varias clases `animate-pulse`, `animate-ping`, `animate-bounce`.

Impacto:

- Android WebView puede sentirse menos fluido por composiciones continuas.

Recomendacion:

- Respetar `prefers-reduced-motion`.
- Reducir animaciones permanentes en modo Android/low-power.
- Mantener animaciones de feedback puntuales.

## 7. Plan recomendado de optimizacion

### Sprint 1 - Alto impacto, bajo riesgo

Estado: completado el 2026-06-05.

1. Optimizar assets:
   - crear respaldo de `public/assets/devices`;
   - generar `thumb` 256/320, `catalog` 512/640, `register` 768;
   - validar visualmente en Registro/Catalogo/Ajustes.
2. Dynamic imports por seccion:
   - cargar bajo demanda Catalogo, Puerquito, Ajustes y Calendario;
   - mantener Registro como inicial.
3. Medir de nuevo:
   - `npm run build`;
   - `npm run android:prepare`;
   - comparar `out/` y chunks.

### Sprint 2 - Fluidez Android

Estado: parcialmente completado el 2026-06-05.

1. Modo low-power para Puerquito:
   - pixelRatio menor;
   - sombras opcionales;
   - pausar loop cuando no este visible.
2. Optimizar long-press:
   - menos setState por segundo;
   - CSS transform para progreso.
3. Reducir animaciones permanentes.

### Sprint 3 - Salud de codigo

1. Confirmar y eliminar codigo muerto.
2. Separar monolitos:
   - `TactileIcons`;
   - `DeviceManagerSettings`;
   - partes de `AppShell`.
3. Tipar `any` criticos.

## 8. No tocar sin autorizacion

- Orden del dock.
- Comisiones.
- Backup/import/export.
- `ProductImageFrame` y `SafeImage` sin pruebas visuales.
- `applicationId`.
- Long-press de registro sin prueba manual.

## 9. Proxima accion recomendada

Aplicar primero un patch de optimizacion de assets y lazy-loading de secciones. Es el mejor balance entre impacto y riesgo para Android.

Despues conectar un telefono por `adb` para medir arranque real, navegar secciones y capturar logcat/screenshot.
