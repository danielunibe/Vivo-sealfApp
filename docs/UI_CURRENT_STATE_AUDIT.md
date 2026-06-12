# AUDITORÍA VISUAL DEL ESTADO ACTUAL (UI_CURRENT_STATE_AUDIT)
**Proyecto:** Vivo Promotor (Cellular Sales & Commissions Tracker)  
**Fecha:** 4 de junio de 2026  
**Auditor:** Antigravity (UX/UI Lead & Technical Auditor)  

---

## 1. PANTALLAS ANALIZADAS Y DETALLES DE INTERFAZ

A continuación se detalla el análisis visual realizado en el navegador corriendo la aplicación local en `http://localhost:3000`:

### A. Registrar Venta (Pantalla Principal)
*   **Problema Detectado:**
    *   *Assets Ausentes:* La sección principal no muestra la imagen real del dispositivo (ej: `V50 LITE` en color Lila Fantasía) debido a la falta de archivos PNG físicos en el servidor de desarrollo, lo que genera errores HTTP `404` en segundo plano.
    *   *Amortiguación Visual:* El componente `<SafeImage />` dibuja un marco de teléfono premium con un contorno de smartphone vectorizado y la etiqueta del modelo en su lugar, evitando que la interfaz se vea rota con el icono clásico del navegador.
*   **Archivo Probable:** `components/sales/ProductImageStage.tsx`, `components/ui/SafeImage.tsx`
*   **Severidad:** Media (Impacto de fidelidad visual, pero funcionalmente estable).
*   **Propuesta de Corrección:** Subir/recolectar los assets PNG correspondientes en las rutas relativas oficiales de `/assets/devices/...`.
*   **Fase Sugerida:** Fase 3 (Assets reales).

---

### B. Calendario
*   **Problema Detectado:**
    *   *Estilo de Miniaturas:* Los badges dentro de las celdas del calendario para los celulares vendidos no cargan las miniaturas de los teléfonos (provocando errores `404` por `/assets/devices/.../thumb.png`). En su lugar, muestran píldoras de texto compactas con el modelo (ej: `V50`) flotando en la celda.
    *   *Consistencia de Scroll:* Bajo resoluciones verticales extremadamente pequeñas (menores a 650px), la grilla del calendario puede chocar ligeramente con la cabecera del resumen diario de celulares vendidos si el margen superior no está lo suficientemente compactado.
*   **Archivo Probable:** `components/calendar/CalendarDeviceBadges.tsx`, `components/calendar/CalendarGrid.tsx`
*   **Severidad:** Media (Estética visual en celdas pequeñas).
*   **Propuesta de Corrección:** Implementar miniaturas de fallback limpias en los badges o asegurar la provisión de los PNGs de tamaño reducido.
*   **Fase Sugerida:** Fase 3 / Fase 6.

---

### C. Catálogo
*   **Problema Detectado:**
    *   *Imágenes Faltantes:* Las Bento Cards del portafolio del catálogo de dispositivos no muestran las imágenes adaptativas de los productos, sino siluetas vectoriales de smartphones teñidas de acuerdo con la paleta de colores.
    *   *Falta de Información Detallada:* El catálogo es una excelente vitrina, pero no ofrece especificaciones técnicas secundarias de los dispositivos (ej: almacenamiento o RAM), limitándose a mostrar el nombre y la comisión.
*   **Archivo Probable:** `components/catalog/CatalogDeviceCard.tsx`, `components/sections/CatalogSection.tsx`
*   **Severidad:** Baja-Media (Falta información complementaria y assets físicos).
*   **Propuesta de Corrección:** Agregar un modal flotante rápido que muestre una ficha de especificaciones al mantener pulsado ("tap holding") la Bento Card del dispositivo.
*   **Fase Sugerida:** Fase 6 (Pulido UX final).

---

### D. Puerquito (Alcancía)
*   **Problema Detectado:**
    *   *HUD de Ahorro y Físicas:* El canvas de Three.js es interactivo, pero en dispositivos de escritorio muy anchos o monitores ultra-wide, el canvas de la alcancía se renderiza con un área de aspecto que puede dejar espacios vacíos en los laterales si la caja móvil no está correctamente centrada en flexbox.
    *   *Historial de Movimientos:* Si el historial de transacciones se encuentra vacío en la primera ejecución, se despliega una tarjeta de lista sin un indicador visual de "Sin movimientos registrados hoy", restándole impacto emocional de avance.
