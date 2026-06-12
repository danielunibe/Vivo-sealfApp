# Guardrails Inviolables del Proyecto

Este documento establece las reglas fundamentales de arquitectura, UX y diseño de la aplicación. Cualquier modificación debe respetar estrictamente estos límites.

## 1. Navegación y Dock Inferior
- **Estructura del Dock:** Barra flotante inferior de 5 iconos táctiles de alta fidelidad neumórfica.
- **Orden Obligatorio de Izquierda a Derecha:**
  1. **Calendario** (Icono de calendario táctil squircle)
  2. **Catálogo** (Brújula tridimensional interactiva `TactileCatalogIcon`)
  3. **Registrar Venta** (Botón central de acción inmediata)
  4. **Puerquito** (Alcancía neumórfica realista con moneda animada)
  5. **Ajustes** (Engranaje dentro del dock flotante)
- **Posición Central:** La acción "Registrar venta" debe permanecer fijamente en el centro del dock.
- **Ajustes en Dock:** La sección de Ajustes debe estar siempre integrada en el dock flotante, sin menús laterales o secundarios de navegación.

## 2. Experiencia de Usuario (UX) por Sección
- **Página de Inicio por Defecto:** La aplicación debe iniciar siempre en la vista de **Registrar Venta** al cargar por primera vez.
- **Formulación de Ajustes:** Las pestañas de configuración interna de Ajustes deben usar iconos limpios, evitando pestañas textuales largas que dañen la visualización en teléfonos.
- **Calendario (Squircles):** Las celdas de días en el calendario deben ser cajas cuadradas redondeadas neumórficas (**squircles**), nunca círculos.
- **Diseño del Puerquito:** Frasco realista 3D-styled con control de metas de ahorro dinámicas y caída física de monedas animadas depositándose en el fondo en la capa lógica correcta.

## 3. Disciplina de Integridad de Código
- **Estabilidad del Calendario:** Queda terminantemente prohibido alterar la lógica o interfaz del Calendario a menos que sea explístamente solicitado por el usuario.
- **Cambios No Destructivos:** No se permiten rediseños globales drásticos o masivos en parches puntuales.
- **Regla del Pipeline:** Todo patch debe estar alineado a una sola fase activa del pipeline y enfocarse en una modificación lógica y estructural limpia.
