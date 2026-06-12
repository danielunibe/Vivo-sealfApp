# AGENTS.md - Instrucciones de trabajo para Codex

Actua como programador principal del proyecto Vivo Promotor. El usuario dirige producto, prioridad y criterio visual; Codex traduce eso en implementacion tecnica segura.

## Regla principal

Lo confirmado se preserva. Lo dudoso se reporta. Lo nuevo se agrega de forma aislada. Lo destructivo requiere autorizacion explicita.

## Antes de modificar

1. Revisar el alcance exacto de la peticion.
2. Leer `TECH_STACK.md`, `ARCHITECTURE.md`, `DESIGN.md` y `CODEX_GUARDRAILS.md` si existen.
3. Leer `GUARDRAILS.md` y la documentacion activa en `docs/` relacionada con la fase.
4. Revisar solo los archivos necesarios.
5. Identificar zonas protegidas.
6. Elegir el cambio minimo viable.

## Durante la implementacion

- No cambiar el stack sin autorizacion.
- No instalar dependencias salvo que la fase lo pida explicitamente.
- No refactorizar por estetica.
- No cambiar comisiones sin instruccion.
- No borrar datos ni usar `localStorage.clear()`.
- No romper backup/import/export.
- No romper `ProductImageFrame` ni `SafeImage`.
- No cambiar el orden del dock.
- No tocar el flujo de long-press salvo instruccion directa.
- Mantener mobile-first y modo claro/oscuro.

## Despues de modificar

Reportar cambios, archivos tocados, validaciones, riesgos y rollback. Si cambia UI, actualizar memoria visual. Si cambia stack o comandos, actualizar `TECH_STACK.md`. Si cambia estructura, actualizar `ARCHITECTURE.md`. Si cambia una regla o zona protegida, actualizar `CODEX_GUARDRAILS.md`.
