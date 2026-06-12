# QA Checklist - Vivo Promotor

## Precondiciones
1. Limpiar datos locales desde las utilidades de consola o recargando en incógnito si es necesario.
2. Iniciar la app en modo claro u oscuro.

## Pruebas Manuales (Happy Paths)

### 1. Ventas y Acumulados
- [ ] Entrar a Ajustes > Dispositivos, editar ganancia de un dispositivo.
- [ ] Entrar a Ajustes > Metas, editar metas (ej. Diaria $300).
- [ ] Entrar a Registrar venta, seleccionar el dispositivo editado y un color distinto al de por defecto.
- [ ] Apretar "Concretar venta" y validar que confirma el modelo, color y monto correctos.
- [ ] En Puerquito, verificar que el acumulado del día (`Día`) refleja la venta.
- [ ] En Puerquito, verificar que la barra de porcentaje refleja el progreso correctamente y no se rompe al exceder la meta.
- [ ] En Puerquito, cambiar a 'Semana', 'Mes' y 'Año' y comprobar que la venta contabiliza.
- [ ] Verificar que en el Calendario, el estado del día se actualizó (cambió color). Validar con una venta parcial (< meta) y meta lograda.

### 2. Días de Descanso y Condicionales
- [ ] Seleccionar el día actual como "inactivo" (descanso) desde Ajustes > Horarios (usando la tuerca u opciones).
- [ ] Verificar en el Calendario que el estado del día es descanso (gris).
- [ ] Hacer una venta en un día de descanso y verificar visualmente en el calendario si se mantiene como descanso o lo pinta con venta (se espera que se quede con la venta, pero la visual de `CalendarStatus` lo pinta de descanso primero. Hay que revisar esta regla operativa si se puede vender en descanso o solo no exige color rojo).
  - *Nota: En la herramienta calendarStatus, el descanso le quita opcionalidad. Funciona.*

### 3. Persistencia de Datos
- [ ] Refrescar (F5) la aplicación.
- [ ] Validar que las metas, horarios, perfil, ventas, movimientos y ganancias siguen siendo las establecidas previamente sin duplicaciones.

### 4. Demo Data
- [ ] Si se necesita poblar la BD con ventas falsas o vaciarla, invocar `window.demoTools.seedDemoData()` o `clearDemoData()`.

## Edge Cases controlados
- [ ] Ganancias cambiadas en *runtime* no deben afectar retroactivamente a ventas previas (el Piggy acumula las ventas desde el momento en que se procesó, cada `Sale` contiene su `amountEarned`).
- [ ] Asegurarse de que múltiples clics seguidos en "Concretar venta" no detonen más de un modal / registro. (Controlado actualmente mediante estado `isConfirming` y remoción del botón).
