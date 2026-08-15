// GET /api/missa/2026-08-02-18-domingo-tempo-comum
//
// O `slug` da URL é o mesmo `slug` do banco. Um identificador só, do banco à
// página pública ao nome do arquivo — é isso que garante que o nome da missa
// nunca divirja entre a Agenda e a página.
//
// Devolve a celebração, o repertório na ordem litúrgica e os arquivos públicos
// (hoje, o PDF do roteiro; o pptx de ~70 MB fica no Drive e não é público).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const slug = String(req.query.slug ?? '');
  if (!/^[a-z0-9-]{8,120}$/.test(slug)) {
    return res.status(400).json({ erro: 'Slug inválido' });
  }

  try {
    const cliente = db();

    const celebracao = await cliente.execute({
      sql: 'SELECT * FROM v_agenda_publica WHERE slug = ?',
      args: [slug],
    });

    if (celebracao.rows.length === 0) {
      return res.status(404).json({ erro: 'Missa não encontrada' });
    }

    const [repertorio, arquivos] = await Promise.all([
      cliente.execute({
        sql: `SELECT r.momento, r.ordem, r.tom_execucao, r.status,
                     m.titulo, m.autor, m.youtube_url,
                     p.apelido, p.nome AS responsavel_nome
              FROM repertorio r
              JOIN celebracoes c ON c.id = r.celebracao_id
              JOIN musicas     m ON m.id = r.musica_id
              LEFT JOIN pessoas p ON p.id = r.responsavel_id
              WHERE c.slug = ?
              ORDER BY r.ordem`,
        args: [slug],
      }),
      cliente.execute({
        sql: 'SELECT tipo, nome_exibicao, nome_arquivo, tamanho_bytes, url FROM v_arquivos_publicos WHERE celebracao_slug = ?',
        args: [slug],
      }),
    ]);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({
      missa: celebracao.rows[0],
      repertorio: repertorio.rows,
      arquivos: arquivos.rows,
    });
  } catch (erro) {
    console.error('[api/missa]', erro);
    return res.status(500).json({ erro: 'Falha ao consultar a missa' });
  }
}
