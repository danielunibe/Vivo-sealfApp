# Requirements Document

## Introduction

Esta funcionalidad define una experiencia integral alrededor del catálogo de modelos Vivo dentro de la app Vivo Promotor (React 19 + Vite 6 + TypeScript, empaquetada como APK Android con Capacitor 8, local-first sobre localStorage + IndexedDB, `applicationId` `com.davidsanchez.vivopromotor`).

El objetivo es que las 12 portadas oficiales (6 modelos × 2 colores) se muestren correctamente identificándolas por el nombre de archivo sin omitir ninguna, que cada modelo tenga su link oficial configurado, que la primera apertura descargue y cachee la web oficial para uso offline (best-effort), que el catálogo visualice los 6 modelos respetando la regla de tarjeta SVG, y que la última caja del catálogo ofrezca una nueva interfaz de compra que se apoye en el flujo de venta/stock existente sin romperlo.

Restricciones de proyecto que este documento respeta (ver `AGENTS.md`, `CODEX_GUARDRAILS.md`, `ARCHITECTURE.md`):

- No se cambia `applicationId` ni se borran llaves `vivo_*`.
- No se modifican comisiones, backup/import/export ni el flujo de venta existente sin instrucción directa; la interfaz de compra reutiliza los puntos de entrada actuales sin alterarlos.
- Las portadas oficiales se resuelven exclusivamente desde `src/lib/officialDeviceCovers.ts`.
- En Catálogo la tarjeta de modelo usa el SVG (`VivoPhoneIcon`), no miniaturas PNG.
- La caché offline de webs oficiales es best-effort y declara su estado (completo/parcial/bloqueado).
- Las imágenes personalizadas no desplazan portadas oficiales de colores Vivo conocidos.

### Hallazgo de contexto (confirmación de assets)

Las 12 imágenes solicitadas YA existen en `public/assets/devices/official/` y ya están mapeadas en `src/lib/officialDeviceCovers.ts`. Por lo tanto NO es necesario copiar archivos nuevos; el trabajo consiste en garantizar que la resolución por nombre de archivo sea completa y correcta, y que la interfaz las muestre. Los nombres de archivo con typos conocidos (`vivoy21d_negrto_jade`, `vivoy29_black_exxpresso`) se conservan como fuente de verdad y se referencian tal cual.

## Glossary

- **Catalog_Service**: Módulo que provee los modelos activos al Catálogo (`getActivePhoneModels`, `getActiveOrderedVariants`).
- **Cover_Resolver**: Módulo `src/lib/officialDeviceCovers.ts` que mapea modelo/color a la portada oficial (PNG) y al icono (SVG) por nombre de archivo.
- **Catalog_View**: Sección de interfaz del catálogo (`src/features/CatalogSection.tsx`) que renderiza las tarjetas de modelo, la tarjeta de academia y la nueva caja de compra.
- **Model_Card**: Tarjeta de un modelo dentro de Catalog_View; su representación visual del equipo usa `VivoPhoneIcon` (SVG).
- **Web_Preview_Panel**: Panel `src/features/catalog/WebPreviewPanel.tsx` que abre/previsualiza la web oficial de un modelo.
- **Web_Archive_Service**: Módulo `src/lib/webArchive.ts` que captura y cachea la web oficial en almacenamiento local (best-effort).
- **Local_Media_Store**: Capa IndexedDB (`src/lib/localMediaStore.ts`) donde se guardan recursos web y el registro `WebArchiveRecord`.
- **Purchase_Box**: Nueva caja ubicada como último elemento del Catalog_View que ofrece la experiencia de compra.
- **Purchase_Flow**: Experiencia de compra que se activa desde Purchase_Box.
- **Sales_Service**: Módulo de venta/stock existente (`saveSaleWithInventory` en `src/lib/storage.ts`) que registra ventas y descuenta stock con movimiento trazable.
- **Official_Model**: Uno de los 6 modelos Vivo soportados (Y04, Y21d, Y29, Y31d, V50 Lite, V60 Lite).
- **Variant**: Combinación modelo + color (PhoneVariant), 12 en total (2 por modelo).
- **Official_URL**: URL de la página oficial del modelo en `vivo.com`.
- **Cache_Status**: Estado declarado de la caché offline de un modelo: `sin_cache`, `cache_completo`, `cache_parcial` o `bloqueado`.
- **First_Open**: Primera vez que se abre la app tras instalación, o la primera vez que se abre un modelo cuya web aún no tiene registro de caché.
- **Settings_Products**: Pantalla Ajustes > Productos y modelos, donde se configuran URLs oficiales e inventario.

## Requirements

### Requirement 1: Mapeo de portadas por nombre de archivo

