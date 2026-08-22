import { defineConfig } from 'vitest/config';

// Testes de lógica pura (parser, transposição, validação de upload). Rodam em
// Node, sem DOM: nada aqui depende de React ou de navegador.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
