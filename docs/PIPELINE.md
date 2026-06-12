# Pipeline completo del desarrollo (Adaptado a Next.js / Entorno Web)

## Fase 0 — Recuperación y estabilización
**Objetivo:** dejar de avanzar a ciegas.
- Revisar estado y dependencias.
- No agregar funciones nuevas.
- Confirmar estructura actual del proyecto.

## Fase 1 — Entorno de Compilación
**Objetivo:** Verificar que el proyecto construye en el contenedor (Node.js/Next.js en lugar de Flutter).
- Confirmar dependencias (npm install).
- Confirmar Next.js app router.

## Fase 2 — Validación técnica del proyecto
**Objetivo:** saber si el código compila.
- Analizar código (`npm run lint`).
- Construir app (`npm run build`).

## Fase 3 — Corrección de errores reales
**Objetivo:** corregir solo lo que falle en logs reales.
- Iterar sobre errores de sintaxis y tipado.
- Si falla la compilación, no se avanza a diseño.

## Fase 4 — QA funcional básico
**Objetivo:** comprobar que la app cumple su flujo central.
- Validar navegación (5 iconos).
- Validar Registrar Venta, Puerquito, Calendario.

## Fase 5 — Pulido de experiencia Registrar
**Objetivo:** que la pantalla principal se sienta premium.
- Tarjetas, selector, botón concretar (animaciones listas).
- Snackbars, notificaciones.

## Fase 6 — Pulido Calendario visual
**Objetivo:** que el calendario sea el corazón visual del historial.
- Miniaturas.
- Resumen mensual y top de modelos.

## Fase 7 — Ajustes y catálogo
**Objetivo:** adaptar a reglas dinámicas.
- Editar comisiones.
- Metas.

## Fase 8 — Exportación y respaldo
**Objetivo:** sacar información útil fuera de la app.
- Exportar CSV o reporte visual.

## Fase 9 — Pulido visual premium
**Objetivo:** app moderna y pulida.
- Liquid/Dark premium en Puerquito (Aplicado).
- Transiciones fluidas (Aplicadas).

# Regla principal desde ahora
Cada prompt debe atacar una fase y solo una fase.
Primero: **entorno + compilación**. Después: diseño y funciones.
