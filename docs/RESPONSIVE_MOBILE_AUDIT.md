# Auditoría de Adaptación Móvil y Responsive (RESPONSIVE_MOBILE_AUDIT)

Este documento detalla el diagnóstico del comportamiento responsive en pantallas de celulares para el proyecto **Vivo Promotor** e identifica las brechas y áreas de oportunidad para lograr una experiencia estanca, táctil y libre de desbordamientos.

---

## 1. Viewports Analizados
Se realizaron pruebas de adaptabilidad visual emulando y midiendo los siguientes dispositivos estándar:
*   **Compacto:** 360 x 640 y 360 x 740 (Android de entrada, Moto G, etc.)
*   **Estándar:** 375 x 812 (iPhone X/11 Pro) y 390 x 844 (iPhone 12/13/14 Pro)
*   **Largo / Grande:** 412 x 915 (Galaxy S20+) y 430 x 932 (iPhone 14/15 Pro Max)
*   **Escritorio (Desktop Preview):** Visualización centrada con límite de ancho.

---

## 2. Diagnóstico por Pantalla / Componente

### A. Estructura y Altura Global
*   **Problema:** El uso de `100vh` en el contenedor principal de `AppShell.tsx` puede causar desbordamientos en navegadores móviles debido a la aparición/desaparición dinámica de la barra de navegación del navegador (Safari/Chrome).
*   **Severidad:** Media.
*   **Propuesta de Corrección:** Asegurar el uso de `h-[100dvh]` y `max-h-[100dvh]` en todos los wrappers de nivel superior. Configurar `min-h-0` y `flex-1` en contenedores intermedios de flexbox para permitir que las secciones internas se encojan en lugar de forzar desbordamiento.

### B. Dock de Navegación Inferior (`SectionIconGrid.tsx`)
*   **Problema:** En pantallas pequeñas (360px de ancho), el dock con padding lateral de `px-6` y el espaciado interno puede sentirse demasiado ajustado. Si hay un safe-area pronunciado abajo en iOS, el dock puede superponerse visualmente al contenido si la sección no tiene suficiente padding inferior de reserva.
*   **Severidad:** Media-Alta.
*   **Propuesta de Corrección:** Utilizar variables CSS para coordinar el padding inferior de las pantallas con la altura y posición del dock. Añadir `padding-bottom: env(safe-area-inset-bottom)` de forma responsiva para respetar safe-areas en iOS/Android modernos.

### C. Sección Calendario (`CalendarSection.tsx` & `CalendarMonthView.tsx`)
*   **Problema:**
    1.  La altura del `SectionCard` que envuelve la cuadrícula del mes está fijada de manera rígida en `heightClass="h-[395px]"`. En dispositivos de baja altura (360 x 640), esto fuerza a que el usuario tenga que hacer scroll vertical para ver el calendario completo y el dock inferior.
    2.  Las celdas de los días utilizan `aspect-square w-full`. Si el ancho se encoge, el alto también, pero si el alto del viewport es muy pequeño, las celdas no se encogen verticalmente de forma independiente.
*   **Severidad:** Alta (Afecta usabilidad crítica).
*   **Propuesta de Corrección:** Implementar un modo compacto con media queries de altura (`@media (max-height: 720px)`) que reduzca los tamaños de texto, los paddings de las celdas y la altura del contenedor principal de `395px` a `340px` o use `flex-1` adaptativo.

### D. Sección Registrar Venta (`RegisterSaleSection.tsx` & `DeviceCarousel.tsx`)
*   **Problema:**
    1.  El renderizado del dispositivo en `ProductImageStage.tsx` tiene un tamaño fijo de `w-[140px] h-[240px]`. En pantallas cortas, esto empuja el botón de "Concretar Venta" hacia abajo, quedando parcialmente tapado por el dock.
    2.  Si el usuario activa la confirmación de venta por pulsación larga, el fondo oscuro se superpone en toda la pantalla, pero en celulares con navegador el botón de cancelar puede quedar muy pegado a la zona de gestos del sistema.
*   **Severidad:** Alta.
*   **Propuesta de Corrección:** Configurar la imagen del teléfono para que escale dinámicamente con `@media (max-height: 720px)` usando `scale(0.85)` y reducir los paddings verticales de `DeviceCarousel` y `DeviceCard`.

### E. Sección Catálogo (`CatalogSection.tsx` & `CatalogDeviceGrid.tsx`)
*   **Problema:**
    1.  El Bento Grid utiliza alturas y paddings fijos. La tarjeta del V60 Lite al final puede quedar bloqueada por el dock si no hay suficiente padding de scroll al final del grid.
    2.  En pantallas de 360px de ancho, las tarjetas de doble columna pueden encoger demasiado el texto de comisiones, haciéndolo ilegible.
*   **Severidad:** Media.
*   **Propuesta de Corrección:** Ajustar la cuadrícula con un padding inferior de reserva (`pb-32` o similar) y usar tamaños de tipografía flexibles (`text-[clamp(9px,2vw,11px)]`) en los badges de comisiones para mantener legibilidad.

### F. Sección Puerquito (`PiggyBankSection.tsx` & `SavingsJar.tsx`)
*   **Problema:** El contenedor de Three.js para la alcancía de cristal tiene una altura y ancho estáticos de `w-[300px] h-[330px]`. En pantallas pequeñas, esta área ocupa más de la mitad del espacio vertical útil, comprimiendo la lista de movimientos o forzando scroll vertical en la pestaña.
*   **Severidad:** Alta (Afecta estética y rendimiento).
*   **Propuesta de Corrección:** Escalar responsivamente el contenedor de la alcancía a `w-[245px] h-[270px]` en dispositivos de baja altura para preservar espacio para el historial de transacciones inferior.

### G. Sección Ajustes y Horarios (`SettingsSection.tsx` & `ScheduleSettings.tsx`)
*   **Problema:** Las pestañas de ajustes superiores son 6 en total. En pantallas de 360px de ancho, las pestañas pueden verse demasiado comprimidas o requerir scroll horizontal si tienen paddings fijos. Los inputs de Horario e Historial pueden colisionar si la pantalla es muy corta.
*   **Severidad:** Media.
*   **Propuesta de Corrección:** Ajustar el tamaño de los botones de pestañas a `p-2.5` en móviles y reducir el espaciado vertical de la tarjeta de jornada laboral en alturas bajas.

---

## 3. Resumen de Brechas Prioritarias

| Componente | Brecha Detectada | Impacto | Propuesta |
| :--- | :--- | :--- | :--- |
| **Global** | Desbordamiento de `100vh` en navegadores móviles | Usabilidad | Cambiar a `100dvh` y configurar `min-h-0 flex-1` en flexbox |
| **Dock** | Superposición e interferencia táctil | Ergonomía | Ajustar paddings y añadir `env(safe-area-inset-bottom)` |
| **Registrar** | Imagen del teléfono y botón empujados por el dock | Bloqueo | Escalar imagen a `scale(0.85)` en viewports de altura < 720px |
| **Puerquito** | Jarra 3D de 330px asfixia el historial | Estética | Escalar jarra a `270px` de altura en pantallas pequeñas |
| **Calendario** | Altura fija de 395px fuerza scroll en pantallas cortas | Usabilidad | Reducir celdas y header en modo compacto de altura |
