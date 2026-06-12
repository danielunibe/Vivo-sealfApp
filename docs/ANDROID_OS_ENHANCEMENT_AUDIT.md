# Android OS Enhancement Audit

- Fecha: 2026-06-12
- Proyecto: Vivo Promotor
- Base actual: Next.js + Capacitor Android con línea Kotlin/Compose paralela
- Objetivo: identificar mejoras que aprovechen Android moderno sin romper datos, flujo de venta ni capacidad de actualización

## 1. Criterio

Las mejoras recomendadas aquí priorizan:

- velocidad operativa en piso de venta;
- menos pasos para registrar y consultar;
- mejor integración con Android actual;
- bajo riesgo para datos y continuidad;
- compatibilidad con una futura migración Compose.

No se recomienda agregar funciones nativas solo por “verse más Android” si no reducen fricción real.

## 2. Mejoras prioritarias

### A. Widget de inicio

Valor:

- ver ventas del día;
- avance a meta diaria;
- acceso directo a Registrar venta;
- acceso rápido a Calendario o Puerquito.

Formato recomendado:

- widget pequeño 2x2: ventas del día + botón rápido;
- widget mediano 4x2: meta diaria, total ganado hoy y último modelo vendido.

Implementación nativa:

- `AppWidgetProvider` en Kotlin;
- lectura de snapshot local seguro desde Room/DataStore;
- actualización al registrar venta y al cambiar metas.

Impacto:

- alto valor;
- riesgo bajo;
- buena mejora para 0.4.x.

### B. Shortcuts dinámicos

Valor:

- pulsación larga del icono para entrar directo a:
  - Registrar venta;
  - Calendario;
  - Puerquito;
  - Exportar backup.

Implementación:

- `ShortcutManager` en Kotlin;
- deep links internos del shell Android.

Impacto:

- alto valor;
- costo bajo;
- ideal incluso antes de una migración full Compose.

### C. Quick Settings Tile

Valor:

- abrir “Registrar venta” desde el panel rápido del sistema;
- muy útil si el usuario trabaja muchas veces al día desde un mismo equipo.

Implementación:

- `TileService` nativo;
- abre la app en la sección de registro.

Impacto:

- valor medio-alto;
- costo medio;
- recomendable cuando el flujo de deep links ya esté firme.

### D. Notificaciones con acciones reales

Valor:

- recordatorios de jornada;
- recordatorios de respaldo;
- aviso de meta diaria cumplida;
- notificación post-venta con acción “Ver Calendario” o “Abrir Puerquito”.

Implementación:

- canales Android separados;
- `WorkManager` para recordatorios;
- acciones profundas a secciones concretas.

Impacto:

- alto valor;
- riesgo bajo si se mantiene opt-in desde Ajustes.

### E. Edge-to-edge y barras del sistema

Valor:

- mejor aprovechamiento visual en Android actual;
- app más integrada con gestos modernos;
- menos sensación de “web embebida”.

Implementación:

- `WindowCompat.setDecorFitsSystemWindows(window, false)`;
- ajuste de status/navigation bar;
- paddings desde insets nativos.

Impacto:

- valor medio;
- costo bajo;
- recomendable pronto.

## 3. Mejoras de segunda fase

### A. Share targets y envío al sistema

Permitir:

- compartir CSV o backup JSON desde la app;
- importar respaldo desde el selector del sistema;
- abrir la app desde “Compartir con Vivo Promotor”.

Valor:

- medio-alto para soporte y migración entre equipos.

### B. Biometría para áreas sensibles

Usos razonables:

- proteger exportación/restauración;
- proteger borrado de historial;
- proteger ajustes administrativos.

Valor:

- medio;
- recomendable como opción, no obligatorio.

### C. Material You controlado

Uso recomendado:

- aplicar color dinámico solo a detalles menores cuando el usuario lo active;
- no romper la identidad monocroma base.

Valor:

- medio;
- solo si se hace como variante opcional.

### D. Predicive Back y deep links robustos

Valor:

- navegación más nativa;
- mejor comportamiento al volver desde ficha, ajustes y modales.

### E. Modo split-screen, tablets y foldables

Valor:

- medio;
- importante si la app va a correr en tablets de tienda o pantallas grandes.

## 4. Mejoras con más retorno operativo

### A. Snapshot nativo para widget y shortcuts

Crear un snapshot ligero con:

- ventas de hoy;
- fecha comercial activa;
- meta diaria;
- monto acumulado del periodo;
- último movimiento.

Esto no reemplaza Room ni el backup. Sirve para:

- widget;
- quick tile;
- shortcuts;
- notificaciones.

### B. Apertura directa por contexto

Deep links internos como:

- `vivo-promotor://register-sale`
- `vivo-promotor://calendar`
- `vivo-promotor://piggy-bank`
- `vivo-promotor://backup`

Eso unifica:

- shortcuts;
- widgets;
- quick settings tile;
- notificaciones;
- futura Compose shell.

### C. Recordatorios configurables por horario laboral

Derivar del horario ya existente:

- inicio de jornada;
- fin de jornada;
- “no has registrado ventas hoy”;
- “haz respaldo semanal”.

## 5. Lo que no conviene priorizar todavía

- servicios en foreground permanentes;
- sincronización nube compleja;
- funciones de IA nativa dentro del sistema;
- overlays invasivos;
- accesos flotantes tipo burbuja;
- rediseños Android-only que rompan la consistencia con la app actual;
- features que dependan de permisos agresivos sin beneficio claro.

## 6. Orden recomendado de implementación

1. Edge-to-edge real con insets nativos.
2. Deep links internos estables por sección.
3. Shortcuts dinámicos del icono.
4. Recordatorios con `WorkManager`.
5. Widget de inicio.
6. Quick Settings Tile.
7. Share targets e import/export mejorado.
8. Biometría opcional.
9. Soporte adaptativo para tablets/foldables.

## 7. Dependencias técnicas

Para la línea Capacitor/Kotlin actual, estas mejoras piden principalmente:

- `ShortcutManager`;
- `AppWidgetProvider`;
- `TileService`;
- `WorkManager`;
- `BiometricPrompt`;
- manejo consistente de intents y deep links;
- snapshot local de lectura rápida.

## 8. Recomendación final

Las tres mejoras con mejor relación valor/esfuerzo para la próxima fase son:

1. shortcuts dinámicos;
2. recordatorios con acciones;
3. widget de inicio.

Las tres mejoras con mejor efecto “se siente nativa” son:

1. edge-to-edge bien hecho;
2. deep links del sistema;
3. quick settings tile.
