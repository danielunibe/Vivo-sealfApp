# AUDITORÍA TÉCNICA DEL ESTADO REAL (TECHNICAL_CURRENT_STATE_AUDIT)
**Proyecto:** Vivo Promotor (Cellular Sales & Commissions Tracker)  
**Fecha:** 4 de junio de 2026  
**Auditor:** Antigravity (Senior Technical Auditor & Lead Architect)  

---

## 1. PILA DE TECNOLOGÍA REAL (REAL TECH STACK)

*   **Framework Principal:** Next.js 15.0.3 (App Router)
*   **Biblioteca de Renderizado:** React 19.0.0-rc.1 (modo cliente `'use client'`)
*   **Lenguaje:** TypeScript 6.0.3
*   **Motor de Estilos:** Tailwind CSS v4.0.0-beta.2 (con PostCSS v4)
*   **Motor 3D (Alcancía):** Three.js v0.184.0 con cargadores de tipo `@types/three`
*   **Biblioteca de Animación:** Motion (anteriormente framer-motion) v12.40.0
*   **Plataforma de Despliegue Target:** Navegadores móviles, empaquetado Web / PWA progresiva (No compila nativamente en Flutter).

---

## 2. FLUJO DE DATOS Y ESTRUCTURA DE ESTADO

### Flujo de Datos Centralizado
La aplicación sigue un flujo unidireccional de datos de arriba hacia abajo (Top-Down Data Flow).

1.  **Inicialización de Estado:** El componente superior `<AppShell />` monta el estado mediante el custom hook `useAppShellState.ts`. Al iniciar la aplicación en el navegador, un bloque `useEffect` lee de manera síncrona los datos almacenados en `localStorage` usando wrappers defensivos de `lib/storage.ts` y actualiza las variables de estado reactivo.
2.  **Propagación de Propiedades:** El estado central (dispositivos, ventas, movimientos, metas, configuraciones, tema) se transmite de forma descendente hacia el componente `<MainContent />`, el cual redirige las propiedades específicas hacia la sección activa (por ejemplo, `CalendarSection`, `SettingsSection`).
3.  **Registro Transaccional de Venta:**
    *   La confirmación se efectúa en `RegisterSaleSection` por retención táctil de 2 segundos.
    *   Al completarse, se dispara el callback `handleConfirmSale` definido en `AppShell.tsx`.
    *   Este método genera de forma atómica:
        *   Un objeto `Sale` (guardado en `sales` y persistido en `vivo_real_sales`).
        *   Un objeto `Movement` (guardado en `movements` y persistido en `vivo_real_movements`).
        *   Un registro de notificación y dispara la animación de la moneda dorada.
    *   Los actualizadores de estado en `useAppShellState.ts` provocan un re-render que propaga los nuevos datos al calendario y al puerquito inmediatamente.

---

## 3. PERSISTENCIA ACTUAL (LOCALSTORAGE SCHEMA)

Los datos se dividen en 6 claves en `localStorage`:

*   `vivo_theme`: Determina el modo `'light'` o `'dark'`.
*   `vivo_devices`: Almacena la lista de dispositivos configurados y sus comisiones activas en pesos mexicanos (MXN).
*   `vivo_userName` / `vivo_userStore`: Datos de texto de la sesión del promotor.
*   `vivo_messages` / `vivo_notifications`: Registro de historiales de soporte y alertas.
*   `vivo_real_sales` (Ventas): Almacena un array JSON de la interfaz `Sale[]`.
*   `vivo_real_movements` (Movimientos): Almacena un array JSON de la interfaz `Movement[]` para el puerquito.
*   `vivo_work_schedule`: Mapea los horarios laborales activos y días de descanso del promotor.
*   `vivo_manual_day_records`: Registro manual de ausencias/asistencias con clave del día `YYYY-MM-DD`.

---

## 4. ANÁLISIS DE COMPONENTES

### Componentes Activos
Todos los componentes integrados bajo `components/sections/` y comunicados por `MainContent.tsx`:
*   `RegisterSaleSection.tsx`: Carrusel y checkout de ventas.
*   `CalendarSection.tsx`: Cuadrícula mensual de celdas squircle de asistencia y unidades.
*   `CatalogSection.tsx`: Bento grid compacto de equipos activos.
*   `PiggyBankSection.tsx`: Alcancía 3D y balance de fondos.
*   `SettingsSection.tsx`: Panel administrativo modular.

### Componentes Huérfanos o Inactivos
*   `components/ChatView.tsx`: Módulo de soporte de campo que no está integrado a la navegación inferior ni es referenciado en `MainContent.tsx`. Representa código muerto de etapas previas de desarrollo.

---

## 5. RIESGOS TÉCNICOS Y DEUDA ACUMULADA

### Deuda Crítica (Bloqueante para Producción)
*   **Falta de Assets Físicos:** La aplicación realiza llamadas de carga de imágenes para el catálogo y carrusel que terminan en error `404` en consola. Aunque `<SafeImage />` intercepta el error, esto incrementa el procesamiento inútil en la red local y degrada el rendimiento de la consola del navegador.

### Deuda Alta (Rendimiento y Estabilidad)
*   **Física de Monedas sin Tope:** En `jarCoins.ts` de Three.js, el canvas intenta renderizar de forma infinita cada moneda que represente una transacción en el historial. Un volumen grande de ventas provocará una ralentización severa del motor gráfico WebGL y consumirá excesivos recursos en teléfonos móviles.
*   **Prop Drilling Masivo:** La cantidad de propiedades transferidas desde `AppShell` a `MainContent` y luego a cada sección excede las 20 firmas de variables, haciendo el código propenso a errores de mantenimiento si se alteran las firmas de TypeScript.

### Qué NO Tocar Todavía
*   **Lógica de Renderizado 3D Compleja:** No rediseñar las mallas geométricas del cristal del puerquito ni alterar las luces de Three.js para evitar introducir fugas de memoria o fallos en el renderizador físico de la alcancía.
*   **Lógica de Fechas en el Calendario:** Evitar reescribir `lib/calendarDailySummary.ts` o los criterios de evaluación de ausencias de `lib/calendarStatus.ts`, ya que regulan el comportamiento estricto del MissedDayPrompt.
