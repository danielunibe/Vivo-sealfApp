import { PhoneVariant } from '../types';

/**
 * Resumen de agregación para una Model_Card del catálogo.
 * - `totalStock`: suma del stock de las variantes provistas.
 * - `minMargin` / `maxMargin`: mínimo y máximo de las comisiones (commission).
 * - `hasVariants`: indica si la lista contenía al menos una variante.
 *
 * La función es PURA: no lee ni escribe estado externo. Se espera recibir
 * las variantes ACTIVAS ya filtradas (p.ej. vía `getActiveOrderedVariants`).
 *
 * Requirements: 5.3 (stock total = suma del stock de variantes activas;
 * rango de margen = min y max de sus commission).
 */
export interface ModelStockAndMarginSummary {
  totalStock: number;
  minMargin: number;
  maxMargin: number;
  hasVariants: boolean;
}

const safeNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export const getModelStockAndMarginSummary = (
  variants: PhoneVariant[] | undefined | null,
): ModelStockAndMarginSummary => {
  const list = Array.isArray(variants) ? variants : [];
  const totalStock = list.reduce((sum, variant) => sum + safeNumber(variant?.stock), 0);
  const margins = list.map((variant) => safeNumber(variant?.commission));
  const hasVariants = list.length > 0;
  const minMargin = margins.length > 0 ? Math.min(...margins) : 0;
  const maxMargin = margins.length > 0 ? Math.max(...margins) : 0;

  return { totalStock, minMargin, maxMargin, hasVariants };
};

/**
 * Texto de rango de margen para la UI: un único valor si min == max,
 * o "min - max" en caso contrario.
 */
export const formatMarginRange = (minMargin: number, maxMargin: number): string =>
  minMargin === maxMargin ? `$${minMargin}` : `$${minMargin} - $${maxMargin}`;
