import { DeviceModel } from '../types';

export const getScriptForModel = (device: DeviceModel, context: 'high_commission' | 'volume' | 'low_stock'): string => {
  if (context === 'low_stock') {
    return `Quedan pocas piezas del ${device.name}, si te interesa este modelo conviene apartarlo hoy.`;
  }
  
  if (context === 'high_commission') {
    return `El ${device.name} te conviene si quieres algo más completo y que dure más tiempo sin sentirlo limitado.`;
  }
  
  if (context === 'volume') {
    return `El ${device.name} es ideal si buscas resolver lo esencial sin subir demasiado el pago.`;
  }

  return `El ${device.name} es una excelente opción dentro de su categoría.`;
};