*   **Archivo Probable:** `components/sections/PiggyBankSection.tsx`, `components/piggybank/MovementHistory.tsx`
*   **Severidad:** Baja (Meramente estético).
*   **Propuesta de Corrección:** Agregar un estado vacío con un icono neumórfico y el mensaje "Aún no hay movimientos hoy. ¡Comienza registrando una venta!" para incentivar al promotor.
*   **Fase Sugerida:** Fase 6 (Pulido UX final).

---

### E. Ajustes / Metas (Sub-Sección de Configuración)
*   **Problema Detectado:**
    *   *Desborde Crítico detras del Dock:* En la pestaña de Metas, el contenedor se expande verticalmente debido al listado de inputs de metas monetarias (Diaria, Semanal, Mensual, Anual) y sus bloques de equivalencia.
    *   *Causa de Diseño:* El componente contenedor padre `components/sections/SettingsSection.tsx` utiliza una simple caja `<div className="w-full">` que interrumpe la estructura de flexbox (`flex flex-col flex-1 min-h-0`). Como consecuencia, la propiedad `flex-1` del `SectionCard` pierde su marco de referencia de altura y la pantalla crece hasta su altura máxima de scroll, empujando los campos de la meta anual detrás del dock inferior o por debajo del mockup de pantalla.
*   **Archivo Probable:** `components/sections/SettingsSection.tsx`, `components/SettingsView.tsx`
*   **Severidad:** **Alta** (Impedimento del flujo; el usuario no puede editar las metas anuales en pantallas móviles típicas).
*   **Propuesta de Corrección:** Cambiar la clase del wrapper en `SettingsSection.tsx` a `w-full flex-1 flex flex-col min-h-0` para restablecer el canal de restricciones de altura de flexbox y permitir el scroll interno correcto de `SettingsView.tsx`.
*   **Fase Sugerida:** Fase 1 / Fase 2 (Inmediato).

---

### F. Ajustes / Otras Sub-Secciones (Perfil, Horarios, Ganancias, Apariencia)
*   **Problema Detectado:**
    *   *Tabs de Navegación:* Los botones superiores de selección en Ajustes (representados por iconos de Lucide como User, Clock, Smartphone, Target y Palette) carecen de etiquetas de texto explicativas. Aunque los iconos son familiares, un usuario nuevo podría no comprender de forma inmediata qué significa el icono de engranaje o el de enchufe/reloj sin interactuar.
    *   *Modo Claro vs Oscuro:* Algunos inputs y botones de selección en el modo claro carecen de un borde de contraste lo suficientemente definido contra el fondo `#FAF9F5`, pudiendo percibirse como bloques planos inactivos.
*   **Archivo Probable:** `components/SettingsView.tsx`, `components/settings/ScheduleSettings.tsx`
*   **Severidad:** Baja-Media (Usabilidad y legibilidad).
*   **Propuesta de Corrección:** Añadir tooltips flotantes sobre los tabs de iconos o un sutil label de texto inferior que se muestre de forma compacta al seleccionar el tab.
*   **Fase Sugerida:** Fase 2 / Fase 6.

---

## 2. RESUMEN DE SEVERIDAD DE HALLAZGOS VISUALES

| ID | Pantalla | Problema Detectado | Severidad | Proposición de Corrección |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Ajustes > Metas | Desborde vertical de campos anuales detrás del dock flotante. | **Alta** | Ajustar flexbox en wrapper de `SettingsSection.tsx` para constreñir altura. |
| **UI-02** | Registrar / Catálogo | Imágenes 404 por falta física de PNGs. | **Media** | Suministrar recursos gráficos o mejorar el fallback de `SafeImage`. |
| **UI-03** | Puerquito | Pantalla vacía al no existir historial de transacciones. | **Baja** | Añadir mensaje motivador de estado vacío. |
| **UI-04** | Ajustes | Falta de texto explicativo en botones superiores de pestañas. | **Baja** | Agregar tooltips o mini labels descriptivos debajo de los iconos. |
| **UI-05** | Global | Contraste deficiente de bordes de inputs en Tema Claro. | **Baja** | Incrementar opacidad de bordes en inputs de temas claros. |
