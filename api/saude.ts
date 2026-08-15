// GET /api/saude — diagnóstico de deploy.
//
// Existe porque a falha típica desta integração é silenciosa: variável de
// ambiente ausente na Vercel e migration não aplicada dão o MESMO 500 genérico.
// Esta rota separa os dois casos sem nunca expor o token.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  const ambiente = {
    // Só o host, nunca a URL completa nem o token.
    TURSO_DATABASE_URL: url ? `configurada (${url.replace(/^\w+:\/\//, '').split('.')[0]}…)` : 'AUSENTE',
    TURSO_AUTH_TOKEN: token ? `configurado (${token.length} caracteres)` : 'AUSENTE',
  };

  if (!url || !token) {
    return res.status(503).json({
      ok: false,
      etapa: 'ambiente',
      ambiente,
      dica: 'Configure as duas em Vercel → Settings → Environment Variables e refaça o deploy.',
    });
  }

  try {
    const { rows } = await db().execute(
      `SELECT
         (SELECT COUNT(*) FROM celebracoes)             AS celebracoes,
         (SELECT COUNT(*) FROM v_agenda_publica)        AS agenda_publica,
         (SELECT COUNT(*) FROM arquivos)                AS arquivos,
         (SELECT COUNT(*) FROM pessoas)                 AS pessoas`
    );
    return res.status(200).json({ ok: true, etapa: 'pronto', ambiente, contagens: rows[0] });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    const semTabela = /no such table|no such view/i.test(mensagem);
    return res.status(503).json({
      ok: false,
      etapa: semTabela ? 'migrations' : 'conexao',
      ambiente,
      erro: mensagem,
      dica: semTabela
        ? 'Aplique db/migrations/0001_init.sql, db/seed/0002_seed.sql e db/migrations/0003_links_musicas_cifras.sql.'
        : 'Confira a URL e o token do banco no Turso.',
    });
  }
}
