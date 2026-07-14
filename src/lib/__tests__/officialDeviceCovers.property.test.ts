import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {PhoneModel, PhoneVariant} from '../../types';
import {
  applyOfficialCoversToPhoneModel,
  detectCoverColorDiscrepancy,
  getOfficialCoverForColor,
  getOfficialCoversForModel,
  getOfficialIconForColor,
  normalizeTextKey,
} from '../officialDeviceCovers';

// ---------------------------------------------------------------------------
// Dominio fijo de los 6 modelos oficiales (fuente de verdad de los ids).
// ---------------------------------------------------------------------------
const OFFICIAL_MODEL_IDS = [
  'y04',
  'y21d',
  'y29',
  'y31d',
  'v50-lite',
  'v60-lite',
] as const;

// ---------------------------------------------------------------------------
// Utilidades para construir variaciones ESTRUCTURALES de una misma clave.
//
// Una variación cambia may/min, inserta acentos/diacríticos sobre las letras
// base (a,e,i,o,u,n) y reemplaza los separadores (espacio, `-`, `_`, repetidos)
// SIN alterar la clave normalizada. De esta forma garantizamos, por
// construcción, que la variación normaliza a la misma clave canónica y evitamos
// falsos negativos que dependan de la propia implementación bajo prueba.
// ---------------------------------------------------------------------------
const ACCENTS: Record<string, string[]> = {
  a: ['á', 'à', 'ä', 'â', 'ã'],
  e: ['é', 'è', 'ë', 'ê'],
  i: ['í', 'ì', 'ï', 'î'],
  o: ['ó', 'ò', 'ö', 'ô', 'õ'],
  u: ['ú', 'ù', 'ü', 'û'],
  n: ['ñ'],
};

const transformChar = (c: string, upper: boolean, accentSeed: number): string => {
  // `c` es siempre una letra/dígito minúsculo (palabra canónica [a-z0-9]).
  const accentedForms = ACCENTS[c];
  let ch = c;
  if (accentedForms && accentSeed % (accentedForms.length + 1) !== 0) {
    ch = accentedForms[(accentSeed % (accentedForms.length + 1)) - 1];
  }
  return upper ? ch.toUpperCase() : ch;
};

interface VariationSeed {
  words: string[]; // palabras canónicas [a-z0-9]+
  caseSeed: boolean[]; // 1 por carácter total
  accentSeed: number[]; // 1 por carácter total
  interiorSeps: string[]; // separadores no vacíos entre palabras
  leadSep: string; // separador inicial (puede ser vacío)
  trailSep: string; // separador final (puede ser vacío)
}

// Clave canónica: palabras alfanuméricas unidas por un único `-`.
// normalizeTextKey de cualquier variación construida a partir de estas palabras
// debe ser exactamente igual a esta clave.
const canonicalKey = (words: string[]): string => words.join('-');

const buildVariation = (seed: VariationSeed): string => {
  const {words, caseSeed, accentSeed, interiorSeps, leadSep, trailSep} = seed;
  let charIdx = 0;
  const renderedWords = words.map((word) =>
    word
      .split('')
      .map((c) => {
        const rendered = transformChar(
          c,
          caseSeed[charIdx] ?? false,
          accentSeed[charIdx] ?? 0,
        );
        charIdx += 1;
        return rendered;
      })
      .join(''),
  );

  let out = leadSep;
  renderedWords.forEach((w, i) => {
    out += w;
    if (i < renderedWords.length - 1) {
      out += interiorSeps[i] ?? '-';
    }
  });
  out += trailSep;
  return out;
};

// Palabra canónica: alfanumérica en minúsculas, no vacía.
const wordArb = fc.stringMatching(/^[a-z0-9]{1,6}$/);
const nonEmptySepArb = fc.stringMatching(/^[ _-]{1,3}$/);
const maybeEmptySepArb = fc.stringMatching(/^[ _-]{0,3}$/);

