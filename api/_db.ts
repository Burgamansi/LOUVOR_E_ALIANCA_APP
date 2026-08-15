// Cliente Turso — SOMENTE servidor.
//
// Este arquivo vive em /api de propósito. O Turso não tem Row Level Security:
// quem tem o token tem o banco inteiro, para ler e para escrever. Se o token
// entrasse no bundle do Vite (qualquer variável `VITE_*` entra), ele estaria
// visível em "ver código-fonte" para qualquer visitante da página pública.
//
// Por isso as variáveis NÃO têm o prefixo VITE_ e o front-end nunca fala com o
// Turso direto: ele chama /api/*, que roda como função serverless na Vercel.

// A entrada '/web' é obrigatória aqui, não uma preferência.
//
// O '@libsql/client' padrão carrega o binding nativo (@libsql/linux-x64-gnu,
// um .node) para suportar banco em arquivo local. O empacotador de funções da
// Vercel não inclui binário nativo, e o import estoura no carregamento do
// módulo — antes do try/catch do handler. O sintoma é exatamente
// FUNCTION_INVOCATION_FAILED: a página de crash da Vercel em vez do nosso JSON.
//
// A entrada '/web' é HTTP puro, sem dependência nativa, e atende libsql:// e
// https:// remotos — o nosso caso. Só não abre banco em arquivo, coisa que uma
// função serverless não faz mesmo.
import { createClient, type Client } from '@libsql/client/web';

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
