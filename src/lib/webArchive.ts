import { PhoneModel, WebArchiveRecord, WebArchiveStatus } from '../types';
import { createMediaAsset, saveMediaAsset, saveWebArchiveRecord, WEB_ARCHIVE_MODEL_LIMIT_BYTES } from './localMediaStore';

const URL_ATTR_PATTERN = /\b(?:src|href)=["']([^"']+)["']/gi;
const CACHEABLE_EXTENSIONS = /\.(?:png|jpe?g|webp|gif|svg|css|js|mp4|webm|mov)(?:[?#].*)?$/i;

// La captura del HTML base se aborta si no finaliza dentro de este tiempo (Req 4.3).
export const WEB_ARCHIVE_HTML_TIMEOUT_MS = 30_000;

const blobToDataUrl = (blob: Blob): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el recurso web.'));
    reader.readAsDataURL(blob);
  })
);

const collectAssetUrls = (html: string, baseUrl: string) => {
  const urls = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = URL_ATTR_PATTERN.exec(html))) {
    const rawUrl = match[1];
    if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('#')) {
      continue;
    }

    try {
      const absoluteUrl = new URL(rawUrl, baseUrl).href;
      if (CACHEABLE_EXTENSIONS.test(absoluteUrl)) {
        urls.add(absoluteUrl);
      }
    } catch {
      // Ignore invalid third-party markup.
    }
  }
  return Array.from(urls).slice(0, 80);
};

const replaceAllUrlReferences = (html: string, originalUrl: string, dataUrl: string) => {
  return html.split(originalUrl).join(dataUrl);
};

export const captureWebArchiveForModel = async (model: PhoneModel): Promise<WebArchiveRecord> => {
  const url = model.officialUrl?.trim();
  if (!url) {
    const record: WebArchiveRecord = {
      modelId: model.id,
      url: '',
      capturedAt: Date.now(),
      status: 'sin_cache',
      bytesUsed: 0,
      assets: [],
      errors: ['Este modelo no tiene URL oficial configurada.'],
    };
    await saveWebArchiveRecord(record);
    return record;
  }

  const errors: string[] = [];
  let html = '';
  let status: WebArchiveStatus = 'cache_parcial';

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, WEB_ARCHIVE_HTML_TIMEOUT_MS);

  try {
    const response = await fetch(url, { cache: 'reload', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    const reason = timedOut
      ? `La captura del HTML base superó el límite de ${WEB_ARCHIVE_HTML_TIMEOUT_MS / 1000} s y fue abortada.`
      : `La web no permitió capturar el HTML base: ${error instanceof Error ? error.message : 'bloqueo desconocido'}.`;
    const record: WebArchiveRecord = {
      modelId: model.id,
      url,
      capturedAt: Date.now(),
      status: 'bloqueado',
      bytesUsed: 0,
      assets: [],
      errors: [reason],
    };
    await saveWebArchiveRecord(record);
    return record;
  } finally {
    clearTimeout(timer);
  }

  let bytesUsed = new Blob([html]).size;
  const assets: WebArchiveRecord['assets'] = [];
  let offlineHtml = html;

  for (const assetUrl of collectAssetUrls(html, url)) {
    if (bytesUsed >= WEB_ARCHIVE_MODEL_LIMIT_BYTES) {
      errors.push('Se alcanzó el límite local de 100 MB por modelo.');
      break;
    }

    try {
      const response = await fetch(assetUrl, { cache: 'reload' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (bytesUsed + blob.size > WEB_ARCHIVE_MODEL_LIMIT_BYTES) {
        errors.push(`Recurso omitido por límite: ${assetUrl}`);
        continue;
      }

      const dataUrl = await blobToDataUrl(blob);
      const asset = await saveMediaAsset(createMediaAsset({
        kind: 'web-asset',
        mimeType: blob.type || 'application/octet-stream',
        dataUrl,
        source: 'web-cache',
        modelId: model.id,
        url: assetUrl,
        label: assetUrl,
      }));

      assets.push({
        url: assetUrl,
        mediaAssetId: asset.id,
        mimeType: asset.mimeType,
        size: asset.size,
      });
      bytesUsed += asset.size;
      offlineHtml = replaceAllUrlReferences(offlineHtml, assetUrl, dataUrl);
    } catch (error) {
      errors.push(`No se pudo guardar recurso: ${assetUrl}`);
    }
  }

  status = errors.length === 0 ? 'cache_completo' : 'cache_parcial';
  const record: WebArchiveRecord = {
    modelId: model.id,
    url,
    capturedAt: Date.now(),
    status,
    bytesUsed,
    assets,
    offlineHtml,
    errors,
  };
  await saveWebArchiveRecord(record);
  return record;
};
