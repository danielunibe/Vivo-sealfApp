# Bugfix Requirements Document

## Introduction

Esta corrección nace de una auditoría profunda del código fuente de Vivo Promotor (React 19 + Vite 6 + TypeScript, empaquetada como APK Android con Capacitor 8, local-first sobre localStorage + IndexedDB). El objetivo es reparar de forma profunda un conjunto de bugs concretos y verificados detectados en el arranque, la persistencia, el flujo de venta, el calendario, los cálculos de fecha/stock y la resolución de portadas oficiales, sin tocar las zonas protegidas (applicationId Android, llaves `vivo_*`, comisiones, backup/import/export, PNG oficiales) más allá del cambio mínimo viable.

El chequeo de tipos (`npm run lint` → `tsc --noEmit`) pasa sin errores (exit 0), por lo que los defectos son de **runtime, lógica de negocio y consistencia de contenido/imágenes**, no de tipado. Cada defecto abajo cita el archivo donde vive y describe la condición exacta que lo dispara.

Los bugs se agrupan en cinco áreas:
- **Área A - Arranque y estabilidad (crashes / pantalla negra):** clausulas 1.1-1.2 → 2.1-2.2
- **Área B - Fechas y zona horaria:** clausulas 1.3-1.5 → 2.3-2.5
- **Área C - Stock e inventario:** clausula 1.6 → 2.6
- **Área D - Portadas oficiales y contenido/imagen:** clausulas 1.7-1.10 → 2.7-2.10
- **Área E - Flujo de venta y UI:** clausulas 1.11-1.12 → 2.11-2.12

> Nota de descarte: durante la auditoría se evaluó `src/lib/backup.ts` y `src/lib/imageUpload.ts` como posible código muerto; se verificó que **ambos están en uso** (`ImageUploadField.tsx`, `DeviceManager.tsx`, panel de respaldo), por lo que quedan fuera del alcance y protegidos.

## Bug Analysis

### Current Behavior (Defect)

Comportamiento actual observado cuando se dispara cada condición.

**Área A - Arranque y estabilidad**

1.1 WHEN se registra una venta o se genera un movimiento de inventario en un WebView Android antiguo o en un contexto no seguro donde `crypto.randomUUID` no existe (varias capas ColorOS/Oppo antiguas) THEN el sistema lanza una excepción no capturada al construir el `id` (`crypto.randomUUID()` en `RegisterSaleSection.tsx` y en `decrementPhoneVariantStock` / `incrementDeviceStock` / movimientos de `storage.ts`) y la venta no se guarda.

1.2 WHEN se ejecutan las migraciones de arranque y existe un movimiento de inventario heredado con `deviceNameSnapshot` `undefined` THEN el sistema lanza `Cannot read properties of undefined (reading 'includes')` en `migrateInventoryMovementsIfNeeded` (`storage.ts`), la migración aborta y el arranque puede quedar en pantalla negra pese al fallback previsto.

**Área B - Fechas y zona horaria**

1.3 WHEN la app se usa en horario local con offset negativo (México, UTC-6) y la hora local está entre las 18:00 y medianoche THEN `getAppToday()` y `toLocalDateKey()` (`src/lib/date.ts`) devuelven la fecha en UTC vía `toISOString().split('T')[0]`, adelantando el día, de modo que una venta hecha "hoy" por la noche se registra y se filtra bajo la fecha de mañana.

1.4 WHEN se calcula el ritmo diario requerido cerca del fin de mes THEN `getRequiredDailyPace()` (`src/lib/insights.ts`) construye `new Date(getAppToday())` interpretando `YYYY-MM-DD` como medianoche UTC, obteniendo un `currentDay`/`daysLeft` desfasado y un ritmo incorrecto.

