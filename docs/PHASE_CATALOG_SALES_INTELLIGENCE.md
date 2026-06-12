# PHASE_CATALOG_SALES_INTELLIGENCE

- Fecha: 2026-06-05
- Estado: implementado

## Objetivo

Convertir el Catalogo en una herramienta de venta con informacion comercial, pitch, objeciones, comparativas y confianza por fuente.

## Cambios

- Se creo `lib/deviceKnowledge.ts`.
- `CatalogDeviceCard` ahora usa linea corta comercial, chips de fortalezas e indicador de confianza.
- `DeviceCommercialGuide` ahora muestra cliente ideal, posicionamiento, argumentos con descripcion, comparativa interna y fuentes.
- Los modelos personalizados mantienen fallback sin romper flujo.
- Se corrigieron claims debiles: Y29 ya no depende de "Red 5G"; V60 Lite ya no se presenta con IP54/80W; Y04 Mexico usa 5150 mAh.

## Validacion

- `npm run lint`: OK.
- `npm run build`: OK con warning CSS heredado en build normal.
- `npm run android:build:web`: OK.

## Riesgos

- V50 Lite 4G y V60 Lite requieren confirmar inventario local exacto si se venden variantes distintas a las fuentes regionales consultadas.
