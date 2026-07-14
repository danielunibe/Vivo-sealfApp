import { CommercialProfile, DeviceModel } from '../types';

export const legacyCommercialToProfile = (
  commercial: DeviceModel['commercial'] | undefined,
): CommercialProfile | undefined => {
  if (!commercial) return undefined;

  return {
    positioning: 'equilibrio',
    idealCustomer: commercial.clienteIdeal,
    mainPitch: commercial.guion,
    keyStrengths: commercial.ventajas,
    objections: commercial.objeciones.map((item) => ({
      objection: item.objecion,
      response: item.refutacion,
    })),
    competitorNotes: commercial.diferenciadores.join(' '),
    salesTips: commercial.diferenciadores,
  };
};
