'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, Check, X, Upload, Palette, AlertTriangle } from 'lucide-react';
import { Device } from '@/types/device';
import { Sale } from '@/types/sale';
import ProductImageFrame from '../ui/ProductImageFrame';

interface DeviceManagerSettingsProps {
  theme: 'light' | 'dark';
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  sales: Sale[];
}

export default function DeviceManagerSettings({
  theme,
  devices,
  setDevices,
  sales
}: DeviceManagerSettingsProps) {
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formSeries, setFormSeries] = useState('Y');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formMargin, setFormMargin] = useState(0);
  const [formColors, setFormColors] = useState<Array<{ hex: string; name: string }>>([]);
  const [formImageDataUrl, setFormImageDataUrl] = useState<string>('');

  // Active modal or validation warning state
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Open form for a new device
  const handleOpenAdd = () => {
    setFormName('');
    setFormSeries('Y');
    setFormDescription('');
    setFormSpecs('');
    setFormMargin(100);
    setFormColors([
      { name: 'Negro', hex: '#000000' },
      { name: 'Blanco', hex: '#ffffff' }
    ]);
    setFormImageDataUrl('');
    setIsAdding(true);
    setEditingDevice(null);
  };

  // Helper: Open form to edit device
  const handleOpenEdit = (device: Device) => {
    setEditingDevice(device);
    setFormName(device.name);
    setFormSeries(device.series || 'Y');
    setFormDescription(device.description || '');
    setFormSpecs(device.specs || '');
    setFormMargin(device.margin);
    setFormColors(device.colors || []);
    setFormImageDataUrl(device.imageDataUrl || '');
    setIsAdding(false);
  };

  // Helper: Client-side canvas compression for local image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((height * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress into JPEG with 70% quality (reduces size from 2MB to ~15KB)
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setFormImageDataUrl(compressed);
        } else {
          setFormImageDataUrl(base64);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Helper: Manage color chips list
  const handleAddColor = () => {
    setFormColors(prev => [...prev, { name: 'Color Nuevo', hex: '#6366F1' }]);
  };

  const handleRemoveColor = (idx: number) => {
    setFormColors(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateColor = (idx: number, field: 'name' | 'hex', value: string) => {
    setFormColors(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  // Helper: Toggle active status
  const handleToggleActive = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, active: d.active === false ? true : false } : d));
  };

  // Action: Save device
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingresa un nombre para el modelo.');
      return;
    }

    if (isAdding) {
      const newDevice: Device = {
        id: `dev-${Date.now()}`,
        name: formName.trim(),
        margin: formMargin,
        active: true,
        series: formSeries,
        description: formDescription.trim(),
        specs: formSpecs.trim(),
        colors: formColors,
        imageDataUrl: formImageDataUrl,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setDevices(prev => [...prev, newDevice]);
      setIsAdding(false);
    } else if (editingDevice) {
      setDevices(prev => prev.map(d => d.id === editingDevice.id ? {
        ...d,
        name: formName.trim(),
        margin: formMargin,
        series: formSeries,
        description: formDescription.trim(),
        specs: formSpecs.trim(),
        colors: formColors,
        imageDataUrl: formImageDataUrl,
        updatedAt: Date.now()
      } : d));
      setEditingDevice(null);
    }
  };

  // Action: Delete device (checking history first)
  const handleDelete = (device: Device) => {
    // Check if there are sales registered under this device name or ID
    const hasSales = sales.some(s => s.deviceId === device.id || s.deviceName.toUpperCase() === device.name.toUpperCase());
    
    if (hasSales) {
      setDeleteWarning(`El modelo "${device.name}" tiene ventas registradas en el historial. Para proteger la integridad de tus comisiones y reportes, no se puede eliminar físicamente de la base de datos. Puedes desactivarlo para que no aparezca en el carrusel de ventas.`);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el modelo "${device.name}" permanentemente?`)) {
      setDevices(prev => prev.filter(d => d.id !== device.id));
    }
  };

  return (
    <div className="space-y-4 pt-1">
      
      {/* Dynamic Warn Dialogue */}
      {deleteWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-450 text-xs flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="leading-tight font-medium">{deleteWarning}</p>
          </div>
          <button 
            onClick={() => setDeleteWarning(null)} 
            className="self-end px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider rounded-lg text-[9px] cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Editor / Creation forms inline */}
      {(isAdding || editingDevice) ? (
        <form onSubmit={handleSave} className="p-4 rounded-2xl bg-neutral-100/50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
              {isAdding ? 'Agregar Modelo Nuevo' : 'Editar Modelo'}
            </span>
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setEditingDevice(null); }}
              className="p-1 rounded-lg text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1">Nombre del Modelo</span>
              <input 
                type="text" 
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Ej. vivo V50 Pro"
                className={`w-full text-xs font-bold py-2 px-3 rounded-xl focus:outline-hidden border transition-all ${
                  theme === 'light'
                    ? 'bg-white border-black/10 focus:border-neutral-500 text-neutral-900'
                    : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white'
                }`}
              />
            </div>

            <div className="col-span-1">
              <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1">Serie</span>
              <select 
                value={formSeries}
                onChange={e => setFormSeries(e.target.value)}
                className={`w-full text-xs font-bold py-2 px-3 rounded-xl focus:outline-hidden border transition-all ${
                  theme === 'light'
                    ? 'bg-white border-black/10 focus:border-neutral-500 text-neutral-900'
                    : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white'
                }`}
              >
                <option value="Y">Serie Y</option>
                <option value="V">Serie V</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="col-span-1">
              <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1">Comisión (MXN)</span>
              <div className="relative flex items-center">
                <span className="text-[10px] font-mono text-neutral-450 absolute left-3">$</span>
                <input 
                  type="number" 
                  value={formMargin}
                  onChange={e => setFormMargin(parseInt(e.target.value, 10) || 0)}
                  className={`w-full pl-6 pr-3 py-2 text-xs font-bold font-mono rounded-xl border focus:outline-hidden transition-all ${
                    theme === 'light'
                      ? 'bg-white border-black/10 focus:border-neutral-500 text-neutral-900'
                      : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1">Descripción Corta</span>
            <input 
              type="text"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Ej. Rendimiento premium y cámara ultra nítida."
              className={`w-full text-xs font-medium py-2 px-3 rounded-xl focus:outline-hidden border transition-all ${
                theme === 'light'
                  ? 'bg-white border-black/10 focus:border-neutral-500 text-neutral-900'
                  : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white'
              }`}
            />
          </div>

          <div>
            <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1">Especificaciones Clave</span>
            <textarea 
              value={formSpecs}
              onChange={e => setFormSpecs(e.target.value)}
              rows={2}
              placeholder="Ej. Carga rápida 44W, RAM 8GB + 8GB Extendida, 256GB ROM."
              className={`w-full text-xs font-medium py-2 px-3 rounded-xl focus:outline-hidden border transition-all resize-none ${
                theme === 'light'
                  ? 'bg-white border-black/10 focus:border-neutral-500 text-neutral-900'
                  : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white'
              }`}
            />
          </div>

          {/* Color list configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                Configuración de Colores
              </span>
              <button 
                type="button" 
                onClick={handleAddColor}
                className="text-[8px] font-black uppercase tracking-wider text-[var(--neo-text)] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" /> Agregar Color
              </button>
            </div>

            {formColors.length === 0 ? (
              <p className="text-[9px] font-medium text-neutral-450 italic text-center py-2">Sin colores configurados. El modelo usará la paleta genérica.</p>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {formColors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={color.name}
                      onChange={e => handleUpdateColor(idx, 'name', e.target.value)}
                      placeholder="Nombre del color (Ej. Gris)"
                      className={`flex-1 text-[10px] font-bold py-1.5 px-2.5 rounded-lg border focus:outline-hidden ${
                        theme === 'light'
                          ? 'bg-white border-black/10 text-neutral-900'
                          : 'bg-neutral-900 border-white/10 text-white'
                      }`}
                    />
                    <input 
                      type="color" 
                      value={color.hex}
                      onChange={e => handleUpdateColor(idx, 'hex', e.target.value)}
                      className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-transparent cursor-pointer overflow-hidden p-0.5 shrink-0"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveColor(idx)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/25 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo/File upload section */}
          <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-2">
            <span className="block text-[9px] font-black uppercase tracking-wider text-neutral-400">Fotografía o Render Local</span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-32 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-black/5 dark:bg-white/2 flex items-center justify-center relative overflow-hidden shrink-0">
                <ProductImageFrame
                  src={formImageDataUrl || undefined}
                  alt="Preview"
                  fallbackLabel="Preview"
                  variant="preview"
                  isThumbnail
                  className="w-full h-full border-0 shadow-none bg-transparent dark:bg-transparent"
                  imageClassName="object-cover"
                  fallbackClassName="min-h-[128px]"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/5 dark:hover:bg-white/10 text-[9.5px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir Imagen
                </button>
                {formImageDataUrl && (
                  <button
                    type="button"
                    onClick={() => setFormImageDataUrl('')}
                    className="text-[8px] font-black uppercase tracking-wider text-red-500 hover:underline text-center cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
                <span className="text-[7.5px] text-neutral-450 leading-tight">La imagen se comprimirá automáticamente a ~15KB para resguardar la memoria del navegador.</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[var(--neo-accent)] text-[var(--neo-accent-contrast)] text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Guardar Modelo
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingDevice(null); }}
              className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-350 text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        /* Models list view */
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
              Modelos de Dispositivos ({devices.length})
            </span>
            <button
              onClick={handleOpenAdd}
              className="py-1 px-2.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[var(--neo-text)] text-[8.5px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" /> Nuevo Modelo
            </button>
          </div>

          <div className="space-y-2 pr-1 pb-10">
            {devices.map((device) => {
              const hasSales = sales.some(s => s.deviceId === device.id || s.deviceName.toUpperCase() === device.name.toUpperCase());
              
              return (
                <div 
                  key={device.id} 
                  className={`min-h-[88px] p-2.5 rounded-xl border grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 transition-all ${
                    device.active === false 
                      ? 'bg-neutral-100/30 border-neutral-200/50 opacity-55' 
                      : theme === 'light'
                        ? 'bg-white border-neutral-200/60 shadow-xs'
                        : 'bg-white/2 border-white/5 shadow-xs'
                  }`}
                >
                  {/* Photo & Metadata (Left) */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-lg bg-black/5 dark:bg-white/2 border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden shrink-0 select-none">
                      <ProductImageFrame
                        src={device.imageDataUrl || undefined}
                        alt={device.name}
                        fallbackLabel={device.name}
                        variant="thumb"
                        isThumbnail
                        className="w-full h-full border-0 shadow-none bg-transparent dark:bg-transparent"
                        imageClassName="object-cover"
                        fallbackClassName="min-h-[64px]"
                      />
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={device.active !== false}
                          onChange={() => handleToggleActive(device.id)}
                          className="w-3.5 h-3.5 rounded-xs border-neutral-300 dark:border-neutral-750 text-neutral-900 focus:ring-neutral-500 dark:text-white cursor-pointer"
                          title={device.active === false ? "Activar modelo" : "Desactivar modelo"}
                        />
                        <h4 className={`text-[11px] font-black truncate ${theme === 'light' ? 'text-neutral-800' : 'text-white'}`}>
                          {device.name}
                        </h4>
                      </div>
                      <span className="text-[7.5px] font-mono text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                        Serie {device.series || 'Y'} · {device.colors?.length || 0} Colores
                      </span>
                      <span className="text-[8px] text-neutral-400 line-clamp-2 max-w-[180px] italic mt-0.5 pr-2 leading-tight">{device.description || 'Sin descripción'}</span>
                    </div>
                  </div>

                  {/* Pricing & Management Actions (Right) */}
                  <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                    <div className="text-right flex flex-col justify-center">
                      <span className="text-[7px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-0.5">Comisión</span>
                      <span className="text-[12px] font-black font-mono text-emerald-500 leading-none">
                        +${device.margin} <span className="text-[6.5px] font-semibold text-neutral-400">MXN</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(device)}
                        className="p-1.5 rounded-lg bg-black/5 text-[var(--neo-text)] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
                        title="Editar modelo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(device)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          hasSales
                            ? 'bg-neutral-400/10 text-neutral-400 hover:bg-neutral-400/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                        title={hasSales ? "Modelo tiene historial de ventas. Solo se desactiva." : "Eliminar modelo"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
