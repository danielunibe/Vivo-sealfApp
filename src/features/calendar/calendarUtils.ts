export const getStateDotColor = (state: string) => {
  switch (state) {
    case 'falta': return '#D44A50';
    case 'parcial': return '#F08A3C';
    case 'logrado': return '#18B883';
    case 'superado': return '#D6A425';
    case 'libre': return '#8E949A';
    case 'pendiente': return '#D1D5DB';
    default: return 'transparent';
  }
};

export const YEAR_STATE_LABELS: Array<{ state: string; label: string }> = [
  { state: 'superado', label: 'Superado' },
  { state: 'logrado', label: 'Logrado' },
  { state: 'parcial', label: 'Parcial' },
  { state: 'falta', label: 'Falta' },
  { state: 'libre', label: 'Día libre' },
];

export const getHexForColorName = (colorName: string) => {
  const mapping: Record<string, string> = {
    'Verde Jade': '#10B981',
    'Lavanda Cristal': '#D8B4FE',
    'Negro Jade': '#1D242E',
    'Morado Lavanda': '#9B7CFF',
    'Black Expresso': '#2D2119',
    'Lila Fantasia': '#CFAEF5',
    'Negro Mistico': '#1E252D',
    'Negro Elegante': '#0F1217',
    'Azul Titanio': '#3B82F6',
    'Blanco Nube': '#E5E7EB',
    'Gris Estelar': '#60636A',
    'Blanco Brillante': '#F4F4F5',
  };
  return mapping[colorName] || '#1ECCA2';
};

export const getNoRecordDayStyle = (isOnDark = false) => ({
  cls: isOnDark
    ? 'text-white/78 border-2 border-dashed border-white/38'
    : 'text-slate-600 border-2 border-dashed border-slate-400/55 dark:text-slate-300 dark:border-slate-500/55',
  css: {
    backgroundColor: isOnDark ? 'rgba(255,255,255,0.06)' : 'rgba(248,250,252,0.94)',
    boxShadow: 'none',
  },
});

export const getPendingDayStyle = (isOnDark = false) => ({
  cls: isOnDark
    ? 'text-white/62 border border-dashed border-white/28'
    : 'text-slate-500 border border-dashed border-slate-300/70 dark:text-slate-400 dark:border-slate-500/45',
  css: {
    backgroundColor: isOnDark ? 'rgba(255,255,255,0.04)' : '#F8F9FB',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
  },
});

