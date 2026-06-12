# Flujo de Datos del Sistema

El flujo de información se rige por un esquema centralizado y unidireccional de estados donde la sección de Ajustes funciona como la fuente primaria de configuración del ecosistema.

```
       [ AJUSTES: Configuración de Configs ]
                         │
                         ▼
        [ REGISTRAR VENTA: Dispositivos / Precios / Colores / Comisiones ] (Lectura)
                         │ (Confirmación de Venta)
                         ▼
             ┌───────────┴───────────┐
             ▼                       ▼
      [ NUEVA VENTA ]       [ NUEVO MOVIMIENTO ]
      (Objeto Sale)        (PiggyMovement)
             │                       │
             ▼                       ▼
    [ CALENDARIO ]            [ ALCANCÍA/PUERQUITO ]
  - Lee metas diarias      - Calcula dinero acumulado
  - Mide rendimiento       - Calcula comisiones ganadas
  - Clasifica jornadas     - Representa ahorro vs. meta
```

## Componentes del Flujo

### 1. Ajustes (Fuente de Verdad)
Configura los parámetros globales como:
- Horas de la jornada laboral diaria.
- Metas de ahorro y metas de unidades a vender.
- Datos maestros de dispositivos disponibles y márgenes de comisión.

### 2. Registrar Venta (Entrada Lógica)
- Lee la lista de modelos de equipos, colores válidos y márgenes cargados desde Ajustes.
- El usuario asocia un dispositivo, color, cliente, fecha y opcionalmente IMEI.
- Al guardar, emite dos registros concurrently: un objeto `Sale` y un registro `PiggyMovement`.

### 3. El Puerquito (Métrica de Comisiones)
- Consume la lista de movimientos financieros (`PiggyMovement`).
- Suma las comisiones acumuladas del periodo y calcula el porcentaje de avance frente a la meta vigente.
- Dispara la caída física de la moneda animada con persistencia en el frasco neumórfico.

### 4. Calendario (Métrica de Actividad)
- Consume la lista histórica de ventas (`Sale`).
- Agrupa las ventas por día del calendario para determinar el rendimiento de la jornada laboral.
- **Separación Crítica de Responsabilidades:**
  - **Calendario:** Mide unidades físicas vendidas en relación a la jornada laboral.
  - **Puerquito:** Mide recursos monetarios y metas de ahorro globales en MXN.
