# QA Checklist Ejecutable

Lista simplificada para verificar la salud y robustez del aplicativo antes de cada despliegue.

## 1. Validación de Entorno y Precondiciones
- [ ] Ejecutar `lint_applet` y validar que no existan errores sintácticos u obsoletos.
- [ ] Ejecutar `compile_applet` para asegurar que el build de producción en Next.js compile a verde.

## 2. Happy Path de Registro de Ventas
- [ ] Abrir el formulario de venta (sección central predeterminada al cargar).
- [ ] Seleccionar un dispositivo y color del listado.
- [ ] Digitar nombre del cliente y fecha exacta.
- [ ] Hacer clic en "Confirmar Venta" y verificar que el formulario se limpie y emita sonido/animación de éxito.

## 3. Catálogo (Vista Única Bento)
- [ ] Visualizar los 5 dispositivos dentro del grid del catálogo en móvil y tableta.
- [ ] Confirmar que el catálogo cabe de manera estanca en el espacio disponible **sin generar scroll**.
- [ ] Comprobar que los cards de dispositivos se adapten elásticamente mediante flex-grow (`h-full min-h-0`).

## 4. El Puerquito (Alcancía Neumórfica)
- [ ] Navegar al Puerquito y confirmar la renderización del frasco realista.
- [ ] Verificar que el progreso en MXN refleje las ventas confirmadas previamente.
- [ ] Validar que al cambiar la meta de ahorro en Ajustes, el porcentaje/líquido del puerquito se recalcule de forma instantánea.
- [ ] Comprobar que la animación de caída de moneda se ejecute fluidamente al registrar una nueva venta.

## 5. Calendario (Unidades y Jornadas)
- [ ] Confirmar que los días se rendericen como celdas cuadradas redondeadas (**squircles**).
- [ ] Verificar que los días con ventas muestren la barra/puntos de unidades de forma visual.
- [ ] Validar el estado de descanso laboral (si un día está configurado como inhábil, debe reflejarlo visualmente).

## 6. Persistencia y Casos de Borde
- [ ] Registrar varias ventas y recargar la página. Confirmar que los datos persistan sin alteración.
- [ ] Intentar registrar una venta con datos vacíos y verificar que se activen las alertas preventivas locales.
- [ ] Probar el rendimiento en zoom extremo móvil (no deben superponerse los elementos con el dock inferior).
