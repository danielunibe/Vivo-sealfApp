# PHASE: RESPONSIVE SWEEP, SAFE-AREA QA & BUILD WARNING CLEANUP

**Proyecto:** Vivo Promotor  
**Fecha:** 5 de junio de 2026  
**Responsable:** Codex

---

## 1. Objetivo

Cerrar una pasada fina de QA responsive real y dejar documentado el estado exacto del warning heredado de `app/globals.css` sin abrir refactors ni cambios de stack.

---

## 2. Estado inicial

- `npm run lint`: OK
- `npm run build`: OK con warning heredado en `app/globals.css`
- La app ya respondía por HTTP, pero durante el QA del navegador hubo ambiguedad local en `127.0.0.1:3000`, así que la validación visual dedicada se hizo en `127.0.0.1:3001`
- `ProductImageFrame`, `SafeImage`, reset seguro y backup ya estaban integrados de la fase anterior

---

## 3. Viewports revisados

- `360x740`
- `375x812`
- `390x844`
- `412x915`
- `430x932`

---

## 4. Hallazgos por viewport

### 360x740

- Sin overflow horizontal detectado.
- Dock visible y usable.
- Registrar, Catálogo, Puerquito y Ajustes mantienen navegación funcional.
- El layout ya era correcto, pero se mantenía apretado en altura útil para secciones largas.

### 375x812

- Sin overflow horizontal detectado.
- El dock no tapa contenido crítico.
- Secciones operativas usables.

### 390x844

- Sin overflow horizontal detectado.
- Las tabs de Ajustes se mantienen táctiles y legibles.
- Catálogo conserva el billboard de `V60 Lite` sin romper la grilla.

### 412x915

- Se confirmó el patrón principal de esta fase: exceso de vacío vertical en Calendario, Puerquito y Perfil de Ajustes.
- Después del ajuste, esas secciones aprovechan mejor la altura sin cambiar navegación ni estructura.

### 430x932

- Sin overflow horizontal detectado.
- Dock estable.
- Persisten espacios respirables propios del diseño, pero ya no depende tanto de alturas rígidas en las superficies auditadas.

---

## 5. Correcciones aplicadas

- Se acotó el escaneo de Tailwind en `app/globals.css` usando `source(none)` y `@source` por carpetas reales del proyecto.
- Se añadió una clase responsive para que la card mensual del calendario gane altura útil en pantallas altas.
- Se ajustó el bloque central del puerquito para que el frasco quede menos hundido en viewports altos.
- Se redistribuyó el perfil de Ajustes para ocupar mejor la altura disponible en pantallas altas.

---

## 6. Estado de dock / safe-area

- No se detectó overflow horizontal en la matriz revisada.
- El dock se mantuvo operativo en los cinco viewports.
- No hubo evidencia de que el dock tapara acciones críticas en la pasada realizada.
- El padding inferior seguro siguió funcionando con la clase `dock-safe-pb`.

---

## 7. Estado por sección

### Registrar

- Usable en la matriz validada.
- La imagen principal mantiene encuadre correcto.
- El CTA `Concretar venta` sigue accesible.

### Calendario

- El grid y el resumen superior siguen funcionales.
- La altura fija era una de las causas del vacío vertical en pantallas altas.
- Se dejó más altura útil sin tocar la lógica del calendario.

### Catálogo

- La grilla sigue estable y sin cortes mayores.
- `V60 Lite` mantiene su billboard horizontal.
- `ProductImageFrame` no rompió el layout.

### Puerquito

- Sigue usable y legible.
- El frasco quedó mejor posicionado en pantallas altas.
- Se mantiene el warning deprecado de Three.js sobre `PCFSoftShadowMap`, pero no bloquea esta fase.

### Ajustes

- Se verificaron tabs de `Perfil`, `Horarios`, `Dispositivos`, `Metas`, `Historial` y `Apariencia`.
- No existe una tab separada de `Respaldo` en el estado actual del checkout.
- `Perfil` aprovecha mejor la altura en viewports altos.
- `Dispositivos` sigue mostrando miniaturas con `ProductImageFrame`.

---

## 8. Investigación del warning de `app/globals.css`

### Causa identificada

El warning no viene de un import roto en `app/globals.css`. Viene del puente de tooling entre:

- `Tailwind CSS v4 beta`
- `@tailwindcss/postcss`
- `Next.js 15 / webpack`

El plugin de Tailwind reporta dependencias de archivos fuente y/o globs al pipeline de PostCSS, y Webpack las marca como `Invalid dependencies`.

### Qué cambió en esta fase

- Antes del ajuste, el warning listaba también dotfiles del root como `.env.example` y `.eslintrc.*`.
- Después del ajuste, el warning quedó acotado a archivos fuente reales como `app/layout.tsx`, `app/page.tsx` y componentes del proyecto.

### Veredicto

- La parte ruidosa del escaneo quedó reducida.
- El warning persiste como ruido de tooling del stack actual.
- No parece seguro intentar “forzarlo” a cero sin cambiar versión o integración de Tailwind/Next.

---

## 9. Resultado de `npm run lint`

- OK

---

## 10. Resultado de `npm run build`

- OK
- El warning de `app/globals.css` persiste, pero quedó mejor acotado y documentado

---

## 11. Estado de localhost

- `http://127.0.0.1:3001`: responde `200` y se usó para la validación visual dedicada
- `http://127.0.0.1:3000`: respondió `200`, pero hubo ambiguedad local con otro proceso durante la validación visual en el navegador, por lo que no se tomó como superficie confiable para esta fase

---

## 12. Riesgos pendientes

- El warning de `app/globals.css` sigue dependiendo del stack actual de Tailwind v4 beta con Next 15.
- Three.js sigue emitiendo warnings deprecados de sombra en consola.
- La sección de Ajustes no tiene una tab separada de respaldo en el estado actual; si esa superficie debe existir, sería otra fase.

---

## 13. Próxima fase recomendada

Hacer una fase corta de `tooling hardening` para decidir una de estas rutas:

1. Mantener el warning documentado mientras el stack siga en beta.
2. Probar una actualización controlada de la integración Tailwind/Next en una rama aislada.
3. Atacar los warnings deprecados de Three.js si se quiere dejar la consola limpia.

