# CODEX_GUARDRAILS.md

## 1. Regla principal

Codex solo debe modificar lo solicitado o lo estrictamente necesario para cumplir la fase activa. Todo lo demas queda protegido por defecto.

## 2. No tocar sin permiso

| No tocar | Motivo | Estado |
|---|---|---|
| Orden del dock | Confirmado por producto | protegido |
| Comisiones | Afecta ventas | protegido |
| `localStorage.clear()` | Riesgo de perdida total | prohibido |
| Backup/import/export | Seguridad de datos | protegido |
| `ProductImageFrame` y `SafeImage` | Fallback visual critico | protegido |
| `applicationId` Android | Identidad para actualizaciones | protegido |
| Keystore de release | Sin la misma firma no se actualiza encima | protegido |
| Feedback sensorial | Debe sentirse sutil y controlable | no agregar sonidos pesados ni autoplay |
| Launcher WebView actual | Referencia funcional hasta paridad Kotlin | no reemplazar comportamiento sin QA |

## 3. Correcciones activas

- Y29 no debe mostrarse como 5G mientras la ficha configurada sea Y29 4G Mexico.
- Y04 Mexico se muestra con 5150 mAh; 5500 mAh queda como variante regional, no claim local.
- Las metas del calendario por color deben calcularse por unidades vendidas contra `dailyDeviceGoal`.
- Modelos personalizados no deben romper catálogo ni ficha; usan fallback pendiente.
- `lib/deviceKnowledge.ts` es la fuente comercial principal; no duplicar claims extensos en `INITIAL_DEVICES`.
- La version visible debe venir de `lib/appVersion.ts` y mantenerse alineada con `package.json` y Android.
- Sonido y vibracion deben pasar por `lib/nativeFeedback.ts`; no reproducir audio directo dentro de componentes.
- La intro de marca debe revelar el video desde negro/degradado y priorizar MP4 de calidad en Android.
- La migracion Kotlin debe ser paralela y reversible hasta que backup, ventas, calendario, catalogo, puerquito y ajustes pasen QA nativa.
- `Sale.date` es la fecha comercial y `Sale.createdAt` es auditoria; no volver a derivar Puerquito solo desde `createdAt`.
- `Movement.effectiveDate` es opcional para no invalidar respaldos v1.
- El sistema visual 0.3.0 es monocromo primero; color global decorativo requiere autorizacion.

## 5. Migracion Kotlin nativa

- Stack destino autorizado: Kotlin + Jetpack Compose + Room + DataStore.
- No borrar Next/Capacitor ni reemplazar el comportamiento `BridgeActivity` del launcher hasta completar paridad funcional.
- `MainActivity.kt` puede existir como entrypoint Kotlin siempre que conserve la experiencia actual.
- El backup JSON v1 actual es contrato de compatibilidad obligatorio.
- Toda importacion/migracion debe ser no destructiva y marcar `native_migration_done` solo al terminar correctamente.

## 4. Futuro no implementado

- Automatizar screenshot QA multi-viewport.
- Generar APK debug/release cuando el entorno tenga Java y Android SDK configurados.
