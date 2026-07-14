# ARCHITECTURE.md

## Proposito

Este documento describe la estructura activa despues de sustituir el proyecto por la app React/Vite entregada en `vivoapp.zip`.

## Estructura activa

```txt
src/                         App React/Vite
src/components/              Shell, UI compartida e iconos
src/features/                Secciones principales: registro, calendario, catalogo, puerquito, ajustes
src/lib/                     Storage, constantes, imagenes, ordenamiento, analytics y helpers
src/types.ts                 Contratos TypeScript principales
public/assets/devices/       Portadas oficiales copiadas desde Downloads/portadas
docs/                        Documentacion incluida en el ZIP
android/                     Envoltura Capacitor conservada para instalar como actualizacion
```

## Reglas

- La fuente de UI nueva es `src/`; no reintroducir las carpetas antiguas `app/`, `components/`, `lib/` de Next.
- `android/` se conserva solo para empaquetar con el mismo `applicationId`.
- Las portadas oficiales se resuelven desde `src/lib/officialDeviceCovers.ts`.
- El orden de modelos y variantes se normaliza desde `src/lib/modelOrdering.ts` y se persiste con `sortOrder`.
- La proyeccion visual de Inicio/Registro compartida por Registro y Ajustes vive en `src/lib/registerHomeProjection.ts`.
- `src/features/settings/RegisterHomeVisualEditor.tsx` provee el modo visual de Ajustes > Productos y modelos; trabaja sobre un borrador de `phoneModels` y solo persiste al guardar.
- `src/features/settings/VariantImageGallery.tsx` concentra la galeria local de imagenes por variante para que modo visual y modo avanzado conserven `imageGallery`/`activeImageId` igual.
- Las migraciones de storage deben ser idempotentes y no borrar ventas historicas.
- Las acciones destructivas deben vivir detras de controles explicitos de Ajustes.

## Zonas protegidas

| Zona | Motivo | Proteccion |
|---|---|---|
| `android/app/build.gradle` identity | Requerida para actualizar encima | alta |
| `src/lib/storage.ts` | Datos, ventas, backup/import/export | alta |
| `src/lib/officialDeviceCovers.ts` | Mapeo oficial modelo/color/portada | media |
| `public/assets/devices/official/` | Portadas entregadas por el usuario | media |
