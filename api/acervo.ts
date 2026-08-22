// GET /api/acervo — o acervo inteiro numa requisição só.
//
// Por que existe, se já há /api/agenda e /api/missa/[slug]:
//
//  · `/api/agenda` devolve as celebrações sem os arquivos, e a tela de Missas
//    mostra a contagem de arquivos em cada cartão da lista. Sem eles, cada
//    cartão precisaria de uma requisição — 82 delas para desenhar uma lista.
//  · `/api/missa/[slug]` devolve os arquivos de UMA celebração, e só os
//    públicos. A tela do ministério mostra os três (roteiro em PDF, texto de
//    trabalho em .docx, projeção em .pptx) — é a ferramenta interna da equipe,
//    não a página pública.
//
// São 82 celebrações e 211 arquivos: um punhado de dezenas de KB. Uma
// requisição, uma resposta, e a tela desenha inteira.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_db.js';

interface ArquivoDaResposta {
  tipo: string;
  driveFileId: string | null;
  nomeExibicao: string;
  tamanhoBytes: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const cliente = db();

    // As duas leituras vão juntas: são independentes e a segunda é a maior.
    const [celebracoes, arquivos] = await Promise.all([
      cliente.execute(
        `SELECT c.slug, c.data, c.hora, c.tipo, c.titulo_liturgico, c.titulo_exibicao,
                c.cor, c.status, c.observacoes,
                COALESCE(l.nome, '') AS local_nome
         FROM celebracoes c
         LEFT JOIN locais l ON l.id = c.local_id
         WHERE c.status <> 'arquivada'
         ORDER BY c.data DESC, c.hora DESC`
      ),
      cliente.execute(
        `SELECT c.slug AS celebracao_slug, a.tipo, a.drive_file_id,
                a.nome_exibicao, a.tamanho_bytes
         FROM arquivos a
         JOIN celebracoes c ON c.id = a.celebracao_id
         WHERE c.status <> 'arquivada'
         ORDER BY a.tipo`
      ),
    ]);

    // Agrupa os arquivos pela celebração antes de montar a resposta: um laço
    // por celebração dentro de outro por arquivo seria 82 × 211 comparações
    // para uma coisa que um mapa resolve numa passada.
    const porSlug = new Map<string, ArquivoDaResposta[]>();
    for (const linha of arquivos.rows) {
      const slug = String(linha.celebracao_slug);
      const lista = porSlug.get(slug) ?? [];
      lista.push({
        tipo: String(linha.tipo),
        driveFileId: linha.drive_file_id === null ? null : String(linha.drive_file_id),
        nomeExibicao: String(linha.nome_exibicao),
        tamanhoBytes: Number(linha.tamanho_bytes ?? 0),
      });
      porSlug.set(slug, lista);
    }

    const missas = celebracoes.rows.map((c) => ({
      slug: String(c.slug),
      data: String(c.data),
      hora: String(c.hora),
      tipo: String(c.tipo),
      tituloLiturgico: String(c.titulo_liturgico),
      tituloExibicao: String(c.titulo_exibicao),
      cor: String(c.cor),
      status: String(c.status),
      local: String(c.local_nome),
      observacao: c.observacoes === null ? null : String(c.observacoes),
      arquivos: porSlug.get(String(c.slug)) ?? [],
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ missas });
  } catch (erro) {
    console.error('[api/acervo]', erro);
    return res.status(500).json({ erro: 'Falha ao consultar o acervo' });
  }
}
