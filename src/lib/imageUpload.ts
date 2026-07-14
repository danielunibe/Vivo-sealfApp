export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato no soportado. Usa JPG, PNG, WEBP o SVG.' };
  }

  // Limit to 2MB (or maybe 1MB to avoid bloated localStorage)
  const maxSizeInBytes = 2 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: 'La imagen es muy pesada. Máximo 2MB recomendado.' };
  }

  return { isValid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo.'));
    };
    reader.readAsDataURL(file);
  });
}

export function resizeImageIfNeeded(dataUrl: string, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (dataUrl.startsWith('data:image/svg+xml')) {
      return resolve(dataUrl); // Don't resize SVGs
    }

    const img = new Image();
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const newUrl = canvas.toDataURL('image/webp', 0.9);
      resolve(newUrl);
    };
    img.onerror = () => {
      resolve(dataUrl); // Fallback to original
    };
    img.src = dataUrl;
  });
}
