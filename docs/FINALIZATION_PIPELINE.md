# PIPELINE DE FINALIZACIÓN DEL PROYECTO (FINALIZATION_PIPELINE)
**Proyecto:** Vivo Promotor (Cellular Sales & Commissions Tracker)  
**Fecha:** 4 de junio de 2026  
**Auditor:** Antigravity (Senior Technical Auditor & Lead Architect)  

---

Este plan establece una ruta crítica ordenada para la estabilización y finalización del desarrollo de la aplicación web, evitando rediseños destructivos o cambios fuera del stack establecido (Next.js 15).

---

## 📌 FASE 1: ESTABILIZACIÓN Y QA BASE (ACTUAL)
*   **Asegurar Compilación Limpia:** Ejecutar `npm run build` localmente y comprobar que no existan errores de tipado de TypeScript.
*   **Corrección de Flexbox en Ajustes:** Solventar el error de diseño en `SettingsSection.tsx` para evitar que la pestaña de Metas desborde detrás del dock inferior.
*   **Limpieza de Consola de Linting:** Asegurar que ESLint esté libre de errores críticos de sintaxis o imports rotos.

---

## 📌 FASE 2: CORRECCIÓN VISUAL Y UX PRINCIPAL
*   **Optimización del Calendario:**
    *   Compactar el margen superior y reordenar la visualización del mes y año en una sola fila.
    *   Asegurar que los badges translucidos (`CalendarDeviceBadges`) no colisionen con los números de día grandes.
*   **Optimización de Registrar Venta:**
    *   Alinear el indicador del carrusel de equipos y el selector de color de línea.
    *   Mejorar la visualización del ticket/recibo de comisión emergente tras registrar ventas.
*   **Optimización del Catálogo:**
    *   Asegurar el scroll del bento grid compacto mediante un padding inferior adecuado (`pb-36` / spacer) que lo mantenga alejado del dock.
*   **Ajuste del Dock Inferior:**
    *   Corregir problemas de contraste del dock de iconos táctiles en modo claro y oscuro.

---

## 📌 FASE 3: ASSETS REALES DE DISPOSITIVOS
*   **Checklist de Imágenes:** Implementar o documentar la carpeta `docs/ASSETS_REQUIRED.md` con las imágenes de producto finales.
*   **Integración de Assets:** Depositar las imágenes PNG en `/public/assets/devices/` de forma ordenada según el mapeador `lib/deviceAssets.ts`.
*   **Resiliencia de SafeImage:** Comprobar que el fallback actúe sin parpadeos si se elimina un archivo PNG o hay problemas de red.

---

## 📌 FASE 4: EXPORTACIÓN Y RESPALDO
*   **Descarga CSV de Ventas:** Desarrollar un botón administrativo en Ajustes para generar un archivo plano CSV con el registro histórico de IMEI, modelo, color y comisiones de cada transacción.
*   **Copia de Seguridad JSON:** Permitir la exportación completa de la base de datos local y su restauración rápida ("Backup & Restore") mediante importación de archivos.
*   **Limpieza Segura:** Proveer un botón de restablecimiento de fábrica seguro con una ventana de confirmación interactiva.

---

## 📌 FASE 5: OPTIMIZACIÓN DE RENDIMIENTO
*   **Límite de Monedas en Three.js:** Modificar `jarCoins.ts` para restringir la simulación física a un máximo de 30 monedas simultáneas en pantalla, acumulando los fondos numéricamente.
*   **Modo de Bajo Rendimiento:** Proveer una opción en Apariencia para inhabilitar el canvas 3D y renderizar un contenedor estático 2D vectorial con un contador digital neumórfico.

---

## 📌 FASE 6: PULIDO UX FINAL
*   **Feedback Táctil:** Añadir micro-animaciones en los botones del dock e inputs de Ajustes.
*   **Modal de Especificaciones:** Permitir un tap prolongado en el catálogo para visualizar la ficha técnica de capacitación del equipo.
*   **Estados Vacíos Emocionales:** Mensajes ilustrativos y llamadas a la acción claros en las secciones sin historial ni ventas registradas.

---

## 📌 FASE 7: ENTREGA FINAL Y PRODUCCIÓN
*   **Build Final de Optimización:** Ejecución del empaquetado de producción standalone.
*   **Checklist de QA Final:** Validación de extremo a extremo de asistencia, registro, puerquito y guardado de datos.
*   **Manual de Soporte:** Documentación final para despliegue en campo y guías de uso del promotor.
