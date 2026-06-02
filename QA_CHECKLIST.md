# QA_CHECKLIST.md

## Flujo manual

1. Abrir app.
2. Confirmar pantalla inicial `Registrar`.
3. Confirmar navegación `Calendario | Registrar | Ajustes`.
4. Confirmar modelos:
   - Y04 $20
   - Y21D $80
   - Y29 $180
   - V50 Lite $350
   - V60 Lite $350
5. Registrar Y29 x2.
6. Confirmar comisión estimada $360.
7. Registrar venta.
8. Confirmar resumen del día actualizado.
9. Ir a Calendario.
10. Confirmar indicador visual en fecha actual.
11. Tocar fecha y validar detalle (modelo/cantidad/comisión).
12. Eliminar venta y confirmar recálculo.
13. Ir a Ajustes y cambiar comisión de Y29.
14. Registrar nueva venta Y29 x1 y confirmar nueva comisión.
15. Verificar que ventas antiguas mantienen snapshot histórico.
16. Exportar CSV ventas y CSV mensual.
17. Confirmar columnas mínimas:
   - `fecha`
   - `modelo`
   - `cantidad`
   - `comision_por_unidad`
   - `comision_total`

## Sanidad técnica

1. `flutter pub get`
2. `dart run build_runner build --delete-conflicting-outputs`
3. `flutter analyze`
4. `flutter test`
5. `flutter build apk --debug`
6. Verificar APK en `build/app/outputs/flutter-apk/app-debug.apk`.
