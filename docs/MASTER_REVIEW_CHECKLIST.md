# VIVO PROMOTOR — MASTER REVIEW CHECKLIST (CHECKLIST MAESTRO DE AUDITORÍA)

Este documento contiene una auditoría completa del estado actual de la aplicación **Vivo promotor**, evaluando su arquitectura, flujos de datos, diseño visual, coherencia conceptual e implementación técnica.

---

## 1. ESTADO GENERAL DEL PROYECTO

*   **¿Qué es la app?** Una herramienta móvil y personal para promotores y personal de venta de teléfonos de la marca **Vivo**, destinada a registrar las ventas ejecutadas en tiempo de trabajo, rastrear comisiones/márgenes, y motivar el logro de metas diarias y mensuales (visualizado como un calendario de metas y una alcancía interactiva con física 3D en tiempo real).
*   **Estado de avance estimado:** `90%` — La aplicación está sumamente pulida, el build es 100% limpio y compila en producción con un linter impecable. La lógica de negocio está totalmente conectada y es reactiva de extremo a extremo. Los assets, fallbacks de imagen, animaciones, pesos y flujos táctiles funcionan de manera fluida y robusta.
*   **Principales riesgos:**
    1.  *Dependencia de Assets Locales:* Aunque se ha introducido un componente `<SafeImage />` excelente que reacciona limpiamente ante imágenes ausentes, si se desplegara la app sin los archivos `.png` en `/public/assets/devices/`, la interfaz usaría fallbacks vectoriales.
    2.  *Desborde de LocalStorage:* Todas las ventas y configuraciones de guardado se hacen de manera cruda en el localStorage. Para un uso pesado de meses o años por parte de un promotor, los datos persisten bien, pero se beneficiaría de un botón para "Exportar Respaldo" o limpieza controlada de historial antiguo para evitar saturar la cuota si crece infinitamente.
    3.  *Compatibilidad del Canvas 3D de Alcancía:* El componente Three.js es de altísima gama, pero requiere GPU de celular de gama media/baja razonable. Se ha de vigilar la tasa de refresco en dispositivos sumamente antiguos si se encapsula como híbrida (PWA o WebView).

---

## 2. CHECKLIST DETALLADO POR SECCIÓN

### 1. Calendario (`CalendarSection`)
La sección funciona como una cuadrícula para medir **unidades vendidas en la jornada diaria** y registrar la asistencia del promotor.
*   `[x]` **Funcionalidad principal completa:** Muestra días en una grilla mensual, día seleccionado, y cambia de mes/año de forma interactiva (deslizable o mediante flechas).
*   `[x]` **Cajas cuadradas redondeadas con marca de agua:** Se cumple rigurosamente; las celdas conservan forma cuadrada (`aspect-square bg-transparent rounded-xl`) y el número de día es una marca de agua translúcida que evita saturación al fondo.
*   `[x]` **Monto diario y miniaturas:** Cada celda muestra miniaturas compactas escaladas (`w-2.5 h-[10px] object-cover`) de los equipos correspondientes vendidos en esa fecha, así como el importe en formato truncado seguro (`$1k`, `$2.5k`, `$400`).
*   `[x]` **Barra superior de progreso por celular (Metas de Unidades):** El componente `CalendarDaySummaryTop` calcula de forma aislada las unidades vendidas en la jornada activa comparándolas con la meta diaria en celulares (meta de unidades, NO dinero), resolviendo la separación conceptual.
*   `[x]` **Asistencia e inasistente interactivo:** El prompt inteligente `<MissedDayPrompt />` (¿Trabajaste ayer?) detecta proactivamente inasistencias y días transcurridos sin registrar para asignar estados manuales de asistencia de campo como descanso, trabajo sin venta o inasistencia de manera reactiva sin sobresaturar.
*   `[x]` **Colores definidores claros:** Diferencia correctamente entre descanso, inasistente ("not-attended"), por debajo de la meta ("below-goal": ámbar), meta cumplida ("goal-met": verde esmeralda) y meta superada ("goal-exceeded": violeta/púrpura).
*   `[ ]` **Pendientes concretos:** Agregar un botón explícito de "Ver Historial Simple del Mes" en la cabecera del calendario para ver un listado condensado de todas las ventas ordenadas cronológicamente para el mes activo sin tener que hacer clic en cada día individual.