**User Story:** Como promotor, quiero que cada color de cada modelo se identifique por el nombre exacto de su archivo de portada, para que las 12 imágenes se muestren sin que se omita ninguna.

#### Acceptance Criteria

1. THE Cover_Resolver SHALL exponer exactamente 6 Official_Model con identificadores `y04`, `y21d`, `y29`, `y31d`, `v50-lite` y `v60-lite`.
2. THE Cover_Resolver SHALL asociar a cada Official_Model exactamente 2 Variant, para un total de exactamente 12 Variant.
3. THE Cover_Resolver SHALL resolver la portada de `vivo V50 Lite` al archivo `vivov50lite_lilafantasia.png` para la Variant Lila Fantasía y al archivo `Vivov50lite_negromistico.png` para la Variant Negro Místico.
4. THE Cover_Resolver SHALL resolver la portada de `vivo V60 Lite` al archivo `vivov60lite_azultitanio.png` para la Variant Azul Titanio y al archivo `vivov60lite_negroelegante.png` para la Variant Negro Elegante.
5. THE Cover_Resolver SHALL resolver la portada de `vivo Y04` al archivo `vivoY04_lavanda_cristal.png` para la Variant Lavanda Cristal y al archivo `vivoY04_verde_jade.png` para la Variant Verde Jade.
6. THE Cover_Resolver SHALL resolver la portada de `vivo Y21d` al archivo `vivoy21d_morado_lavanda.png` para la Variant Morado Lavanda y al archivo `vivoy21d_negrto_jade.png` para la Variant Negro Jade.
7. THE Cover_Resolver SHALL resolver la portada de `vivo Y29` al archivo `vivoy29_blanconube.png` para la Variant Blanco Nube y al archivo `vivoy29_black_exxpresso.png` para la Variant Negro Espresso.
8. THE Cover_Resolver SHALL resolver la portada de `vivo Y31d` al archivo `vivoY31d_blanco_brillante.png` para la Variant Blanco Brillante y al archivo `vivoY31d_gris_estelar.png` para la Variant Gris Estelar.
9. WHERE un nombre de archivo contiene un typo conocido (`vivoy21d_negrto_jade` para Negro Jade y `vivoy29_black_exxpresso` para Negro Espresso), THE Cover_Resolver SHALL usar el nombre de archivo real tal cual, sin renombrarlo ni corregir el typo.
10. THE Cover_Resolver SHALL comparar el nombre de color de cada Variant contra el nombre de archivo aplicando `normalizeTextKey`, de forma que dos cadenas se consideren coincidentes cuando, tras normalización, resultan idénticas ignorando mayúsculas/minúsculas, acentos y diacríticos, y tratando los separadores espacio, guion (`-`) y guion bajo (`_`) como equivalentes.
11. WHEN se renderiza el catálogo oficial, THE Cover_Resolver SHALL mostrar las 12 portadas resueltas (2 por cada uno de los 6 Official_Model) sin omitir ninguna Variant.
12. IF una Variant no encuentra su archivo de portada `.png`, THEN THE Cover_Resolver SHALL sustituir la portada por el icono SVG de la misma Variant (`VivoPhoneIcon`) e indicar que la Variant no dispone de portada oficial, en lugar de un espacio roto.

### Requirement 2: Reconciliación de la discrepancia de colores Y04/Y21d

**User Story:** Como promotor, quiero que se documente y resuelva la diferencia entre la tabla de links y los archivos reales, para que la imagen mostrada siempre corresponda al archivo existente.

#### Acceptance Criteria

1. THE Cover_Resolver SHALL tratar el nombre del archivo de portada como la fuente de verdad para la imagen mostrada de cada Variant, con prioridad sobre el color declarado en la tabla de links cuando ambos difieran.
2. WHERE la tabla de links declara para `vivo Y04` el color "Negro Jade" pero el archivo real es `vivoY04_verde_jade.png`, THE Cover_Resolver SHALL mostrar la portada `Verde Jade` para esa Variant.
3. THE Cover_Resolver SHALL conservar para `vivo Y21d` el color "Negro Jade" resuelto desde el archivo `vivoy21d_negrto_jade.png`.
4. THE requirements documentation SHALL registrar explícitamente que la reconciliación se resuelve a favor del nombre de archivo y que el link oficial del modelo no cambia por la diferencia de nombre de color.
5. IF el archivo de portada referenciado para una Variant no existe en el directorio de imágenes, THEN THE Cover_Resolver SHALL mostrar una imagen de portada de reemplazo y conservar el resto de la información de la Variant, sin interrumpir la visualización del catálogo.
6. WHEN el Cover_Resolver detecta una diferencia entre el color declarado en la tabla de links y el color derivado del nombre del archivo, THE Cover_Resolver SHALL registrar la discrepancia identificando la Variant afectada, el color declarado y el color derivado del nombre del archivo.

