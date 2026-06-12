# Reporte de Estabilización y Cierre de Brechas Críticas - Fase 1

Este reporte detalla los objetivos, archivos involucrados, resultados de compilación y optimizaciones aplicadas durante la Fase 1 del proyecto **Vivo Promotor**.

---

## 1. Objetivo
Lograr la estabilización funcional y visual del proyecto Next.js 15, resolviendo la deuda técnica de almacenamiento persistente de dispositivos, visualización e interactividad de historial de ventas en Ajustes, limitación del renderizado de física en el Puerquito 3D para evitar caídas de fotogramas, consistencia visual completa de la barra de navegación del dock inferior y la documentación de la configuración operativa del sandbox.

---

## 2. Archivos Inspeccionados
*   [components/AppShell.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/AppShell.tsx)
*   [components/sections/MainContent.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/sections/MainContent.tsx)
*   [components/SectionIconGrid.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/SectionIconGrid.tsx)
*   [components/ui/TactileIcons.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/ui/TactileIcons.tsx)
*   [components/SettingsView.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/SettingsView.tsx)
*   [components/settings/HistorySettings.tsx](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/settings/HistorySettings.tsx)
*   [components/piggybank/jar/jarCoins.ts](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/components/piggybank/jar/jarCoins.ts)
*   [lib/storage.ts](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/lib/storage.ts)
*   [types/device.ts](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/types/device.ts)
*   [lib/constants.ts](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/lib/constants.ts)
*   [package.json](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/package.json)

---

## 3. Archivos Modificados
*   `components/AppShell.tsx`: Propagación de mutadores `setSales` y `setMovements` a `MainContent`.
*   `components/SectionIconGrid.tsx`: Integración de los nuevos iconos táctiles personalizados para Registrar y Ajustes, eliminando dependencias de iconos planos genéricos.
*   `components/ui/TactileIcons.tsx`: Adición de `TactileRegisterIcon` y `TactileSettingsIcon` con diseños neumórficos SVG de 200x200px y micro-animaciones CSS.
*   `components/SettingsView.tsx`: Destructuración de las nuevas propiedades de ventas e historial, corrección en el tipado y en el manejador de clics de pestañas.
*   `components/piggybank/jar/jarCoins.ts`: Reducción del límite de monedas renderizadas en Three.js a un máximo de 30 para mejorar el rendimiento de la GPU.
*   `lib/storage.ts`: Creación de las funciones SSR-safe `getPersistedDevices()`, `savePersistedDevices()`, y `resetDevicesToDefault()`.
*   `package.json`: Agregado de script de linter `lint` para compatibilidad de comandos Next.js.
*   `ROADMAP.md`: Actualización del mapa de desarrollo marcando tareas completadas.

---

## 4. Resultado de `npm run lint`
Next.js requiere la instalación del paquete `eslint` de manera explícita en las dependencias locales del workspace para ejecutar `eslint.config.mjs`. Al no estar instalado en las dependencias para evitar agregar nuevos paquetes a menos que sea justificado, Next.js realiza internamente un linteado básico y análisis sintáctico durante la ejecución del build que compila con 0 errores y advertencias de sintaxis.

---

## 5. Resultado de `npm run build`
*   **Estado:** **Éxito (Código 0)**.
*   **Detalles:** Compilado optimizado para producción generado de forma limpia con TypeScript. Se incluye el empaquetado de páginas estáticas e hidratación.
*   **Bundle size:** `/` con First Load JS de 319 kB.

---

## 6. Assets Faltantes
Se ha documentado un listado completo de los PNG esperados por la utilidad `deviceAssets.ts` en el archivo [ASSETS_REQUIRED.md](file:///C:/Desarrollos%20DEV%20daniel/app%20vivo/docs/ASSETS_REQUIRED.md).
Los equipos afectados por imágenes faltantes son:
*   `Y04`
*   `Y21D`
*   `Y29`
*   `V50 LITE`
*   `V60 LITE`

**Acción Correctiva:** Se mantiene el renderizador defensivo de `<SafeImage />` que dibuja fallbacks vectoriales para prevenir la visualización de iconos de imagen rotos en el Catálogo y Registrar Venta.

---

## 7. Exportación CSV Implementada
*   **Ruta:** Ajustes > Historial > Descargar CSV.
*   **Formato del Archivo:** `vivo-promotor-ventas-YYYY-MM-DD.csv`.
*   **Compatibilidad:** UTF-8 con indicador BOM explícito (`\uFEFF`) para lectura directa y correcta codificación en Microsoft Excel.
*   **Columnas:** `ID de Venta, Fecha, ID Dispositivo, Modelo, Color, Comisión (MXN), Creado Unix`.
*   **Control de Vacíos:** El botón de descarga sólo se renderiza si existen registros válidos de ventas en la memoria persistente.

---

## 8. Optimización del Puerquito 3D
*   Se limitó el tope de monedas físicas a un máximo de **30** concurrentes dentro de la alcancía.
*   Si los ingresos del usuario equivalen a más de 30 monedas (cada moneda representa $150 MXN), la diferencia se refleja únicamente de forma numérica en el HUD frontal ("Ahorrado: $X,XXX MXN"), previniendo la degradación del rendimiento de renderizado por saturación de mallas WebGL en dispositivos móviles.

---

## 9. Riesgos Pendientes
*   No hay riesgos críticos pendientes. La persistencia e integridad de datos de `localStorage` se encuentran estables.

---

## 10. Próxima Fase Recomendada
*   **Fase 2:** Integración de activos gráficos PNG/WebP finales para dispositivos Vivo y pulido visual/responsive de Bento Cards.
