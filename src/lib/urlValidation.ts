/**
 * Valida que una cadena sea una URL absoluta con esquema https.
 * 
 * @param url - La cadena a validar
 * @returns true si es una URL absoluta válida con esquema https; false en caso contrario
 * 
 * @example
 * isValidHttpsUrl('https://www.vivo.com/mx/products/y04') // true
 * isValidHttpsUrl('http://www.vivo.com/mx/products/y04')  // false (http, no https)
 * isValidHttpsUrl('/products/y04')                        // false (relativa)
 * isValidHttpsUrl('not-a-url')                            // false (inválida)
 * isValidHttpsUrl('')                                      // false (vacía)
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    // La URL no es válida (relativa, malformada, etc.)
    return false;
  }
}