1.5 WHEN el día del mes actual es de un solo dígito (1 a 9) THEN el calendario no resalta el día de hoy: `todayData = calendarDays.find(d => d.day === currentDayStr)` (`src/features/CalendarSection.tsx`) compara `currentDayStr` con cero a la izquierda (`'09'`) contra `day = String(d)` sin cero (`'9'`), por lo que nunca coinciden y el estado/resaltado de "hoy" se pierde.

**Área C - Stock e inventario**

1.6 WHEN se registra una venta cuya cantidad supera el stock disponible de la variante (sobreventa) y luego esa venta se elimina THEN el stock queda inflado: `decrementPhoneVariantStock` recorta con `Math.max(0, previousStock - quantity)` (pierde el excedente), pero `deleteSale` → `incrementPhoneVariantStock` suma la cantidad completa vendida, dejando el stock por encima del valor real previo a la venta.

**Área D - Portadas oficiales y contenido/imagen**

1.7 WHEN un color con nombre/alias `'rosa pop'` se resuelve para el modelo v60-lite THEN el sistema devuelve la portada de **Azul Titanio** (`vivov60lite_azultitanio.png`), porque `'rosa pop'` está listado erróneamente como alias de Azul Titanio en `src/lib/officialDeviceCovers.ts`, mostrando una imagen que no corresponde al color.

1.8 WHEN se resuelve la portada de v50-lite Negro Mistico THEN la entrada tiene un alias duplicado literal `aliases: ['negro mistico', 'negro mistico']` (`officialDeviceCovers.ts`), lo que es redundante y no aporta la variante de acento real que debería mapear.

1.9 WHEN se muestra el icono compacto/calendario de la variante y31d **Gris Estelar** THEN el sistema usa un `iconPath` que apunta a un `.png` (`vivoY31d_gris_estelar.png`) porque el archivo SVG no existe en disco, rompiendo la convención de "SVG = icono" y mostrando un PNG donde el resto de variantes usan SVG.

1.10 WHEN el usuario cambia el modelo o el color dentro de `ConfirmSaleSheet` antes de confirmar THEN la venta se guarda con `deviceImageSnapshot` tomado de `activeWallpaper` del modelo originalmente seleccionado (`RegisterSaleSection.tsx` → `handleConfirmSale`), no del `localModel`/`localVariant` finalmente elegidos, quedando una imagen que no coincide con el equipo vendido.

**Área E - Flujo de venta y UI**

1.11 WHEN el usuario pulsa "Confirmar Registro" en `ConfirmSaleSheet` y la hoja no se desmonta de inmediato (o la confirmación falla) THEN `isSubmitting` se pone en `true` y nunca se restablece, dejando el control en estado bloqueado/enviando de forma permanente.

1.12 WHEN se abre la vista previa web de un modelo en `WebPreviewPanel` y la web oficial bloquea el embebido en iframe (X-Frame-Options / CSP) THEN el panel queda en blanco sin mensaje ni fallback, sin indicar que el contenido no puede mostrarse offline/incrustado.

### Expected Behavior (Correct)

Comportamiento correcto que debe cumplirse para cada condición defectuosa.

**Área A - Arranque y estabilidad**

2.1 WHEN se registra una venta o se genera un movimiento de inventario en un WebView sin `crypto.randomUUID` THEN el sistema SHALL generar el identificador mediante un helper de UID con fallback seguro (por ejemplo `crypto.randomUUID` cuando existe, y si no un generador basado en timestamp + aleatorio) SIN lanzar excepciones, guardando la venta correctamente.

2.2 WHEN se ejecutan las migraciones y un movimiento tiene `deviceNameSnapshot` `undefined` THEN el sistema SHALL tratar el valor de forma segura (coalescencia a cadena vacía antes de `.includes`) de modo que la migración complete sin abortar y el arranque nunca quede en pantalla negra por esta causa.

**Área B - Fechas y zona horaria**

