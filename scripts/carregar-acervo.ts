/**
 * Carrega no banco o acervo inteiro de missas que hoje vive em
 * `src/data/missas.ts` — 82 celebrações e 211 arquivos, o mapeamento do Drive
 * feito uma vez e conferido contra o calendário litúrgico.
 *
 *   npx tsx scripts/carregar-acervo.ts
 *
 * Por que existe: o seed inicial (0002) cobriu só junho a agosto de 2026, 13
 * celebrações. Enquanto o banco tiver menos do que o arquivo embarcado, trocar
 * a tela para ler do banco é perder acervo. Este script iguala os dois, e é
 * ele que torna a troca segura.
 *
 * A direção da verdade é do ARQUIVO para o BANCO, de propósito: `missas.ts` é
 * o que a equipe vê hoje e o que foi conferido contra as pastas do Drive. As
 * 13 linhas que já existiam são atualizadas para bater com ele.
 *
 * Idempotente: `ON CONFLICT DO UPDATE` em celebrações (por slug) e em arquivos
 * (por celebração + tipo). Rodar de novo não duplica nem apaga nada.
 *
 * Lê as credenciais de `.env.local` — que está no .gitignore.
 */
import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import type { InStatement } from '@libsql/client';
import { resolve } from 'node:path';
import { MISSAS } from '../src/data/missas';
import type { ArquivoMissa } from '../src/data/missas';
import {
  tempoLiturgico, anoLiturgico, semanaDoTitulo, tipoDeCelebracao,
} from '../src/lib/liturgia/derivar';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(`
Faltam as credenciais do banco. Crie .env.local (já está no .gitignore) com:

  TURSO_DATABASE_URL=libsql://app-igreja-louvor-e-alianca-burgamansi.aws-us-east-2.turso.io
  TURSO_AUTH_TOKEN=<token do Turso>
`);
  process.exit(1);
}

/** O local que o aplicativo mostra em toda parte — barra lateral, folha A4, acervo. */
const LOCAL_ID = 'loc-sao-judas';
const LOCAL_NOME = 'Paróquia São Judas Tadeu — Americana/SP';

const MIME: Record<ArquivoMissa['tipo'], string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** "Texto de trabalho" + docx → "texto-de-trabalho.docx". Sem acento, sem espaço. */
function nomeDeArquivo(arquivo: ArquivoMissa): string {
  const base = arquivo.nomeExibicao
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'arquivo';
  return `${base}.${arquivo.tipo}`;
}

const cliente = createClient({ url, authToken });

