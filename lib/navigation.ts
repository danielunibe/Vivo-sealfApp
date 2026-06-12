import { SectionType } from '@/types/navigation';

export interface SectionMetadata {
  id: SectionType;
  label: string;
  color: string;
  title: string;
  subtitle: string;
}

export const SECTIONS: SectionMetadata[] = [
  {
    id: 'calendar',
    label: 'Calendario',
    color: '#E15E58',
    title: 'Calendario de Campo',
    subtitle: 'Planificador mensual de actividades de campaña'
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    color: '#FABB74',
    title: 'Catálogo de Celulares',
    subtitle: 'Información y argumentos de venta para campo'
  },
  {
    id: 'register-sale',
    label: 'Registrar Venta',
    color: '#10B981',
    title: 'Registrar Venta',
    subtitle: 'Modelos disponibles para activación de campo'
  },
  {
    id: 'piggy-bank',
    label: 'Puerquito',
    color: '#3B82F6',
    title: 'Ganancias y Metas',
    subtitle: 'Historial de comisiones y avance de objetivos'
  },
  {
    id: 'settings',
    label: 'Ajustes',
    color: '#EC4899',
    title: 'Ajustes de Operación',
    subtitle: 'Comisiones y horarios laborales de campo'
  }
];

export const TAB_INDICES: Record<SectionType, number> = {
  'calendar': 0,
  'catalog': 1,
  'register-sale': 2,
  'piggy-bank': 3,
  'settings': 4
};
