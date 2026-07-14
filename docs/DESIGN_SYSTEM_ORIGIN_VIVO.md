# Sistema de Diseño OriginOS 6 (Vivo Promotor)

## 1. Topología y Formas (Morphing Shapes)
OriginOS 6 se caracteriza por sus "squircles" (superelipses) fluidas y radios dinámicos.
- **Micro**: 8px - 12px (chips, badges, inputs pequeños)
- **Base (Tarjetas)**: 20px - 24px (cards regulares, menús)
- **Max (Contenedores)**: 32px - 40px (modales, docks, headers)

## 2. Superficies (Materialidad)
El uso del Cristal (Glassmorphism) es esencial, balanceado con Neumorfismo.
- **Fondo General**: Sólido o con gradiente ultraligero (blanco humo o negro noche).
- **Tarjetas Principales**: Superficies sólidas levantadas (`neo-surface`).
- **Superficies Flotantes (Dock, Pill, Modales)**: Cristal esmerilado profundo (`glass-bg` + `backdrop-blur`).
- **Sombras**: Difusas y extendidas, nunca duras. Sombras internas sutiles para efecto táctil.

## 3. Topografía (Espaciado)
Altamente espacioso.
- **Paddings**: 16px, 20px, 24px, 32px.
- **Gaps**: 12px, 16px, 24px.
- **Safe Area**: Respetado escrupulosamente.

## 4. Tipografía
- Limpia y geométrica.
- Mucho contraste de peso (Black/Bold para números y títulos cortos, Medium/Regular para texto).
- Letter-spacing: Ligeramente ajustado en uppercase y números grandes.

## 5. Dinámica y Movimiento (Kinetic)
OriginOS se siente "elástico" pero rápido.
- Transiciones de Layout: 200ms - 300ms.
- Interacciones táctiles (Taps): 100ms - 150ms.
- Curvas (Easings): `cubic-bezier(0.2, 0.8, 0.2, 1)` (suave desaceleración).

## 6. Colores (Paleta)
- **Origin Blue**: Acento principal, eléctrico y enérgico `#4A72FF`.
- **Textos Secundarios**: Alta legibilidad pero baja jerarquía visual (opacidad 0.5 a 0.7).
- **Éxito / Avance**: Verde menta brillante o Turquesa vibrante `#2DD4bf`.
- **Alerta / Falta**: Naranja papaya o Rojo coral `#fb7185`.
