# Pipeline de Desarrollo y Trabajo por Fases

El proyecto sigue una estricta disciplina de **una fase activa por prompt**. Es obligatorio completar y validar los bloqueantes de una fase antes de proceder a la siguiente.

| Fase | Objetivo | Permitido | Bloqueante |
| :--- | :--- | :--- | :--- |
| **Fase 1: Entorno** | Estabilizar Dependencias y Compilación | Modificar scripts, instalar librerías válidas en `package.json`, solucionar imports rotos. | Errores de compilación, advertencias críticas de TypeScript o falta de módulos base. |
| **Fase 2: Datos** | Establecer Flujo, Estado y Almacenamiento | Definir interfaces TypeScript, configurar persistencia (`localStorage`), sincronizar estados compartidos. | Mutaciones directas involuntarias de estados o pérdidas de persistencia local. |
| **Fase 3: Diseño** | Estilo Neumórfico, Bento y Dock Táctil | Pulir layouts responsivos, ajustar el grid bento de catálogo en una pantalla única, refinar micro-animaciones en `motion`. | Scrollboards rotos, colisiones con el dock flotante inferior o texturas pixeladas / mal balanceados. |
| **Fase 4: Funciones**| Auditoría, Lógica y Casos de Borde | Implementar validaciones de formulario, rangos de fecha de calendario, cálculos de comisiones del puerquito. | Fallos en el happy path de venta o inconsistencias en contadores diarios. |
| **Fase 5: Extensión**| Integraciones de Valor Añadido (Opcionales)| Añadir descargas opcionales CSV, soporte de logs históricos o configuraciones de IMEI opcionales. | Introducción de dependencias pesadas no autorizadas que revienten el rendimiento móvil. |

## Regla de Oro
- **Una Sola Fase por Turno:** No intentes solucionar problemas de diseño decorativo mientras existan fallas de compilación o linter activas en el entorno.
