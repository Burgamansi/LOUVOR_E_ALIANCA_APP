// Cliente Turso — SOMENTE servidor.
//
// Este arquivo vive em /api de propósito. O Turso não tem Row Level Security:
// quem tem o token tem o banco inteiro, para ler e para escrever. Se o token
// entrasse no bundle do Vite (qualquer variável `VITE_*` entra), ele estaria
// visível em "ver código-fonte" para qualquer visitante da página pública.
//
// Por isso as variáveis NÃO têm o prefixo VITE_ e o front-end nunca fala com o
// Turso direto: ele chama /api/*, que roda como função serverless na Vercel.

import { createClient, type Client } from '@libsql/client';

let cliente: Client | null = null;

export function db(): Client {
  if (cliente) return cliente;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) throw new Error('TURSO_DATABASE_URL não configurada nas variáveis de ambiente.');
  if (!authToken) throw new Error('TURSO_AUTH_TOKEN não configurada nas variáveis de ambiente.');

  cliente = createClient({ url, authToken });
  return cliente;
}
