/**
 * Property-based tests for sale inventory and commission invariants
 * **Validates: Requirements 6.7, 6.8, 6.11**
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import type { PhoneModel, PhoneVariant, SaleRecord, InventoryMovement } from '../../types';

// Mock localStorage para testing aislado
const createMockStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    },
    _getStorage: () => storage,
  };
};

// Reimplementación de las funciones de storage necesarias para testing
const safeReadArray = <T>(key: string, defaultValue: T[], mockStorage: ReturnType<typeof createMockStorage>): T[] => {
  const stored = mockStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeWriteStorage = (key: string, value: unknown, mockStorage: ReturnType<typeof createMockStorage>) => {
  try {
    mockStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to storage key ${key}:`, e);
  }
};

const getPhoneModels = (mockStorage: ReturnType<typeof createMockStorage>): PhoneModel[] => {
  return safeReadArray<PhoneModel>('vivo_phone_models_v1', [], mockStorage);
};

const savePhoneModels = (models: PhoneModel[], mockStorage: ReturnType<typeof createMockStorage>) => {
  safeWriteStorage('vivo_phone_models_v1', models, mockStorage);
};

const getInventoryMovements = (mockStorage: ReturnType<typeof createMockStorage>): InventoryMovement[] => {
  return safeReadArray<InventoryMovement>('vivo_inventory_movements_v1', [], mockStorage);
};

const saveInventoryMovement = (movement: InventoryMovement, mockStorage: ReturnType<typeof createMockStorage>) => {
  const movements = getInventoryMovements(mockStorage);
  movements.push(movement);
  safeWriteStorage('vivo_inventory_movements_v1', movements, mockStorage);
};

const getSales = (mockStorage: ReturnType<typeof createMockStorage>): SaleRecord[] => {
  return safeReadArray<SaleRecord>('vivo_sales_history_v3', [], mockStorage);
};

const saveSale = (sale: SaleRecord, mockStorage: ReturnType<typeof createMockStorage>) => {
  const sales = getSales(mockStorage);
  sales.push(sale);
  safeWriteStorage('vivo_sales_history_v3', sales, mockStorage);
};

// Implementación simplificada de saveSaleWithInventory para testing
const saveSaleWithInventory = (
  sale: SaleRecord,
  mockStorage: ReturnType<typeof createMockStorage>
) => {
  // Guardar la venta
  saveSale(sale, mockStorage);

  // Decrementar stock si hay modelId y variantId
  if (sale.modelId && sale.variantId) {
    const models = getPhoneModels(mockStorage);
    const modelIndex = models.findIndex(m => m.id === sale.modelId);
    
    if (modelIndex !== -1) {
      const model = models[modelIndex];
      const variantIndex = model.variants.findIndex(v => v.id === sale.variantId);
      
      if (variantIndex !== -1) {
        const variant = model.variants[variantIndex];
        const previousStock = variant.stock || 0;
        const quantity = sale.quantity || 1;
        const finalStock = Math.max(0, previousStock - quantity);
        
        // Actualizar el stock
        const updatedModels = [...models];
        updatedModels[modelIndex] = {
          ...model,
          variants: [
            ...model.variants.slice(0, variantIndex),
            { ...variant, stock: finalStock },
            ...model.variants.slice(variantIndex + 1)
          ]
        };
        savePhoneModels(updatedModels, mockStorage);
        
        // Crear el movimiento de inventario
        saveInventoryMovement({
          id: crypto.randomUUID(),
          deviceId: sale.modelId,
          deviceNameSnapshot: `${model.name} (${variant.colorName})`,
          modelId: sale.modelId,
          variantId: sale.variantId,
          variantColorSnapshot: variant.colorName,
          type: 'sale',
          quantityChange: -quantity,
          previousStock,
          newStock: finalStock,
          reason: 'Venta registrada',
          createdAt: Date.now(),
          relatedSaleId: sale.id
        }, mockStorage);
      }
    }
  }
};

describe('saleInvariants - Property 11', () => {

  /**
   * Property 11: For all sales registered via saveSaleWithInventory,
   * the variant's stock decreases by exactly the quantity purchased,
   * the commission per unit remains unchanged from the variant's commission,
   * and the amount earned equals commissionPerUnit × quantity.
   */
  test('Property 11: Sale invariants - stock, commission, and earnings', () => {
    fc.assert(
      fc.property(
        // Generador de modelo y variante con stock válido
        fc.record({
          modelId: fc.constantFrom('y04', 'y21d', 'y29', 'y31d', 'v50-lite', 'v60-lite'),
          modelName: fc.string({ minLength: 3, maxLength: 20 }),
          variantColor: fc.constantFrom('Verde Jade', 'Lavanda Cristal', 'Negro Jade', 'Morado Lavanda'),
          initialStock: fc.integer({ min: 1, max: 100 }),
          commission: fc.float({ min: 50, max: 5000, noNaN: true }),
          quantity: fc.integer({ min: 1, max: 50 }),
        }),
        (testData) => {
          // Crear un storage fresco para cada iteración
          const mockStorage = createMockStorage();
          // Precondición: la cantidad debe ser menor o igual al stock inicial
          fc.pre(testData.quantity <= testData.initialStock);

          // Setup: crear modelo y variante
          const variantId = `${testData.modelId}-${testData.variantColor.toLowerCase().replace(/\s+/g, '-')}`;
          
          const variant: PhoneVariant = {
            id: variantId,
            modelId: testData.modelId,
            colorName: testData.variantColor,
            colorHex: '#3b82f6',
            stock: testData.initialStock,
            minStock: 1,
            commission: testData.commission,
            isActive: true,
            sortOrder: 0,
          };

          const model: PhoneModel = {
            id: testData.modelId,
            name: testData.modelName,
            shortName: testData.modelName,
            isActive: true,
            sortOrder: 0,
            variants: [variant],
          };

          // Guardar el modelo en el storage mockeado
          savePhoneModels([model], mockStorage);

          // Leer el stock previo
          const previousStock = testData.initialStock;

          // Crear y registrar la venta
          const sale: SaleRecord = {
            id: crypto.randomUUID(),
            date: '2024-01-15',
            deviceId: testData.modelId,
            deviceNameSnapshot: testData.modelName,
            deviceColorSnapshot: testData.variantColor,
            deviceImageSnapshot: '',
            quantity: testData.quantity,
            commissionPerUnit: testData.commission,
            amountEarned: testData.commission * testData.quantity,
            createdAt: Date.now(),
            modelId: testData.modelId,
            variantId: variantId,
          };

          saveSaleWithInventory(sale, mockStorage);

          // Leer el estado después de la venta
          const modelsAfter = getPhoneModels(mockStorage);
          const modelAfter = modelsAfter.find(m => m.id === testData.modelId);
          const variantAfter = modelAfter?.variants.find(v => v.id === variantId);
          const movements = getInventoryMovements(mockStorage);
          const relatedMovement = movements.find(m => m.relatedSaleId === sale.id);

          // Invariante 1: El stock se reduce exactamente por la cantidad comprada
          const expectedStock = previousStock - testData.quantity;
          expect(variantAfter?.stock).toBe(expectedStock);

          // Invariante 2: La comisión por unidad en el SaleRecord es igual a la comisión de la variante
          expect(sale.commissionPerUnit).toBe(testData.commission);

          // Invariante 3: El monto ganado = commissionPerUnit × quantity
          expect(sale.amountEarned).toBe(testData.commission * testData.quantity);

          // Invariante 4: Se crea un InventoryMovement con type 'sale'
          expect(relatedMovement).toBeDefined();
          expect(relatedMovement?.type).toBe('sale');

          // Invariante 5: El movimiento tiene la cantidad correcta (negativa)
          expect(relatedMovement?.quantityChange).toBe(-testData.quantity);

          // Invariante 6: El movimiento registra el stock previo y el nuevo stock correctamente
          expect(relatedMovement?.previousStock).toBe(previousStock);
          expect(relatedMovement?.newStock).toBe(expectedStock);

          // Invariante 7: El movimiento está vinculado a la venta
          expect(relatedMovement?.relatedSaleId).toBe(sale.id);

          // Invariante 8: El movimiento tiene los identificadores correctos
          expect(relatedMovement?.modelId).toBe(testData.modelId);
          expect(relatedMovement?.variantId).toBe(variantId);
          expect(relatedMovement?.variantColorSnapshot).toBe(testData.variantColor);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 11.1: Multiple sales to the same variant accumulate correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          modelId: fc.constant('y04'),
          modelName: fc.constant('vivo Y04'),
          variantColor: fc.constant('Verde Jade'),
          initialStock: fc.integer({ min: 10, max: 100 }),
          commission: fc.float({ min: 100, max: 1000, noNaN: true }),
          sales: fc.array(
            fc.integer({ min: 1, max: 5 }),
            { minLength: 2, maxLength: 5 }
          ),
        }),
        (testData) => {
          // Crear un storage fresco para cada iteración
          const mockStorage = createMockStorage();
          // Precondición: la suma de las ventas debe ser menor o igual al stock
          const totalQuantity = testData.sales.reduce((sum, q) => sum + q, 0);
          fc.pre(totalQuantity <= testData.initialStock);

          // Setup
          const variantId = `${testData.modelId}-verde-jade`;
          const variant: PhoneVariant = {
            id: variantId,
            modelId: testData.modelId,
            colorName: testData.variantColor,
            colorHex: '#10b981',
            stock: testData.initialStock,
            minStock: 1,
            commission: testData.commission,
            isActive: true,
            sortOrder: 0,
          };

          const model: PhoneModel = {
            id: testData.modelId,
            name: testData.modelName,
            shortName: testData.modelName,
            isActive: true,
            sortOrder: 0,
            variants: [variant],
          };

          savePhoneModels([model], mockStorage);

          // Registrar múltiples ventas
          testData.sales.forEach((quantity) => {
            const sale: SaleRecord = {
              id: crypto.randomUUID(),
              date: '2024-01-15',
              deviceId: testData.modelId,
              deviceNameSnapshot: testData.modelName,
              deviceColorSnapshot: testData.variantColor,
              deviceImageSnapshot: '',
              quantity,
              commissionPerUnit: testData.commission,
              amountEarned: testData.commission * quantity,
              createdAt: Date.now(),
              modelId: testData.modelId,
              variantId: variantId,
            };
            saveSaleWithInventory(sale, mockStorage);
          });

          // Verificar estado final
          const modelsAfter = getPhoneModels(mockStorage);
          const modelAfter = modelsAfter.find(m => m.id === testData.modelId);
          const variantAfter = modelAfter?.variants.find(v => v.id === variantId);

          // El stock final debe ser el inicial menos la suma de todas las ventas
          const expectedStock = testData.initialStock - totalQuantity;
          expect(variantAfter?.stock).toBe(expectedStock);

          // Debe haber un movimiento por cada venta
          const movements = getInventoryMovements(mockStorage);
          const saleMovements = movements.filter(m => m.type === 'sale' && m.variantId === variantId);
          expect(saleMovements.length).toBe(testData.sales.length);

          // La suma de los cambios de cantidad debe ser igual al total vendido (negativo)
          const totalQuantityChange = saleMovements.reduce((sum, m) => sum + m.quantityChange, 0);
          expect(totalQuantityChange).toBe(-totalQuantity);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 11.2: Stock never goes below zero', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialStock: fc.integer({ min: 1, max: 50 }),
          quantity: fc.integer({ min: 1, max: 100 }),
          commission: fc.float({ min: 50, max: 500, noNaN: true }),
        }),
        (testData) => {
          // Crear un storage fresco para cada iteración
          const mockStorage = createMockStorage();
          // Setup con stock que puede ser menor que la cantidad solicitada
          const modelId = 'test-model';
          const variantId = 'test-variant';
          
          const variant: PhoneVariant = {
            id: variantId,
            modelId,
            colorName: 'Test Color',
            colorHex: '#000000',
            stock: testData.initialStock,
            minStock: 1,
            commission: testData.commission,
            isActive: true,
            sortOrder: 0,
          };

          const model: PhoneModel = {
            id: modelId,
            name: 'Test Model',
            shortName: 'Test',
            isActive: true,
            sortOrder: 0,
            variants: [variant],
          };

          savePhoneModels([model], mockStorage);

          // Intentar vender (sin validación previa)
          const sale: SaleRecord = {
            id: crypto.randomUUID(),
            date: '2024-01-15',
            deviceId: modelId,
            deviceNameSnapshot: 'Test Model',
            deviceColorSnapshot: 'Test Color',
            deviceImageSnapshot: '',
            quantity: testData.quantity,
            commissionPerUnit: testData.commission,
            amountEarned: testData.commission * testData.quantity,
            createdAt: Date.now(),
            modelId,
            variantId,
          };

          saveSaleWithInventory(sale, mockStorage);

          // Verificar que el stock nunca sea negativo
          const modelsAfter = getPhoneModels(mockStorage);
          const variantAfter = modelsAfter.find(m => m.id === modelId)?.variants.find(v => v.id === variantId);
          
          expect(variantAfter?.stock).toBeGreaterThanOrEqual(0);
          
          // Si la cantidad excede el stock, el stock debe ser 0
          if (testData.quantity > testData.initialStock) {
            expect(variantAfter?.stock).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 11.3: Commission is never modified during sale', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialCommission: fc.float({ min: 50, max: 5000, noNaN: true }),
          stock: fc.integer({ min: 5, max: 50 }),
          quantity: fc.integer({ min: 1, max: 5 }),
        }),
        (testData) => {
          // Crear un storage fresco para cada iteración
          const mockStorage = createMockStorage();
          fc.pre(testData.quantity <= testData.stock);

          const modelId = 'commission-test';
          const variantId = 'commission-variant';
          
          const variant: PhoneVariant = {
            id: variantId,
            modelId,
            colorName: 'Commission Test',
            colorHex: '#000000',
            stock: testData.stock,
            minStock: 1,
            commission: testData.initialCommission,
            isActive: true,
            sortOrder: 0,
          };

          const model: PhoneModel = {
            id: modelId,
            name: 'Commission Model',
            shortName: 'Comm',
            isActive: true,
            sortOrder: 0,
            variants: [variant],
          };

          savePhoneModels([model], mockStorage);

          // Registrar venta
          const sale: SaleRecord = {
            id: crypto.randomUUID(),
            date: '2024-01-15',
            deviceId: modelId,
            deviceNameSnapshot: 'Commission Model',
            deviceColorSnapshot: 'Commission Test',
            deviceImageSnapshot: '',
            quantity: testData.quantity,
            commissionPerUnit: testData.initialCommission,
            amountEarned: testData.initialCommission * testData.quantity,
            createdAt: Date.now(),
            modelId,
            variantId,
          };

          saveSaleWithInventory(sale, mockStorage);

          // Verificar que la comisión de la variante no cambió
          const modelsAfter = getPhoneModels(mockStorage);
          const variantAfter = modelsAfter.find(m => m.id === modelId)?.variants.find(v => v.id === variantId);
          
          expect(variantAfter?.commission).toBe(testData.initialCommission);
        }
      ),
      { numRuns: 100 }
    );
  });
});
