# Reporte de Fase: Administración de Modelos de Dispositivos (PHASE_DEVICE_MODEL_MANAGEMENT)

Este documento registra la arquitectura, cambios y resultados de la implementación del módulo de administración completa de modelos de dispositivos, la integración de imágenes locales comprimidas en cliente, y el resguardo de la base de datos de comisiones históricas.

---

## 1. Objetivo
Convertir la sección de comisiones estáticas en una consola completa de administración de catálogo que permita al promotor dar de alta nuevos teléfonos, editar detalles (series, colores, márgenes), subir fotos personalizadas que persistan sin agotar la memoria del navegador (`localStorage`), y proteger las comisiones de ventas históricas de modificaciones posteriores.

---

## 2. Estado Anterior
- **Comisiones Estáticas:** Se limitaba a listar 5 modelos fijos de la constante `INITIAL_DEVICES` en `lib/constants.ts`.
- **Campos Limitados:** Solo se guardaban los campos básicos `id`, `name`, `margin` y `active`.
- **Sin fotos personalizadas:** Dependía estrictamente de los archivos estáticos preexistentes en la carpeta `public/assets/`.
- **Vulnerabilidad Histórica:** Cualquier alteración del margen recalculaba de inmediato el monto acumulado en el puerquito para ventas pasadas.

---

## 3. Cambios al Tipo Device (`types/device.ts`)
Se expandió la interfaz para soportar metadatos completos y colores dinámicos:
```typescript
export interface Device {
  id: string;
  name: string;
  margin: number;
  active?: boolean;
  
  // Nuevos campos para administración completa
  series?: string;
  description?: string;
  specs?: string;
  colors?: Array<{ hex: string; name: string }>;
  imageDataUrl?: string; // base64 de imagen comprimida en canvas
  imageUrl?: string; // fallback de assets
  createdAt?: number;
  updatedAt?: number;
}
```

---

## 4. Persistencia e Integración de LocalStorage
- **Llave de persistencia:** Los dispositivos se guardan en la llave `vivo_devices`.
- **Migración Defensiva:** Al cargar la app mediante `getPersistedDevices()` en `lib/storage.ts`, se verifica si los modelos por defecto carecen de especificaciones o colores. En tal caso, se enriquece automáticamente el registro en localStorage con los metadatos y chips de color oficiales del proyecto.
- **Sincronización:** Los cambios realizados se propagan de inmediato al carrusel de ventas en la pestaña **Registrar** y a las Bento Cards de la pestaña **Catálogo**.

---

## 5. Manual de Operación de la Consola

### A. Cómo Agregar un Modelo
1. Ir a **Ajustes** y seleccionar la pestaña **Dispositivos y ganancias** (icono de Smartphone).
2. Hacer clic en **Nuevo Modelo** (esquina superior derecha).
3. Rellenar los campos: Nombre, Serie (Y / V / Otro), Margen en pesos, Descripción y Especificaciones.
4. Agregar colores en la sección interactiva asignando el nombre del tono y eligiendo el color en el picker nativo.
5. Hacer clic en **Guardar Modelo**.

### B. Cómo Editar un Modelo
1. Hacer clic en el icono de **Lápiz** al lado del modelo correspondiente.
2. Modificar los campos necesarios en el formulario.
3. Hacer clic en **Guardar Modelo** para consolidar los cambios en localStorage.

### C. Cómo Desactivar / Eliminar un Modelo
- **Desactivar:** Se puede desmarcar el checkbox a la izquierda del nombre del dispositivo. Esto lo desactiva instantáneamente del carrusel de ventas (Registrar) y del Catálogo, pero lo conserva en Ajustes para su posterior reactivación.
- **Eliminar:** Hacer clic en el icono de **Bote de Basura**.
  - Si el dispositivo **NO** tiene ventas asociadas en `sales`, se elimina físicamente con confirmación del navegador.
  - Si el dispositivo **SÍ** tiene ventas registradas, la aplicación bloquea la eliminación física y advierte al usuario que solo se permite desactivar para proteger el historial.

---

## 6. Subida e Imagen Comprimida en Cliente (Canvas)
Para evitar el desbordamiento de cuota de `localStorage` (~5MB), implementamos un compresor en cliente usando la API del lienzo Canvas de HTML5:
1. Al cargar una imagen de cualquier tamaño mediante `<input type="file">`, `FileReader` la lee en memoria.
2. Un objeto `Image` de Javascript procesa la imagen y calcula una escala proporcional de un máximo de **300px** de ancho/alto.
3. Se dibuja la imagen redimensionada sobre un lienzo Canvas y se codifica en **JPEG al 70% de calidad**.
4. Esto reduce el peso físico de la imagen de megabytes a **~15KB**, permitiendo guardar decenas de fotos sin colapsar el almacenamiento.

---

## 7. Protección de Ventas Históricas
Al registrar una venta en `AppShell.tsx`:
1. Se realiza un snapshot del nombre, color seleccionado y de la comisión exacta del dispositivo en el momento de la confirmación:
   `amountEarned: device.margin`
2. Esta cifra se escribe de forma inalterable en el objeto `Sale` dentro de la lista `vivo_real_sales`.
3. Si el promotor actualiza la comisión del dispositivo en Ajustes posteriormente, las ventas históricas conservan su valor original, protegiendo las estadísticas reales de David.

---

## 8. Evidencia del Proceso de QA
Las pruebas funcionales se validaron mediante emulación de viewports móviles en `http://localhost:3000`:
- **settings_device_manager.png:** Muestra el panel de administración listando los teléfonos.
- **settings_device_manager_updated.png:** Muestra la inserción de un dispositivo personalizado con colores y metadatos.
- **register_sale_new_device.png:** Muestra el nuevo modelo incorporado en el carrusel de ventas con su color, nombre y comisión de $550 MXN.
- **catalog_new_device.png:** Muestra la Bento card del nuevo modelo renderizada en el catálogo.

---

## 9. Resultados de Compilación Técnica
- **npm run lint:** Aprobado sin errores.
- **npm run build:** Completado de forma exitosa (`next build` optimizó el bundle de producción correctamente).

---

## 10. Próxima Fase Recomendada
Se recomienda proceder con la:
**Fase E — Exportación de Datos en Formato CSV y Respaldo JSON Completo** en la pestaña de Ajustes para permitir que David descargue sus reportes a Excel y realice respaldos de seguridad locales de su base de datos.
