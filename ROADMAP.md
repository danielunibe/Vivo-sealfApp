# Roadmap de Funcionalidades Pendientes

Plan de trabajo ordenado por prioridad de negocio y complejidad técnica.

## Prioridad 0 (P0): Exportación e Integridad de Datos
- **[COMPLETADO] Exportación CSV:** Implementado en Ajustes > Historial con descarga de archivo `.csv` compatible con Excel.
- **IMEI Opcional:** Permitir opcionalmente asociar el número IMEI del equipo celular al registrar una venta para un control exacto de stock.

## Prioridad 1 (P1): Optimización y Balance de Métricas
- **[COMPLETADO] Limitación de Monedas en Rendimiento:** Limitado a un máximo de 30 monedas concurrentes en el visualizador 3D para optimización de físicas y CPU/GPU.
- **Refactorización de Monolitos:** Separar el componente principal de la alcancía en sub-módulos para simplificar su mantenimiento y reducir las líneas de código de `PiggyBankSection.tsx`.

## Prioridad 2 (P2): Historial Expandido y Reportes
- **Resumen Mensual de Comisiones:** Incluir una gráfica analítica simplificada de barras temporales en la pestaña de Ajustes para analizar las comisiones ganadas mes con mes.
- **Filtros Avanzados:** Añadir filtrado por cliente, color de equipo o modelo específico en una sección secundaria de auditoría.
