---
name: Vivo Promotor
version: 0.3.0
status: active
platforms:
  - web
  - capacitor-android
  - jetpack-compose-target
themes:
  light:
    background: "#EDF0F2"
    surface: "#EDF0F2"
    surfaceSoft: "#F7F8F9"
    text: "#111315"
    muted: "#686F76"
    border: "rgba(255,255,255,0.72)"
    accent: "#111315"
  dark:
    background: "#0D0F11"
    surface: "#15181B"
    surfaceSoft: "#1B1F23"
    text: "#F5F6F7"
    muted: "#969DA4"
    border: "rgba(255,255,255,0.08)"
    accent: "#F5F6F7"
semantic:
  success: "#41B883"
  warning: "#D9A441"
  danger: "#D96B6B"
radii:
  small: 10
  medium: 14
  large: 20
spacing:
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
motion:
  fast: 180
  normal: 300
  slow: 500
  reducedMotion: required
---

# Vivo Promotor Design System

## Dirección visual

Vivo Promotor usa un neumorfismo monocromo refinado. Negro, blanco y grises forman la interfaz; el color se reserva para información que lo necesita.

La experiencia debe sentirse táctil, directa y profesional en teléfonos de 360 a 430 px. La profundidad proviene de una superficie elevada y una sombra doble controlada, no de halos, estrellas, gradientes decorativos o capas de blur.

## Uso del color

Color permitido:

- estado de venta, éxito, advertencia y error;
- acabado físico del dispositivo;
- progreso de calendario y Puerquito;
- selección activa puntual cuando mejora la lectura.

Color no permitido:

- fondos completos por dispositivo;
- un color distinto para cada destino del dock;
- halos o nebulosas decorativas;
- gradientes sin significado funcional.

## Superficies y elevación

- Fondo y superficie principal comparten familia tonal para conservar el relieve neumórfico.
- Las cards usan radio grande de 20 px.
- Botones, inputs y controles usan radio medio de 14 px.
- Iconos compactos y celdas auxiliares usan 10 px.
- Cada elemento elevado usa como máximo una sombra clara y una oscura.
- El blur se limita al dock y overlays temporales; no debe ocultar contenido.
- No colocar cards dentro de cards salvo que exista una herramienta realmente enmarcada.

## Tipografía

- Texto principal: sans del sistema, alto contraste.
- Nombres de modelos: serif existente para preservar identidad comercial.
- Datos, fechas y cantidades: mono solo cuando ayuda a comparar.
- Labels: 9-11 px, peso alto y mayúsculas con moderación.
- No usar tracking negativo.

## Navegación

El dock conserva exactamente este orden:

1. Calendario.
2. Catálogo.
3. Registrar venta.
4. Puerquito.
5. Ajustes.

Registrar venta permanece al centro. Los iconos son monocromos; el estado activo usa relieve inset y un indicador neutral. El punto de venta nueva en Calendario puede usar verde por ser un estado semántico.

## Registrar venta

- La fecha comercial es visible y editable antes de confirmar.
- El control incluye acción rápida `Hoy`.
- La fecha se expresa internamente como `YYYY-MM-DD`.
- El long-press de tres segundos se preserva.
- El teléfono y sus swatches pueden mostrar su color físico real.
- La confirmación usa negro/blanco; el verde queda reservado para el estado de éxito.
- No usar fondos cósmicos, estrellas o halos durante la confirmación.

## Calendario

- Los días son squircles, nunca círculos.
- La navegación permite cualquier año válido.
- Estados de progreso conservan color semántico.
- El resto de la superficie es monocroma.
- Las transiciones de mes respetan movimiento reducido.

## Puerquito

- El frasco 3D y las monedas se preservan.
- El patrón mensual puede comunicar progreso, pero la superficie contenedora sigue siendo neutral.
- Los movimientos se agrupan por fecha comercial, no por hora de captura.

## Catálogo y Ajustes

- Catálogo conserva imágenes reales, color físico, comisión y ficha comercial.
- Ajustes prioriza densidad legible y controles nativos reconocibles.
- Acciones destructivas conservan rojo y confirmación explícita.

## Equivalencia Compose

| Web token | Compose target |
|---|---|
| `--neo-bg` | `VivoColors.background` |
| `--neo-surface` | `VivoColors.surface` |
| `--neo-surface-soft` | `VivoColors.surfaceSoft` |
| `--neo-text` | `VivoColors.onBackground` |
| `--neo-muted` | `VivoColors.onSurfaceVariant` |
| `--neo-accent` | `VivoColors.primary` |
| `--neo-radius-*` | `VivoShapes` |
| `--neo-shadow-*` | `VivoElevation` |

Compose debe replicar intención, contraste, geometría y estados; no traducir sombras CSS literalmente.

## Elementos protegidos

- Orden del dock.
- Registrar venta como acción central.
- Flujo long-press.
- `ProductImageFrame` y `SafeImage`.
- Modo claro/oscuro.
- Intro e identidad de aplicación.

## Referencias

- Google Labs `design.md`: estructura legible por humanos y agentes.
- Hackers' Pub: enfoque black-and-white-first.
- Cal.com: tokens explícitos y reglas operativas.
- Jetpack Compose: equivalencia mediante tema, colores, formas y elevación.
