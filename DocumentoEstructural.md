Sí, David. Este prompt está pensado para **Google AI Studio / Gemini**, para que haga una **primera auditoría completa** de lo que ya tienes, sin pedirle todavía que programe. La idea es que revise la app como producto, arquitectura, UX/UI, flujo, datos, rendimiento y preparación para Android. La base es la app de ventas con 5 secciones: Calendario, Catálogo, Registrar/Dispositivo, Puerquito/Ahorros y Ajustes, con lógica de checkout, calendario visual, comisiones programadas y enfoque mobile-first premium. 

Copia y pega esto en Google AI Studio:

```text
Actúa como auditor senior de producto digital, arquitectura móvil, UX/UI mobile-first, Flutter/Android, QA funcional y diseño de sistemas.

Necesito que realices una PRIMERA AUDITORÍA COMPLETA del proyecto actual de una app móvil de registro de ventas para promotor de celulares.

IMPORTANTE:
Esta primera fase NO es para reescribir toda la app.
Esta fase es para auditar, diagnosticar, ordenar problemas, detectar riesgos y proponer un plan de corrección.
No hagas cambios destructivos.
No inventes funciones que no estén justificadas.
No propongas rediseñar todo desde cero si se puede corregir lo existente.
Primero analiza lo que ya existe.

CONTEXTO DEL PRODUCTO

La app es una herramienta personal de piso de venta para registrar ventas diarias de celulares.

Debe funcionar como una app rápida, visual e intuitiva, con lógica tipo carrito/checkout:

Seleccionar dispositivo → ajustar cantidad → calcular comisión → registrar venta → reflejar en calendario → actualizar progreso/comisión.

La app debe tener 5 secciones principales de izquierda a derecha:

1. Calendario
2. Catálogo
3. Registrar / Dispositivo
4. Puerquito / Ahorros
5. Ajustes

La sección central y más importante debe ser Registrar / Dispositivo, porque es donde se captura la venta.

OBJETIVO GENERAL DE LA APP

La app debe permitir:

- registrar ventas diarias de celulares;
- seleccionar dispositivo vendido;
- usar comisiones ya programadas por modelo;
- calcular comisión automáticamente;
- organizar ventas por fecha, día, mes y año;
- mostrar calendario visual con miniaturas de dispositivos vendidos;
- mostrar avance mensual;
- mostrar ahorro/comisión acumulada;
- consultar catálogo comercial de modelos;
- configurar modelos, comisiones, metas y ajustes;
- exportar o respaldar información en futuras fases.

MODELOS Y COMISIONES BASE

La app debe incluir inicialmente estos dispositivos:

- Y04: $20
- Y21D: $80
- Y29: $180
- V50 Lite: $350
- V60 Lite: $350

Cada modelo idealmente debe tener:

- id
- nombre
- comisión por unidad
- imagen PNG o placeholder
- estado activo/inactivo
- snapshot al momento de registrar venta

REGLA IMPORTANTE SOBRE COMISIONES

Si en Ajustes se cambia la comisión de un modelo, las ventas antiguas NO deben recalcularse.
Cada venta debe conservar el nombre, imagen y comisión que tenía el dispositivo al momento de registrarse.

SECCIONES A AUDITAR

AUDITORÍA 1 — ESTRUCTURA GENERAL DEL PRODUCTO

Evalúa si la app actualmente tiene una lógica clara:

- ¿Se entiende para qué sirve?
- ¿La pantalla principal lleva naturalmente a registrar ventas?
- ¿Las 5 secciones están bien conectadas?
- ¿Hay pantallas duplicadas, confusas o innecesarias?
- ¿El usuario puede registrar una venta rápidamente?
- ¿La app se siente como herramienta de ventas o como formulario genérico?
- ¿La navegación tiene sentido?

Debes evaluar especialmente esta regla:

Registrar crea datos.
Calendario interpreta datos.
Puerquito convierte datos en motivación.
Catálogo convierte producto en argumento de venta.
Ajustes controla el sistema.

AUDITORÍA 2 — NAVEGACIÓN Y FLUJO

Revisa:

- orden de las 5 secciones;
- si el dock inferior funciona correctamente;
- si el dock tapa contenido;
- si hay safe area inferior;
- si el centro de la navegación está destacado;
- si Registrar es realmente el centro operativo;
- si desde Catálogo se puede mandar un modelo a Registrar;
- si desde Calendario se puede registrar una venta en una fecha seleccionada;
- si el usuario puede volver fácilmente sin perder contexto.

Resultado esperado:
Detecta fricciones y propón correcciones concretas.

AUDITORÍA 3 — SECCIÓN CALENDARIO

El Calendario debe funcionar como mapa visual de ventas.

Audita:

- si muestra mes y año correctamente;
- si permite cambiar de mes;
- si cada fecha muestra información útil;
- si las cajas del calendario se recortan;
- si las miniaturas se ven bien;
- si hay indicadores de cantidad;
- si distingue días con venta y sin venta;
- si se puede tocar una fecha para ver detalle;
- si se puede ver total del día;
- si se puede ver total del mes;
- si hay estados visuales para:
  - hoy;
  - día con venta;
  - día sin venta;
  - descanso;
  - meta cumplida;
  - seleccionado.

Propón cómo debería quedar la lógica visual de cada celda.

AUDITORÍA 4 — SECCIÓN CATÁLOGO

El Catálogo no debe ser solo una galería. Debe servir como herramienta comercial.

Audita:

- si los modelos están bien presentados;
- si las imágenes se ven limpias;
- si los PNG están recortados o mal integrados;
- si las tarjetas son claras;
- si hay información útil para vender;
- si se puede distinguir serie, comisión y ventaja clave;
- si cada modelo tiene ficha comercial;
- si existe botón para registrar venta de ese modelo;
- si la sección ayuda realmente en piso de venta.

Propón estructura ideal para ficha de producto:

- cliente ideal;
- argumentos rápidos;
- beneficios principales;
- objeciones frecuentes;
- respuesta sugerida;
- frase de cierre;
- botón “Registrar este modelo”.

AUDITORÍA 5 — SECCIÓN REGISTRAR / DISPOSITIVO

Esta es la pantalla más importante.

Debe sentirse como checkout/carrito.

Audita:

- si permite seleccionar dispositivo rápidamente;
- si muestra comisión por unidad;
- si permite ajustar cantidad;
- si calcula total estimado;
- si el botón de registrar es claro;
- si hay feedback después de registrar;
- si se mantiene la selección del modelo;
- si resetea cantidad a 1 después de vender;
- si actualiza calendario;
- si actualiza puerquito;
- si guarda correctamente la venta;
- si se puede registrar en fecha distinta cuando viene desde Calendario.

Evalúa si el flujo puede hacerse en pocos toques.

Flujo ideal:

1. Abrir app.
2. Elegir modelo.
3. Ajustar cantidad.
4. Ver comisión.
5. Registrar.
6. Confirmación.
7. Actualización inmediata de calendario y ahorro.

AUDITORÍA 6 — SECCIÓN PUERQUITO / AHORROS

Esta sección debe ser motivacional y visual.

Audita:

- si muestra comisión acumulada;
- si muestra avance contra meta;
- si se entiende cuánto falta;
- si usa una metáfora visual clara: puerquito, frasco, monedas o barra;
- si el contraste es bueno;
- si las animaciones son pesadas;
- si se actualiza después de registrar venta;
- si muestra ranking por modelo;
- si distingue hoy, semana, mes o año;
- si realmente aporta algo diferente al Calendario.

Propón mejoras sin saturar.

AUDITORÍA 7 — SECCIÓN AJUSTES

Ajustes debe ser el centro de control.

Audita si permite o debería permitir:

- editar modelos;
- editar comisiones;
- activar/desactivar modelos;
- configurar metas;
- configurar días de descanso;
- cambiar imágenes PNG;
- exportar CSV;
- respaldar datos;
- importar datos;
- ajustar apariencia;
- activar modo rendimiento;
- activar/desactivar animaciones;
- resetear datos con confirmación.

Propón una estructura ordenada en bloques:

- Perfil operativo
- Dispositivos
- Comisiones
- Metas
- Calendario / descansos
- Respaldo / exportación
- Apariencia / rendimiento
- Información de app

AUDITORÍA 8 — DATOS Y PERSISTENCIA

Revisa si la estructura de datos actual es suficiente.

Debe existir o proponerse algo equivalente a:

DeviceModel:
- id
- name
- commission
- imagePath
- isActive
- createdAt
- updatedAt

SaleModel:
- id
- date
- deviceId
- deviceNameSnapshot
- deviceImagePathSnapshot
- quantity
- commissionPerUnitSnapshot
- totalCommission
- createdAt
- updatedAt

Settings / Goals:
- monthlyPieceGoal
- monthlyCommissionGoal
- dailyPieceGoal
- restDays
- themeMode
- reducedMotion

Audita:

- si se guardan ventas correctamente;
- si se agrupan por día/mes/año;
- si se conservan snapshots;
- si se recalculan totales correctamente;
- si cambiar comisiones afecta ventas anteriores;
- si hay riesgo de pérdida de datos;
- si la app puede crecer sin romperse.

AUDITORÍA 9 — UX/UI Y DISEÑO VISUAL

El estilo buscado es:

- mobile-first;
- dark premium;
- liquid glass / glassmorphism;
- tarjetas translúcidas;
- bordes suaves;
- contraste alto;
- estética moderna;
- interfaz cómoda para uso diario;
- visual tipo app premium, no Excel.

Audita:

- jerarquía visual;
- tamaños de texto;
- contraste;
- espaciado;
- recortes;
- scroll;
- safe areas;
- legibilidad;
- botones tocables;
- exceso de decoración;
- consistencia entre secciones;
- si la app se siente rápida o pesada;
- si se entiende qué tocar primero.

Detecta problemas visuales concretos.

AUDITORÍA 10 — ACCESIBILIDAD Y USABILIDAD EN PISO

La app se usará en piso de venta, con poco tiempo y posiblemente en movimiento.

Audita:

- si puede usarse con una mano;
- si los botones son grandes;
- si el texto es legible;
- si hay demasiados pasos;
- si requiere escribir demasiado;
- si se entiende bajo presión;
- si las acciones principales son visibles;
- si hay confirmaciones útiles;
- si hay deshacer para acciones importantes;
- si hay riesgo de registrar mal una venta.

AUDITORÍA 11 — RENDIMIENTO

Audita:

- animaciones pesadas;
- loops innecesarios;
- renders excesivos;
- imágenes mal optimizadas;
- calendario recargando de más;
- widgets/componentes que se podrían memoizar;
- carga de assets;
- pantallas fuera de vista consumiendo recursos;
- posibilidad de modo reducido.

Propón mejoras de rendimiento.

AUDITORÍA 12 — QA FUNCIONAL

Diseña una lista de pruebas manuales.

Debe incluir casos como:

- registrar Y29 x2 y verificar $360;
- registrar V60 Lite x1 y verificar $350;
- registrar varias ventas el mismo día;
- revisar calendario;
- tocar fecha y ver detalle;
- eliminar venta;
- cambiar comisión en Ajustes;
- confirmar que ventas antiguas no cambian;
- desactivar modelo y verificar que no aparezca en Registrar;
- configurar meta mensual;
- revisar avance en Puerquito;
- navegar entre las 5 secciones;
- cerrar y abrir app y verificar persistencia.

AUDITORÍA 13 — PRIORIZACIÓN

Después de auditar, clasifica todo en una tabla:

Prioridad P0:
Errores críticos que impiden usar la app.

Prioridad P1:
Problemas importantes que afectan flujo, datos o usabilidad.

Prioridad P2:
Mejoras visuales o funcionales recomendadas.

Prioridad P3:
Ideas futuras o mejoras no urgentes.

Para cada hallazgo incluye:

- sección afectada;
- problema;
- impacto;
- solución recomendada;
- dificultad estimada;
- prioridad.

FORMATO DE RESPUESTA OBLIGATORIO

Entrega la auditoría con esta estructura:

1. Resumen ejecutivo
   - Estado general del proyecto
   - Qué tan cerca está de ser usable
   - Riesgos principales

2. Mapa de la app actual
   - Secciones detectadas
   - Flujo actual
   - Flujo ideal

3. Auditoría por sección
   - Calendario
   - Catálogo
   - Registrar / Dispositivo
   - Puerquito / Ahorros
   - Ajustes

4. Auditoría técnica
   - Arquitectura
   - Estado
   - Datos
   - Persistencia
   - Rendimiento
   - Riesgos

5. Auditoría UX/UI
   - Jerarquía
   - Accesibilidad
   - Visual
   - Consistencia
   - Fricciones

6. Tabla de hallazgos
   Columnas:
   - Prioridad
   - Sección
   - Problema
   - Impacto
   - Recomendación
   - Dificultad

7. Plan de corrección por fases
   Fase 1: Correcciones críticas
   Fase 2: Flujo Registrar + datos
   Fase 3: Calendario visual
   Fase 4: Catálogo comercial
   Fase 5: Puerquito y metas
   Fase 6: Ajustes y exportación
   Fase 7: Pulido visual y rendimiento

8. Checklist de aceptación
   Lista clara de lo que debe cumplirse para decir que la app está lista para siguiente fase.

9. Prompt siguiente recomendado
   Al final, genera un prompt listo para enviar a Codex/Kilo/Antigravity para corregir los problemas encontrados en la auditoría.

REGLAS DE RESPUESTA

- Sé directo y crítico.
- No suavices problemas importantes.
- No digas “todo está bien” si hay errores.
- No propongas rehacer toda la app salvo que sea absolutamente necesario.
- Prioriza soluciones prácticas.
- Distingue entre lo urgente y lo estético.
- Piensa como producto real para uso diario.
- Piensa como app Android móvil.
- Piensa como herramienta de ventas en piso.
- Entrega una auditoría accionable, no una opinión general.

Ahora analiza toda la documentación/código/imágenes que te proporcione y realiza la primera auditoría completa.
```

Cuando lo uses en Google AI Studio, súbele o pégale todo lo que tengas disponible: capturas de la app, estructura de carpetas, archivos clave, README, documentación y cualquier respuesta de Codex. Ese prompt está diseñado para que Gemini no se vaya directo a “crear cosas nuevas”, sino que primero te entregue una **radiografía completa del estado actual**.
