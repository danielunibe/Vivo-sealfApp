# CODEX_GUARDRAILS.md

## Regla principal

Codex solo debe modificar lo solicitado o lo estrictamente necesario para cumplir la fase activa. Todo lo demas queda protegido por defecto.

## No tocar sin permiso

| No tocar | Motivo | Estado |
|---|---|---|
| `applicationId` Android | Permite instalar como actualizacion de la app anterior | protegido |
| Llaves `vivo_*` | Conservan datos del usuario | protegido |
| Comisiones | Afectan ventas | protegido |
| Backup/import/export | Seguridad de datos | protegido |
| Portadas entregadas en `public/assets/devices/official/` | Son fuente visual dada por el usuario | protegido |
| PNG de portadas/wallpapers | Deben seguir como imagen grande de Registro; los SVG son iconos, no wallpapers | protegido |

## Fase activa

- El codigo web fue reemplazado por `C:\Users\danie\Downloads\vivoapp.zip`.
- `android/` se conserva como envoltura tecnica para generar APK con el mismo paquete.
- La actualizacion Android debe mantener `com.davidsanchez.vivopromotor` y subir `versionCode`.
- Las portadas se toman de `C:\Users\danie\Downloads\portadas` y se resuelven por modelo/color.

## Reglas endurecidas

- No usar `localStorage.clear()`.
- No borrar ventas o historial durante migraciones.
- Migrar datos heredados `dev-*` y `vivo_real_sales` de forma no destructiva; nunca borrar llaves antiguas para forzar que la pantalla cargue.
- No cambiar el orden de modelos o variantes fuera de Ajustes > Productos y modelos salvo instruccion directa del usuario.
- No volver a inflar la vista inicial de Ingresos con coach, retos, logros, galerias o estadisticas extendidas por defecto; deben quedar fuera del inicio salvo solicitud directa.
- No reemplazar `android/` si eso rompe la capacidad de instalar encima de la app anterior.
- No cambiar nombres de modelo/color sin actualizar `src/lib/officialDeviceCovers.ts`.
- No reemplazar las portadas PNG de Registro por los SVG de iconos; los SVG se usan para calendario/representacion compacta.
- No reemplazar en Catalogo la tarjeta SVG del modelo por miniaturas PNG; en esa superficie el resumen del equipo debe seguir saliendo desde `VivoPhoneIcon`.
- En Catalogo, la accion principal de una tarjeta de modelo es abrir la web oficial configurada; si falta URL, guiar a Ajustes > Productos y modelos.
- La cache offline de webs oficiales es best-effort: guardar lo maximo permitido y declarar si queda completa, parcial o bloqueada.
- Las imagenes personalizadas de modelos/variantes deben vivir fuera de `localStorage` pesado; usar referencias ligeras y media local.
- En Inicio solo una imagen de galeria puede estar activa por variante; las demas quedan guardadas para elegirlas desde Ajustes.
- En Ajustes > Productos y modelos, no permitir que una imagen manual desplace la portada oficial de un modelo/color Vivo conocido.
- En Ajustes > Productos y modelos, `Editar Inicio` trabaja con borrador y requiere Guardar/Cancelar; no persistir cada ajuste visual de inmediato.
- No convertir `Editar Inicio` en canvas libre ni guardar coordenadas por elemento sin autorizacion explicita; el orden visual debe seguir `sortOrder`.
- Mantener `Avanzado` como ruta disponible para edicion completa de modelos, variantes, comisiones, enlaces e inventario.
- No depender de iconos remotos para el dock principal; los assets visuales base del shell deben quedar locales en el proyecto.
- En Registro, la seleccion visual debe seguir la portada oficial activa; no reintroducir estados donde wallpaper, acento y nombre de color apunten a variantes distintas.
- Ajustes, inventario y registro de ventas deben leer el mismo inventario de `phoneModels` por variante; no reintroducir la hoja legacy basada en `getDevices()` para los conteos operativos.
- Toda venta que afecte stock debe dejar un movimiento trazable con relacion a la venta y, cuando exista, identidad completa de modelo/variante.
- No mantener switches de apariencia que no controlen nada real; si una preferencia no gobierna la app activa, debe retirarse o volverse funcional.
- La seccion legal no debe prometer nube, permisos sensibles, transferencias o servicios remotos si el codigo actual no los ejecuta realmente.
- El fullscreen nativo Android debe fallar suave en capas OEM como ColorOS/Oppo; no usar `FLAG_LAYOUT_NO_LIMITS`, no forzar `LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS` y no limpiar padding/margenes recursivamente sobre todo el arbol nativo.
- El arranque WebView no debe quedar en pantalla negra: las migraciones de storage deben estar protegidas, Registro no debe devolver `null` silencioso si faltan modelos/variantes, y debe existir fallback HTML/React visible de recuperacion.
