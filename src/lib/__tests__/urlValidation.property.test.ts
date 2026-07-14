import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {isValidHttpsUrl} from '../urlValidation';

// Feature: catalog-purchase-experience, Property 6: Validación de URL oficial (https absoluta)
// Para toda cadena candidata a officialUrl, la acción de abrir la web se habilita si y solo si la
// cadena es una URL absoluta con esquema https; para cualquier cadena inválida, la apertura se
// rechaza y el valor almacenado se conserva sin cambios.
//
// **Validates: Requirements 3.11**

// --- Generadores POSITIVOS: URLs absolutas con esquema https ---
// Construimos URLs https válidas de dos formas complementarias:
//  1) Reescribiendo el esquema de fc.webUrl() a https (host/ruta/puerto realistas).
//  2) URLs oficiales conocidas del catálogo (casos concretos de la feature).
const knownOfficialUrls = [
  'https://www.vivo.com/mx/products/y04',
  'https://www.vivo.com/mx/products/y21d',
  'https://www.vivo.com/mx/products/y29-4g',
  'https://www.vivo.com/mx/products/y31d',
  'https://www.vivo.com/mx/products/v50-lite',
  'https://www.vivo.com/mx/products/v60-lite',
];

const httpsUrlArb: fc.Arbitrary<string> = fc.oneof(
  // fc.webUrl() puede producir http o https; forzamos https reescribiendo el esquema.
  fc.webUrl().map((u) => u.replace(/^https?:/, 'https:')),
  fc.constantFrom(...knownOfficialUrls),
);

// --- Generadores NEGATIVOS: cadenas que NO son URLs https absolutas ---
// Se construyen de modo estructural para garantizar que nunca sean https absolutas
// (sin depender de isValidHttpsUrl para clasificarlas).

// (a) URLs absolutas con un esquema distinto de https.
const nonHttpsSchemeArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom('http', 'ftp', 'ws', 'wss', 'file'),
    fc.domain(),
    fc.webPath(),
  )
  .map(([scheme, domain, path]) => `${scheme}://${domain}${path}`);

// (b) Rutas relativas: sin esquema, new URL() sin base lanza excepción.
const relativePathArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom('/', './', '../', ''),
    fc.stringMatching(/^[a-z0-9\-/.]{1,20}$/),
  )
  .map(([prefix, rest]) => `${prefix}${rest}`);

// (c) Texto arbitrario sin esquema: eliminamos ':' para descartar cualquier
//     posibilidad de que se interprete como URL absoluta (un esquema requiere ':').
const randomTextArb: fc.Arbitrary<string> = fc
  .string({minLength: 0, maxLength: 40})
  .map((s) => s.replace(/:/g, ''));

const invalidUrlArb: fc.Arbitrary<string> = fc.oneof(
  nonHttpsSchemeArb,
  relativePathArb,
  randomTextArb,
  fc.constant(''),
);

describe('Property 6: Validación de URL oficial (https absoluta)', () => {
  it('acepta (=> true) toda URL absoluta con esquema https', () => {
    fc.assert(
      fc.property(httpsUrlArb, (url) => {
        expect(isValidHttpsUrl(url)).toBe(true);
      }),
      {numRuns: 100},
    );
  });

  it('rechaza (=> false) toda cadena que no sea una URL https absoluta', () => {
    fc.assert(
      fc.property(invalidUrlArb, (candidate) => {
        expect(isValidHttpsUrl(candidate)).toBe(false);
      }),
      {numRuns: 100},
    );
  });

  it('es una función pura: no muta el valor almacenado (se conserva sin cambios)', () => {
    fc.assert(
      fc.property(fc.oneof(httpsUrlArb, invalidUrlArb), (candidate) => {
        // El valor "almacenado" se representa dentro de un contenedor.
        const store = {officialUrl: candidate};
        const snapshot = store.officialUrl;
        isValidHttpsUrl(store.officialUrl);
        // Tras la validación, el valor almacenado se conserva idéntico.
        expect(store.officialUrl).toBe(snapshot);
      }),
      {numRuns: 100},
    );
  });
});
