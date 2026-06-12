# ANDROID_WHATSAPP_INSTALL_GUIDE

- Proyecto: Vivo Promotor
- APK de prueba actual: `dist-apk/vivo-promotor-debug.apk`
- Tipo: APK debug instalable para pruebas
- Fecha: 2026-06-05

## Enviar por WhatsApp

1. Enviar `vivo-promotor-debug.apk` como documento, no como imagen.
2. En el telefono Android, descargar el archivo recibido.
3. Tocar el APK descargado.
4. Si Android bloquea la instalacion, tocar `Ajustes` o `Permitir desde esta fuente`.
5. Permitir temporalmente instalar apps desde WhatsApp o el gestor de archivos.
6. Volver al APK e instalar.
7. Abrir `Vivo Promotor`.

## Si aparece Play Protect

- Revisar que el archivo venga de una fuente confiable.
- Tocar `Mas detalles` si Android lo muestra.
- Continuar solo si el usuario sabe que es una APK privada de prueba.

## Antes de actualizar una APK manual

1. Abrir Vivo Promotor.
2. Ir a Ajustes > Respaldo.
3. Exportar respaldo JSON.
4. Instalar la nueva APK encima, sin desinstalar.
5. Confirmar que ventas, calendario, puerquito, dispositivos y ajustes siguen.

## Importante

- Si desinstalas la app, Android puede borrar los datos locales.
- Para actualizar sin perder datos, se debe mantener el mismo `applicationId`: `com.davidsanchez.vivopromotor`.
- Para release formal, se necesita firmar siempre con la misma keystore.

## Qué hacer si no instala

- Si dice `App no instalada`, puede existir una version previa firmada diferente.
- No desinstalar automaticamente si hay datos reales.
- Primero exportar respaldo JSON desde la app instalada.
- Para pruebas sin datos, se puede desinstalar manualmente y reinstalar, sabiendo que eso puede borrar datos.
