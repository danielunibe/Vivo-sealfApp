# FLUJO DE DATOS (DATA FLOW)

## 1. Ajustes (Fuente de verdad)
En \`SettingsView\`, el usuario configura:
- **Perfil operativo:** Nombre y tienda.
- **Dispositivos:** Modelos activos y sus montos de ganancia (comisiones).
- **Horarios:** Días laborables, descansos, y horas de entrada/salida.
- **Metas:** Diaria, Semanal, Mensual, y Anual.

*Todas las configuraciones persisten en \`localStorage\` usando los helpers de \`lib/storage.ts\` (\`vivo_piggy_goals\`, \`vivo_work_schedule\`, \`vivo_devices\`, etc).*

## 2. Registrar venta
La sección \`RegisterSaleSection\` lee la información configurada en Ajustes (principalmente el catálogo de dispositivos y la ganancia asociada a cada modelo). 
- El usuario selecciona un **modelo** y el **color**, lo cual actualiza el fondo y estilo de la pantalla.
- Al hacer clic en "Concretar venta", se muestra un diálogo de confirmación que resume el modelo, color y el monto a sumar.
- Al confirmar:
  - Se guarda el objeto \`Sale\` (con modelo, color seleccionado explícitamente, ganancia, día de registro) mediante \`setSales\`.
  - Se genera un \`PiggyMovement\` (tipo income) que se registra en el Puerquito para tener el rastro.
  - Se invoca animación y feedback visual en el dock.

## 3. Puerquito
La sección \`PiggyBankSection\`:
- **Lee todos los movimientos** guardados (de las ventas).
- **Calcula** el acumulado mediante su propio utilitario \`lib/piggyUtils.ts\` que suma todos los movimientos que caigan dentro del periodo actualmente seleccionado (\`Día\`, \`Semana\`, \`Mes\`, \`Año\`).
- **Compara** el progreso (\`progressPercent\`) contra la meta real configurada en los ajustes del usuario (\`currentGoal\`).
- Los valores y colores del fondo ahora son dinámicos en función a este avance real.

## 4. Calendario y Resumen de Jornada
La sección \`CalendarGrid\`:
- **Lee su configuración laboral** de \`getWorkSchedule()\` para marcar si un día es un día funcional o si el promotor tuvo descanso (\`rest\`).
- **Lee todas las ventas** registradas.
- **Reconoce Estados Manuales de Asistencia:** Integra `lib/calendarDailySummary.ts` leyendo estados manuales locales como "No me presenté" o "Descanso explícito" a petición del prompt inteligente de confirmación diaria.
- **Expone un Resumen Integral:** Por cada día se evalúa comparando la venta contra el \`dailyGoal\`. Renderizando micro-píldoras (representando los dispositivos vendidos), el estatus del color según la asistencia y cumplimiento de cuotas, y el dinero sumado en la jornada, cerrando así un ciclo limpio y transparente hacia El Puerquito.
