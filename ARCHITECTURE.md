# ARCHITECTURE.md

## Estructura

- `core/database`: Drift schema + queries
- `data/repositories`: acceso a datos
- `features/register`: captura tipo checkout y resumen diario
- `features/calendar`: calendario, métricas y CSV
- `features/settings`: edición de dispositivos/comisiones

## Reglas

- UI no consulta SQL directo.
- Ventas guardan snapshots de nombre/imagen/comisión.
- Modelos inactivos se filtran en `Registrar` desde repositorio de activos.
