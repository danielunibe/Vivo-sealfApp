# UNOVA_PROJECT_STATUS.md

> Ficha automática. Se regenera desde evidencia del proyecto y el historial central UNOVA.

- Proyecto: Vivo Promotor
- Identificador: `vivo-promotor`
- Grupo operativo: iniciado
- Última generación: 2026-07-14T07:10:39-06:00
- Ruta canónica: `C:\Desarrollos DEV daniel\app vivo`

## Propósito y estado

<div align="center" <img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" / </div

- Estado documentado: Código y estructura ejecutable detectados
- Evidencia técnica: Código y estructura ejecutable detectados
- Decisión de producto: No documentado

## Continuidad

- Último movimiento detectado: 2026-07-14T07:10:39-06:00
- Último avance documentado: No documentado
- Pendientes documentados: Desde una subpantalla de Ajustes (reproducido en Productos y modelos / Editor de Inicio y Apariencia), el botón Atrás del sistema termina en el launcher en vez de regresar a Ajustes. Implementar una ruta de retorno consistente antes de cerrar la actividad.; Repetir la prueba en Productos, Inventario, Apariencia, Webs, Sistema e Historial; cada subpantalla debe conservar el estado de la sección padre al volver.; Verificar que Atrás cierre primero overlays, hojas y diálogos; después subpantalla; y solo al final permita salir de la app.; En Editor de Inicio, el primer estado visible puede mostrar el escenario negro con laterales vacíos mientras las portadas oficiales aún cargan. Evitar que el usuario interprete ese estado como fallo: mostrar placeholder/fallback visible y estable.; Medir y reducir el tiempo desde la entrada a Productos hasta la primera portada visible; no bloquear el resto de controles mientras se cargan las imágenes.; Confirmar que el mismo comportamiento no ocurra al volver desde Avanzado, cambiar de variante o abrir el editor en frío.; El APK permanece visualmente blanco durante aproximadamente 5–8 segundos antes de mostrar Registro. Agregar o reparar el fallback visible de arranque sin ocultar el contenido ya funcional.; Comprobar que una excepción de migración, storage o carga inicial pinte una recuperación visible y no una pantalla blanca/negra vacía.; Confirmar que el primer render no depende de que terminen de cargar todas las portadas.; Conservar la portada edge-to-edge, pero revisar el contraste de la tarjeta superior contra wallpapers claros y oscuros.
- Próximo paso: Desde una subpantalla de Ajustes (reproducido en Productos y modelos / Editor de Inicio y Apariencia), el botón Atrás del sistema termina en el launcher en vez de regresar a Ajustes. Implementar una ruta de retorno consistente antes de cerrar la actividad.
- Bloqueos documentados: No documentado

## Progreso estimado

- MVP verificable: 76%
- Visión completa: 0%
- Confianza de la estimación: Alta

| Eje | Puntos | Máximo |
|---|---:|---:|
| Definición | 5 | 15 |
| Diseño | 10 | 10 |
| Arquitectura | 10 | 10 |
| Implementación | 30 | 30 |
| Pruebas | 10 | 15 |
| Empaquetado | 3 | 10 |
| Continuidad documental | 5 | 5 |
| Validación | 3 | 5 |

## Evidencia

- Archivos relevantes: 434
- Archivos de código: 155
- Documentos: 20
- Pruebas detectadas: 17
- Último archivo modificado: `android/capacitor-cordova-android-plugins/cordova.variables.gradle`
- Evidencia faltante: Ninguna crítica detectada
- Documentos posiblemente desactualizados: Ninguno detectado

## Fuente central

- Historial: `C:\Desarrollos DEV daniel\unova SA de CV\history`
- Catálogo: `C:\Desarrollos DEV daniel\unova SA de CV\data\proyectos.csv`