try {
  // ── O local ───────────────────────────────────────────────────────────────
  // O seed nasceu com "Paróquia Nossa Senhora de Fátima" e um TODO pedindo
  // confirmação. O aplicativo inteiro diz São Judas Tadeu, e é o que `missas.ts`
  // traz em todas as 82 linhas — então é esse que vale.
  await cliente.execute({
    sql: `INSERT INTO locais (id, nome, cidade, uf) VALUES (?, ?, 'Americana', 'SP')
          ON CONFLICT(id) DO UPDATE SET nome = excluded.nome`,
    args: [LOCAL_ID, LOCAL_NOME],
  });

  // ── Celebrações ───────────────────────────────────────────────────────────
  const celebracoes: InStatement[] = MISSAS.map((missa) => {
    const tipo = tipoDeCelebracao(missa.tipo, missa.tituloLiturgico);
    return {
      sql: `INSERT INTO celebracoes
              (id, slug, data, hora, local_id, tipo, tempo, ano_liturgico, semana,
               titulo_liturgico, titulo_exibicao, cor, status, publica, observacoes)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(slug) DO UPDATE SET
              data = excluded.data, hora = excluded.hora, local_id = excluded.local_id,
              tipo = excluded.tipo, tempo = excluded.tempo,
              ano_liturgico = excluded.ano_liturgico, semana = excluded.semana,
              titulo_liturgico = excluded.titulo_liturgico,
              titulo_exibicao = excluded.titulo_exibicao, cor = excluded.cor,
              status = excluded.status, publica = excluded.publica,
              observacoes = excluded.observacoes`,
      args: [
        `c-${missa.slug}`,
        missa.slug,
        missa.data,
        missa.hora,
        LOCAL_ID,
        tipo,
        tempoLiturgico(missa.tituloLiturgico),
        anoLiturgico(missa.data),
        tipo === 'domingo' ? semanaDoTitulo(missa.tituloLiturgico) : null,
        missa.tituloLiturgico,
        missa.tituloExibicao,
        missa.cor,
        missa.status,
        missa.status === 'publicada' ? 1 : 0,
        missa.observacao ?? null,
      ],
    };
  });

  await cliente.batch(celebracoes, 'write');
  console.log(`celebrações: ${celebracoes.length} enviadas`);

  // ── Arquivos ──────────────────────────────────────────────────────────────
  // O id da celebração vem do banco, não do palpite: as 13 que o seed criou
  // têm id no formato antigo (`c-2026-06-07`), e um INSERT com o id novo
  // quebraria a chave estrangeira.
  const { rows } = await cliente.execute('SELECT id, slug FROM celebracoes');
  const idPorSlug = new Map(rows.map((r) => [String(r.slug), String(r.id)]));

  const arquivos: InStatement[] = [];
  const semDono: string[] = [];

  for (const missa of MISSAS) {
    const celebracaoId = idPorSlug.get(missa.slug);
    if (!celebracaoId) { semDono.push(missa.slug); continue; }

    for (const arquivo of missa.arquivos) {
      arquivos.push({
        sql: `INSERT INTO arquivos
                (celebracao_id, tipo, origem, drive_file_id, nome_exibicao,
                 nome_arquivo, mime, tamanho_bytes, versao, publico)
              VALUES (?,?,'drive',?,?,?,?,?,1,?)
              ON CONFLICT(celebracao_id, tipo, versao) DO UPDATE SET
                drive_file_id = excluded.drive_file_id,
                nome_exibicao = excluded.nome_exibicao,
                nome_arquivo  = excluded.nome_arquivo,
                mime          = excluded.mime,
                tamanho_bytes = excluded.tamanho_bytes,
                publico       = excluded.publico`,
        args: [
          celebracaoId,
          arquivo.tipo,
          arquivo.driveFileId,
          arquivo.nomeExibicao,
          nomeDeArquivo(arquivo),
          MIME[arquivo.tipo],
          arquivo.tamanhoBytes,
          // O PDF é o que a página pública abre; o .docx de trabalho e o .pptx
          // de 70 MB ficam internos, como no seed original.
          arquivo.tipo === 'pdf' ? 1 : 0,
        ],
      });
    }
  }

  if (semDono.length) {
    console.error(`ATENÇÃO: ${semDono.length} missas sem id no banco:`, semDono.join(', '));
  }

  // Em lotes: 211 comandos numa tacada só estouram o limite da requisição.
  for (let i = 0; i < arquivos.length; i += 50) {
    await cliente.batch(arquivos.slice(i, i + 50), 'write');
  }
  console.log(`arquivos: ${arquivos.length} enviados`);

  // ── Conferência ───────────────────────────────────────────────────────────
  const conferencia = await cliente.execute(
    `SELECT
       (SELECT COUNT(*) FROM celebracoes)                          AS celebracoes,
       (SELECT COUNT(*) FROM v_agenda_publica)                     AS agenda_publica,
       (SELECT COUNT(*) FROM arquivos)                             AS arquivos,
       (SELECT COUNT(*) FROM v_arquivos_publicos)                  AS arquivos_publicos,
       (SELECT COUNT(*) FROM celebracoes WHERE data LIKE '2025%')  AS de_2025,
       (SELECT COUNT(*) FROM celebracoes WHERE data LIKE '2026%')  AS de_2026,
       (SELECT COUNT(*) FROM pessoas)                              AS pessoas,
       (SELECT COUNT(*) FROM escalas)                              AS escalas`
  );

  console.log('\n── o banco agora ──');
  for (const [chave, valor] of Object.entries(conferencia.rows[0])) {
    console.log(`  ${chave.padEnd(18)} ${valor}`);
  }

  const doArquivo = MISSAS.length;
  const doBanco = Number(conferencia.rows[0].celebracoes);
  console.log(
    doBanco === doArquivo
      ? `\nbanco e missas.ts batem: ${doArquivo} celebrações.\n`
      : `\nDIVERGÊNCIA: missas.ts tem ${doArquivo}, banco tem ${doBanco}.\n`
  );
} finally {
  cliente.close();
}
