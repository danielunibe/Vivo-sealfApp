export const getWallpaperFor = (deviceId: string, colorName: string = '') => {
  const c = (colorName || '').toLowerCase();
  
  if (
    c.includes('verde') || 
    c.includes('jade') || 
    c.includes('black') || 
    c.includes('espresso') || 
    c.includes('expresso') || 
    c.includes('mistico') || 
    c.includes('elegante') || 
    c.includes('azul') || 
    c.includes('titanio')
  ) {
    if (deviceId === 'y04') {
      return '/assets/devices/official/vivoY04_verde_jade.png';
    }
    return '/assets/devices/official/vivov60lite_negroelegante.png';
  }
  
  if (deviceId === 'y04') {
    return '/assets/devices/official/vivoY04_lavanda_cristal.png';
  }
  return '/assets/devices/official/vivov50lite_lilafantasia.png';
};
