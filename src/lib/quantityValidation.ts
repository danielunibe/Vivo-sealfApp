/**
 * Validates that a quantity is valid for purchase given available stock.
 * 
 * @param quantity - The quantity to validate
 * @param stock - The available stock
 * @returns true if quantity is an integer, >= 1, and <= stock; false otherwise
 */
export function isValidQuantity(quantity: number, stock: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= stock;
}
