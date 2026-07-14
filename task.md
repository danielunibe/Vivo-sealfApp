# Revisión visual y plan de corrección — APK Vivo Promotor

Fecha de revisión: 2026-07-10  
APK revisado: `dist-apk/vivo-promotor-debug.apk`  
Paquete: `com.davidsanchez.vivopromotor`  
Versión observada: `0.4.7` / versionCode `12`  
Dispositivo: emulador Pixel API 35, resolución 1280×2856

## Criterio de trabajo

- Mantener el flujo de venta, inventario, comisiones, ventas históricas y backup/import/export.
- No cambiar el applicationId ni sustituir las portadas PNG oficiales.
- Validar cada corrección en claro, oscuro, arranque en frío y emulador Android.
- Marcar cada tarea como `[x]` solo después de comprobarla visualmente en el APK reconstruido.

## Hallazgos confirmados

### P0 — Continuidad de navegación Android

- [ ] Desde una subpantalla de Ajustes (reproducido en Productos y modelos / Editor de Inicio y Apariencia), el botón Atrás del sistema termina en el launcher en vez de regresar a Ajustes. Implementar una ruta de retorno consistente antes de cerrar la actividad.
- [ ] Repetir la prueba en Productos, Inventario, Apariencia, Webs, Sistema e Historial; cada subpantalla debe conservar el estado de la sección padre al volver.
- [ ] Verificar que Atrás cierre primero overlays, hojas y diálogos; después subpantalla; y solo al final permita salir de la app.

### P1 — Carga progresiva de imágenes

- [ ] En Editor de Inicio, el primer estado visible puede mostrar el escenario negro con laterales vacíos mientras las portadas oficiales aún cargan. Evitar que el usuario interprete ese estado como fallo: mostrar placeholder/fallback visible y estable.
- [ ] Medir y reducir el tiempo desde la entrada a Productos hasta la primera portada visible; no bloquear el resto de controles mientras se cargan las imágenes.
- [ ] Confirmar que el mismo comportamiento no ocurra al volver desde Avanzado, cambiar de variante o abrir el editor en frío.

### P0 — Arranque / recuperación

- [ ] El APK permanece visualmente blanco durante aproximadamente 5–8 segundos antes de mostrar Registro. Agregar o reparar el fallback visible de arranque sin ocultar el contenido ya funcional.
- [ ] Comprobar que una excepción de migración, storage o carga inicial pinte una recuperación visible y no una pantalla blanca/negra vacía.
- [ ] Confirmar que el primer render no depende de que terminen de cargar todas las portadas.

### P1 — Registro / Inicio

- [ ] Conservar la portada edge-to-edge, pero revisar el contraste de la tarjeta superior contra wallpapers claros y oscuros.
- [ ] Revisar el truncado de etiquetas en las miniaturas laterales (`VI...`) y asegurar que siga siendo legible sin invadir el área de venta.
- [ ] Verificar que el botón `VENDER` sea presionable en Android en todos los modelos y que ninguna capa gestual capture el tap.
- [ ] Revisar la convivencia entre miniaturas laterales, tarjeta superior y dock inferior en pantallas pequeñas.

### P1 — Calendario

- [ ] Reducir la dominancia visual de la tarjeta roja de meta diaria; conservar el estado semántico de avance y mejorar la jerarquía.
- [ ] Mejorar contraste y grosor de las celdas punteadas para que los días se perciban como interactivos sin verse deslavados.
- [ ] Revisar el espaciado vertical: la cuadrícula ocupa casi toda la pantalla y empuja las tarjetas semanal/mensual/anual hacia abajo.
- [ ] Confirmar que las celdas con ventas mantengan `xN` e icono compacto de teléfono dentro de la celda.
- [ ] Probar claro/oscuro y fechas con ventas, hoy, futuro y mes con seis semanas.

### P1 — Catálogo

- [ ] Reforzar la identidad de modelo en cada tarjeta; actualmente predominan color y margen y falta una lectura inmediata del modelo.
- [ ] Ajustar el espacio vacío inferior de la pantalla para que el grid y el dock se sientan intencionales.
- [ ] Revisar tamaño, alineación y peso de las siluetas SVG para que todos los modelos tengan presencia homogénea.
- [ ] Confirmar que tocar la tarjeta abra la web oficial configurada y que la ausencia de URL guíe a Ajustes.
- [ ] Revisar detalle: chips de color visibles, swatches claros y gesto de deslizar como atajo secundario.

### P1 — Ingresos

- [ ] Mejorar la legibilidad de la tarjeta principal oscura y sus datos secundarios sin perder el panel ejecutivo compacto.
- [ ] Revisar el estado visual de `Smart Club`: aparece excesivamente desaturado/fantasma; debe distinguirse como disponible, bloqueado o informativo según su estado real.
- [ ] Unificar el peso visual de metas, ritmo, acumulados y porcentajes para evitar que compitan entre sí.
- [ ] Verificar que el historial reciente y las acciones con ventas reales mantengan buen contraste.

