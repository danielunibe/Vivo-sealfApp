import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { getModelStockAndMarginSummary } from '../catalogAggregation';
import { sortBySortOrder } from '../modelOrdering';
import type { PhoneVariant } from '../../types';

describe('Property-based tests for catalog aggregation and ordering', () => {
  
  it('Property 8: getModelStockAndMarginSummary aggregates stock and margin correctly', () => {
    // Feature: catalog-purchase-experience, Property 8: Agregación correcta en la Model_Card
    
    // Generator for PhoneVariant with arbitrary stock and commission
    const phoneVariantArb = fc.record({
      id: fc.string({ minLength: 1 }),
      modelId: fc.string({ minLength: 1 }),
      colorName: fc.string({ minLength: 1 }),
      colorHex: fc.string({ minLength: 1 }),
      stock: fc.nat({ max: 1000 }),
      minStock: fc.nat({ max: 10 }),
      commission: fc.float({ min: 0, max: 1000, noNaN: true }),
      isActive: fc.constant(true),
      sortOrder: fc.nat(),
    }) as fc.Arbitrary<PhoneVariant>;

    const variantsListArb = fc.array(phoneVariantArb, { minLength: 0, maxLength: 10 });

    fc.assert(fc.property(variantsListArb, (variants) => {
      const result = getModelStockAndMarginSummary(variants);
      
      // Stock total debe ser igual a la suma manual de los stock
      const expectedTotalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
      if (result.totalStock !== expectedTotalStock) {
        throw new Error(`Total stock mismatch: expected ${expectedTotalStock}, got ${result.totalStock}`);
      }
      
      // hasVariants debe ser true si hay al menos una variante
      const expectedHasVariants = variants.length > 0;
      if (result.hasVariants !== expectedHasVariants) {
        throw new Error(`hasVariants mismatch: expected ${expectedHasVariants}, got ${result.hasVariants}`);
      }
      
      if (variants.length > 0) {
        // minMargin debe ser el mínimo de las comisiones
        const expectedMinMargin = Math.min(...variants.map(v => v.commission));
        if (result.minMargin !== expectedMinMargin) {
          throw new Error(`Min margin mismatch: expected ${expectedMinMargin}, got ${result.minMargin}`);
        }
        
        // maxMargin debe ser el máximo de las comisiones
        const expectedMaxMargin = Math.max(...variants.map(v => v.commission));
        if (result.maxMargin !== expectedMaxMargin) {
          throw new Error(`Max margin mismatch: expected ${expectedMaxMargin}, got ${result.maxMargin}`);
        }
      } else {
        // Lista vacía debe retornar minMargin y maxMargin = 0
        if (result.minMargin !== 0 || result.maxMargin !== 0) {
          throw new Error(`Empty list should return min/max margin = 0, got min=${result.minMargin}, max=${result.maxMargin}`);
        }
      }
      
      return true;
    }), { numRuns: 100 });
  });

  it('Property 8: getModelStockAndMarginSummary handles edge cases correctly', () => {
    // Feature: catalog-purchase-experience, Property 8: Casos borde (lista vacía y un solo elemento)
    
    // Test lista vacía
    const emptyResult = getModelStockAndMarginSummary([]);
    if (emptyResult.totalStock !== 0 || emptyResult.minMargin !== 0 || emptyResult.maxMargin !== 0 || emptyResult.hasVariants !== false) {
      throw new Error(`Empty list should return {totalStock: 0, minMargin: 0, maxMargin: 0, hasVariants: false}`);
    }
    
    // Test un solo elemento
    const singleVariantArb = fc.record({
      id: fc.constant('test-id'),
      modelId: fc.constant('test-model'),
      colorName: fc.constant('Test Color'),
      colorHex: fc.constant('#000000'),
      stock: fc.nat({ max: 100 }),
      minStock: fc.constant(1),
      commission: fc.float({ min: 0, max: 500, noNaN: true }),
      isActive: fc.constant(true),
      sortOrder: fc.constant(0),
    }) as fc.Arbitrary<PhoneVariant>;

    fc.assert(fc.property(singleVariantArb, (variant) => {
      const result = getModelStockAndMarginSummary([variant]);
      
      // Para un solo elemento, min == max
      if (result.minMargin !== result.maxMargin) {
        throw new Error(`Single element should have min == max margin`);
      }
      
      if (result.minMargin !== variant.commission || result.maxMargin !== variant.commission) {
        throw new Error(`Single element margin should match variant commission`);
      }
      
      if (result.totalStock !== variant.stock) {
        throw new Error(`Single element stock should match variant stock`);
      }
      
      if (result.hasVariants !== true) {
        throw new Error(`Single element should have hasVariants = true`);
      }
      
      return true;
    }), { numRuns: 100 });
  });

  it('Property 9: sortBySortOrder returns stable and conservative ordering', () => {
    // Feature: catalog-purchase-experience, Property 9: Ordenamiento estable y conservador
    
    // Generator for objects with sortOrder
    const itemWithSortOrderArb = fc.record({
      id: fc.string({ minLength: 1 }),
      name: fc.string(),
      sortOrder: fc.integer({ min: -1000, max: 1000 }),
      // Campos adicionales para verificar que se preservan
      extraField: fc.string(),
    });

    const itemsListArb = fc.array(itemWithSortOrderArb, { minLength: 0, maxLength: 20 });

    fc.assert(fc.property(itemsListArb, (items) => {
      const result = sortBySortOrder(items);
      
      // El resultado debe ser una permutación exacta (misma longitud)
      if (result.length !== items.length) {
        throw new Error(`Length mismatch: input ${items.length}, output ${result.length}`);
      }
      
      // Todos los elementos originales deben estar presentes
      for (const originalItem of items) {
        const found = result.find(item => 
          item.id === originalItem.id && 
          item.name === originalItem.name && 
          item.extraField === originalItem.extraField
        );
        if (!found) {
          throw new Error(`Original item ${originalItem.id} not found in result`);
        }
      }
      
      // No debe haber elementos duplicados
      const ids = result.map(item => item.id);
      const uniqueIds = [...new Set(ids)];
      if (ids.length !== uniqueIds.length) {
        throw new Error(`Duplicate elements found in result`);
      }
      
      // El resultado debe estar ordenado de forma no decreciente por sortOrder
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i].sortOrder > result[i + 1].sortOrder) {
          throw new Error(`Result not sorted: item ${i} has sortOrder ${result[i].sortOrder} > item ${i+1} has sortOrder ${result[i + 1].sortOrder}`);
        }
      }
      
      return true;
    }), { numRuns: 100 });
  });

  it('Property 9: sortBySortOrder handles edge cases correctly', () => {
    // Feature: catalog-purchase-experience, Property 9: Casos borde para ordenamiento
    
    // Test lista vacía
    const emptyResult = sortBySortOrder([]);
    if (emptyResult.length !== 0) {
      throw new Error(`Empty list should return empty array`);
    }
    
    // Test con sortOrder undefined - debe usar index como fallback
    const itemsWithUndefinedSortOrder = [
      { id: '1', name: 'First', sortOrder: undefined },
      { id: '2', name: 'Second', sortOrder: undefined },
      { id: '3', name: 'Third', sortOrder: undefined }
    ] as Array<{ id: string; name: string; sortOrder?: number }>;
    
    const resultUndefined = sortBySortOrder(itemsWithUndefinedSortOrder);
    if (resultUndefined.length !== 3) {
      throw new Error(`Should preserve all items with undefined sortOrder`);
    }
    
    // Debe mantener el orden original cuando no hay sortOrder definido (usa el index como fallback)
    for (let i = 0; i < resultUndefined.length; i++) {
      const resultItem = resultUndefined[i] as any;
      const originalItem = itemsWithUndefinedSortOrder[i] as any;
      if (resultItem.id !== originalItem.id) {
        throw new Error(`Order should be preserved for items with undefined sortOrder`);
      }
    }
    
    // Test con sortOrder iguales - debe ser estable
    const itemsWithSameSortOrder = [
      { id: '1', name: 'First', sortOrder: 1 },
      { id: '2', name: 'Second', sortOrder: 1 },
      { id: '3', name: 'Third', sortOrder: 1 }
    ];
    
    const resultSame = sortBySortOrder(itemsWithSameSortOrder);
    if (resultSame.length !== 3) {
      throw new Error(`Should preserve all items with same sortOrder`);
    }
    
    // Todos deben tener el mismo sortOrder
    for (const item of resultSame) {
      if (item.sortOrder !== 1) {
        throw new Error(`All items should have sortOrder = 1`);
      }
    }
  });
});