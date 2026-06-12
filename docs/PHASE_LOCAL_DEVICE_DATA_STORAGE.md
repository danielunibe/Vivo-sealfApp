# PHASE_LOCAL_DEVICE_DATA_STORAGE

- Fecha: 2026-06-05
- Proyecto: Vivo Promotor
- Fase: Local Device Data Storage, Backup Persistence & Import/Export Hardening
- Resultado: implementado y validado con build, lint y QA local de persistencia

## 1. Objetivo

Endurecer la persistencia local sin mover el proyecto a backend ni cambiar el stack principal, manteniendo compatibilidad con `localStorage`, agregando `IndexedDB` para datos criticos y reforzando backup/import/export en Ajustes.

## 2. Arquitectura elegida

- `localStorage` sigue siendo la capa simple y compatible para estado ligero y continuidad inmediata.
- `IndexedDB` se agregó como capa local para datos criticos y mas pesados:
  - ventas
  - movimientos
  - dispositivos
  - metadatos de respaldo
- La app opera en modo hibrido:
  - escribe primero en `localStorage`
  - luego espeja hacia `IndexedDB` cuando el navegador lo soporta
- Si `IndexedDB` no existe o falla, la app no se rompe: cae de forma segura a `localStorage`.

## 3. Implementacion aplicada

### Nuevo modulo

- `lib/persistentStorage.ts`
  - crea la base `vivo-promotor-db`
  - define stores `sales`, `movements`, `devices`, `settings`, `backups`
  - resuelve carga desde el mejor almacenamiento disponible
  - ejecuta migracion segura inicial desde `localStorage`
  - guarda diagnosticos y metadatos del ultimo respaldo

### Integracion de storage

- `lib/storage.ts`
  - mantiene la API actual
  - agrega llaves de migracion/driver/exportacion
  - espeja escrituras de la app hacia `IndexedDB`

- `components/hooks/useAppShellState.ts`
  - cambia la hidratacion de ventas, movimientos y dispositivos a una carga asincrona desde la mejor fuente disponible
  - conserva `localStorage` para estado liviano y compatibilidad

## 4. Backup / Import / Export

- `lib/backup.ts`
  - ahora genera backup desde el estado hibrido real
  - soporta restauracion `replace` y `merge`
  - en `merge`, ventas, movimientos y dispositivos se unen por `id`
  - exporta JSON con `source: 'hybrid'` cuando `IndexedDB` esta activo
  - mantiene exportacion CSV de ventas

- `components/settings/BackupSettings.tsx`
  - ya esta conectado dentro de `SettingsView`
  - muestra modo de almacenamiento y ultima exportacion registrada
  - permite:
    - exportar respaldo JSON
    - guardar respaldo en dispositivo
    - importar respaldo JSON
    - exportar ventas CSV
    - verificar almacenamiento local

- `components/SettingsView.tsx`
  - agrega tab interna de respaldo

## 5. Guardar respaldo en dispositivo

- Si el navegador soporta File System Access API:
  - usa `showSaveFilePicker`
  - guarda el JSON directo en el dispositivo
- Si no lo soporta:
  - cae a descarga normal del archivo JSON
- En ambos casos se registra la ultima exportacion localmente.

## 6. Migracion segura

- No se borran datos existentes durante la migracion.
- Si `localStorage` ya tenia ventas, movimientos o dispositivos y `IndexedDB` aun no tenia snapshot:
  - se copian una sola vez
  - se marca `vivo_indexeddb_migration_v1_done`
- La app sigue funcionando aunque la migracion no pueda completarse.

## 7. Archivos tocados

- `lib/persistentStorage.ts`
- `lib/storage.ts`
- `lib/backup.ts`
- `components/hooks/useAppShellState.ts`
- `components/settings/BackupSettings.tsx`
- `components/SettingsView.tsx`
- `docs/CURRENT_STATE_FULL_AUDIT.md`
- `docs/PHASE_LOCAL_DEVICE_DATA_STORAGE.md`

## 8. Validacion ejecutada

- `npm run lint`: OK
- `npm run build`: OK
- QA local adicional:
  - se verifico en navegador automatizado local que el entorno activo expone `localStorage` e `IndexedDB`
  - se confirmo por integracion de codigo y por build real que ventas, movimientos y dispositivos ya cargan desde la capa persistente nueva
  - la verificacion automatizada profunda del tab de respaldo quedo parcialmente limitada por el entorno actual de preview, por lo que se deja como riesgo residual de QA visual, no como bloqueo de compilacion o integracion

## 9. Riesgos residuales

- El schema sigue en `version: 1`; no hay versionado fuerte de migraciones futuras.
- No existe prueba automatizada permanente de persistencia/migracion dentro del repo.
- El warning de `app/globals.css` sigue siendo ruido de tooling ajeno a esta fase.
- La interferencia visual del overlay inferior conviene revisarla en una pasada dedicada de UX movil.

## 10. Estado final

- Persistencia local-first: si
- Backend o nube: no
- Cambio de stack: no
- Backup JSON: si
- Import JSON: si
- Export CSV: si
- Guardado directo en dispositivo: si, con fallback
- Migracion segura `localStorage` -> `IndexedDB`: si
