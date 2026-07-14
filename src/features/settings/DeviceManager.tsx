import React, { useState, useEffect } from 'react';
import { PhoneModel, PhoneVariant } from '../../types';
import { getPhoneModels, savePhoneModels, getSales } from '../../lib/storage';
import { Smartphone, Plus, Edit2, Trash2, Eye, EyeOff, Save, ChevronUp, Image as ImageIcon, Link as LinkIcon, Package, DollarSign } from 'lucide-react';
import { emitInventoryUpdated } from '../../lib/events';
import ImageUploadField from './ImageUploadField';
import { normalizePhoneModelsOrder, reorderVariantsByIds, sortBySortOrder } from '../../lib/modelOrdering';
import { getPhoneVariantCatalogImage } from '../../lib/deviceImages';
import { VariantMediaImage } from '../../components/ui/VariantMediaImage';
import { SortableVerticalList } from '../../components/ui/SortableVerticalList';
import VariantImageGallery from './VariantImageGallery';
import RegisterHomeVisualEditor from './RegisterHomeVisualEditor';

export default function DeviceManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [visualDraftModels, setVisualDraftModels] = useState<PhoneModel[]>([]);
  const [isVisualDraftDirty, setIsVisualDraftDirty] = useState(false);
  const [managerMode, setManagerMode] = useState<'visual' | 'advanced'>('visual');
  const [salesCountMap, setSalesCountMap] = useState<Record<string, number>>({});
  const [variantSalesCountMap, setVariantSalesCountMap] = useState<Record<string, number>>({});
  
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  
  const [editingModel, setEditingModel] = useState<PhoneModel | null>(null);
  const [editingVariant, setEditingVariant] = useState<PhoneVariant | null>(null);

  const editingVariantModel = editingVariant ? models.find(m => m.id === editingVariant.modelId) : null;
  const editingVariantPreviewImage = editingVariant && editingVariantModel
    ? getPhoneVariantCatalogImage({
        ...editingVariantModel,
        variants: editingVariantModel.variants.some(v => v.id === editingVariant.id)
          ? editingVariantModel.variants.map(v => v.id === editingVariant.id ? editingVariant : v)
          : [...editingVariantModel.variants, editingVariant],
      }, editingVariant.colorName)
    : null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allModels = normalizePhoneModelsOrder(getPhoneModels());
    setModels(allModels);
    setVisualDraftModels(allModels);
    setIsVisualDraftDirty(false);
    
    const sales = getSales();
    const counts: Record<string, number> = {};
    const variantCounts: Record<string, number> = {};
    sales.forEach(s => {
      counts[s.deviceId] = (counts[s.deviceId] || 0) + 1;
      const variantKey = s.variantId || (s.modelId && s.deviceColorSnapshot ? `${s.modelId}::${s.deviceColorSnapshot}` : '');
      if (variantKey) {
        variantCounts[variantKey] = (variantCounts[variantKey] || 0) + 1;
      }
    });
    setSalesCountMap(counts);
    setVariantSalesCountMap(variantCounts);
  };

  const persistModels = (nextModels: PhoneModel[], message?: string) => {
    const normalizedModels = normalizePhoneModelsOrder(nextModels);
    savePhoneModels(normalizedModels);
    setModels(normalizedModels);
    setVisualDraftModels(normalizedModels);
    setIsVisualDraftDirty(false);
    emitInventoryUpdated();
    if (message) onNotify(message);
  };

  const updateVisualDraft = (nextModels: PhoneModel[]) => {
    setVisualDraftModels(normalizePhoneModelsOrder(nextModels));
    setIsVisualDraftDirty(true);
  };

  const saveVisualDraft = () => {
    persistModels(visualDraftModels, 'Inicio actualizado');
  };

  const cancelVisualDraft = () => {
    setVisualDraftModels(models);
    setIsVisualDraftDirty(false);
    onNotify('Cambios de Inicio descartados');
  };

  const handleAddModel = () => {
    setEditingModel({
      id: `model_${Date.now()}`,
      name: 'Nuevo Modelo',
      shortName: 'Nuevo',
      accentColor: '#3b82f6',
      isActive: true,
      sortOrder: models.length,
      variants: []
    });
  };

  const handleSaveModel = () => {
    if (!editingModel) return;
    
    const updatedModels = [...models];
    const index = updatedModels.findIndex(m => m.id === editingModel.id);
    
    const modelToSave = { ...editingModel };
    if (index === -1 && (!modelToSave.variants || modelToSave.variants.length === 0)) {
      modelToSave.variants = [{
        id: `${modelToSave.id}-var-default`,
        modelId: modelToSave.id,
        colorName: 'Variante principal',
        colorHex: '#3b82f6',
        stock: 0,
        minStock: 1,
        commission: 0,
        isActive: true,
        sortOrder: 0
      }];
    }

    if (index !== -1) {
      updatedModels[index] = modelToSave;
    } else {
      updatedModels.push(modelToSave);
    }
    
    persistModels(updatedModels);
    setManagerMode('advanced');
    setEditingModel(null);
    onNotify("Modelo guardado correctamente");
  };

  const handleAddVariant = (modelId: string) => {
    const parentModel = models.find(m => m.id === modelId);
    if (!parentModel) return;
    
    setEditingVariant({
      id: `${modelId}-var-${Date.now()}`,
      modelId: modelId,
      colorName: 'Nuevo Color',
      colorHex: '#3b82f6',
      stock: 0,
      minStock: 1,
      commission: 0,
      isActive: true,
      sortOrder: parentModel.variants.length
    });
  };

  const handleSaveVariant = () => {
    if (!editingVariant) return;
    
    const updatedModels = [...models];
    const modelIndex = updatedModels.findIndex(m => m.id === editingVariant.modelId);
    if (modelIndex === -1) return;
    
    const model = { ...updatedModels[modelIndex] };
    model.variants = [...model.variants];
    
    const varIndex = model.variants.findIndex(v => v.id === editingVariant.id);
    if (varIndex !== -1) {
      model.variants[varIndex] = editingVariant;
    } else {
      model.variants.push(editingVariant);
    }
    
    updatedModels[modelIndex] = model;
    
    persistModels(updatedModels);
    setManagerMode('advanced');
    setEditingVariant(null);
    onNotify("Variante guardada correctamente");
  };

  const toggleModelActive = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = models.map(m => m.id === modelId ? { ...m, isActive: !m.isActive } : m);
    persistModels(updated);
  };
  
  const toggleVariantActive = (modelId: string, variantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...models];
    const modelIndex = updated.findIndex(m => m.id === modelId);
    if (modelIndex === -1) return;
    
    const model = { ...updated[modelIndex] };
    model.variants = model.variants.map(v => v.id === variantId ? { ...v, isActive: !v.isActive } : v);
    updated[modelIndex] = model;
    
    persistModels(updated);
  };

  const handleDeleteModel = (model: PhoneModel, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasSales = salesCountMap[model.id] > 0;
    
    if (hasSales) {
      if (confirm(`Este modelo tiene ${salesCountMap[model.id]} ventas históricas. Solo se puede desactivar. ¿Proceder?`)) {
        const updated = models.map(m => m.id === model.id ? { ...m, isActive: false } : m);
        persistModels(updated);
        onNotify("Modelo desactivado");
      }
    } else {
      if (confirm('¿Estás seguro de eliminar este modelo?')) {
        const updated = models.filter(m => m.id !== model.id);
        persistModels(updated);
        onNotify("Modelo eliminado");
      }
    }
  };

  const handleDeleteVariant = (model: PhoneModel, variant: PhoneVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    const fallbackKey = `${model.id}::${variant.colorName}`;
    const hasSales = (variantSalesCountMap[variant.id] || variantSalesCountMap[fallbackKey] || 0) > 0;

    if (hasSales) {
      if (confirm(`Esta variante tiene ventas históricas. Solo se puede desactivar. ¿Proceder?`)) {
        const updated = models.map((entry) =>
          entry.id === model.id
            ? { ...entry, variants: entry.variants.map((item) => item.id === variant.id ? { ...item, isActive: false } : item) }
            : entry,
        );
        persistModels(updated);
        onNotify("Variante desactivada");
      }
      return;
    }

    if (model.variants.length <= 1) {
      onNotify("El modelo debe conservar al menos una variante");
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta variante?')) {
      const updated = models.map((entry) =>
        entry.id === model.id
          ? { ...entry, variants: entry.variants.filter((item) => item.id !== variant.id) }
          : entry,
      );
      persistModels(updated, "Variante eliminada");
    }
  };

  if (editingModel) {
    return (
      <div className="bg-white dark:bg-[var(--neo-surface)] rounded-[1.5rem] p-4 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
        <h3 className="text-sm font-black text-gray-800 dark:text-slate-100 mb-4">{editingModel.name === 'Nuevo Modelo' ? 'Añadir Modelo' : 'Editar Modelo'}</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
              <input type="text" value={editingModel.name} onChange={e => setEditingModel({...editingModel, name: e.target.value})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre Corto</label>
              <input type="text" value={editingModel.shortName} onChange={e => setEditingModel({...editingModel, shortName: e.target.value})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre de Serie (opcional)</label>
              <input type="text" value={editingModel.seriesName || ''} onChange={e => setEditingModel({...editingModel, seriesName: e.target.value})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Color Acento (HEX)</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={editingModel.accentColor || '#3b82f6'} onChange={e => setEditingModel({...editingModel, accentColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                <input type="text" value={editingModel.accentColor || ''} onChange={e => setEditingModel({...editingModel, accentColor: e.target.value})} className="flex-1 bg-gray-50 p-2 rounded-lg text-xs font-mono outline-none" placeholder="#HEX" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><LinkIcon size={12}/> Link Oficial VIVO</label>
            <input type="text" placeholder="https://..." value={editingModel.officialUrl || ''} onChange={e => setEditingModel({...editingModel, officialUrl: e.target.value || undefined})} className="w-full bg-gray-50 p-2 rounded-lg text-xs font-mono outline-none" />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <h4 className="text-[0.65rem] font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest mb-2 flex items-center gap-1"><ImageIcon size={12}/> URLs de Imágenes (Modelo)</h4>
            
            <div className="space-y-4">
              <ImageUploadField 
                label="Icono SVG / Thumbnail Selector"
                description="Imagen pequeña para selector y cards."
                value={editingModel.thumbnailImagePath || editingModel.svgIconPath || ''}
                onChange={v => setEditingModel({...editingModel, thumbnailImagePath: v, svgIconPath: v})}
              />
              
              <ImageUploadField 
                label="Imagen Hero (Home sin fondo)"
                description="Imagen principal del modelo."
                value={editingModel.heroImagePath || ''}
                onChange={v => setEditingModel({...editingModel, heroImagePath: v})}
              />
              
              <ImageUploadField 
                label="Fondo (Background Hero)"
                description="Esta imagen se verá como portada en la pantalla principal."
                value={editingModel.backgroundImagePath || ''}
                onChange={v => setEditingModel({...editingModel, backgroundImagePath: v})}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={() => setEditingModel(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest transition-all">Cancelar</button>
          <button onClick={handleSaveModel} className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[0.65rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all"><Save size={14}/> Guardar</button>
        </div>
      </div>
    );
  }

  if (editingVariant) {
    return (
      <div className="bg-white dark:bg-[var(--neo-surface)] rounded-[1.5rem] p-4 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
        <h3 className="text-sm font-black text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          {editingVariant.colorName === 'Nuevo Color' ? 'Añadir Variante' : 'Editar Variante'}
        </h3>

        {editingVariantPreviewImage && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
            <div className="h-16 w-12 rounded-xl bg-white dark:bg-[var(--neo-surface)] shadow-sm border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
              <VariantMediaImage
                variant={editingVariant}
                fallbackSrc={editingVariantPreviewImage}
                alt={`Preview ${editingVariant.colorName}`}
                className="h-full w-full object-contain"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[0.58rem] font-black uppercase tracking-widest text-blue-500">
                Preview de variante
              </div>
              <p className="mt-1 text-[0.72rem] font-bold leading-snug text-slate-700 dark:text-slate-200">
                Para modelos Vivo oficiales, esta portada se resuelve por modelo y color antes de usar una imagen manual.
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre del Color / Variante</label>
              <input type="text" value={editingVariant.colorName} onChange={e => setEditingVariant({...editingVariant, colorName: e.target.value})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Color (HEX)</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={editingVariant.colorHex} onChange={e => setEditingVariant({...editingVariant, colorHex: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                <input type="text" value={editingVariant.colorHex} onChange={e => setEditingVariant({...editingVariant, colorHex: e.target.value})} className="flex-1 bg-gray-50 p-2 rounded-lg text-xs font-mono outline-none" placeholder="#HEX" />
              </div>
            </div>
            
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={10} /> Comisión ($)</label>
              <input type="number" min={0} value={editingVariant.commission} onChange={e => setEditingVariant({...editingVariant, commission: Math.max(0, Number(e.target.value))})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Package size={10} /> Stock Actual</label>
              <input type="number" min={0} value={editingVariant.stock} onChange={e => setEditingVariant({...editingVariant, stock: Math.max(0, Number(e.target.value))})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
            
            <div>
              <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock Mínimo</label>
              <input type="number" min={0} value={editingVariant.minStock} onChange={e => setEditingVariant({...editingVariant, minStock: Math.max(0, Number(e.target.value))})} className="w-full bg-gray-50 p-2 rounded-lg text-sm font-medium outline-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <h4 className="text-[0.65rem] font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest mb-2 flex items-center gap-1"><ImageIcon size={12}/> Imágenes (Variante)</h4>
            
            {editingVariantModel && (
              <VariantImageGallery
                model={editingVariantModel}
                variant={editingVariant}
                onChange={setEditingVariant}
                onNotify={onNotify}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={() => setEditingVariant(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest transition-all">Cancelar</button>
          <button onClick={handleSaveVariant} className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[0.65rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all"><Save size={14}/> Guardar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-6 px-1">
        <p className="text-[0.7rem] font-medium text-slate-500 mb-3 leading-relaxed">
          Edita Inicio con la misma vista que ves en Registro: textos, colores, stock e imagenes. El modo avanzado sigue disponible para ajustes completos.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-[1.35rem] vivo-surface-on-pattern p-1.5">
          <button
            type="button"
            onClick={() => setManagerMode('visual')}
            className={`min-h-11 rounded-2xl text-[0.62rem] font-black uppercase tracking-widest transition-all ${
              managerMode === 'visual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Editar Inicio
          </button>
          <button
            type="button"
            onClick={() => setManagerMode('advanced')}
            className={`min-h-11 rounded-2xl text-[0.62rem] font-black uppercase tracking-widest transition-all ${
              managerMode === 'advanced' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Avanzado
          </button>
        </div>
      </div>

      {managerMode === 'visual' && (
        <RegisterHomeVisualEditor
          models={visualDraftModels}
          isDirty={isVisualDraftDirty}
          salesCountMap={salesCountMap}
          variantSalesCountMap={variantSalesCountMap}
          onDraftChange={updateVisualDraft}
          onSave={saveVisualDraft}
          onCancel={cancelVisualDraft}
          onAddModel={() => {
            setManagerMode('advanced');
            handleAddModel();
          }}
          onEditModel={(model) => {
            setManagerMode('advanced');
            setEditingModel(model);
          }}
          onAddVariant={(modelId) => {
            setManagerMode('advanced');
            handleAddVariant(modelId);
          }}
          onEditVariant={(variant) => {
            setManagerMode('advanced');
            setEditingVariant(variant);
          }}
          onOpenAdvanced={() => setManagerMode('advanced')}
          onNotify={onNotify}
        />
      )}
      
      {managerMode === 'advanced' && (
      <div className="space-y-3 pb-4 px-1">
        <button onClick={handleAddModel} className="w-full bg-slate-800 text-white px-4 py-3.5 rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md hover:bg-slate-900">
          <Plus size={16} /> Agregar nuevo modelo
        </button>
        <p className="px-1 text-[0.62rem] font-semibold leading-relaxed text-slate-500">
          Mantén pulsado el icono de arrastre y suelta para cambiar el orden de modelos y variantes en Inicio.
        </p>
        <SortableVerticalList<PhoneModel>
          items={normalizePhoneModelsOrder(models)}
          getItemId={(model) => model.id}
          onReorder={(nextModels) => persistModels(nextModels, 'Orden de modelos actualizado')}
          className="space-y-3"
          ariaLabel="Orden de modelos"
          renderItem={(model) => {
          const isExpanded = expandedModelId === model.id;
          const totalStock = model.variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);
          const orderedVariants = sortBySortOrder(model.variants);
          const activeVariants = orderedVariants.filter(v => v.isActive);
          const primaryVariant = activeVariants[0] ?? orderedVariants[0];
          const primaryPreviewImage = primaryVariant ? getPhoneVariantCatalogImage(model, primaryVariant.colorName) : null;
          
          return (
            <div className={`rounded-[1.25rem] border ${model.isActive ? 'vivo-surface-on-pattern' : 'vivo-inset-on-pattern opacity-80'} overflow-hidden transition-all duration-300`}>
              
              <div 
                className="p-4 flex flex-col cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-[var(--neo-surface-soft)] transition-colors"
                onClick={() => setExpandedModelId(isExpanded ? null : model.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${model.isActive ? 'bg-white dark:bg-[var(--neo-surface)] border border-slate-100' : 'bg-slate-200/50'}`} style={{ color: model.isActive && model.accentColor ? model.accentColor : '#94a3b8' }}>
                      {primaryPreviewImage ? (
                        <VariantMediaImage
                          variant={primaryVariant}
                          fallbackSrc={primaryPreviewImage || ''}
                          alt={model.name}
                          className="h-11 w-9 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Smartphone size={24} strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[1.05rem] font-black text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-2">
                        {model.name}
                        {!model.isActive && <span className="text-[0.55rem] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Inactivo</span>}
                      </h4>
                      <div className="text-[0.65rem] font-bold text-slate-500 mt-1">
                        <span className={totalStock > 0 ? "text-emerald-600" : ""}>{totalStock} piezas disponibles</span>
                      </div>
                    </div>
                  </div>
                  {!isExpanded && (
                    <div className="bg-slate-100 text-slate-600 text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1">
                      Gestionar
                    </div>
                  )}
                  {isExpanded && (
                     <div className="text-slate-400 p-1">
                       <ChevronUp size={20} />
                     </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2.5 ml-1">
                  <div className="flex -space-x-1.5">
                    {activeVariants.slice(0, 4).map(v => (
                      <div key={v.id} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: v.colorHex }} />
                    ))}
                    {activeVariants.length > 4 && (
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[0.5rem] font-bold text-slate-600 shadow-sm z-10">
                        +{activeVariants.length - 4}
                      </div>
                    )}
                    {activeVariants.length === 0 && (
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
                    )}
                  </div>
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                    {model.variants.length} Variante{model.variants.length !== 1 && 's'}
                    {salesCountMap[model.id] > 0 && <span className="text-blue-500 ml-1.5 font-black">• {salesCountMap[model.id]} Ventas</span>}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 dark:bg-[var(--neo-surface-soft)]/50 border-t border-slate-100/80 p-4">
                  <div className="grid grid-cols-[1fr_1fr_3.25rem] gap-2 mb-3">
                    <button onClick={(e) => { e.stopPropagation(); setEditingModel(model); }} className="flex-1 py-2.5 bg-white dark:bg-[var(--neo-surface)] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-[var(--neo-surface-soft)] transition-colors">
                      <Edit2 size={14} /> Editar modelo
                    </button>
                    <button onClick={(e) => toggleModelActive(model.id, e)} className="flex-1 py-2.5 bg-white dark:bg-[var(--neo-surface)] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-[var(--neo-surface-soft)] transition-colors">
                      {model.isActive ? <><EyeOff size={14} /> Desactivar</> : <><Eye size={14} /> Activar</>}
                    </button>
                    <button onClick={(e) => handleDeleteModel(model, e)} className="w-[3.25rem] bg-white dark:bg-[var(--neo-surface)] border border-red-100 text-red-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Variantes configuradas</h5>
                    
                    <SortableVerticalList<PhoneVariant>
                      items={orderedVariants}
                      getItemId={(variant) => variant.id}
                      onReorder={(nextVariants) => {
                        persistModels(
                          reorderVariantsByIds(models, model.id, nextVariants.map((variant) => variant.id)),
                          'Orden de variantes actualizado',
                        );
                      }}
                      className="space-y-2"
                      itemClassName="items-center"
                      ariaLabel={`Orden de variantes de ${model.name}`}
                      renderItem={(variant) => {
                      const variantPreviewImage = getPhoneVariantCatalogImage(model, variant.colorName);

                      return (
                      <div className={`flex items-center justify-between p-3 rounded-xl border ${variant.isActive ? 'bg-white dark:bg-[var(--neo-surface)] border-slate-200 dark:border-white/10 shadow-sm' : 'bg-slate-100/50 border-slate-200 dark:border-white/10 opacity-70'} transition-all w-full`}>
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-11 h-12 rounded-2xl bg-white dark:bg-[var(--neo-surface)] shadow-sm shrink-0 border border-slate-100 flex items-center justify-center overflow-hidden">
                            {variantPreviewImage ? (
                              <VariantMediaImage
                                variant={variant}
                                fallbackSrc={variantPreviewImage || ''}
                                alt={`${model.name} ${variant.colorName}`}
                                className="h-11 w-9 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Smartphone size={20} strokeWidth={1.5} className="text-slate-400" />
                            )}
                            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: variant.colorHex }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[0.8rem] font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-0.5">
                              <span className="truncate">{variant.colorName}</span>
                              {!variant.isActive && <span className="text-[0.5rem] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">Inactiva</span>}
                            </div>
                            <div className="text-[0.6rem] font-bold text-slate-500 uppercase flex gap-2.5 tracking-widest">
                              <span>Stock: <span className={variant.stock > 0 ? "text-emerald-600" : ""}>{variant.stock}</span></span>
                              <span>•</span>
                              <span>Com: ${variant.commission}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={(e) => toggleVariantActive(model.id, variant.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            {variant.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingVariant(variant); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={(e) => handleDeleteVariant(model, variant, e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                    }}
                    />
                    
                    <button onClick={() => handleAddVariant(model.id)} className="w-full mt-1 py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-[var(--neo-surface-soft)] hover:text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5">
                      <Plus size={14} /> Añadir nueva variante
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
          }}
        />
      </div>
      )}
    </div>
  );
}
