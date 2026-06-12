import { Device, DeviceKnowledge } from '@/types/device';

export type DeviceKnowledgeStatus = NonNullable<DeviceKnowledge['confidence']>;

export const DEVICE_KNOWLEDGE_UPDATED_AT = '2026-06-05';

export const DEVICE_COMMERCIAL_KNOWLEDGE: Record<string, DeviceKnowledge> = {
  'Y04': {
    heroTitle: 'Entrada confiable para uso diario',
    summary: 'Modelo accesible para clientes que necesitan pantalla grande, buena bateria y resistencia basica sin subir de presupuesto.',
    confidence: 'partial',
    sourceRegion: 'vivo Mexico confirmado; capacidad de bateria cambia por region',
    positioning: 'Entrada accesible con pantalla grande y resistencia IP64.',
    idealCustomer: 'Cliente que usa WhatsApp, llamadas, redes, video y necesita un equipo economico con buena autonomia.',
    quickPitch: 'Si buscas algo confiable para el dia a dia, el Y04 te da pantalla grande, carga rapida y resistencia IP64 a precio de entrada.',
    shortCardLine: 'Pantalla 6.74" + 5150 mAh + IP64',
    topStrengths: ['5150 mAh', '44W', 'IP64'],
    keySpecs: ['6.74" LCD 90 Hz', '5150 mAh en vivo Mexico', '44W FlashCharge', '4 GB + 256 GB', 'Camara 13 MP + 0.08 MP', 'IP64', 'SGS cinco estrellas contra caidas', 'Paquete posventa de 4 anos segun vivo Mexico'],
    salesArguments: [
      { title: 'Pantalla grande', description: 'La pantalla de 6.74" ayuda para videos, redes y lectura sin sentirse limitado.' },
      { title: 'Bateria correcta', description: 'En Mexico vivo lista 5150 mAh, suficiente para uso cotidiano con carga de 44W.' },
      { title: 'Resistencia de entrada', description: 'IP64 protege contra polvo y salpicaduras en uso diario.' },
      { title: 'Servicio posventa vendible', description: 'La pagina de vivo Mexico comunica beneficios de cuidado durante 4 anos, util para cerrar con tranquilidad.' }
    ],
    objectionsAndResponses: [
      { objection: 'Vi que tenia 5500 mAh.', response: 'Depende de la region. Para Mexico la ficha oficial marca 5150 mAh; por eso aqui lo mostramos como dato Mexico confirmado.' },
      { objection: 'No es para juegos pesados, verdad?', response: 'Es un modelo de entrada. Para juegos, camara o pantalla mas exigente conviene subir a Y29, V50 Lite o V60 Lite.' }
    ],
    comparisonNotes: [
      { comparedTo: 'Y21D', note: 'Y21D sube mucho en bateria y resistencia.' },
      { comparedTo: 'Y29', note: 'Y29 agrega mas bateria, mejor fluidez y Snapdragon 685.' }
    ],
    bestFor: ['Primer smartphone', 'Uso basico diario', 'Clientes sensibles a precio', 'Clientes que valoran garantia y resistencia'],
    avoidIf: ['Cliente exige camara avanzada', 'Cliente juega mucho'],
    recommendedClosing: 'Para lo esencial, este es el equipo que cumple sin castigar el presupuesto.',
    sources: [
      { label: 'vivo Mexico Y04 especificaciones', url: 'https://www.vivo.com/mx/products/param/y04', type: 'official', note: '5150 mAh, 44W, IP64, 6.74".' },
      { label: 'vivo Mexico Y04 producto', url: 'https://www.vivo.com/mx/products/y04', type: 'official', note: 'Pantalla, audio, resistencia, SGS y paquete posventa.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  },
  'Y21D': {
    heroTitle: 'Resistencia y bateria para trabajo pesado',
    summary: 'Equipo para clientes que trabajan fuera, se mueven mucho o suelen maltratar el telefono.',
    confidence: 'partial',
    sourceRegion: 'vivo Espana/Indonesia; no se encontro pagina Mexico oficial',
    positioning: 'Serie Y resistente con bateria grande, carga rapida y proteccion IP alta.',
    idealCustomer: 'Repartidores, campo, obra, estudiantes o usuarios que quieren menos preocupacion por golpes, agua y bateria.',
    quickPitch: 'El Y21D es para quien necesita bateria fuerte y resistencia real: 6500 mAh, 44W e IP68/IP69 segun fuente oficial regional.',
    shortCardLine: '6500 mAh + IP68/IP69 + 44W',
    topStrengths: ['6500 mAh', 'IP68/IP69', '44W'],
    keySpecs: ['6500 mAh BlueVolt', '44W FlashCharge', 'IP68 / IP69 / IP69+', 'Pantalla 6.68" 90 Hz', 'Camara 50 MP', 'Volumen 400%'],
    salesArguments: [
      { title: 'Bateria para jornadas largas', description: '6500 mAh permite venderlo como equipo de batalla para todo el dia.' },
      { title: 'Proteccion superior', description: 'IP68/IP69/IP69+ lo posiciona por encima de un equipo comun de entrada.' },
      { title: 'Carga util', description: '44W ayuda a recuperar energia rapido entre trayectos o turnos.' }
    ],
    objectionsAndResponses: [
      { objection: 'Por que no compro uno mas barato?', response: 'Porque aqui pagas por bateria y resistencia; si el telefono se usa en calle o trabajo pesado, eso vale mas que ahorrar poco.' },
      { objection: 'La pantalla es solo HD+?', response: 'Si, pero tiene brillo alto y 90 Hz; el fuerte del modelo es resistencia, autonomia y confiabilidad.' }
    ],
    comparisonNotes: [
      { comparedTo: 'Y04', note: 'Sube en bateria, carga y proteccion.' },
      { comparedTo: 'Y29', note: 'Y29 es mas equilibrado; Y21D es mas rudo.' }
    ],
    bestFor: ['Trabajo en calle', 'Bateria', 'Resistencia al agua y polvo'],
    avoidIf: ['Cliente prioriza AMOLED o fotografia premium'],
    recommendedClosing: 'Si quieres un telefono que aguante la rutina, este es el Y que se compra por tranquilidad.',
    sources: [
      { label: 'vivo Espana Y21d', url: 'https://www.vivo.com/es/products/y21d', type: 'official', note: '6500 mAh, 44W, IP68/IP69, volumen 400%.' },
      { label: 'vivo Indonesia Y21d parametros', url: 'https://www.vivo.com/id/products/param/y21d', type: 'official', note: 'IP68/69/69+, RAM/ROM y bateria.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  },
  'Y29': {
    heroTitle: 'Equilibrio entre bateria, pantalla y uso diario',
    summary: 'Modelo de equilibrio para quien quiere mejor experiencia que entrada, bateria grande y diseno moderno.',
    confidence: 'confirmed',
    sourceRegion: 'vivo Mexico Y29 4G',
    positioning: 'Gama media accesible 4G con bateria grande, Snapdragon y pantalla fluida.',
    idealCustomer: 'Cliente que quiere autonomia, 256 GB, uso fluido y un equipo mas completo sin saltar a serie V.',
    quickPitch: 'El Y29 en Mexico es 4G: 6500 mAh, 44W, Snapdragon 685, 8+256 GB y pantalla 120 Hz.',
    shortCardLine: '6500 mAh + 44W + Snapdragon 685',
    topStrengths: ['6500 mAh', '44W', 'Snapdragon'],
    keySpecs: ['Y29 4G Mexico', '6500 mAh BlueVolt', '44W FlashCharge', 'Snapdragon 685', '8 GB + 256 GB', 'Pantalla 120 Hz', 'IP64', 'AI Erase segun ficha regional'],
    salesArguments: [
      { title: 'No mostrar como 5G', description: 'La version confirmada para esta ficha es Y29 4G Mexico, no debe venderse como Red 5G.' },
      { title: 'Autonomia fuerte', description: '6500 mAh y 44W son el argumento principal para uso diario largo.' },
      { title: 'Uso mas fluido', description: 'Snapdragon 685 y pantalla 120 Hz lo hacen mas atractivo que entrada basica.' },
      { title: 'Edicion con IA', description: 'AI Erase ayuda a venderlo como equipo practico para fotos y redes sin subir a serie V.' }
    ],
    objectionsAndResponses: [
      { objection: 'Entonces no es 5G?', response: 'Esta ficha es Y29 4G Mexico. Si el inventario fuera Y29 5G, debe confirmarse como variante distinta antes de venderlo asi.' },
      { objection: 'Vale la pena sobre Y21D?', response: 'Si buscas equilibrio y rendimiento, si. Si buscas maxima resistencia al agua, Y21D tiene mejor argumento.' }
    ],
    comparisonNotes: [
      { comparedTo: 'Y21D', note: 'Y29 es mas equilibrado y fluido; Y21D es mas resistente.' },
      { comparedTo: 'V50 LITE', note: 'V50 Lite sube a AMOLED, 90W y mejor camara.' }
    ],
    bestFor: ['Uso diario completo', 'Autonomia', 'Almacenamiento amplio'],
    avoidIf: ['Cliente exige 5G confirmado', 'Cliente quiere AMOLED'],
    recommendedClosing: 'Si quieres bateria grande y un telefono equilibrado sin brincar a gama V, este es el punto medio inteligente.',
    sources: [
      { label: 'vivo Mexico Y29 producto', url: 'https://www.vivo.com/mx/product/productDetails?id=121', type: 'official', note: 'Y29 4G, 6500 mAh, 44W, Snapdragon.' },
      { label: 'vivo Yemen Y29 4G', url: 'https://www.vivo.com/ye/en/products/y29-4g', type: 'official', note: 'Referencia oficial regional para 6500 mAh, Snapdragon 685 y AI Erase.' },
      { label: 'vivo Mexico Y29 parametros', url: 'https://www.vivo.com/mx/products/param/y29-4g', type: 'official', note: 'Snapdragon 685, 8+256 GB, IP64.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  },
  'V50 LITE': {
    heroTitle: 'Pantalla, camara y carga rapida en gama media',
    summary: 'Para clientes que quieren experiencia visual superior, mejores fotos y carga mucho mas rapida.',
    confidence: 'partial',
    sourceRegion: 'vivo Global y vivo Mexico V50 Lite 5G como apoyo regional',
    positioning: 'Serie V enfocada en AMOLED, fotografia y carga rapida.',
    idealCustomer: 'Usuario de redes, contenido, fotos, videos y carga de emergencia durante el dia.',
    quickPitch: 'El salto al V50 Lite se justifica por AMOLED, 6500 mAh, 90W y camara principal de 50 MP.',
    shortCardLine: 'AMOLED + 90W + 50 MP',
    topStrengths: ['AMOLED', '90W', '50 MP'],
    keySpecs: ['6.77" AMOLED 120 Hz', '6500 mAh BlueVolt', '90W FlashCharge', 'Camara 50 MP', 'Resistencia a caidas SGS', 'Version 4G requiere confirmar inventario local'],
    salesArguments: [
      { title: 'Mejor experiencia visual', description: 'AMOLED y 120 Hz hacen que se sienta como un salto claro frente a la serie Y.' },
      { title: 'Carga muy rapida', description: '90W es un argumento facil de demostrar a clientes con poco tiempo.' },
      { title: 'Camara mas vendible', description: '50 MP y herramientas de retrato lo posicionan para redes y fotos de personas.' }
    ],
    objectionsAndResponses: [
      { objection: 'Por que pagar mas que por Y29?', response: 'Porque aqui subes a AMOLED, mejor carga y mejor enfoque de camara; se nota todos los dias.' },
      { objection: 'Es 4G o 5G?', response: 'La app lo maneja como V50 Lite 4G. Si el inventario cambia a 5G, debe separarse la ficha por variante.' }
    ],
    comparisonNotes: [
      { comparedTo: 'Y29', note: 'V50 Lite gana en pantalla, carga y camara.' },
      { comparedTo: 'V60 LITE', note: 'V60 Lite queda como opcion mas actual/premium segun inventario.' }
    ],
    bestFor: ['Fotos', 'Pantalla AMOLED', 'Carga rapida'],
    avoidIf: ['Cliente solo busca precio bajo'],
    recommendedClosing: 'Si lo que mas vas a notar todos los dias es pantalla, fotos y carga, este es el salto correcto.',
    sources: [
      { label: 'vivo Global V50 Lite', url: 'https://www.vivo.com/en/products/v50-lite', type: 'official', note: '6500 mAh, 90W, display 6.77".' },
      { label: 'vivo Mexico V50 Lite 5G', url: 'https://www.vivo.com/mx/products/v50-lite-5g', type: 'official', note: 'Apoyo regional para bateria, carga y resistencia.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  },
  'V60 LITE': {
    heroTitle: 'Opcion premium ligera con IA y AMOLED',
    summary: 'Equipo para quien quiere una experiencia mas actual: pantalla AMOLED, bateria grande, 90W y procesador Snapdragon 6s 4G Gen 2 en la ficha regional confirmada.',
    confidence: 'partial',
    sourceRegion: 'vivo Panama / vivo Global; confirmar disponibilidad Mexico',
    positioning: 'Serie V ligera y premium con IA, AMOLED, bateria grande y carga rapida.',
    idealCustomer: 'Cliente que quiere verse actualizado, consumir contenido, multitarea y buena autonomia sin ir a gama alta.',
    quickPitch: 'El V60 Lite regional confirmado combina 6500 mAh, 90W, AMOLED 120 Hz, audio 400% y Snapdragon 6s 4G Gen 2.',
    shortCardLine: 'AMOLED + IA + 6500 mAh',
    topStrengths: ['AMOLED', '90W', 'IA'],
    keySpecs: ['6500 mAh BlueVolt', '90W FlashCharge', '6.77" AMOLED 120 Hz', 'Snapdragon 6s Gen 2 4G', '8 GB + 8 GB extendida + 256 GB', 'IP65', 'Audio 400%', 'Funtouch OS 15 / Android 15 en ficha Panama'],
    salesArguments: [
      { title: 'Mas premium en mano', description: 'Perfil delgado, pantalla AMOLED y diseno limpio dan sensacion de equipo superior.' },
      { title: 'Bateria y carga top', description: '6500 mAh con 90W es una combinacion muy fuerte para venta diaria.' },
      { title: 'IA y multitarea', description: '8 GB + RAM extendida y herramientas de IA ayudan a venderlo como opcion actual.' },
      { title: 'Software actual', description: 'La ficha regional lista Funtouch OS 15 sobre Android 15, buen argumento para clientes que preguntan por vigencia.' }
    ],
    objectionsAndResponses: [
      { objection: 'Es 5G?', response: 'La ficha oficial de Panama consultada corresponde a V60 Lite 4G con Snapdragon 6s 4G Gen 2. No vender como 5G sin confirmar variante.' },
      { objection: 'Vale la pena sobre V50 Lite?', response: 'Si quiere algo mas actual, con IA y perfil premium, si. Si solo busca pantalla/camara/carga, V50 Lite tambien compite fuerte.' }
    ],
    comparisonNotes: [
      { comparedTo: 'V50 LITE', note: 'V60 Lite es la opcion mas actual y con IA; V50 Lite queda como valor fuerte.' },
      { comparedTo: 'Y29', note: 'V60 Lite sube a AMOLED, 90W, audio y posicionamiento premium.' }
    ],
    bestFor: ['Experiencia premium ligera', 'Contenido', 'Carga rapida', 'IA'],
    avoidIf: ['Cliente necesita 5G confirmado en ficha local'],
    recommendedClosing: 'Si quieres el mas completo y moderno del catalogo actual, el V60 Lite es el que se siente premium desde que lo tomas.',
    sources: [
      { label: 'vivo Panama V60 Lite', url: 'https://www.vivo.com/pa/products/v60-lite', type: 'official', note: '6500 mAh, 90W, AMOLED, Snapdragon 6s 4G Gen 2.' },
      { label: 'vivo Panama V60 Lite parametros', url: 'https://www.vivo.com/pa/products/param/v60-lite', type: 'official', note: '8+256 GB, IP65, UFS 2.2.' },
      { label: 'vivo Global V60 Lite', url: 'https://www.vivo.com/en/products/v60-lite', type: 'official', note: 'AMOLED, 90W, audio y bateria.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  }
};

export function getDeviceKnowledge(device: Device): DeviceKnowledge {
  const normalizedName = device.name.toUpperCase();
  const officialKnowledge = DEVICE_COMMERCIAL_KNOWLEDGE[normalizedName];

  if (officialKnowledge) {
    return officialKnowledge;
  }

  return {
    heroTitle: 'Ficha comercial pendiente',
    summary: device.description || 'Modelo personalizado agregado por el usuario. Completa descripcion, specs y argumentos desde Ajustes para convertirlo en una ficha de venta.',
    confidence: 'pending',
    sourceRegion: 'modelo personalizado',
    positioning: 'Pendiente de definir.',
    idealCustomer: 'Pendiente de definir segun inventario y perfil de cliente.',
    quickPitch: device.description || 'Agrega un pitch corto para usar este modelo en piso.',
    shortCardLine: device.description || 'Ficha pendiente de completar',
    topStrengths: device.specs ? device.specs.split(',').map(spec => spec.trim()).filter(Boolean).slice(0, 3) : ['Pendiente'],
    keySpecs: device.specs ? device.specs.split(',').map(spec => spec.trim()).filter(Boolean) : ['Agrega specs desde Ajustes'],
    salesArguments: ['Completa argumentos comerciales desde Ajustes para este modelo.'],
    objectionsAndResponses: [
      { objection: 'No tengo informacion suficiente de este modelo.', response: 'Usa Ajustes > Dispositivos para agregar specs, descripcion e imagen antes de venderlo como ficha completa.' }
    ],
    comparisonNotes: [],
    bestFor: ['Pendiente'],
    recommendedClosing: 'Completa esta ficha antes de usarla como apoyo de venta.',
    sources: [
      { label: 'Modelo personalizado', type: 'internal', note: 'Sin fuentes externas configuradas.' }
    ],
    updatedAt: DEVICE_KNOWLEDGE_UPDATED_AT
  };
}

export function getKnowledgeStatusLabel(status?: DeviceKnowledgeStatus): string {
  if (status === 'confirmed') return 'Confirmado';
  if (status === 'partial') return 'Info parcial';
  return 'Pendiente confirmar';
}
