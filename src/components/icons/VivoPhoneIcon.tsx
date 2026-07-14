import React from 'react';

// Vivo Y04
import { LavandaCristal } from '../ModelsVivo/VivoY04/LavandaCristal/LavandaCristal';
import { VerdeJade } from '../ModelsVivo/VivoY04/VerdeJade/VerdeJade';
// Vivo Y21D
import { NegroJade } from '../ModelsVivo/VivoY21D/NegroJade/NegroJade';
import { MoradoLavanda } from '../ModelsVivo/VivoY21D/MoradoLavanda/MoradoLavanda';
// Vivo Y29
import { BlackExpresso } from '../ModelsVivo/VivoY29/BlackExpresso/BlackExpresso';
import { LilaFantasia } from '../ModelsVivo/VivoY29/LilaFantasia/LilaFantasia';
import { BlancoNube } from '../ModelsVivo/VivoY29/BlancoNube/BlancoNube';
// Vivo Y31D
import { GrisEstelar } from '../ModelsVivo/VivoY31D/GrisEstelar/GrisEstelar';
import { BlancoBrillante } from '../ModelsVivo/VivoY31D/BlancoBrillante/BlancoBrillante';
// Vivo V50 Lite
import { LilaFantasiaV50 } from '../ModelsVivo/VivoV50lite/LilaFantasia/LilaFantasia';
import { NegroMistico } from '../ModelsVivo/VivoV50lite/NegroMistico/NegroMistico';
// Vivo V60 Lite
import { NegroElegante } from '../ModelsVivo/Vivo60lite/NegroElegante/NegroElegante';
import { AzulTitanio } from '../ModelsVivo/Vivo60lite/AzulTitanio/AzulTitanio';

export type PhoneColorVariant = 'jade' | 'lavender' | 'jade-old' | 'lavender-old';

interface VivoPhoneIconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: PhoneColorVariant;
  deviceId?: string;
  colorName?: string;
}

export const VivoPhoneIcon = ({ className, width = "100%", height = "100%", variant, deviceId, colorName }: VivoPhoneIconProps) => {

  const getComponent = () => {
    // Exact mapping logic
    const devIdStr = (deviceId || '').toLowerCase().replace(/_/g, '-');
    const colorStr = (colorName || '').toLowerCase();

    if (devIdStr === 'y04') {
      if (colorStr.includes('lavanda')) return <LavandaCristal width={width} height={height} className={className} />;
      if (colorStr.includes('verde')) return <VerdeJade width={width} height={height} className={className} />;
      return <VerdeJade width={width} height={height} className={className} />; // default
    }

    if (devIdStr === 'y21d') {
      if (colorStr.includes('lavanda') || colorStr.includes('morado')) return <MoradoLavanda width={width} height={height} className={className} />;
      if (colorStr.includes('jade') || colorStr.includes('negro')) return <NegroJade width={width} height={height} className={className} />;
      return <NegroJade width={width} height={height} className={className} />; // default
    }

    if (devIdStr === 'y29') {
      if (colorStr.includes('expresso')) return <BlackExpresso width={width} height={height} className={className} />;
      if (colorStr.includes('fantasia')) return <LilaFantasia width={width} height={height} className={className} />;
      if (colorStr.includes('nube') || colorStr.includes('blanco')) return <BlancoNube width={width} height={height} className={className} />;
      return <BlackExpresso width={width} height={height} className={className} />; // default
    }

    if (devIdStr === 'y31d') {
      if (colorStr.includes('estelar') || colorStr.includes('gris')) return <GrisEstelar width={width} height={height} className={className} />;
      if (colorStr.includes('brillante') || colorStr.includes('blanco')) return <BlancoBrillante width={width} height={height} className={className} />;
      return <GrisEstelar width={width} height={height} className={className} />; // default
    }

    if (devIdStr === 'v50-lite') {
      if (colorStr.includes('fantasia')) return <LilaFantasiaV50 width={width} height={height} className={className} />;
      if (colorStr.includes('mistico') || colorStr.includes('obsidiana')) return <NegroMistico width={width} height={height} className={className} />;
      return <NegroMistico width={width} height={height} className={className} />;
    }

    if (devIdStr === 'v60-lite') {
      if (colorStr.includes('elegante')) return <NegroElegante width={width} height={height} className={className} />;
      if (colorStr.includes('titanio')) return <AzulTitanio width={width} height={height} className={className} />;
      return <NegroElegante width={width} height={height} className={className} />;
    }

    // Fallbacks to old logic if no device ID provided or unmatched
    if (variant === 'jade-old' || variant === 'jade') return <VerdeJade width={width} height={height} className={className} />;
    if (variant === 'lavender-old' || variant === 'lavender') return <LavandaCristal width={width} height={height} className={className} />;

    // Default icon
    return <LavandaCristal width={width} height={height} className={className} />;
  };

  return getComponent();
};
