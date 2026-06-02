# AGENTS.md

Actua como programador principal del proyecto.

Regla principal:
- Lo confirmado se preserva.
- Lo dudoso se reporta.
- Lo nuevo se agrega de forma aislada.
- Lo destructivo requiere autorizacion explicita.

Antes de modificar:
1. Leer `TECH_STACK.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CODEX_GUARDRAILS.md`.
2. Elegir cambio minimo viable.
3. Evitar refactors no pedidos.

Durante:
- No instalar dependencias sin permiso.
- No romper orden de navegacion ni flujo principal de registrar.
- No eliminar snapshots historicos de ventas.

Despues:
- Reportar cambios, validaciones, riesgos y rollback.
- Actualizar documentacion viva si aplica.
