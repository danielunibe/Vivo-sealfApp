// @vitest-environment jsdom
import fc from 'fast-check';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {PhoneModel} from '../../types';

// ---------------------------------------------------------------------------
// Mock de la capa de persistencia (IndexedDB) para que la captura NUNCA toque
// la base local real. jsdom no provee IndexedDB, por eso stubbeamos el módulo
// completo `../localMediaStore` (mismo módulo que webArchive.ts importa como
// `./localMediaStore`). Devolvemos implementaciones en memoria/no-op.
// ---------------------------------------------------------------------------
vi.mock('../localMediaStore', () => ({
  WEB_ARCHIVE_MODEL_LIMIT_BYTES: 100 * 1024 * 1024,
  createMediaAsset: vi.fn((input: {
    kind: string;
    mimeType: string;
    dataUrl: string;
    source: string;
    modelId?: string;
    url?: string;
    label?: string;
  }) => ({
    id: `asset-${Math.random().toString(36).slice(2)}`,
    kind: input.kind,
    mimeType: input.mimeType,
    dataUrl: input.dataUrl,
    size: 10,
    createdAt: 0,
    source: input.source,
    modelId: input.modelId,
    url: input.url,
    label: input.label,
  })),
  // Persistencia stubbeada: devuelve el argumento sin tocar IndexedDB.
  saveMediaAsset: vi.fn(async (asset: unknown) => asset),
  saveWebArchiveRecord: vi.fn(async (record: unknown) => record),
}));

// Se importa DESPUÉS del vi.mock (hoisted por Vitest) para que use el stub.
import {captureWebArchiveForModel} from '../webArchive';

// Conjunto declarado de Property 7 (fuente de verdad = WebArchiveStatus).
const VALID_STATUSES = ['sin_cache', 'cache_completo', 'cache_parcial', 'bloqueado'] as const;

const OFFICIAL_URL = 'https://www.vivo.com/mx/products/y04';

// ---------------------------------------------------------------------------
// Generador de escenarios: cubre todas las ramas de captureWebArchiveForModel.
//  - empty-url    → sin_cache (sin officialUrl útil, fetch nunca se invoca)
//  - html-reject  → bloqueado (fetch del HTML rechaza / lanza)
//  - html-abort   → bloqueado (AbortController/timeout simulado con AbortError)
//  - html-not-ok  → bloqueado (respuesta no-ok → el código lanza HTTP <status>)
//  - html-ok      → cache_completo | cache_parcial según recursos generados
// ---------------------------------------------------------------------------
type AssetOutcome = 'ok' | 'not-ok' | 'reject';

type Scenario =
  | {kind: 'empty-url'; officialUrl: string | undefined}
  | {kind: 'html-reject'; message: string}
  | {kind: 'html-abort'}
  | {kind: 'html-not-ok'; statusCode: number}
  | {kind: 'html-ok'; assetOutcomes: AssetOutcome[]};

const scenarioArb: fc.Arbitrary<Scenario> = fc.oneof(
  fc.record({
    kind: fc.constant('empty-url' as const),
    officialUrl: fc.constantFrom('', '   ', undefined),
  }),
  fc.record({
    kind: fc.constant('html-reject' as const),
    message: fc.string({maxLength: 20}),
  }),
  fc.record({kind: fc.constant('html-abort' as const)}),
  fc.record({
    kind: fc.constant('html-not-ok' as const),
    statusCode: fc.integer({min: 400, max: 599}),
  }),
  fc.record({
    kind: fc.constant('html-ok' as const),
    assetOutcomes: fc.array(fc.constantFrom<AssetOutcome>('ok', 'not-ok', 'reject'), {
      minLength: 0,
      maxLength: 6,
    }),
  }),
);

const buildModel = (scenario: Scenario): PhoneModel => ({
  id: 'y04',
  name: 'vivo Y04',
  shortName: 'Y04',
  isActive: true,
  sortOrder: 0,
  variants: [],
  officialUrl: scenario.kind === 'empty-url' ? scenario.officialUrl : OFFICIAL_URL,
});

// Construye un mock de `fetch` coherente con el escenario generado.
const buildFetch = (scenario: Scenario, officialUrl: string) =>
  vi.fn(async (input: unknown) => {
    const urlStr = typeof input === 'string' ? input : String(input);

    // --- Petición del HTML base (misma URL oficial del modelo) ---
    if (urlStr === officialUrl) {
      switch (scenario.kind) {
        case 'html-reject':
          throw new Error(scenario.message || 'network error');
        case 'html-abort': {
          const err = new Error('The operation was aborted.');
          err.name = 'AbortError';
          throw err;
        }
        case 'html-not-ok':
          return {ok: false, status: scenario.statusCode, text: async () => ''};
        case 'html-ok': {
          const html =
            '<html><body>' +
            scenario.assetOutcomes
              .map((_, i) => `<img src="https://cdn.example.com/asset-${i}.png">`)
              .join('') +
            '</body></html>';
          return {ok: true, status: 200, text: async () => html};
        }
        default:
          throw new Error('unreachable');
      }
    }

    // --- Petición de recursos estáticos referenciados por el HTML ---
    const match = urlStr.match(/asset-(\d+)\.png/);
    const idx = match ? Number(match[1]) : -1;
    const outcome: AssetOutcome =
      scenario.kind === 'html-ok' && idx >= 0 ? scenario.assetOutcomes[idx] : 'reject';

    if (outcome === 'reject') throw new Error('asset network error');
    if (outcome === 'not-ok') return {ok: false, status: 500, blob: async () => new Blob([])};
    return {
      ok: true,
      status: 200,
      blob: async () => new Blob(['x'.repeat(20)], {type: 'image/png'}),
    };
  });

describe('Property 7: Cache_Status siempre dentro del conjunto declarado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restaura mocks/stubs entre iteraciones para evitar fugas de estado.
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Feature: catalog-purchase-experience, Property 7: Para todo WebArchiveRecord producido por el
  // Web_Archive_Service, su status pertenece siempre al conjunto
  // { sin_cache, cache_completo, cache_parcial, bloqueado }.
  //
  // **Validates: Requirements 4.10**
  it('el status del WebArchiveRecord siempre pertenece al conjunto declarado', async () => {
    await fc.assert(
      fc.asyncProperty(scenarioArb, async (scenario) => {
        // Aísla estado entre corridas: limpia historial de mocks y re-stubbea fetch.
        vi.clearAllMocks();
        const model = buildModel(scenario);
        const officialUrl = model.officialUrl ?? OFFICIAL_URL;
        vi.stubGlobal('fetch', buildFetch(scenario, officialUrl));

        const record = await captureWebArchiveForModel(model);

        // Property 7: el estado SIEMPRE está en el conjunto declarado.
        expect(VALID_STATUSES).toContain(record.status);
        // Invariante estructural mínima del registro producido.
        expect(record.modelId).toBe(model.id);

        vi.unstubAllGlobals();
      }),
      {numRuns: 100},
    );
  });
});
