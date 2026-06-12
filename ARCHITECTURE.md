# ARCHITECTURE.md

## 1. Proposito

Este documento registra la estructura activa para evitar monolitos y cambios mal ubicados.

## 2. Estructura activa

```txt
app/                         Next App Router y CSS global
components/                  UI principal por secciones
components/calendar/         Calendario y estados diarios
components/catalog/          Catalogo y fichas comerciales
components/settings/         Ajustes, dispositivos, metas, respaldo
components/ui/               Primitivos visuales compartidos
lib/                         datos iniciales, storage, backup, helpers
types/                       contratos TypeScript
docs/                        documentacion viva por fase
android/                     proyecto Android generado por Capacitor
android/app/src/main/kotlin/ base Kotlin/Compose nativa experimental
scripts/                     scripts auxiliares de build
```

## 3. Reglas anti-monolito

- Las secciones viven en `components/sections/`.
- `components/sections/MainContent.tsx` mantiene Registro como seccion inicial y carga Calendario, Catalogo, Puerquito y Ajustes bajo demanda con `next/dynamic` para reducir el arranque en Android.
- La logica de conocimiento comercial vive en `lib/deviceKnowledge.ts`, no dentro de las cards.
- La persistencia vive en `lib/storage.ts`, `lib/persistentStorage.ts`, `lib/backup.ts` y migraciones en `lib/migrations.ts`.
- Las cards no deben contener investigacion extensa; solo resumen y entrada a ficha.
- Android debe ser envoltura Capacitor, no reescritura de la app.
- La migracion Kotlin vive en paralelo bajo `nativeapp/` hasta que alcance paridad funcional; no debe reemplazar `MainActivity` sin QA.
- `MainActivity.kt` ya es entrypoint Kotlin, pero conserva `BridgeActivity` para mantener la experiencia validada.
- El backup JSON v1 es el puente canonico entre la app web actual y la app Kotlin.
- `lib/dateUtils.ts` centraliza fechas locales `YYYY-MM-DD` y el fallback de movimientos: `effectiveDate`, venta enlazada y `createdAt`.
- La fecha elegida en Registrar es la fecha comercial; `createdAt` queda reservado para auditoria.

## 4. Modulos protegidos

| Modulo | Motivo | Proteccion |
|---|---|---|
| Dock inferior | Navegacion confirmada de 5 secciones | alto |
| Registro de venta long-press | Flujo operativo sensible | alto |
| `ProductImageFrame` / `SafeImage` | Proteccion visual de assets | alto |
| Backup/import/export | Seguridad de datos del usuario | alto |
| `android` signing identity | Requerida para actualizar APK sin perder datos | alto |
| Launcher Android actual | Mantiene app validada mientras Kotlin madura | alto |