> **Clasificación del Estado (Calendario):**
> *   *Implementado:* Sí
> *   *Parcial:* Ninguno
> *   *Roto:* Ninguno
> *   *Pendiente:* Botón de vista de historial textual resumido mensual.
> *   *Riesgo:* Bajo. Rendimiento de animaciones en navegadores sumamente desactualizados si se cargan muchas transacciones pesadas de golpe.

---

### 2. Catálogo (`CatalogSection`)
Muestra el portafolio visual premium de teléfonos móviles activos de la marca Vivo.
*   `[x]` **Los 5 modelos oficiales presentes:** Y04, Y21D, Y29, V50 lite 4G y V60 lite.
*   `[x]` **Layout de bento grid ultra-premium:** El portafolio huye del diseño tipo tabla aburrida y expone un ritmo asimétrico asombroso con bordes asimétricos curvos (`rounded-tl-[70px]`, `rounded-tr-[50px]`, etc.) y fondos degradados líquidos líquidos para cada celular en su gama croma correspondiente.
*   `[x]` **Identificación monetaria unificada en pesos mexicanos:** Muestra de forma limpia la ganancia/comisión asignada (ejemplo: `+$450 MXN`) alineado con los ajustes de comisiones.
*   `[x]` **Sistemas de chips de colores y características:** Presenta de manera sutil e integrada los chips de pintura comercializada oficiales (Morado Lavanda, Blanco Nube, Rosa Pop) y descripciones cortas reales fidedignos sin datos fantasiosos.
*   `[x]` **Preparación de assets segura:** Implementa `<SafeImage />` conectada al `catalogSrc` y un fallback automático vectorial de smartphone estilizado si el PNG local está ausente en el build.
*   `[ ]` **Pendientes concretos:** Permitir un toque secundario ("Tap holding") para abrir una tarjeta detallada con "Specs completas del equipo" (procesador, SoC, batería exacta, sensor de cámara) útil para entrenamiento rápido del promotor en el piso de venta.

> **Clasificación del Estado (Catálogo):**
> *   *Implementado:* Sí
> *   *Parcial:* Ninguno
> *   *Roto:* Ninguno
> *   *Pendiente:* Modal flotante de especificaciones de hardware rápidas ("Cheat-Sheet" de capacitación).
> *   *Riesgo:* Ninguno. Estanco y 100% estable.

---

### 3. Registrar venta (`RegisterSaleSection`)
Sección central que permite capturar de forma interactiva una transacción concretada.
*   `[x]` **Selectores iniciales y color activo:** Permite alternar modelos a través de un carrusel táctil y un selector de color vertical reactivo que tiñe los bordes, la iluminación y el fondo global de la pantalla.
*   `[x]` **Comienzo enfocado seguro:** Inicia en `V50 lite` / `Negro Místico` por defecto.
*   `[x]` **Confirmación por retención física ("Hold to Confirm"):** En vez de un simple diálogo flotante genérico que interrumpe bruscamente la experiencia ("Guardar Sí/No"), utiliza un botón del motor táctil que requiere ser presionado de manera continua por 3 segundos ("Confirmar venta"), pintando barra y desatando una asombrosa animación de partículas cósmicas y nebulae que tiñen toda la interfaz física del celular del promotor.
*   `[x]` **Creación de transacciones sincrónicas:** Al completarse, genera reactivamente el registro `Sale` detallado (con modelo, color real y fecha), genera el respectivo `PiggyMovement` (ingreso para el puerquito), y actualiza de inmediato el calendario tras recarga.
*   `[x]` **Ganancias reactivas:** Lee y calcula con precisión las comisiones vigentes y modificadas en Ajustes para el abonado instantáneo.
*   `[x]` **Uso de assets reales:** Integración de imágenes a través de `registerSrc`, visualizaciones limpias sin fallos de rutas absolutas de disco duro.
*   `[ ]` **Pendientes concretos:** Agregar la posibilidad de capturar el "IMEI" (15 dígitos numéricos) del equipo vendido como campo opcional antes de sostener para registrar la venta, asegurando que el promotor tenga un folio real si la tienda auditara los reportes.

> **Clasificación del Estado (Registrar venta):**
> *   *Implementado:* Sí
> *   *Parcial:* Ninguno
> *   *Roto:* Ninguno
> *   *Pendiente:* Campo opcional para registro de IMEI o folio de ticket comercial.
> *   *Riesgo:* Medio-bajo. Evitar toques continuos repetidos (ya blindado en los hooks con resets de animaciones y estados inhabilitados durante la confirmación).

---

