import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';

// Configuración de testing aislada (Vitest + fast-check) sobre Vite 6.
// - Dependencia de desarrollo: NO afecta el empaquetado Android (dev-only).
// - Entorno por defecto `node` para lógica pura (src/lib/**).
// - Para tests de componentes, forzar jsdom por archivo con el docblock:
//     // @vitest-environment jsdom
// - Convención del proyecto: cada test de propiedad corre >= 100 iteraciones
//   mediante `fc.assert(fc.property(...), { numRuns: 100 })`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