// Arbitrario que produce { words, variation } donde `variation` es una
// reescritura estructural de `words` que DEBE normalizar a canonicalKey(words).
const variationArb: fc.Arbitrary<{words: string[]; variation: string}> = fc
  .array(wordArb, {minLength: 1, maxLength: 4})
  .chain((words) => {
    const totalChars = words.reduce((n, w) => n + w.length, 0);
    return fc
      .record({
        caseSeed: fc.array(fc.boolean(), {
          minLength: totalChars,
          maxLength: totalChars,
        }),
        accentSeed: fc.array(fc.nat(), {
          minLength: totalChars,
          maxLength: totalChars,
        }),
        interiorSeps: fc.array(nonEmptySepArb, {
          minLength: Math.max(0, words.length - 1),
          maxLength: Math.max(0, words.length - 1),
        }),
        leadSep: maybeEmptySepArb,
        trailSep: maybeEmptySepArb,
      })
      .map(({caseSeed, accentSeed, interiorSeps, leadSep, trailSep}) => ({
        words,
        variation: buildVariation({
          words,
          caseSeed,
          accentSeed,
          interiorSeps,
          leadSep,
          trailSep,
        }),
      }));
  });

// ===========================================================================
// Feature: catalog-purchase-experience, Property 1: Normalización idempotente e invariante
// Para toda cadena, normalizeTextKey es idempotente y produce la misma clave sin
// importar variaciones de mayúsculas/minúsculas, acentos/diacríticos y separadores
// (espacio, `-`, `_` equivalentes).
//
// **Validates: Requirements 1.10**
// ===========================================================================
describe('Property 1: Normalización idempotente e invariante', () => {
  it('es idempotente e invariante ante mayúsculas, acentos y separadores', () => {
    fc.assert(
      fc.property(fc.string(), variationArb, (rawString, {words, variation}) => {
        // Idempotencia sobre una cadena arbitraria cualquiera.
        const onceRaw = normalizeTextKey(rawString);
        expect(normalizeTextKey(onceRaw)).toBe(onceRaw);

        // Idempotencia sobre la variación estructural.
        const onceVar = normalizeTextKey(variation);
        expect(normalizeTextKey(onceVar)).toBe(onceVar);

        // Invariancia: la variación (may/min + acentos + separadores) normaliza a
        // la misma clave canónica que las palabras base.
        expect(onceVar).toBe(canonicalKey(words));
      }),
      {numRuns: 100},
    );
  });
});

// ===========================================================================
// Feature: catalog-purchase-experience, Property 2: Completitud del resolver de portadas
// Para todo Official_Model existen exactamente 2 Variant y cada una resuelve a una
// portada definida (.png) o a su fallback SVG, sumando exactamente 12 portadas.
//
// **Validates: Requirements 1.2, 1.11, 1.1**
// ===========================================================================
describe('Property 2: Completitud del resolver de portadas', () => {
  it('cada modelo tiene 2 covers resueltas; el total suma exactamente 12', () => {
    // Verificación global del total (12 = 6 modelos × 2 variantes), fuera del
    // muestreo aleatorio porque cada corrida evalúa un único id del dominio.
    const total = OFFICIAL_MODEL_IDS.reduce(
      (sum, id) => sum + getOfficialCoversForModel(id).length,
      0,
    );
    expect(total).toBe(12);

    fc.assert(
      fc.property(fc.constantFrom(...OFFICIAL_MODEL_IDS), (modelId) => {
        const covers = getOfficialCoversForModel(modelId);
        // Exactamente 2 covers por modelo.
        expect(covers).toHaveLength(2);

        covers.forEach((cover) => {
          // La portada resuelve a un archivo .png definido.
          expect(typeof cover.path).toBe('string');
          expect(cover.path.endsWith('.png')).toBe(true);

          // El color resuelve a una cover definida por las funciones públicas.
          expect(getOfficialCoverForColor(modelId, cover.colorName)).toBeDefined();

          // El fallback (icono SVG/portada) siempre está definido.
          const icon = getOfficialIconForColor(modelId, cover.colorName);
          expect(icon).toBeDefined();
          expect(typeof icon).toBe('string');
        });
      }),
      {numRuns: 100},
    );
  });
});