2.3 WHEN se calcula la fecha "de hoy" de la app en cualquier horario local THEN `getAppToday()` y `toLocalDateKey()` SHALL producir la fecha en **hora local** (componentes año/mes/día locales), de modo que una venta nocturna se registre y se filtre bajo el día local correcto.

2.4 WHEN se calcula el ritmo diario requerido THEN `getRequiredDailyPace()` SHALL derivar `currentDay`, `daysInMonth` y `daysLeft` a partir de la fecha local (sin reinterpretar `YYYY-MM-DD` como UTC), devolviendo un ritmo correcto también cerca del fin de mes.

2.5 WHEN el día actual es de un solo dígito THEN el calendario SHALL resaltar correctamente el día de hoy, comparando el día con un formato consistente (ambos lados con o sin cero a la izquierda) para que los días 1 a 9 coincidan.

**Área C - Stock e inventario**

2.6 WHEN se elimina una venta que fue una sobreventa THEN el sistema SHALL restaurar el stock de forma simétrica al decremento aplicado (no reponer más unidades de las que realmente se descontaron), evitando la inflación de stock; el movimiento resultante SHALL seguir siendo trazable y no negativo.

**Área D - Portadas oficiales y contenido/imagen**

2.7 WHEN se resuelve un color `'rosa pop'` para v60-lite THEN el sistema SHALL dejar de mapearlo como Azul Titanio; el alias incorrecto SHALL eliminarse para que `'rosa pop'` no muestre una portada que no le corresponde (y, si no hay portada oficial para ese color, caiga en el placeholder/ícono correcto).

2.8 WHEN se resuelve v50-lite Negro Mistico THEN la lista de aliases SHALL quedar sin duplicados literales y con los alias reales necesarios para la coincidencia por nombre/acento.

2.9 WHEN se muestra el icono de y31d Gris Estelar THEN el sistema SHALL resolver el icono de forma consistente y con degradado suave: usar SVG cuando exista y, cuando el SVG no exista en disco, caer explícitamente al PNG oficial sin romper la convención ni dejar imagen rota (sin requerir agregar nuevos assets protegidos).

2.10 WHEN el usuario cambia modelo o color dentro de `ConfirmSaleSheet` THEN la venta SHALL guardarse con un `deviceImageSnapshot` derivado del `localModel`/`localVariant` efectivamente confirmados, coincidiendo con el equipo vendido.

**Área E - Flujo de venta y UI**

2.11 WHEN la confirmación de venta termina (éxito o error) THEN `isSubmitting` SHALL restablecerse (o el control SHALL protegerse contra doble envío de forma que no quede bloqueado permanentemente).

2.12 WHEN la web oficial no puede embeberse en el iframe de `WebPreviewPanel` THEN el sistema SHALL mostrar un estado de fallback claro (mensaje y/o acción para abrir en el navegador), declarando que el contenido no está disponible incrustado, en lugar de un panel en blanco.

### Unchanged Behavior (Regression Prevention)

Comportamiento existente que debe preservarse intacto.

3.1 WHEN un WebView moderno soporta `crypto.randomUUID` THEN el sistema SHALL CONTINUAR generando identificadores con el mismo formato UUID que hoy.

3.2 WHEN las migraciones de storage se ejecutan sobre datos válidos THEN el sistema SHALL CONTINUAR migrando de forma idempotente y no destructiva, sin borrar ventas ni historial ni llaves `vivo_*`.

3.3 WHEN la app se usa a una hora local que no cruza el límite UTC (p. ej. por la mañana) THEN el sistema SHALL CONTINUAR resolviendo la fecha de hoy igual que antes, y el modo demo (`DEMO_DATE`) SHALL CONTINUAR funcionando sin cambios.

3.4 WHEN el día actual es de dos dígitos (10 a 31) THEN el calendario SHALL CONTINUAR resaltando el día de hoy correctamente como hasta ahora.

