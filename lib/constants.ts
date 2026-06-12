import { Device } from '@/types/device';
import { APP_VERSION_NAME } from '@/lib/appVersion';

export interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  active: boolean;
}

export const INITIAL_DEVICES: Device[] = [
  { 
    id: 'dev-1', name: 'Y04', margin: 20, active: true,
    description: 'Entrada confiable para uso diario.',
    specs: 'Pantalla 6.74", 5150 mAh Mexico, 44W, IP64.'
  },
  { 
    id: 'dev-2', name: 'Y21D', margin: 80, active: true,
    description: 'Resistencia y bateria para trabajo pesado.',
    specs: '6500 mAh, 44W, IP68/IP69/IP69+, camara 50 MP.'
  },
  { 
    id: 'dev-3', name: 'Y29', margin: 180, active: true,
    description: 'Equilibrio entre bateria, pantalla y uso diario.',
    specs: 'Y29 4G Mexico, 6500 mAh, 44W, Snapdragon 685, 8+256 GB.'
  },
  { 
    id: 'dev-4', name: 'V50 LITE', margin: 350, active: true,
    description: 'Pantalla, camara y carga rapida en gama media.',
    specs: 'AMOLED 120 Hz, 6500 mAh, 90W, camara 50 MP.'
  },
  { 
    id: 'dev-5', name: 'V60 LITE', margin: 350, active: true,
    description: 'Opcion premium ligera con IA y AMOLED.',
    specs: 'AMOLED 120 Hz, 6500 mAh, 90W, Snapdragon 6s 4G Gen 2, IP65.'
  },
];

// Mensajes iniciales reales para Catálogo / Soporte de campo
export const INITIAL_CHATS: ChatMessage[] = [
  { id: 1, sender: 'Supervisor de Zona', text: '¡Excelente venta ayer, Carlos! Sigue así.', time: '09:12 AM' },
  { id: 2, sender: 'Marta Ruiz (Lead)', text: 'Hola, me interesa el Plan Vivo Ultra. ¿Tienen alguna promo para hoy?', time: '10:05 AM' },
  { id: 3, sender: 'Tú', text: 'Hola Marta, claro. Te damos 3 meses gratis si te registras hoy.', time: '10:07 AM' },
];

// Notificaciones iniciales de Centro de Alertas y Puerquito
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: 'Bono Alcanzado', desc: '¡Has sumado +$500 MXN en comisiones por meta semanal!', time: 'Hace 5 min', active: true },
  { id: 2, title: 'Venta Validada', desc: 'El contrato de Carlos Mendoza ha sido auditado y aprobado.', time: 'Hace 1 hora', active: false },
  { id: 3, title: 'Nueva Zona Asignada', desc: 'Se ha validado tu campaña para mañana en Plaza Carso.', time: 'Hace 4 horas', active: true },
  { id: 4, title: 'Sistema Actualizado', desc: `${APP_VERSION_NAME} instalada correctamente.`, time: 'Hace 1 día', active: false },
];

// Planificador mensual de actividades de campaña para el Calendario
export const CAMPAIGN_EVENTS: Record<number, string> = {
  1: 'Activación de campo en Plaza Carso - Todo el día.',
  2: 'Reunión semanal de promotores de campo en corporativo.',
  3: 'Volanteo intensivo Zona Centro en semáforos clave.',
  4: 'Auditoría de stands y material promocional - 11:30 AM.',
  5: 'Capacitación "Vivo Fibra Inteligente" presencial.',
  6: 'Consolidación semanal de resultados con supervisor.',
  7: 'Planificación de ruta de campo - 10:00 AM.',
  8: 'Demostración de marca en Centro Comercial Coyoacán.',
  9: 'Lanzamiento oficial de comisiones dobles de Junio.',
  10: 'Activación en puntos calientes de Parque España.',
  11: 'Auditoría de campo aleatoria y firmas de asistencia.',
  12: 'Reunión de balance general con gerentes - Zona Centro.',
  13: 'Volanteo y promoción en colonias aledañas.',
  14: 'Cierre de reporte quincenal de activación de ventas.',
};

export function getCampaignEvent(day: number): string {
  return CAMPAIGN_EVENTS[day] || 'Sin evento especial. Activación habitual en punto asignado.';
}
