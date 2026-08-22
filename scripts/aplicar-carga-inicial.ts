/**
 * Termina a carga inicial do banco — o que faltou do seed e a migration 0003.
 *
 *   npx tsx scripts/aplicar-carga-inicial.ts
 *
 * Lê TURSO_DATABASE_URL e TURSO_AUTH_TOKEN do `.env.local` (que está no
 * .gitignore). Nada de credencial neste arquivo, e nada de rota pública: é um
 * script de uma vez só, rodado da máquina de quem administra.
 *
 * Idempotente de propósito — `INSERT OR IGNORE`, `CREATE TABLE IF NOT EXISTS`.
 * Parte do seed já entrou pelo console web do Turso (config, local, as cinco
 * pessoas); rodar de novo não duplica nada, então dá para executar sem medo
 * quantas vezes for preciso.
 */
import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// O projeto usa `.env.local`, o mesmo nome que a Vercel usa localmente.
config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(`
Faltam as credenciais do banco.

Crie o arquivo .env.local na raiz do projeto (ele já está no .gitignore) com:

  TURSO_DATABASE_URL=libsql://app-igreja-louvor-e-alianca-burgamansi.aws-us-east-2.turso.io
  TURSO_AUTH_TOKEN=<o token gerado no Turso>

São exatamente os mesmos dois valores já configurados na Vercel.
`);
  process.exit(1);
}

const arquivos = [
  'db/seed/0002_seed.sql',
  'db/migrations/0003_links_musicas_cifras.sql',
] as const;

/**
 * Torna o SQL seguro para reexecução.
 *
 * O seed e a migration foram escritos para rodar uma vez, num banco vazio.
 * Aqui parte deles já rodou, então cada comando de criação ganha o seu
 * "se ainda não existir" e cada inserção passa a ignorar o que já está lá.
 */
function idempotente(sql: string): string {
  return sql
    .replace(/\bINSERT INTO\b/g, 'INSERT OR IGNORE INTO')
    .replace(/\bCREATE TABLE (?!IF NOT EXISTS)/g, 'CREATE TABLE IF NOT EXISTS ')
    .replace(/\bCREATE INDEX (?!IF NOT EXISTS)/g, 'CREATE INDEX IF NOT EXISTS ')
    .replace(/\bCREATE TRIGGER (?!IF NOT EXISTS)/g, 'CREATE TRIGGER IF NOT EXISTS ')
    .replace(/\bCREATE VIEW (?!IF NOT EXISTS)/g, 'CREATE VIEW IF NOT EXISTS ');
}

/**
 * `ALTER TABLE ... ADD COLUMN` não tem "IF NOT EXISTS" no SQLite: reexecutar
 * dá "duplicate column name". Como as colunas de cifra podem já existir, cada
 * uma vai isolada e o erro de duplicata é o único que se engole.
 */
async function adicionarColuna(
  cliente: ReturnType<typeof createClient>,
  comando: string
): Promise<'criada' | 'ja-existia'> {
  try {
    await cliente.execute(comando);
    return 'criada';
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    if (/duplicate column name/i.test(mensagem)) return 'ja-existia';
    throw erro;
  }
}

const cliente = createClient({ url, authToken });

try {
  for (const caminho of arquivos) {
    const bruto = readFileSync(resolve(process.cwd(), caminho), 'utf8');

    // Os ALTER saem do bloco principal e são aplicados um a um.
    const alters = bruto.match(/^ALTER TABLE[\s\S]*?;/gm) ?? [];
    const resto = idempotente(bruto.replace(/^ALTER TABLE[\s\S]*?;/gm, ''));

    console.log(`\n${caminho}`);

    // As colunas vem PRIMEIRO: o resto do arquivo as usa. A 0003 cria
    // `idx_musicas_youtube` sobre `youtube_id`, que e justamente uma das
    // colunas adicionadas aqui — na ordem inversa, o indice nao acha a coluna.
    for (const alter of alters) {
      const coluna = /ADD COLUMN (\w+)/.exec(alter)?.[1] ?? '?';
      const estado = await adicionarColuna(cliente, alter);
      console.log(`  coluna ${coluna}: ${estado}`);
    }

    await cliente.executeMultiple(resto);
    console.log(`  estrutura e inserções aplicadas`);

  }

  const { rows } = await cliente.execute(
    `SELECT
       (SELECT COUNT(*) FROM celebracoes)         AS celebracoes,
       (SELECT COUNT(*) FROM v_agenda_publica)    AS agenda_publica,
       (SELECT COUNT(*) FROM arquivos)            AS arquivos,
       (SELECT COUNT(*) FROM pessoas)             AS pessoas,
       (SELECT COUNT(*) FROM escalas)             AS escalas,
       (SELECT COUNT(*) FROM config)              AS config,
       (SELECT COUNT(*) FROM links)               AS links,
       (SELECT COUNT(*) FROM propostas_musicais)  AS propostas`
  );

  console.log('\n── o que existe agora no banco ──');
  for (const [chave, valor] of Object.entries(rows[0])) {
    console.log(`  ${chave.padEnd(16)} ${valor}`);
  }
  console.log('\nEsperado: 13 celebrações, 12 na agenda pública, 33 arquivos, 5 pessoas, 60 escalas.\n');
} finally {
  cliente.close();
}
