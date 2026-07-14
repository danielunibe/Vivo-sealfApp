import React, { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { validateImageFile, fileToDataUrl, resizeImageIfNeeded } from '../../lib/imageUpload';

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ImageUploadField({
  label,
  description,
  value,
  onChange,
  placeholder = 'https://...',
  className = ''
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Error de archivo');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const resized = await resizeImageIfNeeded(dataUrl, 800);
      onChange(resized);
    } catch (err) {
      setError('Error al procesar la imagen');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = value && value.trim().length > 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-end">
        <label className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider block">
          {label}
        </label>
        {description && (
          <span className="text-[0.5rem] text-gray-400 italic">
            {description}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="flex-1 bg-gray-50 p-2 rounded-lg text-xs outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-slate-200"
            title="Subir archivo local"
          >
            <UploadCloud size={16} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp, image/svg+xml"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="flex items-center gap-1 text-[0.6rem] text-red-500 font-medium">
            <AlertCircle size={10} />
            {error}
          </div>
        )}

        {hasImage && (
          <div className="relative mt-1 border border-gray-100 rounded-lg p-1 bg-white inline-block w-fit group">
            <img 
              src={value} 
              alt={label} 
              className="h-16 w-auto object-contain rounded bg-gray-50/50" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiLz48L3N2Zz4='; // Error placeholder
              }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              title="Quitar imagen"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
