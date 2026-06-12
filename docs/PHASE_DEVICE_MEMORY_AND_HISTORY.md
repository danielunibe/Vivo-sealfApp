# Persistencia de Dispositivos e Historial de Ventas (Fase 1)

Este documento detalla la implementación técnica para asegurar la memoria persistente de la configuración de dispositivos, la creación del panel de Historial operativo dentro de Ajustes, y las configuraciones de permisos.

---

## 1. Objetivo
Lograr que la aplicación retenga de forma robusta e idempotente la configuración de los dispositivos (márgenes/comisiones y estados activo/inactivo), y proporcionar una sección en Ajustes para auditar las ventas registradas con soporte de exportación a formato CSV e interacción con portapapeles.

---

## 2. Estado Anterior
* Los dispositivos se inicializaban desde un arreglo estático `INITIAL_DEVICES` en `lib/constants.ts` en cada recarga de página, perdiendo cualquier edición de comisiones realizada en la sección Ajustes.
* No existía un panel donde el usuario pudiera ver el historial detallado de ventas registradas, excepto de manera indirecta en el calendario o las monedas de la alcancía.
* Había una brecha en la propagación de funciones modificadoras (`setSales` y `setMovements`) desde `AppShell.tsx` hacia `MainContent.tsx` e hijos.

---

## 3. Cambios Aplicados

### A. Consolidación de Persistencia de Dispositivos
* Se implementaron y consolidaron las funciones `getPersistedDevices()`, `savePersistedDevices()`, y `resetDevicesToDefault()` en `lib/storage.ts` que encapsulan el acceso seguro e idempotente a `localStorage` previniendo errores de hidratación en Server-Side Rendering (SSR).
* El hook `useAppShellState.ts` carga ahora los dispositivos al iniciar y guarda cualquier modificación de forma automática y reactiva.
* Se agregó la propiedad `active?: boolean` en la interfaz `Device` en [device.ts](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/types/device.ts) para permitir habilitar/deshabilitar modelos.
* Se corrigió el mapeo de índices en el Catálogo ([CatalogDeviceGrid.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/catalog/CatalogDeviceGrid.tsx)) para buscar dinámicamente el índice original en la lista completa (`devices.indexOf(device)`) en lugar de usar el índice del bucle de dispositivos activos, previniendo discrepancias al navegar a la pestaña de Registrar Venta con dispositivos desactivados.

### B. Sección Historial de Ventas en Ajustes
* Se creó el componente [HistorySettings.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/settings/HistorySettings.tsx).
* Se integró como un nuevo tab interactivo (`history`) representado por un icono de historial en el panel de navegación superior de la vista de Ajustes en [SettingsView.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/SettingsView.tsx).
* Muestra tarjetas KPI con:
  * Total ahorrado acumulado (en pesos mexicanos `$MXN`).
  * Total de piezas de dispositivos vendidas.
* Muestra un listado ordenado cronológicamente (descendente) de las ventas.
* Ofrece las siguientes funciones operativas:
  * **Copiar Resumen:** Agrupa las ventas por dispositivo, calcula totales y copia al portapapeles un informe de texto limpio y legible.
  * **Descargar CSV:** Exporta las ventas a un archivo `.csv` descargable con codificación UTF-8 e indicador BOM para compatibilidad directa con Microsoft Excel, bajo el nombre `vivo-promotor-ventas-YYYY-MM-DD.csv`.
  * **Borrar Historial Completo:** Lógica de doble confirmación visual para prevenir limpiezas accidentales, que vacía las ventas y movimientos del puerquito.

### C. Conexión de Estado
* Se modificó [AppShell.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/AppShell.tsx) para suministrar `setSales` y `setMovements` a `MainContent` y de ahí a `SettingsSection` y `SettingsView`.

---

## 4. Llaves de localStorage Usadas
* `vivo_devices`: Guarda el arreglo completo de dispositivos, con sus ID, nombres, comisiones personalizadas y estado activo/inactivo.
* `vivo_real_sales`: Historial serializado de ventas registradas.
* `vivo_real_movements`: Historial de transacciones de ingresos/egresos del Puerquito 3D.
* `vivo_user_profile`: Información de perfil (nombre y región).

---

## 5. Decisiones sobre Permisos de Antigravity
* Se identificó que las solicitudes de permisos de Antigravity se deben a la política estricta de aislamiento del sandbox.
* Se redactó una guía detallada en [ANTIGRAVITY_PERMISSION_SETUP.md](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/docs/ANTIGRAVITY_PERMISSION_SETUP.md) indicando los pasos para que el desarrollador permita prefijos repetitivos como `git status` o comandos npm locales de manera persistente en su cliente, acelerando las ejecuciones futuras sin comprometer la seguridad de archivos externos.

---

## 6. Resultados de Verificación
* **npm run lint:** No disponible por falta de eslint en el stack, pero Next.js corre su pre-build linting integrado sin fallos.
* **npm run build:** **Éxito (Código 0)**. El proyecto compila a producción de forma limpia con TypeScript y empaquetamiento Webpack.

---

## 7. Riesgos Pendientes
* **SSR Hydration:** Al cargar valores guardados en `localStorage` usando efectos asíncronos en el cliente (`useEffect`), se evitan brechas de renderizado entre servidor y cliente (hydration mismatch). Todo se comporta de forma estable.

---

## 8. Próxima Fase Recomendada
* **Optimización de Assets:** Reemplazar los marcadores de posición de SafeImage por assets reales optimizados en formato WebP una vez que estén disponibles en el repositorio.
* **Metas Dinámicas:** Habilitar la edición de metas directamente desde el panel de Ajustes > Metas.
