# PHASE_CALENDAR_STATUS_COLORS_AND_CLIPPING_FIXES

- Fecha: 2026-06-05
- Estado: implementado

## Objetivo

Mejorar lectura de meta diaria en Calendario y corregir recortes en Ajustes > Dispositivos.

## Sistema de estados

- `no-sale`: sin unidades registradas.
- `below-goal`: ventas parciales por debajo de `dailyDeviceGoal`.
- `goal-met`: unidades vendidas iguales o superiores a `dailyDeviceGoal`.
- `goal-exceeded`: unidades vendidas al menos 20% sobre la meta.
- `rest`: dia no laborable sin venta.
- `future`: dia futuro sin evaluacion.

## Cambios

- `lib/calendarDailySummary.ts` y `lib/calendarStatus.ts` comparan unidades vendidas contra meta de unidades, no dinero contra meta monetaria.
- `CalendarGrid` pasa `dailyDeviceGoal`.
- `CalendarDaySummaryTop` cambia color, etiqueta y barra segun estado.
- `SettingsView` y `DeviceManagerSettings` agregan mas padding inferior y filas con altura estable para evitar recortes.

## Validacion

- `npm run lint`: OK.
- `npm run build`: OK.
- QA visual automatizada con Playwright: no ejecutada porque el runtime local no tiene Playwright instalado y no se agrego una dependencia nueva.

## Riesgos

- Falta una matriz visual automatizada real en 360, 375, 390, 412 y 430 px.
