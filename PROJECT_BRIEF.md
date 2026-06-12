# Project Brief: Cellular Sales & Commissions Tracker

## Descripción
Una aplicación web full-stack premium optimizada para teléfonos y tabletas diseñada para registrar ventas de dispositivos celulares, calcular comisiones en tiempo real, visualizar metas de ahorro mediante una alcancía interactiva y monitorear la actividad en un calendario neumórfico.

## Objetivo Principal
Proporcionar una interfaz táctil, fluida y de pantalla única para que representantes de ventas registren transacciones, sigan metas de ahorro de comisiones y consulten el historial de unidades vendidas de forma ultra visual.

## Stack Tecnológico
- **Frontend:** Next.js 15+ (App Router), React 19, TypeScript
- **Animaciones:** Motion (`motion/react`)
- **Estilos:** Tailwind CSS v4 (con soporte para modo claro/oscuro)
- **Iconografía:** Lucide React & Tactile Svg Icons
- **Persistencia:** LocalState / LocalStorage persistente

## Estado Actual
- **Catálogo:** Cuadrícula bento optimizada de 5 cajas que caben exactamente en el viewport en móviles y tabletas sin scroll secundario.
- **Dock Flotante Premium:** Barra flotante inferior neumórfica con 5 iconos interactivos (Calendario, Catálogo, Registrar Venta, Puerquito, Ajustes).
- **Alcancía Realista:** Frasco animado con física de caída de monedas en capas y metas de ahorro dinámicas.
- **Calendario Squircle:** Cuadrícula de días tipo squircle (cajas de bordes suaves con curvatura uniforme) para el seguimiento diario de unidades.

## Riesgos Actuales Reales
- **Rendimiento:** Saturación de físicas de monedas si se acumulan demasiadas transacciones concurrentes de golpe.
- **Límite de Almacenamiento:** Uso de `localStorage` para el histórico de ventas puede llenarse a largo plazo con registros exhaustivos de IMEI y notas de clientes.

## Próximo Paso Recomendado
- Implementar la exportación de registros de ventas en formato CSV (P0).
- Añadir resúmenes de rendimiento mensual simple en la sección de Ajustes (P1).
