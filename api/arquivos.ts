// POST /api/arquivos — grava a lista de arquivos de uma celebração.
//
// Recebe a lista inteira daquela missa, não um arquivo por vez. É o formato
// que a tela já tem em mãos (ela edita um array e salva), e evita o problema
// clássico de sincronizar remoções: se o arquivo sumiu da lista, sumiu do
// banco, sem precisar de uma rota de exclusão separada.
//
// ── Sobre o acesso ────────────────────────────────────────────────────────
// Esta rota NÃO tem autenticação, porque o aplicativo ainda não tem login.
// Quem descobrir o endereço consegue reescrever a lista de arquivos de uma
// missa. Três coisas limitam o estrago, e é bom que fiquem explícitas:
//
//  · não há nada sensível aqui — são ids de arquivos do Drive que já estão
//    compartilhados como "qualquer pessoa com o link";
//  · a validação é fechada: só slugs que existem, só três tipos de arquivo,
//    só id com a cara de id do Drive, no máximo 20 arquivos por celebração.
//    Não dá para escrever nada arbitrário;
//  · é recuperável: `src/data/missas.ts` continua sendo a fonte de verdade do
//    acervo, e `scripts/carregar-acervo.ts` reescreve tudo a qualquer momento.
//
// Ainda assim, isto é uma lacuna real e o próximo passo de segurança do
// projeto é login para a equipe. Está anotado aqui para não virar surpresa.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_db.js';

const TIPOS = new Set(['pdf', 'docx', 'pptx']);

/** O id de um arquivo do Drive: 20+ caracteres de letra, número, hífen ou sublinhado. */
const RE_DRIVE_ID = /^[\w-]{20,120}$/;

const MAX_ARQUIVOS = 20;
const MAX_NOME = 120;

interface ArquivoRecebido {
  tipo: string;
  driveFileId: string;
  nomeExibicao: string;
  tamanhoBytes?: number;
}

/** Devolve a lista limpa, ou a primeira razão para recusar. */
function validar(bruto: unknown): { arquivos: ArquivoRecebido[] } | { erro: string } {
  if (!Array.isArray(bruto)) return { erro: 'A lista de arquivos precisa ser um array.' };
  if (bruto.length > MAX_ARQUIVOS) return { erro: `No máximo ${MAX_ARQUIVOS} arquivos por celebração.` };

  const arquivos: ArquivoRecebido[] = [];

  for (const item of bruto) {
    const a = item as Partial<ArquivoRecebido>;

    if (typeof a?.tipo !== 'string' || !TIPOS.has(a.tipo)) {
      return { erro: `Tipo de arquivo inválido: ${String(a?.tipo)}.` };
    }
    if (typeof a?.driveFileId !== 'string' || !RE_DRIVE_ID.test(a.driveFileId)) {
      return { erro: 'Id do arquivo no Drive inválido.' };
    }
    const nome = typeof a?.nomeExibicao === 'string' ? a.nomeExibicao.trim() : '';
    if (!nome) return { erro: 'Todo arquivo precisa de um nome.' };

    const tamanho = Number(a?.tamanhoBytes ?? 0);

    arquivos.push({
      tipo: a.tipo,
      driveFileId: a.driveFileId,
      nomeExibicao: nome.slice(0, MAX_NOME),
      tamanhoBytes: Number.isFinite(tamanho) && tamanho > 0 ? Math.floor(tamanho) : 0,
    });
  }

  return { arquivos };
}

/** "Texto de trabalho" + docx → "texto-de-trabalho.docx". */
function nomeDeArquivo(nomeExibicao: string, tipo: string): string {
  const base = nomeExibicao
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'arquivo';
  return `${base}.${tipo}`;
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const slug = String((req.body as { slug?: unknown })?.slug ?? '');
  if (!/^[a-z0-9-]{8,120}$/.test(slug)) {
    return res.status(400).json({ erro: 'Slug inválido' });
  }

  const conferido = validar((req.body as { arquivos?: unknown })?.arquivos);
  if ('erro' in conferido) return res.status(400).json({ erro: conferido.erro });

  try {
    const cliente = db();

    const celebracao = await cliente.execute({
      sql: 'SELECT id FROM celebracoes WHERE slug = ?',
      args: [slug],
    });
    if (celebracao.rows.length === 0) {
      return res.status(404).json({ erro: 'Missa não encontrada' });
    }
    const celebracaoId = String(celebracao.rows[0].id);

    // A tabela tem UNIQUE (celebracao_id, tipo, versao). Dois arquivos do
    // mesmo tipo na mesma missa — dois PDFs, por exemplo — são legítimos, e
    // é a versão que os separa: o primeiro PDF vira versão 1, o segundo
    // versão 2. Sem isto o segundo seria recusado pelo banco.
    const versaoPorTipo = new Map<string, number>();

    const comandos = [
      // Trocar a lista inteira: o que sumiu da tela some do banco.
      { sql: 'DELETE FROM arquivos WHERE celebracao_id = ?', args: [celebracaoId] },
      ...conferido.arquivos.map((a) => {
        const versao = (versaoPorTipo.get(a.tipo) ?? 0) + 1;
        versaoPorTipo.set(a.tipo, versao);
        return {
          sql: `INSERT INTO arquivos
                  (celebracao_id, tipo, origem, drive_file_id, nome_exibicao,
                   nome_arquivo, mime, tamanho_bytes, versao, publico)
                VALUES (?,?,'drive',?,?,?,?,?,?,?)`,
          args: [
            celebracaoId,
            a.tipo,
            a.driveFileId,
            a.nomeExibicao,
            nomeDeArquivo(a.nomeExibicao, a.tipo),
            MIME[a.tipo] ?? null,
            a.tamanhoBytes ?? 0,
            versao,
            a.tipo === 'pdf' ? 1 : 0,
          ],
        };
      }),
    ];

    // Em transação: apagar e não conseguir reinserir deixaria a missa sem
    // arquivo nenhum, que é pior do que não ter salvado.
    await cliente.batch(comandos, 'write');

    return res.status(200).json({ ok: true, slug, gravados: conferido.arquivos.length });
  } catch (erro) {
    console.error('[api/arquivos]', erro);
    return res.status(500).json({ erro: 'Falha ao gravar os arquivos' });
  }
}