export const getDayStyle = (state: string) => {
  switch (state) {
    case 'falta': return { cls: 'text-white', css: { backgroundColor: '#D44A50', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 12px rgba(0,0,0,0.08)' } };
    case 'parcial': return { cls: 'text-white', css: { backgroundColor: '#F08A3C', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 16px rgba(0,0,0,0.10)' } };
    case 'logrado': return { cls: 'text-white', css: { backgroundColor: '#18B883', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 16px rgba(0,0,0,0.10)' } };
    case 'superado': return { cls: 'text-[#343A43] font-bold', css: { background: 'linear-gradient(135deg, #F4D94F, #D6A425)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 16px rgba(0,0,0,0.10)' } };
    case 'libre': return { cls: 'text-white', css: { backgroundColor: '#8E949A', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 16px rgba(0,0,0,0.10)' } };
    case 'pendiente': return { cls: 'text-gray-400 border-none', css: { backgroundColor: 'color-mix(in srgb, #F8F9FB 78%, transparent)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 4px 10px rgba(31,41,55,0.08)' } };
    default: return { cls: 'bg-transparent text-transparent', css: {} };
  }
};

export const getCardTheme = (state: string) => {
  const themes: Record<string, {
    bg: string;
    text: string;
    dot: string;
    badgeBg: string;
    badgeBorder: string;
    barBg: string;
    barBorder: string;
    barFill: string;
    barText: string;
    phoneMain: string;
    phoneInner: string;
    phoneBorder: string;
    msg: string;
  }> = {
    superado: {
      bg: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)', // Premium dark
      text: '#FFFFFF',
      dot: '#FCD34D',
      badgeBg: 'rgba(255,255,255,0.1)',
      badgeBorder: 'rgba(255,255,255,0.2)',
      barBg: 'rgba(0,0,0,0.5)',
      barBorder: 'rgba(255,255,255,0.15)',
      barFill: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)',
      barText: '#000000',
      phoneMain: '#FFFFFF',
      phoneInner: 'rgba(255,255,255,0.85)',
      phoneBorder: 'rgba(255,255,255,0.4)',
      msg: '¡META SUPERADA!'
    },
    logrado: {
      bg: 'linear-gradient(135deg, #065F46 0%, #022C22 100%)', // Rich premium emerald
      text: '#FFFFFF',
      dot: '#A7F3D0',
      badgeBg: 'rgba(255,255,255,0.15)',
      badgeBorder: 'rgba(255,255,255,0.3)',
      barBg: 'rgba(0,0,0,0.3)',
      barBorder: 'rgba(255,255,255,0.25)',
      barFill: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', // Radiant emerald fill
      barText: '#022C22',
      phoneMain: '#FFFFFF',
      phoneInner: 'rgba(255,255,255,0.85)',
      phoneBorder: 'rgba(255,255,255,0.5)',
      msg: '¡META LOGRADA!'
    },
    parcial: {
      bg: 'linear-gradient(135deg, #FA9E55, #F58B39)',
      text: '#FFFFFF',
      dot: '#FFFFFF',
      badgeBg: 'rgba(255,255,255,0.2)',
      badgeBorder: 'rgba(255,255,255,0.3)',
      barBg: 'rgba(0,0,0,0.2)',
      barBorder: 'rgba(255,255,255,0.3)',
      barFill: '#FFFFFF',
      barText: '#F58B39',
      phoneMain: '#FFFFFF',
      phoneInner: 'rgba(255,255,255,0.6)',
      phoneBorder: 'rgba(0,0,0,0.15)',
      msg: 'PROGRESO PARCIAL'
    },
    falta: {
      bg: 'linear-gradient(135deg, #E04B4B, #CE3232)',
      text: '#FFFFFF',
      dot: '#FFFFFF',
      badgeBg: 'rgba(255,255,255,0.2)',
      badgeBorder: 'rgba(255,255,255,0.3)',
      barBg: 'rgba(0,0,0,0.2)',
      barBorder: 'rgba(255,255,255,0.3)',
      barFill: '#FFFFFF',
      barText: '#CE3232',
      phoneMain: '#FFFFFF',
      phoneInner: 'rgba(255,255,255,0.6)',
      phoneBorder: 'rgba(0,0,0,0.15)',
      msg: 'SIN VENTA'
    },
    libre: {
      bg: 'linear-gradient(135deg, #A0A4A8, #888C90)',
      text: '#FFFFFF',
      dot: '#FFFFFF',
      badgeBg: 'rgba(255,255,255,0.2)',
      badgeBorder: 'rgba(255,255,255,0.3)',
      barBg: 'rgba(0,0,0,0.2)',
      barBorder: 'rgba(255,255,255,0.3)',
      barFill: '#FFFFFF',
      barText: '#888C90',
      phoneMain: '#FFFFFF',
      phoneInner: 'rgba(255,255,255,0.6)',
      phoneBorder: 'rgba(0,0,0,0.15)',
      msg: 'DÍA LIBRE'
    },
    pendiente: {
      bg: 'linear-gradient(135deg, #353D45, #2B3138)',
      text: '#FFFFFF',
      dot: '#10B981',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeBorder: 'rgba(16, 185, 129, 0.2)',
      barBg: 'rgba(0,0,0,0.5)',
      barBorder: 'rgba(16, 185, 129, 0.3)',
      barFill: 'linear-gradient(to right, #10B981, #34D399)',
      barText: '#FFFFFF',
      phoneMain: '#D8B4FE',
      phoneInner: '#9B7CFF',
      phoneBorder: 'rgba(255,255,255,0.1)',
      msg: 'EN PROGRESO'
    }
  };
  return themes[state] || themes['pendiente'];
};

export const getTodayCardRingGradient = (state: string) => {
  switch (state) {
    case 'superado':
      return 'linear-gradient(135deg, rgba(252,211,77,0.95), rgba(245,158,11,0.5), rgba(255,255,255,0.82))';
    case 'logrado':
      return 'linear-gradient(135deg, rgba(167,243,208,0.95), rgba(16,185,129,0.45), rgba(255,255,255,0.78))';
    case 'parcial':
      return 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(254,243,199,0.65), rgba(251,191,36,0.45))';
    case 'falta':
      return 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(254,202,202,0.55), rgba(248,113,113,0.35))';
    case 'libre':
      return 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(226,232,240,0.55), rgba(148,163,184,0.35))';
    case 'pendiente':
    default:
      return 'linear-gradient(135deg, rgba(52,211,153,0.9), rgba(16,185,129,0.4), rgba(255,255,255,0.72))';
  }
};
