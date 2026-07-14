/**
 * Property-based tests for quantity validation
 * **Validates: Requirements 6.5, 6.6, 6.13**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidQuantity } from '../quantityValidation';

describe('quantityValidation - Property 10', () => {
  /**
   * Property 10: For all quantity values and stock values,
   * isValidQuantity returns true if and only if quantity is an integer,
   * quantity >= 1, and quantity <= stock.
   */
  test('Property 10: isValidQuantity returns true IFF quantity is integer AND >= 1 AND <= stock', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 200 }), // quantity (includes negative, zero, positive)
        fc.integer({ min: 0, max: 100 }),    // stock (non-negative)
        (quantity, stock) => {
          const result = isValidQuantity(quantity, stock);
          const expected = Number.isInteger(quantity) && quantity >= 1 && quantity <= stock;
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.1: Valid quantities in range [1, stock] return true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // stock (positive)
        (stock) => {
          // Generate a valid quantity within [1, stock]
          fc.assert(
            fc.property(
              fc.integer({ min: 1, max: stock }),
              (quantity) => {
                expect(isValidQuantity(quantity, stock)).toBe(true);
              }
            ),
            { numRuns: 10 }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.2: Non-integers return false', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100.9, noNaN: true, noDefaultInfinity: true }), // non-integer
        fc.integer({ min: 1, max: 100 }), // stock
        (quantity, stock) => {
          // Ensure it's not an integer
          fc.pre(!Number.isInteger(quantity));
          
          expect(isValidQuantity(quantity, stock)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.3: Quantities < 1 return false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 0 }), // quantity <= 0
        fc.integer({ min: 1, max: 100 }),  // stock
        (quantity, stock) => {
          expect(isValidQuantity(quantity, stock)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.4: Quantities > stock return false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // stock
        (stock) => {
          // Generate quantity > stock
          fc.assert(
            fc.property(
              fc.integer({ min: stock + 1, max: stock + 100 }),
              (quantity) => {
                expect(isValidQuantity(quantity, stock)).toBe(false);
              }
            ),
            { numRuns: 10 }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.5: Edge case - quantity equals stock should be valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (stock) => {
          expect(isValidQuantity(stock, stock)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.6: Edge case - quantity = 1 should be valid when stock >= 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (stock) => {
          expect(isValidQuantity(1, stock)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10.7: Edge case - stock = 0 should reject all quantities', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        (quantity) => {
          expect(isValidQuantity(quantity, 0)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
