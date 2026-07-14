import React from 'react';
import { CheckCircle2, Plus, RotateCcw, UploadCloud, X } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { getPhoneVariantCatalogImage } from '../../lib/deviceImages';
import { createMediaAsset, deleteMediaAsset, saveMediaAsset } from '../../lib/localMediaStore';
import { validateImageFile, fileToDataUrl, resizeImageIfNeeded } from '../../lib/imageUpload';
import { VariantMediaImage } from '../../components/ui/VariantMediaImage';

type VariantImageGalleryProps = {
  model: PhoneModel;
  variant: PhoneVariant;
  onChange: (variant: PhoneVariant) => void;
  onNotify: (msg: string) => void;
};

export default function VariantImageGallery({ model, variant, onChange, onNotify }: VariantImageGalleryProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState('');
  const officialFallback = getPhoneVariantCatalogImage({ ...model, variants: [variant] }, variant.colorName) || '';
  const gallery = Array.isArray(variant.imageGallery) ? variant.imageGallery : [];

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = event.target.files ? Array.from(event.target.files) as File[] : [];
    if (inputRef.current) inputRef.current.value = '';
    if (files.length === 0) return;

    const nextGallery = [...gallery];
    let nextActiveId = variant.activeImageId;

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'No se pudo cargar la imagen.');
        continue;
      }

      const dataUrl = await fileToDataUrl(file);
      const resized = await resizeImageIfNeeded(dataUrl, 1200);
      const mimeType = resized.match(/^data:([^;]+);/)?.[1] || file.type || 'image/webp';
      const asset = await saveMediaAsset(createMediaAsset({
        kind: 'variant-image',
        mimeType,
        dataUrl: resized,
        source: 'user-upload',
        modelId: model.id,
        variantId: variant.id,
        label: file.name,
      }));
      const imageRef = {
        id: crypto.randomUUID(),
        mediaAssetId: asset.id,
        label: file.name,
        createdAt: Date.now(),
        source: 'user-upload' as const,
      };
      nextGallery.push(imageRef);
      nextActiveId = imageRef.id;
    }

    onChange({ ...variant, imageGallery: nextGallery, activeImageId: nextActiveId });
    onNotify('Imagen guardada en galeria local');
  };

  const handleDelete = async (imageId: string) => {
    const image = gallery.find((item) => item.id === imageId);
    if (!image) return;

    await deleteMediaAsset(image.mediaAssetId).catch(() => undefined);
    const nextGallery = gallery.filter((item) => item.id !== imageId);
    onChange({
      ...variant,
      imageGallery: nextGallery,
      activeImageId: variant.activeImageId === imageId ? nextGallery[0]?.id : variant.activeImageId,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[0.68rem] font-black uppercase tracking-widest text-slate-700">Galeria de Inicio</h4>
          <p className="mt-1 text-[0.64rem] font-bold leading-snug text-slate-500">
            Sube varias imagenes y elige una sola como portada visible para esta variante.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm active:scale-95"
          title="Subir imagenes"
        >
          <UploadCloud size={17} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp, image/svg+xml"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2">
        <div className="mb-1 text-[0.55rem] font-black uppercase tracking-widest text-emerald-600">Imagen activa en Inicio</div>
        <div className="flex items-center gap-3">
          <div className="h-20 w-14 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <VariantMediaImage
              variant={variant}
              fallbackSrc={officialFallback}
              alt={`${model.name} ${variant.colorName}`}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="min-w-0 text-[0.68rem] font-bold leading-snug text-slate-700">
            {variant.activeImageId ? 'Imagen personalizada seleccionada.' : 'Usando portada oficial del color.'}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...variant, activeImageId: undefined })}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-[0.58rem] font-black uppercase tracking-widest text-slate-600"
        >
          <RotateCcw size={13} className="shrink-0" /> <span className="min-w-0 text-center leading-tight">Usar portada oficial</span>
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-2 text-[0.58rem] font-black uppercase tracking-widest text-white"
        >
          <Plus size={13} className="shrink-0" /> <span className="min-w-0 text-center leading-tight">Subir imagen</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...variant, activeImageId: undefined })}
          disabled={!variant.activeImageId}
          className="col-span-2 flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[0.58rem] font-black uppercase tracking-widest text-slate-500 disabled:opacity-45"
        >
          <X size={13} className="shrink-0" /> <span className="min-w-0 text-center leading-tight">Quitar imagen personalizada</span>
        </button>
      </div>

      {error && <div className="mt-2 text-[0.62rem] font-bold text-red-500">{error}</div>}

      <div className="mt-3 text-[0.55rem] font-black uppercase tracking-widest text-slate-400">Elegir de galeria</div>

      {gallery.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {gallery.map((image) => {
            const isActive = variant.activeImageId === image.id;
            return (
              <div key={image.id} className="relative w-20 shrink-0">
                <button
                  type="button"
                  onClick={() => onChange({ ...variant, activeImageId: image.id })}
                  className={`relative h-24 w-full overflow-hidden rounded-xl border bg-white ${
                    isActive ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <VariantMediaImage
                    variant={{ ...variant, activeImageId: image.id, imageGallery: [image] }}
                    fallbackSrc={officialFallback}
                    alt={image.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-1 text-white">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                  title="Eliminar imagen"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {gallery.length === 0 && (
        <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[0.62rem] font-bold text-slate-500">
          Aun no hay imagenes guardadas para esta variante.
        </div>
      )}
    </div>
  );
}