### P1 — Ajustes

- [ ] Revisar la jerarquía de las tarjetas: título, descripción, icono y chevron deben conservar una escala consistente en claro/oscuro.
- [ ] Aumentar la visibilidad del pie `VIVO PROMOTOR / AJUSTES`, que actualmente queda demasiado tenue.
- [ ] Corregir el truncado del encabezado `APARIENCIA Y RENDIMIE...`; el título debe ser legible completo o tener una abreviatura intencional.
- [ ] Revisar la altura de Apariencia: en una sola vista se acumulan modo oscuro, premium, animaciones y el bloque `Entorno (Demo)`, desplazando el contenido operativo.
- [ ] Confirmar contra la build activa qué controles tienen efecto real. `Modo demo` y los campos del escenario no deben aparecer como configuración operativa si no forman parte del flujo de producción.
- [ ] Evitar fechas demo antiguas visibles fuera de un estado demo explícitamente activado; durante la revisión apareció `06/13/2026` aunque la fecha actual del dispositivo era 10/07/2026.
- [ ] Revisar la sección legal visible y su lectura en pantallas pequeñas.
- [ ] Verificar que Apariencia solo muestre controles con efecto real (`Modo visual premium`, `Reducir animaciones`).

### P1 — Productos y modelos / Editor de Inicio

- [ ] Mantener la indicación de modo edición, outlines dashed y botones Guardar/Cancelar.
- [ ] Revisar la altura del mock de pantalla completa para que el primer estado útil llegue antes y no exija tanto desplazamiento.
- [ ] Confirmar que el borrador no persista hasta pulsar Guardar y que Cancelar restaure el estado anterior.
- [ ] Validar que modelo, color, portada, nombre, stock y miniaturas provengan de la misma variante.

### P2 — Consistencia transversal

- [ ] Normalizar radios, sombras, bordes, mayúsculas, tracking y colores de estado entre las cinco secciones principales.
- [ ] Revisar el área segura del dock inferior y el contraste de icono activo/inactivo.
- [ ] Probar soporte claro/oscuro, rotación no necesaria pero sí alturas pequeñas, y arranque después de reinstalar sin borrar datos.
- [ ] Repetir recorrido de accesibilidad visual: targets táctiles, foco, textos truncados y contraste.

## Evidencia generada

- `tmp-apk-launch.png`: captura temprana; muestra pantalla blanca durante el arranque.
- `tmp-apk-launch-after.png`: Registro cargado tras esperar.
- `tmp-apk-calendar.png`, `tmp-apk-catalog.png`, `tmp-apk-income.png`, `tmp-apk-settings.png`: recorrido de secciones principales.
- `tmp-apk-products.png`: Productos y modelos / Editor de Inicio.

## Orden de implementación nocturna

1. Arranque visible y recuperación (P0).
2. Registro: tap de venta, solapes y legibilidad de miniaturas.
3. Calendario: jerarquía, grid e indicadores de venta.
4. Catálogo: identidad de modelo, grid y detalle.
5. Ingresos y Ajustes: contraste y estados desaturados.
6. Productos y modelos: editor y consistencia de variantes.
7. Build, lint, instalación del APK y recorrido visual de regresión.

## Definición de terminado

- [ ] `npm run lint` sin errores.
- [ ] `npm run build` sin errores.
- [ ] `npm run android:deliver` genera APK actualizado conservando `com.davidsanchez.vivopromotor`.
- [ ] Arranque sin pantalla blanca prolongada o con fallback visible inmediato.
- [ ] Recorrido visual completo documentado con nuevas capturas y sin regresiones en ventas, inventario o backup.

## Secuencia programada

- [ ] **04:40 — revisión de continuidad:** revisar nuevamente el APK/build actual en frío y caliente, navegación Atrás Android, secciones principales, subpantallas, claro/oscuro, estados con datos y carga progresiva de assets.
- [ ] **04:40–05:30 — correcciones:** implementar los hallazgos confirmados priorizados, preservando identidad Android, ventas, comisiones, inventario y backup/import/export.
- [ ] **Después de la revisión — primer build:** ejecutar lint, build web y `android:deliver`; instalar el APK resultante en el emulador.
- [ ] **Segunda oportunidad — revisión del APK nuevo:** repetir el recorrido visual y de continuidad sobre el APK recién generado.
- [ ] **Cierre:** corregir regresiones encontradas, reconstruir si es necesario y entregar el segundo APK con la lista y evidencias actualizadas.

La ejecución está programada para la próxima ventana disponible a las 04:40, hora de Ciudad de México. Si la implementación o la segunda revisión exceden las 05:30, se debe continuar hasta dejar un APK compilable y documentar exactamente lo pendiente.
