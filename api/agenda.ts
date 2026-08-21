// GET /api/agenda            → todas as missas publicadas, em ordem de data
// GET /api/agenda?de=2026-08-01&ate=2026-08-31  → recorte por período
//
// Lê da view v_agenda_publica, que já filtra publica = 1 e status = 'publicada'.
// É a fonte da "Agenda por Missas" e da listagem em /missas.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const de = typeof req.query.de === 'string' ? req.query.de : null;
  const ate = typeof req.query.ate === 'string' ? req.query.ate : null;

  try {
    const { rows } = de && ate
      ? await db().execute({
          sql: 'SELECT * FROM v_agenda_publica WHERE data BETWEEN ? AND ?',
          args: [de, ate],
        })
      : await db().execute('SELECT * FROM v_agenda_publica');

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ missas: rows });
  } catch (erro) {
    console.error('[api/agenda]', erro);
    return res.status(500).json({ erro: 'Falha ao consultar a agenda' });
  }
}
