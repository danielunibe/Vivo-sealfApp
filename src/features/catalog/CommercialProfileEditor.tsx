import React, { useState } from 'react';
import { DeviceModel, CommercialProfile } from '../../types';
import { Save, Plus, Trash2, BookOpen } from 'lucide-react';
import { saveDevices, getDevices } from '../../lib/storage';

interface Props {
  device: DeviceModel;
  onClose: () => void;
  onSaved: () => void;
}

export function CommercialProfileEditor({ device, onClose, onSaved }: Props) {
  const [profile, setProfile] = useState<CommercialProfile>(device.commercialProfile || {
    positioning: 'equilibrio',
    idealCustomer: device.commercial?.clienteIdeal || '',
    mainPitch: device.commercial?.guion || '',
    keyStrengths: device.commercial?.ventajas || [],
    objections: device.commercial?.objeciones.map(o => ({ objection: o.objecion, response: o.refutacion })) || [],
    closingPhrase: '',
    competitorNotes: '',
  });

  const handleSave = () => {
    const devices = getDevices();
    const idx = devices.findIndex(d => d.id === device.id);
    if (idx !== -1) {
      devices[idx].commercialProfile = profile;
      saveDevices(devices);
      // emit inventory-updated
      window.dispatchEvent(new Event('inventory-updated'));
      onSaved();
    }
  };

  const updateField = (field: keyof CommercialProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addObjection = () => {
    setProfile(prev => ({
      ...prev,
      objections: [...(prev.objections || []), { objection: '', response: '' }]
    }));
  };

  const updateObjection = (index: number, field: 'objection' | 'response', value: string) => {
    const newObjs = [...(profile.objections || [])];
    newObjs[index][field] = value;
    updateField('objections', newObjs);
  };

  const removeObjection = (index: number) => {
    const newObjs = [...(profile.objections || [])];
    newObjs.splice(index, 1);
    updateField('objections', newObjs);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f12] text-white">
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
          <BookOpen size={16} />
          Editar Ficha Comercial
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white font-bold text-xs p-2">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50">Posicionamiento</label>
          <select 
            value={profile.positioning || 'equilibrio'}
            onChange={e => updateField('positioning', e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="volumen">Volumen (Rotación rápida)</option>
            <option value="rentabilidad">Rentabilidad (Mejor margen)</option>
            <option value="equilibrio">Equilibrio (Calidad / Precio)</option>
            <option value="premium">Premium (Gama Alta)</option>
            <option value="entrada">Entrada (Básico)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50">Cliente Ideal</label>
          <input 
            type="text"
            value={profile.idealCustomer || ''}
            onChange={e => updateField('idealCustomer', e.target.value)}
            placeholder="Ej: Jóvenes buscando buena cámara..."
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50">Argumento Principal (Pitch)</label>
          <textarea 
            value={profile.mainPitch || ''}
            onChange={e => updateField('mainPitch', e.target.value)}
            placeholder="Lo que le dices en los primeros 10 segundos..."
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 min-h-[80px] placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50">Frase de Cierre</label>
          <input 
            type="text"
            value={profile.closingPhrase || ''}
            onChange={e => updateField('closingPhrase', e.target.value)}
            placeholder="Ej: ¿Te lo preparo en negro o azul?"
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50 flex justify-between items-center">
            Objeciones Frecuentes
            <button onClick={addObjection} className="text-emerald-400 flex items-center gap-1 hover:text-emerald-300">
              <Plus size={12} /> Agregar
            </button>
          </label>
          
          {profile.objections?.map((obj, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative">
              <button 
                onClick={() => removeObjection(i)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300"
              >
                <Trash2 size={12} />
              </button>
              <input 
                type="text"
                value={obj.objection}
                onChange={e => updateObjection(i, 'objection', e.target.value)}
                placeholder="El cliente dice..."
                className="bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-red-200 focus:outline-none focus:border-red-500/50 placeholder:text-red-200/30"
              />
              <textarea 
                value={obj.response}
                onChange={e => updateObjection(i, 'response', e.target.value)}
                placeholder="Tú respondes..."
                className="bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 min-h-[60px] placeholder:text-white/20"
              />
            </div>
          ))}
          {(!profile.objections || profile.objections.length === 0) && (
            <div className="text-center p-4 border border-dashed border-white/10 rounded-xl text-xs text-white/30">
              Sin objeciones cargadas
            </div>
          )}
        </div>

      </div>

      <div className="p-4 border-t border-white/10 shrink-0 bg-black/20">
        <button 
          onClick={handleSave}
          className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[0.65rem] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          <Save size={16} />
          Guardar Ficha
        </button>
      </div>
    </div>
  );
}