### Requirement 3: Configuración de links oficiales por modelo

**User Story:** Como promotor, quiero que cada modelo tenga su URL oficial agrupando sus colores como variantes del mismo equipo, para abrir la web oficial correcta desde el catálogo.

#### Acceptance Criteria

1. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/y31d` al Official_Model `vivo Y31d`.
2. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/v60-lite` al Official_Model `vivo V60 Lite`.
3. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/v50-lite` al Official_Model `vivo V50 Lite`.
4. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/y29-4g` al Official_Model `vivo Y29`.
5. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/y21d` al Official_Model `vivo Y21d`.
6. THE Catalog_Service SHALL asignar la Official_URL `https://www.vivo.com/mx/products/y04` al Official_Model `vivo Y04`.
7. THE Catalog_Service SHALL agrupar los 2 colores de cada Official_Model como Variant del mismo equipo bajo una única Official_URL.
8. WHERE el usuario configuró previamente en Settings_Products una Official_URL cuyo valor difiere del valor por defecto, THE Catalog_Service SHALL conservar el valor configurado por el usuario y no sobrescribirlo durante actualizaciones o recargas de datos de la aplicación.
9. IF un Official_Model no tiene Official_URL asignada, THEN THE Catalog_View SHALL deshabilitar la acción de abrir la web oficial para ese modelo y mostrar un mensaje visible indicando que se requiere configuración, ofreciendo una acción de navegación directa hacia Settings_Products.
10. WHEN el usuario selecciona la acción de web oficial de un Official_Model que tiene Official_URL asignada, THE Catalog_Service SHALL abrir la Official_URL correspondiente a ese Official_Model.
11. IF la Official_URL asignada a un Official_Model no es una URL absoluta válida con esquema `https`, THEN THE Catalog_Service SHALL rechazar la apertura, conservar el valor almacenado y mostrar un mensaje indicando que la URL configurada es inválida.

### Requirement 4: Descarga y caché en la primera apertura

**User Story:** Como promotor, quiero que la primera vez que abro la app o un modelo se descargue y cachee la web oficial, para poder consultarla offline después.

#### Acceptance Criteria

1. WHEN ocurre un First_Open para un Official_Model con Official_URL configurada, THE Web_Archive_Service SHALL intentar capturar el HTML base y los recursos cacheables, entendidos como los recursos estáticos referenciados por el HTML base (imágenes, hojas de estilo y scripts).
2. THE Web_Archive_Service SHALL guardar los recursos capturados en Local_Media_Store (IndexedDB) y NO SHALL usar localStorage para datos pesados.
3. IF la captura del HTML base no finaliza dentro de 30 segundos, THEN THE Web_Archive_Service SHALL abortar la captura y declarar Cache_Status `bloqueado`.
4. WHEN la captura almacena el HTML base y el 100% de los recursos cacheables, THE Web_Archive_Service SHALL declarar Cache_Status `cache_completo`.
5. IF la captura almacena el HTML base pero menos del 100% de los recursos cacheables por bloqueo o por límite de almacenamiento, THEN THE Web_Archive_Service SHALL declarar Cache_Status `cache_parcial` y registrar los recursos omitidos con su motivo.
6. IF la captura no obtiene un HTML base utilizable, THEN THE Web_Archive_Service SHALL declarar Cache_Status `bloqueado` y registrar el motivo.
7. WHEN el almacenamiento local para un modelo alcanza el límite definido (`WEB_ARCHIVE_MODEL_LIMIT_BYTES`), THE Web_Archive_Service SHALL detener la descarga de ese modelo conservando el HTML base y los recursos ya almacenados, y registrar que se alcanzó el límite.
8. WHILE el dispositivo está sin conexión y existe un registro con `offlineHtml`, THE Web_Preview_Panel SHALL mostrar la copia offline almacenada.
9. WHILE el dispositivo está sin conexión y no existe copia offline utilizable, THE Web_Preview_Panel SHALL mostrar un mensaje que indique que se requiere conexión para guardar la web.
10. THE Web_Preview_Panel SHALL mostrar el Cache_Status vigente de cada modelo mediante una etiqueta visible restringida a los valores `sin_cache`, `cache_completo`, `cache_parcial` o `bloqueado`.
11. WHEN el usuario solicita actualizar la caché de un modelo, THE Web_Archive_Service SHALL recapturar la Official_URL y actualizar el Cache_Status resultante.
12. IF la recaptura falla, THEN THE Web_Archive_Service SHALL preservar la copia offline previa y el Cache_Status anterior, e informar al usuario del error de actualización.

### Requirement 5: Visualización de los 6 modelos en el catálogo

**User Story:** Como promotor, quiero ver los 6 modelos en el catálogo con su representación visual y acción de web oficial, para explorar y presentar el portafolio.

