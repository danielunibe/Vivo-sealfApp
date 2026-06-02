# CODEX_GUARDRAILS.md

## Solicitud activa (2026-06-01)

Completar Fase 2: endurecimiento, mejoras funcionales y documentación, sin romper stack ni navegación.

## Protegido

- `lib/core/database/app_database.dart`: snapshots históricos.
- `lib/features/navigation/main_shell.dart`: orden fijo de pestañas.

## Aplicado en esta fase

- Se mantuvo Drift/SQLite.
- Se mantuvo pantalla inicial `Registrar`.
- Se implementó edición de comisión/nombre/estado en `Ajustes`.
- Se implementó resumen diario + deshacer en `Registrar`.
- Se implementó calendario visual con miniaturas, métricas y export CSV por portapapeles.