### 4. Puerquito (`PiggyBankSection`)
Sección de acumulación de comisiones, ahorro global y métricas financieras interactiva.
*   `[x]` **Acumulado monetario absoluto real:** Suma e interpreta de forma pura las ventas exitosas calculando cuánto dinero ha ingresado.
*   `[x]` **Barra de progreso de energía mensual (Métricas Financieras):** Posee selectores rápidos de período (`Día`, `Semana`, `Mes`, `Año`) y los coteja individualmente con la meta económica asignada (meta de dinero, NO unidades), respondiendo a la dualidad conceptual de dinero vs unidades.
*   `[x]` **Frasco de vidrio interactivo 3D con físicas:** El componente de GPU `SavingsJar` renderiza mediante Three.js un botellón realista de cristal texturizado translúcido, donde se vacían monedas de oro macizo y reflectante de manera gravitacional al capturar ingresos.
*   `[x]` **Pulsación sensorial gratificante de jornada:** Al confirmar una venta, la interfaz flota una moneda dorada animada por encima del dock, e inyecta la cápsula `+$ MXN hoy` sobre la boca del frasco, desvaneciéndose limpiamente con resortes tras 4.5 segundos.
*   `[x]` **Etiqueta glaseada no invasiva:** La placa frontal ("Ahorrado") posee sutil cristalización traslúcida que permite ver la caída y acumulación de monedas de forma transparente.
*   `[ ]` **Pendientes concretos:** Dar soporte a un botón para hacer "Unboxing / Sacudir Alcancía" que aplique una fuerza vectorial aleatoria en el plano de Three.js para recolocar las monedas acumuladas en caso de que se apilen de forma extraña en pantallas ultra-angostas.

> **Clasificación del Estado (Puerquito):**
> *   *Implementado:* Sí
> *   *Parcial:* Ninguno
> *   *Roto:* Ninguno
> *   *Pendiente:* Botón o sensor de agitar dispositivo (giroscopio) para mover las monedas dentro de la botella.
> *   *Riesgo:* Medio. Consumo de recursos de procesado gráfico de Three.js si existieran más de 80 monedas físicas simuladas de golpe (ya controlado mediante limitación en el algoritmo de renderizado de la alcancía).

---

### 5. Ajustes (`SettingsSection`)
La fuente de verdad para parametrizar perfiles, equipos, metas y visuales.
*   `[x]` **Diseño de tabs internas compactas:** Se navega de manera interna mediante botones de iconos minimalistas correspondientes a perfil, metas, horarios, y ganancias de dispositivos.
*   `[x]` **Configuración real y persistente de metas:** Separa correctamente la meta diaria del calendario (medida en celulares, por defecto `3` unidades) de las metas de comisiones de la alcancía (por defecto `$300` diarios, `$6500` mensuales).
*   `[x]` **Dispositivos y ganancias ajustables:** Permite modificar con exactitud los pesos y pesos de MXN asignados para cada uno de los 5 equipos oficiales.
*   `[x]` **Horarios funcionales y descansos:** El grid de horario permite alternar individualmente qué días labora el promotor y la hora de cobertura (ejemplo: Lunes, 09:00 a 18:00) y qué días son descanso oficial, enlazado para que el calendario no castigue las ausencias en feriados/descansos.
*   `[ ]` **Pendientes concretos:** Añadir una pestaña de "Exportación de Datos" en Ajustes que permita descargar el contenido del localStorage en un CSV limpio para enviar por correo o WhatsApp a los supervisores de la marca.

> **Clasificación del Estado (Ajustes):**
> *   *Implementado:* Sí
> *   *Parcial:* Ninguno
> *   *Roto:* Ninguno
> *   *Pendiente:* Botón de exportar a hoja de cálculo de comisiones (CSV).
> *   *Riesgo:* Bajo. Operaciones de persistencia directas sin parpadeos.

---

## 3. CHECKLIST MAESTRO DE FLUJO DE DATOS RECOMPILADO