3.5 WHEN se registra o elimina una venta dentro del stock disponible (sin sobreventa) THEN el sistema SHALL CONTINUAR ajustando el stock exactamente por la cantidad vendida y dejando un movimiento trazable, y las comisiones SHALL permanecer sin cambios.

3.6 WHEN se resuelven portadas oficiales de colores/modelos no afectados (Verde Jade, Lavanda Cristal, Negro Jade, Morado Lavanda, Black Expresso, Blanco Nube, Azul Titanio real, Negro Elegante, etc.) THEN el sistema SHALL CONTINUAR devolviendo la misma portada PNG y el mismo icono SVG que hoy, sin reemplazar PNG oficiales por SVG ni viceversa.

3.7 WHEN se confirma una venta sin cambiar modelo ni color en `ConfirmSaleSheet` THEN el sistema SHALL CONTINUAR guardando el mismo snapshot de imagen, modelo, variante y comisión que hoy.

3.8 WHEN la web oficial sí permite embeberse THEN `WebPreviewPanel` SHALL CONTINUAR mostrando la vista previa como hasta ahora.

3.9 WHEN se exporta o importa un respaldo JSON THEN el sistema SHALL CONTINUAR con el mismo formato y comportamiento de backup/import/export (zona protegida, sin cambios).

## Derivación de la condición de bug

Dado que esta corrección agrupa varios defectos independientes, se modela cada uno con su predicado. `F` es el código actual y `F'` el corregido.

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type AppInput
  OUTPUT: boolean

  RETURN
    // A. Arranque / estabilidad
    (X.action IN {createSale, inventoryMovement} AND NOT hasCryptoRandomUUID(X.env))
    OR (X.action = runMigrations AND EXISTS m IN X.movements WHERE m.deviceNameSnapshot = undefined)
    // B. Fechas
    OR (X.action IN {getAppToday, toLocalDateKey, requiredDailyPace} AND localUtcOffset(X.env) <> 0 AND crossesUtcBoundary(X.localTime))
    OR (X.action = calendarTodayHighlight AND X.dayOfMonth >= 1 AND X.dayOfMonth <= 9)
    // C. Stock
    OR (X.action = deleteSale AND X.sale.quantity > stockBefore(X.sale))
    // D. Imágenes
    OR (X.action = resolveCover AND X.model = 'v60-lite' AND normalize(X.color) = 'rosa pop')
    OR (X.action = resolveIcon AND X.model = 'y31d' AND normalize(X.color) = 'gris estelar')
    OR (X.action = confirmSale AND (X.changedModel OR X.changedColor) IN ConfirmSaleSheet)
    // E. UI
    OR (X.action = confirmSale AND sheetStaysMounted(X))
    OR (X.action = openWebPreview AND iframeBlocked(X.url))
END FUNCTION
```

```pascal
// Property: Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  result <- F'(X)
  ASSERT no_crash(result)
    AND correctLocalDate(result)          // B
    AND todayHighlighted(result)          // B (dias 1-9)
    AND stockRestoredSymmetric(result)    // C
    AND coverMatchesColor(result)         // D
    AND imageSnapshotMatchesConfirmed(result) // D
    AND controlNotStuck(result)           // E
    AND fallbackShown(result)             // E
END FOR
```

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

## Zonas protegidas afectadas (fixes de cambio mínimo, con cuidado)

- `src/lib/officialDeviceCovers.ts` (protección media): solo se ajustan aliases erróneos y la resolución de icono con degradado suave; **no** se tocan los PNG oficiales en `public/assets/devices/official/`.
- Flujo de venta (`RegisterSaleSection.tsx`, `ConfirmSaleSheet.tsx`) y `storage.ts` (alta protección): correcciones mínimas de UID, snapshot de imagen, `isSubmitting` y simetría de stock; **no** se alteran comisiones ni el formato de datos, ni backup/import/export.
- Migraciones de `storage.ts`: se endurece la coalescencia sin cambiar la semántica idempotente/no destructiva.
