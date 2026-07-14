import { DeviceModel } from '../types';

export const DEFAULT_DEVICES: DeviceModel[] = [
  { 
    id: 'y04', name: 'Y04', margin: 20, points: 5, colors: ['Verde Jade', 'Lavanda Cristal'], officialUrl: 'https://www.vivo.com/mx/products/y17s', pitch: 'Entrada confiable para uso diario', specs: {battery: '5500 mAh', screen: '6.74"', camera: 'Dual 13MP'},
    commercial: {
      ventajas: ['Precio accesible', 'Diseño resistente', 'Batería duradera'],
      diferenciadores: ['No se traba en tareas básicas', 'Acabados que no parecen de gama baja'],
      clienteIdeal: 'Clientes de primer smartphone, adultos mayores, o equipo secundario.',
      objeciones: [{ objecion: 'La cámara se ve sencilla', refutacion: 'Para su precio, la IA de vivo mejora mucho las fotos en comparación a otras marcas del mismo valor.' }],
      guion: 'Si busca algo económico pero que no lo deje tirado a medio día, el Y04 tiene batería de sobra y un diseño muy actual.'
    }
  },
  { 
    id: 'y21d', name: 'Y21D', margin: 80, points: 15, colors: ['Negro Jade', 'Morado Lavanda'], officialUrl: 'https://www.vivo.com/mx/products/y27', pitch: 'Resistencia y batería para trabajo pesado', specs: {battery: '6500 mAh', screen: 'Ampliación de RAM', camera: 'Resolución Alta'},
    commercial: {
      ventajas: ['Gran batería 6500mAh', 'Soporta trato rudo', 'RAM extendida para multitarea'],
      diferenciadores: ['Batería bestial y protección contra salpicaduras y polvo.'],
      clienteIdeal: 'Trabajadores en calle, repartidores, choferes o usuarios intensivos.',
      objeciones: [{ objecion: 'Se siente un poco pesado', refutacion: 'Es por la enorme batería de 6500mAh. Vale la pena no llevar cargador.' }],
      guion: 'Este equipo es un tanque. Si necesita que la batería dure hasta dos días trabajando con GPS o videos, este es el ideal.'
    }
  },
  { 
    id: 'y29', name: 'Y29', margin: 180, points: 30, colors: ['Black Expresso', 'Blanco Nube'], officialUrl: 'https://www.vivo.com/mx/products/y36', pitch: 'Equilibrio entre batería, pantalla y uso diario', specs: {battery: '6500 mAh', screen: 'Gran pantalla', camera: 'Resolución Media'},
    commercial: {
      ventajas: ['Pantalla inmersiva', 'Cámara versátil', 'Diseño elegante'],
      diferenciadores: ['El mejor equilibrio entre precio, cámara y pantalla de la serie Y.'],
      clienteIdeal: 'Estudiantes, jóvenes y usuarios que consumen mucho video o redes.',
      objeciones: [{ objecion: '¿Correrá juegos pesados?', refutacion: 'Corre juegos populares sin problema, su procesador y RAM están optimizados para no calentarse.' }],
      guion: 'El Y29 es la compra más inteligente. Se ve como teléfono premium, tiene excelente pantalla y la batería le durará todo el día sin problemas.'
    }
  },
  { 
    id: 'y31d', name: 'Y31D', margin: 160, points: 25, colors: ['Gris Estelar', 'Blanco Brillante'], officialUrl: 'https://www.vivo.com/mx/products/y100', pitch: 'Rendimiento sólido y diseño elegante', specs: {battery: '6000 mAh', screen: '6.58"', camera: 'Triple 50MP'},
    imagePath: '',
    heroImagePath: '',
    carouselImages: [],
    calendarImagePath: '',
    commercialProfile: {
      positioning: "equilibrio",
      idealCustomer: "Usuarios que buscan un teléfono con gran apariencia y buen rendimiento general.",
      mainPitch: "Rendimiento sólido y diseño elegante",
      keyStrengths: ["Diseño premium", "Excelente cámara", "Buen balance de especificaciones"],
      objections: [{ objection: "No tiene cámara ultra gran angular", response: "Su sensor principal de 50MP captura un excelente detalle, y la IA compensa brillantemente cualquier situación de luz." }],
      closingPhrase: "El Y31D destaca visualmente por donde lo vea.",
      competitorNotes: "Aspecto cristalino and estelar único en su rango."
    },
    commercial: {
      ventajas: ['Diseño premium', 'Excelente cámara', 'Buen balance de especificaciones'],
      diferenciadores: ['Aspecto cristalino y estelar único en su rango.'],
      clienteIdeal: 'Usuarios que buscan un teléfono con gran apariencia y buen rendimiento general.',
      objeciones: [{ objecion: 'No tiene cámara ultra gran angular', refutacion: 'Su sensor principal de 50MP captura un excelente detalle, y la IA compensa brillantemente cualquier situación de luz.' }],
      guion: 'El Y31D destaca visualmente por donde lo vea, y además captura fotografías nítidas gracias a su cámara principal.'
    }
  },
  { 
    id: 'v50-lite', name: 'V50 Lite 4G', margin: 350, points: 60, colors: ['Negro Mistico', 'Lila Fantasia'], officialUrl: 'https://www.vivo.com/mx/products/v40', pitch: 'Pantalla, cámara y carga rápida en gama media', specs: {battery: '6500 mAh', screen: 'AMOLED', camera: '50 MP / 90W'},
    commercial: {
      ventajas: ['Luz de Aura', 'Carga súper rápida 90W', 'AMOLED brillante'],
      diferenciadores: ['Sistema de Luz de Aura para retratos de estudio en cualquier lugar.'],
      clienteIdeal: 'Entusiastas de la fotografía, redes sociales y creadores de contenido principiantes.',
      objeciones: [{ objecion: 'Es versión 4G, no 5G', refutacion: 'A cambio de eso, obtiene una carga mucho más rápida (90W) y una cámara de un segmento superior.' }],
      guion: 'Si le gusta tomar buenas fotos, su Luz de Aura exclusiva le dará iluminación de estudio. Además, se carga rapidísimo.'
    }
  },
  { 
    id: 'v60-lite', name: 'V60 Lite', margin: 350, points: 80, colors: ['Negro Elegante', 'Azul Titanio'], officialUrl: 'https://www.vivo.com/mx/products/v30', pitch: 'Opción premium ligera con mejor experiencia visual', specs: {battery: '6500 mAh', screen: 'AMOLED', camera: 'IA incorporada'},
    commercial: {
      ventajas: ['Diseño ultradelgado', 'Cámara con funciones IA', 'Colores atractivos'],
      diferenciadores: ['El más ligero, con funciones de IA fotográfica avanzadas.'],
      clienteIdeal: 'Usuarios enfocados en moda, diseño, estilo de vida, y lo último en IA.',
      objeciones: [{ objecion: 'El precio es algo elevado', refutacion: 'Está llevando la última tecnología AMOLED y algoritmos de IA de vivo que solo se ven en gamas más altas.' }],
      guion: 'Este es el equipo más moderno que tenemos. Súper delgado, con pantalla espectacular y funciones de Inteligencia Artificial que mejoran cada foto que tome.'
    }
  },
];