*   `[x]` **Ajustes guarda metas:** Las modifica y propaga de inmediato al localStorage de forma SSR-safe.
*   `[x]` **Ajustes guarda ganancias:** Modificar el margen de `V60 LITE` afecta al instante el desglose expuesto en el catálogo y los montos a calcular en Registrar Venta.
*   `[x]` **Registrar venta usa comisiones reales y activas:** Lee directamente el estado del array de dispositivos cargado desde persistencia.
*   `[x]` **Registrar venta guarda atributos correctos:** Guarda el modelo y sobre todo el color comercial activo exactamente como fue seleccionado mediante el selector vertical.
*   `[x]` **Sincronía reactiva de doble registro:** Genera `Sale` y genera `PiggyMovement` simultáneamente en una sola ejecución transaccional atómica.
*   `[x]` **Puerquito calcula finanzas acumuladas sobre movimientos reales:** Su algoritmo suma ingresos menos egresos del período actual.
*   `[x]` **Calendario calcula unidades físicas y reconoce descansos:** Asocia las metas diarias en base al número de celulares vendidos en esa jornada y marca descansos según la configuración semanal o inasistencias manuales decididas tras el prompt diario, de forma totalmente disociada del dinero.

---

## 4. CHECKLIST CONTROL VISUAL GLOBAL

*   `[x]` **Consistencia de Dock:** Iconos premium con tactilidad avanzada, sin texto debajo de los iconos ni dots redundantes. El botón central ("Registrar venta") toma peso de foco absoluto de manera minimalista.
*   `[x]` **Sintonía de Divisa Localizada:** Exclusivo uso de pesos mexicanos (`MXN` / `$`) en todo el ecosistema de la app, desactivando ruidos residuales de USD.
*   `[x]` **Párrafos, holguras y textos:** Sin leyendas cortadas, ni excesos de espacio en blanco injustificado. Rediseñada la barra de navegación superior y títulos de mes agrupados de forma horizontal integrada para compactar jerarquías espaciales.
*   `[x]` **Estilo de marca de agua:** En el calendario las marcas de agua de fondo se redujeron en contraste y opacidad (`opacity-[0.14]`) asentándose de manera silenciosa para priorizar los badges y montos en cada celda.
*   `[x]` **Manejo de refracción y etiqueta en alcancía:** La etiqueta del frasco es un hermoso vidrio translúcido (`backdrop-blur-md bg-white/5`) no invasivo que deja ver el metalizado de Three.js.

---

## 5. CHECKLIST TÉCNICO

*   `[x]` **Compilación impecable:** `Build` en producción limpio al 100%.
*   `[x]` **Linter impecable:** `Lint` completado con 0 errores de sintaxis o cascading.
*   `[x]` **Modularidad de lógicas:** Lógicas robustas aisladas en `lib/storage.ts`, `lib/piggyUtils.ts`, `lib/calendarDailySummary.ts` y custom hooks.
*   `[x]` **Componentes estables:** React hooks estables sin triggers infinitos de re-renders o variables inestables en arrays de efectos.
*   `[ ]` **Refactorización de archivos de gran escala:** Algunos componentes monolíticos visuales (como `CatalogSection.tsx` con 461 líneas o `RegisterSaleSection.tsx` con 320 líneas) se beneficiarían de ser subdivididos en micro-ficheros aislados en su propio subdirectorio para optimizar velocidad del desarrollador.

---

## 6. ROADMAP DE IMPLEMENTACIÓN RECOMENDADO (PATCHES ADELANTE)

### Prioridad P0 — Crítico antes de seguir
*   *(Completado)* No existen errores de ejecución o interrupción en el actual estado auditado.

### Prioridad P1 — Necesario para versión de campo usable en piso de venta
1.  **Registro de IMEI / Folio opcional:** Añadir el campo de captura de IMEI de 15 dígitos numéricos en la tarjeta del selector antes del hold para evitar que el promotor cometa fraude de listados.
2.  **Exportación a CSV:** Añadir el botón en la pestaña de Ajustes de Perfil para que el usuario promotor exporte un archivo plano rápido con todos sus datos del mes y lo envíe a sus superiores.

### Prioridad P2 — Pulido y Comodidad Visual
1.  **Historial Simple en Calendario:** Botón flotante para ver en formato de lista textual todas las ventas del mes activo de un vistazo para cotejos de caja rápidos.
2.  **Detalle de Ficha Técnica de Equipos (Capacitación):** En el Catálogo, poder ver una tarjeta con las características completas de hardware del dispositivo para consulta de asesoría de marca rápida.

### Prioridad P3 — Mejoras de Larga Escala y Futuro
1.  **Agitado de Alcancía:** Vincular el movimiento del acelerómetro/giroscopio en Web para sacudir las monedas físicas y resolver apilamientos densos e incentivar el juego de ahorro.
2.  **Sincronización Cloud Offline-First (Firestore):** Preparar almacenamiento Firestore para respaldos automáticos en la nube cuando el promotor recupere conexión de datos móviles en campo.
