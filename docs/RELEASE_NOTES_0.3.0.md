# Vivo Promotor 0.3.0

## Estado de publicación

- Versión preparada: `0.3.0`.
- Android: `versionCode 3`, `versionName 0.3.0`.
- Publicación GitHub: pendiente del URL exacto del repositorio.
- Canal previsto mientras solo exista APK debug: **pre-release**.
- Release estable: bloqueado hasta disponer de APK firmada con keystore conservada fuera del repositorio.

## Novedades

- Selector visible para registrar una venta en cualquier fecha.
- Acción rápida para restablecer la fecha a hoy.
- Calendario sin límites artificiales 2026-2027.
- Comisiones del Puerquito alineadas con la fecha comercial de la venta.
- Compatibilidad con datos antiguos mediante fallback `effectiveDate`, `saleId` y `createdAt`.
- Rediseño neumórfico negro/blanco con color reservado para estados y producto.
- Contrato visual documentado para su traducción futura a Jetpack Compose.
- Room esquema 2 con migración no destructiva del nuevo campo opcional.

## Compatibilidad

- No cambian las comisiones.
- No cambian las llaves `vivo_*`.
- No cambia `applicationId`.
- No cambia el orden del dock.
- No cambia el flujo long-press.
- Los backups JSON v1 siguen siendo válidos.

## Artefactos

- APK debug: `dist-apk/vivo-promotor-debug.apk`.
- Checksum SHA-256: generar después del build final.

## Publicación pendiente

1. Recibir y verificar URL exacto del repositorio.
2. Auditar `git status` y secretos.
3. Configurar `origin`.
4. Consolidar baseline en `main`.
5. Crear tag anotado `v0.3.0`.
6. Publicar pre-release con APK debug y checksum.
