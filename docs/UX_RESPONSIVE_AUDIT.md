# Auditoría UX y Responsive (Vivo Promotor)

## Observaciones Iniciales

1. **Uso del Espacio (Layout)**:
   - Existen secciones de la app donde las imágenes dominan demasiado o hay espacios vacíos sin propósito.
   - El dock ocasionalmente parece estar compitiendo con el contenido si el padding inferior no es el adecuado.

2. **Disonancia de Contraste**:
   - Hay textos en gris oscuro o negro sobre fondos translúcidos que pueden perderse bajo iluminación directa (común en el piso de ventas).

3. **Interacciones y Háptica (Física)**:
   - Se debe seguir implementando el feedback nativo al presionar elementos, haciendo uso del `LiquidGlass` de manera eficiente.

4. **Escala y Touch Targets**:
   - En pantallas pequeñas (360x740), la tarjeta de detalle del catálogo requerirá máximo cuidado para no obligar a scroll innecesario.
   - Los botones primarios necesitan al menos 48px - 56px de altura táctil.

## Viewports Auditados
- **360x740**: Principal target para asegurar que los elementos no colisionen.
- **390x844**: Standard.
- **430x932**: Max (iPhone Pro Max / Pixel Pro).

## Acciones de Fase 1
- Refinar Tokens globales en CSS a OriginOS 6.
- Limpiar `index.css` de variables residuales e inyectar constantes `glass` refinadas.
- Actualizar `components/ui/LiquidGlass.tsx` para coincidir con OriginOS 6 (border más suaves, blur ajustado).
- Actualizar `Dock` and `SmartPill` con estética de "cristal puro".

## Acciones de Fase 2 (En Progreso / Ajustes UX Táctiles y Persistencia de Metas)
- **Alturas y Paddings Fluidos de OriginOS 6**: Ajustar el padding inferior de todas las pantallas para evitar colisiones con el Dock en dispositivos con viewports pequeños como 360x740.
- **Doble Contraste y Legibilidad**: Incrementar el contraste de leyendas, textos grises secundarios y elementos esmerilados para facilitar la lectura bajo luces artificiales intensas o sol directo en el piso de ventas.
- **Meta de Ahorros Dinámica e Integrada**: Añadir soporte de edición cruzada y persistencia para la Meta de Ingresos/Ahorros tanto en el panel de Ingresos (PiggyBank/Ahorros) como en la sección de Ajustes, calculando los porcentajes y círculos dinámicos con datos reales.
- **Micro-Interacciones Elásticas (Física Dinámica)**: Mejorar el feedback háptico con escalado dinámico al mantener presionados los botones de Registro, Configuración y Selección de color.

