# DESIGN.md

## Identidad visual

Vivo Promotor mantiene una experiencia mobile-first con tarjetas glass, fondos oscuros en Registro y navegacion inferior flotante.

## Reglas activas

- Registro usa portadas oficiales full-screen por modelo y color.
- Registro debe renderizar la portada edge-to-edge desde el primer pixel del viewport, sin franja blanca superior ni padding visual sobre la imagen.
- Las portadas no deben depender de URLs externas cuando exista asset local.
- Las portadas/wallpapers grandes de Registro usan los PNG locales de `public/assets/devices/official/`; no deben sustituirse por SVG.
- Las variantes oficiales usan representaciones SVG locales solo como iconos compactos, especialmente en Calendario y superficies donde se necesita silueta de telefono.
- Las cajas del Calendario deben resumir lo vendido del dia como `xN` junto a un icono compacto de celular dentro de la propia celda; si no hay SVG utilizable, usar un icono general de telefono.
- En Catalogo, las tarjetas de producto deben priorizar la silueta compacta SVG/local del dispositivo; no deben dominar con cajas o imagenes demasiado grandes.
- En Catalogo, la tarjeta-resumen de cada modelo debe renderizar el SVG propio del modelo/color activo; los PNG oficiales de `portadas` se reservan para fondos, wallpapers, detalle o vistas grandes.
- En Catalogo, tocar un modelo abre la web oficial configurada; la ficha interna comercial deja de ser la accion primaria de la tarjeta.
- En el detalle de Catalogo, el cambio de color debe tener chips visibles con nombre y swatch; el gesto de deslizar queda solo como atajo secundario.
- En Ajustes > Productos y modelos, las previews de variantes oficiales deben resolver primero por modelo/color para evitar fotos cruzadas.
- En Ajustes > Productos y modelos, cada variante puede tener galeria local; solo una imagen queda activa y esa misma imagen debe verse en Inicio.
- En Ajustes > Productos y modelos, `Editar Inicio` es el modo principal para ajustar visualmente la pantalla de Registro: replica el wallpaper, nombre, variante, stock, miniaturas laterales y dock en estado no operativo.
- El modo `Editar Inicio` debe indicar claramente que esta en edicion mediante outlines finos/dashed y toolbar de guardar/cancelar; no debe sentirse como la pantalla real de venta.
- `Editar Inicio` reordena modelos y variantes mediante `sortOrder`; no usa posiciones libres ni coordenadas persistidas.
- El modo `Avanzado` conserva la gestion completa tipo lista para enlaces, comisiones, URLs, altas/bajas y campos extensos.
- Si un modelo de Catalogo no tiene URL, debe guiar a configurarla en Ajustes.
- La copia offline de webs oficiales debe declarar su estado real: sin cache, cache completo, cache parcial o bloqueado.
- La fila superior de Registro muestra cajitas por portada/variante activa, con ocho cajitas visibles antes del scroll horizontal y menor altura para convivir con el dock inferior.
- En Registro, la portada oficial activa debe gobernar en conjunto el wallpaper, el color/acento y el nombre visible de variante; no se debe mezclar una foto oficial con texto heredado de otra variante.
- El boton principal de venta en Registro debe quedar completamente presionable en Android; las capas gestuales no pueden robar ese tap.
- Mantener soporte claro/oscuro.
- Mantener dock inferior con cinco accesos principales.
- No aplicar filtros, scrims o degradados pesados sobre las portadas oficiales sin autorizacion.
- Ingresos debe funcionar como panel ejecutivo compacto: resumen mensual, ritmo, acciones y ultimos movimientos; coach, retos, logros o estadisticas extendidas no deben dominar la vista inicial.
- El arranque debe mostrar una marca/fallback visible si WebView o React tardan; no se permite una pantalla negra vacia como estado de carga o error.
- La tarjeta especial final de Catalogo debe sentirse intencional y editorial; no debe quedar como una celda solitaria que parezca bug de grid.
- Los iconos del dock principal deben resolverse desde assets locales del proyecto; no deben depender de URLs remotas.
- El arranque debe usar el icono oficial local como pieza central visual; no debe depender de video para la intro.
- El Soft Launch de arranque es icon-first sobre fondo claro del sistema: icono + wordmark VIVO/Promotor + loader mínimo; sin tarjeta de novedades, sin anillos giratorios ni barra de porcentaje falsa.
- Las novedades de versión se muestran solo en el overlay post-arranque cuando hay notas no vistas; no se duplican en el boot.
- El sonido de entrada debe sentirse como un earcon corto, limpio y premium, no como musica larga o efecto intrusivo.
- En Ajustes > Apariencia y rendimiento solo deben existir controles con efecto real en la build activa; hoy quedan `Modo visual premium` y `Reducir animaciones`.
- Ajustes debe incluir una sección legal visible con términos base, privacidad, titularidad y propiedad intelectual coherentes con el comportamiento real de la app.

## Portadas oficiales

Las portadas activas fueron copiadas desde `C:\Users\danie\Downloads\portadas` hacia `public/assets/devices/official/`.
Los SVG oficiales viven en la misma carpeta, pero su rol es icono/representacion compacta; el rol de wallpaper queda reservado para los PNG.
La pantalla de inicio debe resolver esas portadas por nombre de archivo/modelo-color y mostrar exactamente las variantes oficiales disponibles en esa carpeta.

| Modelo | Colores con portada local |
|---|---|
| Y04 | Verde Jade, Lavanda Cristal |
| Y21D | Negro Jade, Morado Lavanda |
| Y29 | Black Expresso, Blanco Nube |
| Y31D | Gris Estelar, Blanco Brillante |
| V50 Lite | Negro Mistico, Lila Fantasia |
| V60 Lite | Negro Elegante, Azul Titanio |

## Orden visual de modelos

El orden visible en Registro, Catalogo y selectores se controla desde Ajustes > Productos y modelos. Los botones de subir/bajar actualizan `sortOrder` de modelos y variantes; no debe cambiarse ese orden desde otras superficies sin instruccion directa.
`Editar Inicio` es la superficie preferente para cambios visuales de orden, nombre, stock e imagen activa porque muestra una replica segura de Registro antes de guardar.

## Elementos protegidos

- Portadas oficiales por color.
- Flujo principal de registro.
- Vista inicial compacta de Ingresos.
- Backup/import/export.
- Identidad Android para actualizacion encima.