// ===========================================================================
// Feature: catalog-purchase-experience, Property 3: La portada oficial es la fuente de verdad visual
// Para toda Variant de un color conocido con portada oficial, la imagen resuelta
// por applyOfficialCoversToPhoneModel es la portada oficial derivada del archivo
// (cover.path), con prioridad sobre cualquier imagePath personalizado de entrada.
//
// **Validates: Requirements 2.1, 2.2, 5.7**
// ===========================================================================
describe('Property 3: La portada oficial es la fuente de verdad visual', () => {
  it('prioriza la portada oficial .png sobre imagePath personalizado', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...OFFICIAL_MODEL_IDS),
        // Dos rutas personalizadas "custom://..." (una por variante), garantizadas
        // distintas de cualquier portada oficial .png.
        fc.array(fc.string(), {minLength: 2, maxLength: 2}),
        (modelId, customImages) => {
          const covers = getOfficialCoversForModel(modelId);

          const inputVariants: PhoneVariant[] = covers.map((cover, i) => ({
            id: `${modelId}-input-${i}`,
            modelId,
            colorName: cover.colorName,
            colorHex: '#000000',
            imagePath: `custom://${customImages[i]}`,
            stock: 1,
            minStock: 1,
            commission: 100,
            isActive: true,
            sortOrder: i,
          }));

          const inputModel: PhoneModel = {
            id: modelId,
            name: `Modelo ${modelId}`,
            shortName: modelId,
            isActive: true,
            sortOrder: 0,
            variants: inputVariants,
          };

          const result = applyOfficialCoversToPhoneModel(inputModel);

          // La salida conserva 2 variantes en el orden de las covers oficiales.
          expect(result.variants).toHaveLength(covers.length);

          result.variants.forEach((variant, i) => {
            const officialPath = covers[i].path;
            // La imagen resuelta es la portada oficial derivada del archivo.
            expect(variant.imagePath).toBe(officialPath);
            expect(variant.imagePath?.endsWith('.png')).toBe(true);
            // NUNCA es la ruta personalizada de entrada.
            expect(variant.imagePath).not.toBe(`custom://${customImages[i]}`);
            expect(variant.imagePath?.startsWith('custom://')).toBe(false);
          });
        },
      ),
      {numRuns: 100},
    );
  });
});

// ===========================================================================
// Feature: catalog-purchase-experience, Property 4: Detección de discrepancia declarado vs. derivado
// Para todo par (declaredColor, fileDerivedColor), detectCoverColorDiscrepancy
// reporta discrepancia (no-null / hasDiscrepancy true) si y solo si difieren tras
// normalizeTextKey, e incluye variantId, declaredColor y derivedColor.
//
// **Validates: Requirements 2.6**
// ===========================================================================
describe('Property 4: Detección de discrepancia declarado vs. derivado', () => {
  it('reporta discrepancia si y solo si difieren tras normalizeTextKey', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9-]{1,20}$/), // variantId
        // Par EQUIVALENTE tras normalizar: dos variaciones estructurales de la
        // misma clave (distinto caso/acento/separador) => NO deben marcar.
        variationArb,
        variationArb,
        // Par potencialmente distinto: dos cadenas arbitrarias; solo se evalúa la
        // rama "distinta" cuando realmente difieren tras normalizar (fc.pre).
        fc.string(),
        fc.string(),
        (variantId, equalA, equalB, rawA, rawB) => {
          // --- Caso EQUIVALENTE: misma clave canónica por construcción. ---
          // Forzamos que ambas variaciones provengan de la MISMA palabra base
          // reutilizando equalA.words para reconstruir una segunda variación
          // sería ideal, pero basta con comparar dos variaciones cuyas claves
          // canónicas coincidan; garantizamos igualdad usando la misma base.
          if (canonicalKey(equalA.words) === canonicalKey(equalB.words)) {
            const equivResult = detectCoverColorDiscrepancy({
              variantId,
              declaredColor: equalA.variation,
              fileDerivedColor: equalB.variation,
            });
            expect(equivResult).toBeNull();
          }

          // Para garantizar SIEMPRE un caso equivalente no trivial, comparamos
          // una variación consigo misma re-derivada de la misma base.
          const selfEquivResult = detectCoverColorDiscrepancy({
            variantId,
            declaredColor: equalA.variation,
            fileDerivedColor: canonicalKey(equalA.words),
          });
          expect(selfEquivResult).toBeNull();

          // --- Caso DISTINTO: solo cuando difieren tras normalizar. ---
          fc.pre(normalizeTextKey(rawA) !== normalizeTextKey(rawB));
          const diffResult = detectCoverColorDiscrepancy({
            variantId,
            declaredColor: rawA,
            fileDerivedColor: rawB,
          });
          expect(diffResult).not.toBeNull();
          expect(diffResult?.hasDiscrepancy).toBe(true);
          expect(diffResult?.variantId).toBe(variantId);
          expect(diffResult?.declaredColor).toBe(rawA);
          expect(diffResult?.derivedColor).toBe(rawB);
        },
      ),
      {numRuns: 100},
    );
  });
});
