import { MediaAsset, MediaAssetKind, MediaAssetSource, WebArchiveRecord } from '../types';

const DB_NAME = 'vivo_promotor_media_v1';
const DB_VERSION = 1;
const MEDIA_STORE = 'media_assets';
const WEB_ARCHIVE_STORE = 'web_archives';
export const WEB_ARCHIVE_MODEL_LIMIT_BYTES = 100 * 1024 * 1024;

let dbPromise: Promise<IDBDatabase> | null = null;

const openMediaDb = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB no está disponible en este dispositivo.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        mediaStore.createIndex('modelId', 'modelId', { unique: false });
        mediaStore.createIndex('variantId', 'variantId', { unique: false });
      }
      if (!db.objectStoreNames.contains(WEB_ARCHIVE_STORE)) {
        db.createObjectStore(WEB_ARCHIVE_STORE, { keyPath: 'modelId' });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir la base local.'));
    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
};

const runStoreRequest = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = action(tx.objectStore(storeName));
    request.onerror = () => reject(request.error ?? new Error('Error de almacenamiento local.'));
    request.onsuccess = () => resolve(request.result);
    tx.onerror = () => reject(tx.error ?? new Error('Error de transacción local.'));
  });
};

export const estimateDataUrlBytes = (dataUrl: string) => {
  const payload = dataUrl.split(',')[1] ?? '';
  return Math.ceil((payload.length * 3) / 4);
};

export const createMediaAsset = (input: {
  kind: MediaAssetKind;
  mimeType: string;
  dataUrl: string;
  source: MediaAssetSource;
  modelId?: string;
  variantId?: string;
  url?: string;
  label?: string;
}): MediaAsset => ({
  id: crypto.randomUUID(),
  kind: input.kind,
  mimeType: input.mimeType,
  dataUrl: input.dataUrl,
  size: estimateDataUrlBytes(input.dataUrl),
  createdAt: Date.now(),
  source: input.source,
  modelId: input.modelId,
  variantId: input.variantId,
  url: input.url,
  label: input.label,
});

export const saveMediaAsset = async (asset: MediaAsset) => {
  await runStoreRequest(MEDIA_STORE, 'readwrite', (store) => store.put(asset));
  return asset;
};

export const getMediaAsset = (assetId: string) => {
  return runStoreRequest<MediaAsset | undefined>(MEDIA_STORE, 'readonly', (store) => store.get(assetId));
};

export const deleteMediaAsset = (assetId: string) => {
  return runStoreRequest<undefined>(MEDIA_STORE, 'readwrite', (store) => store.delete(assetId) as IDBRequest<undefined>);
};

export const saveWebArchiveRecord = async (record: WebArchiveRecord) => {
  await runStoreRequest(WEB_ARCHIVE_STORE, 'readwrite', (store) => store.put(record));
  return record;
};

export const getWebArchiveRecord = (modelId: string) => {
  return runStoreRequest<WebArchiveRecord | undefined>(WEB_ARCHIVE_STORE, 'readonly', (store) => store.get(modelId));
};

export const getAllWebArchiveRecords = () => {
  return runStoreRequest<WebArchiveRecord[]>(WEB_ARCHIVE_STORE, 'readonly', (store) => store.getAll());
};

export const deleteWebArchiveRecord = (modelId: string) => {
  return runStoreRequest<undefined>(WEB_ARCHIVE_STORE, 'readwrite', (store) => store.delete(modelId) as IDBRequest<undefined>);
};