#### Acceptance Criteria

1. THE Catalog_View SHALL mostrar exactamente una Model_Card por cada Official_Model activo, presentando las 6 Model_Card cuando los 6 Official_Model estén activos.
2. THE Model_Card SHALL representar el equipo usando el icono SVG `VivoPhoneIcon` y NO usar miniaturas PNG en esa superficie.
3. THE Model_Card SHALL mostrar el nombre del modelo, el resumen de colores correspondiente a todas sus Variant activas, el rango de margen expresado como valor mínimo y valor máximo, y el stock disponible total calculado como la suma del stock de sus Variant activas.
4. WHEN el usuario toca una Model_Card que tiene Official_URL definida, THE Catalog_View SHALL abrir el Web_Preview_Panel en un máximo de 1 segundo.
5. IF el usuario toca una Model_Card sin Official_URL definida, THEN THE Catalog_View SHALL redirigir a Settings_Products y mostrar una indicación de que falta la URL oficial, conservando los datos del modelo sin modificarlos.
6. THE Catalog_View SHALL ordenar los modelos y las variantes según el orden definido en `src/lib/modelOrdering.ts`, sin alterar ese orden en ningún contexto fuera de Settings_Products.
7. WHERE un color de un Official_Model conocido tiene portada oficial, THE Catalog_View SHALL priorizar la portada oficial sobre las imágenes personalizadas para esa Variant.
8. IF el Web_Preview_Panel no logra cargar la Official_URL dentro de 10 segundos, THEN THE Catalog_View SHALL mostrar un mensaje de error indicando que la vista web no está disponible y conservar el estado previo del catálogo.
9. WHILE no exista ningún Official_Model activo, THE Catalog_View SHALL mostrar un mensaje indicando que no hay modelos disponibles.

### Requirement 6: Interfaz de compra en la última caja del catálogo

**User Story:** Como promotor, quiero que la última caja del catálogo sea una interfaz de compra, para poder concretar la compra de un modelo apoyándome en el flujo de venta y stock existente.

#### Acceptance Criteria

1. THE Catalog_View SHALL renderizar Purchase_Box como el último elemento del catálogo, después de todas las Model_Card y de la tarjeta de academia.
2. WHEN el usuario abre Purchase_Box, THE Purchase_Flow SHALL permitir seleccionar un Official_Model entre los 6 modelos activos.
3. WHEN el usuario selecciona un Official_Model, THE Purchase_Flow SHALL permitir seleccionar una Variant activa de ese modelo.
4. WHEN el usuario selecciona una Variant, THE Purchase_Flow SHALL mostrar el color, la portada oficial y el stock disponible de la Variant, expresado como un entero mayor o igual a 0.
5. WHEN el usuario selecciona una Variant con stock disponible mayor o igual a 1, THE Purchase_Flow SHALL permitir indicar una cantidad entera comprendida entre 1 y el stock disponible de la Variant, ambos inclusive.
6. IF la cantidad indicada es menor a 1, mayor al stock disponible o no es un entero, THEN THE Purchase_Flow SHALL bloquear la confirmación, mostrar un mensaje indicando el rango válido y mostrar el stock disponible actual.
7. WHEN el usuario confirma la compra, THE Purchase_Flow SHALL registrar la venta reutilizando `saveSaleWithInventory` de `storage.ts` sin modificar su implementación.
8. WHEN `saveSaleWithInventory` completa el registro con éxito, THE Purchase_Flow SHALL descontar del stock de la Variant la cantidad comprada y generar un movimiento de inventario trazable que incluya el Official_Model, la Variant, la cantidad comprada y la fecha del movimiento.
9. IF `saveSaleWithInventory` falla durante el registro de la venta, THEN THE Purchase_Flow SHALL abortar la operación sin descontar stock, preservar el estado previo de la Variant y del inventario, y mostrar un mensaje de error indicando que la compra no se completó.
10. IF el Official_Model seleccionado no tiene ninguna Variant activa, THEN THE Purchase_Flow SHALL indicar que no hay variantes disponibles y bloquear la selección de Variant y la confirmación de compra.
11. THE Purchase_Flow SHALL preservar las comisiones existentes de cada Variant sin modificarlas durante la compra.
12. WHEN una compra se confirma con éxito, THE Purchase_Flow SHALL mostrar una confirmación con el Official_Model, el color de la Variant y la cantidad comprada.
13. IF la Variant seleccionada tiene stock disponible igual a 0, THEN THE Purchase_Flow SHALL indicar "Agotado" y bloquear la confirmación de la compra para esa Variant.
14. THE Purchase_Flow SHALL mantener funcional el flujo de venta existente en otras secciones sin duplicar ni alterar sus datos.
