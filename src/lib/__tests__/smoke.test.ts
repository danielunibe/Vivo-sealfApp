import fc from 'fast-check';
import {describe, expect, it} from 'vitest';

// Test de humo de la infraestructura de testing (Tarea 1).
// Verifica que Vitest + fast-check funcionan y que la convención del proyecto
// (mínimo 100 iteraciones por test de propiedad) se ejecuta correctamente.
describe('infraestructura de testing (smoke)', () => {
  it('vitest ejecuta un test unitario básico', () => {
    expect(1 + 1).toBe(2);
  });

  it('fast-check corre >= 100 iteraciones (numRuns: 100)', () => {
    let runs = 0;
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        runs += 1;
        // Propiedad trivial pero universal: la suma es conmutativa.
        return a + b === b + a;
      }),
      {numRuns: 100},
    );
    expect(runs).toBeGreaterThanOrEqual(100);
  });
});
