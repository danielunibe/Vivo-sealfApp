# Configuración de Permisos en Antigravity

Este documento explica cómo configurar los permisos de **Antigravity** para reducir la frecuencia de las confirmaciones repetidas, manteniendo la seguridad del sistema y agilizando el flujo de trabajo en el proyecto **Vivo Promotor**.

---

## 1. Por qué Antigravity solicita permisos
Antigravity opera bajo un modelo de **privilegio mínimo** y aislamiento. Por defecto:
* Cada comando propuesto en la terminal (ej. `npm run build`, `git status`) requiere confirmación explícita del usuario.
* Ciertos accesos a archivos o peticiones HTTP externas requieren consentimiento del usuario.
* Esto protege el sistema contra ejecuciones accidentales, comandos destructivos o fugas de datos.

---

## 2. Configuración Manual en el Cliente de Antigravity
Para evitar que Antigravity solicite autorización para tareas repetitivas y seguras, puedes configurar reglas persistentes directamente en la interfaz del cliente:

### A. Autorización de Comandos Frecuentes
Cuando aparezca un diálogo de permiso para un comando, puedes seleccionar la opción de **"Recordar siempre para este prefijo de comando"** o similar en la UI de Antigravity. Los prefijos recomendados para permitir son:
* `git status` / `git diff`
* `npm run lint`
* `npm run build`
* `npm run dev`

Al permitir estos comandos de lectura y construcción local, Antigravity los ejecutará inmediatamente sin pausar el flujo de desarrollo.

### B. Gestión de Permisos desde la Interfaz de Configuración
1. Abre el panel de **Ajustes** de Antigravity.
2. Ve a la sección **Seguridad / Permisos de Workspace**.
3. Asegúrate de añadir el directorio del proyecto `C:\Desarrollos DEV daniel\app vivo` en la lista de **Directorios de Confianza**. Esto concederá permisos de lectura y escritura (`read_file` y `write_file`) recursivos automáticos dentro de esta ruta sin pedir confirmación por cada archivo modificado.

---

## 3. Directrices de Seguridad (Qué NO Permitir)
Para mantener a salvo tu entorno de desarrollo, **NUNCA** debes otorgar auto-aprobación o permisos automáticos para las siguientes operaciones:

1. **Comandos destructivos:**
   * `rm -rf` o `Remove-Item`
   * Limpieza de base de datos o borrado masivo de localStorage.
2. **Operaciones fuera del Workspace:**
   * Modificar archivos en carpetas del sistema, perfiles de usuario o directorios distintos a `C:\Desarrollos DEV daniel\app vivo`.
3. **Comandos de red no verificados:**
   * Descargas externas o peticiones curl/wget a dominios desconocidos.
4. **Instalación de paquetes no solicitados:**
   * `npm install` o adición de dependencias globales sin revisión manual previa.

---

## 4. Estado Actual del Workspace
El agente actualmente cuenta con:
* Acceso de lectura y escritura completo en `C:\Desarrollos DEV daniel\app vivo`.
* Permiso concedido para ejecutar peticiones HTTP a `localhost`.
* Petición de confirmación activa (`ask`) para archivos de configuración sensibles (`.env`, `.npmrc`).
