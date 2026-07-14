import packageJson from '../../package.json';

export type ReleaseNoteEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
};

const SEEN_VERSION_KEY = 'vivo_release_notes_seen_version';

export const APP_VERSION = packageJson.version;

export const RELEASE_HISTORY: ReleaseNoteEntry[] = [
  {
    version: '0.4.8',
    date: '2026-07-13',
    title: 'Arranque Soft Launch',
    summary: 'La app abre con una entrada más limpia centrada en el icono oficial, sin pantalla de actualización densa.',
    highlights: [
      'Nuevo Soft Launch: icono de la app, wordmark VIVO y carga mínima sobre fondo claro.',
      'Se eliminan del arranque la tarjeta de novedades, anillos y barra de porcentaje falsa.',
      'Las novedades de versión siguen apareciendo solo cuando hay cambios no vistos.',
      'Patrón diagonal más suave e Ingresos con mejor padding en resúmenes y cajas Por lograr / Ritmo alineadas.',
    ],
  },
  {
    version: '0.4.7',
    date: '2026-07-09',
    title: 'Corrección de arranque en Registro',
    summary: 'Corrige un error que podía bloquear la pantalla principal al abrir la app después de actualizar.',
    highlights: [
      'La sección de Registro (Inicio) ya no cae en pantalla de recuperación al arrancar.',
      'Incluye todas las mejoras de la versión 0.4.6: catálogo unificado, storage seguro y fixes de calendario.',
    ],
  },
  {
    version: '0.4.6',
    date: '2026-07-09',
    title: 'Datos más seguros e inventario alineado',
    summary: 'Esta actualización protege tus ventas guardadas, unifica catálogo e inventario en todas las pantallas y corrige detalles del calendario.',
    highlights: [
      'Si el dispositivo no puede guardar, la app te avisa en lugar de mostrar éxito falso.',
      'Calendario, Ingresos e Inicio usan el mismo catálogo de modelos, colores, stock y comisión por variante.',
      'Las ventas manuales validan stock antes de registrarse, igual que en Registro.',
      'Calendario: meta diaria coherente, agenda sin reorden aleatorio y fechas futuras bloqueadas en el formulario.',
      'Vista anual del calendario, fecha editable y mejoras visuales en movimientos de Ingresos.',
    ],
  },
  {
    version: '0.4.5',
    date: '2026-07-09',
    title: 'Más claridad en calendario, web inmersiva y novedades',
    summary: 'Esta actualización mejora cómo ves tu día, tu mes y las webs oficiales, además de corregir el cambio de día a medianoche local.',
    highlights: [
      'El calendario ahora muestra el día actual en la tarjeta principal y el mes a la izquierda con una barra de progreso mensual hacia tu meta de comisión.',
      'Al abrir una web del catálogo entras en modo pantalla completa: solo ves la página y un botón “Salir”. El dock inferior se oculta para no distraerte.',
      'Las webs oficiales se descargan solas en WiFi una vez al día. Puedes revisar el estado y forzar la descarga en Ajustes → Webs oficiales.',
      'El día de la app ya cambia a medianoche local, no antes por diferencia de horario UTC.',
      'Nuevo historial de novedades por versión para que sepas qué trae cada actualización.',
    ],
  },
  {
    version: '0.4.4',
    date: '2026-07-02',
    title: 'Estabilidad en Android y pantalla completa',
    summary: 'Correcciones importantes para que la app arranque bien en más dispositivos y se vea a pantalla completa.',
    highlights: [
      'Arranque más seguro en Android sin pantalla negra al abrir.',
      'Mejoras de borde a borde en pantallas Oppo, ColorOS y emuladores recientes.',
      'Ajustes visuales en Registro e Ingresos para aprovechar mejor el espacio útil.',
    ],
  },
  {
    version: '0.4.3',
    date: '2026-06-29',
    title: 'Corrección de cierres inesperados',
    summary: 'Versión enfocada en que la app abra y se mantenga estable durante el uso diario.',
    highlights: [
      'Corrección de cierres al entrar a catálogo en algunos equipos Oppo.',
      'Mejor manejo del WebView al cargar contenido local.',
    ],
  },
  {
    version: '0.4.2',
    date: '2026-06-29',
    title: 'Registro edge-to-edge',
    summary: 'La vista de registro de venta aprovecha mejor toda la pantalla del teléfono.',
    highlights: [
      'Registro con diseño más inmersivo y sin barras negras molestas.',
      'Dock y secciones principales alineados al área segura del dispositivo.',
    ],
  },
  {
    version: '0.4.1',
    date: '2026-06-29',
    title: 'Primera entrega estable del nuevo shell',
    summary: 'Base funcional del nuevo Vivo Promotor con catálogo, calendario, ingresos y ajustes.',
    highlights: [
      'Catálogo VIVO con webs oficiales por modelo.',
      'Calendario de metas diarias con colores de avance.',
      'Ingresos compactos con historial de ventas.',
      'Respaldo e importación de datos locales.',
    ],
  },
];

export const getReleaseHistory = (): ReleaseNoteEntry[] => {
  return [...RELEASE_HISTORY].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
};

export const getCurrentReleaseNotes = (): ReleaseNoteEntry | undefined => {
  return RELEASE_HISTORY.find((entry) => entry.version === APP_VERSION);
};

export const getSeenReleaseVersion = (): string => {
  try {
    return localStorage.getItem(SEEN_VERSION_KEY) || '';
  } catch {
    return '';
  }
};

export const markReleaseNotesSeen = (version: string = APP_VERSION): void => {
  try {
    localStorage.setItem(SEEN_VERSION_KEY, version);
    window.dispatchEvent(new CustomEvent('release-notes-seen', { detail: { version } }));
  } catch {
    // ignore write failures
  }
};

export const hasUnseenReleaseNotes = (): boolean => {
  if (!getCurrentReleaseNotes()) return false;
  return getSeenReleaseVersion() !== APP_VERSION;
};
