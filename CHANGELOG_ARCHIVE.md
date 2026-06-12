# Archivo Histórico de Cambios (Changelog)

Registro histórico abreviado de las optimizaciones y patches estructurales implementados en la aplicación celular.

## [Patch I a XV] - Estabilización de Vistas Base
- **Navegación Establecida:** Creación del dock inferior flotante de 5 accesos neumórficos y persistencia local de transacciones.
- **Visuales Neumórficas:** Implementación del frasco realista con caída por gravedad de monedas y calendario de squircles activos.

## [Patch XVI] - Reducción de Recortes en Viewport
- **Eliminación de Contenedores Centrados:** Modificación de layouts principales para usar `justify-start` vertical, evitando cortes en la parte superior en celulares pequeños.
- **Scrollbars Fallback:** Configuración de contenedores con desplazabilidad de reserva en las secciones de registro de metas para evitar colisiones con el dock.

## [Patch XIX] - Solución de Colisiones de Grid
- **Grid Spacer Físico:** Inyección de caja oculta `col-span-2 h-32` al final del listado del catálogo para forzar que el último componente (`V60 lite`) se deslice por arriba del dock flotante.

## [Patch XX] - Optimización de Pantalla Única Catálogo
- **Fusión de Cabecera:** Remoción absoluta del componente `CatalogHeader` para recuperar espacio vertical.
- **Grids Proporcionales de Fila:** Rediseño del catálogo en cuadrícula estática `grid-rows-[1.1fr_1.1fr_0.8fr]` sin scrollboards.
- **Escalamiento Bento Elástico:** Flexibilidad responsiva mediante `h-full min-h-0` para acoplar las 5 tarjetas de celulares de manera inteligente.

## [Patch XXI] - Rediseño de Iconos y Capas de Alcancía
- **Tactile Catalog Compass:** Añadido de brújula interactiva 3D con aguja magnética rotatoria de coral y sombra de color integrada.
- **Capa de Moneda (Order Layer):** Corregido el renderizado de la moneda voladora del puerquito para depositarse visualmente adentro del frasco neumórfico y enmascarado por encima de la arcilla.
