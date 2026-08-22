import { afterEach, describe, expect, it, vi } from 'vitest';
import { gravarArquivosNoBanco } from '../src/lib/acervo/gravar';
import type { ArquivoMissa } from '../src/data/missas';

const arquivos: ArquivoMissa[] = [
  { tipo: 'pdf', driveFileId: '1AbCdEfGhIjKlMnOpQrStUv', nomeExibicao: 'Roteiro', tamanhoBytes: 1234 },
];

const responder = (init: { ok: boolean; status?: number; corpo?: unknown }) =>
  vi.fn().mockResolvedValue({
    ok: init.ok,
    status: init.status ?? (init.ok ? 200 : 400),
    json: async () => init.corpo ?? {},
  });

afterEach(() => { vi.unstubAllGlobals(); });

describe('gravar a lista de arquivos no banco', () => {
  it('manda slug e arquivos no corpo, como JSON', async () => {
    const fetchFalso = responder({ ok: true });
    vi.stubGlobal('fetch', fetchFalso);

    const r = await gravarArquivosNoBanco('2026-08-23-21-domingo-tempo-comum', arquivos);

    expect(r).toEqual({ ok: true });
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe('/api/arquivos');
    expect(opcoes.method).toBe('POST');
    expect(JSON.parse(opcoes.body)).toEqual({
      slug: '2026-08-23-21-domingo-tempo-comum',
      arquivos: [
        { tipo: 'pdf', driveFileId: '1AbCdEfGhIjKlMnOpQrStUv', nomeExibicao: 'Roteiro', tamanhoBytes: 1234 },
      ],
    });
  });

  it('lista vazia é pedido válido — é assim que se apaga o último arquivo', async () => {
    vi.stubGlobal('fetch', responder({ ok: true }));
    expect(await gravarArquivosNoBanco('missa-x', [])).toEqual({ ok: true });
  });

  it('recusa do servidor devolve o motivo que ele explicou', async () => {
    vi.stubGlobal('fetch', responder({ ok: false, status: 400, corpo: { erro: 'Tipo de arquivo inválido: exe.' } }));

    const r = await gravarArquivosNoBanco('missa-x', arquivos);
    expect(r).toEqual({ ok: false, motivo: 'Tipo de arquivo inválido: exe.' });
  });

  it('recusa sem corpo legível ainda diz o código HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 500, json: async () => { throw new Error('não é JSON'); },
    }));

    const r = await gravarArquivosNoBanco('missa-x', arquivos);
    expect(r.ok).toBe(false);
    expect(r).toMatchObject({ motivo: expect.stringContaining('500') });
  });

  it('sem rede devolve falha de conexão — é o que faz a tela cair no aparelho', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const r = await gravarArquivosNoBanco('missa-x', arquivos);
    expect(r).toEqual({ ok: false, motivo: 'Sem conexão com o servidor.' });
  });

  it('nunca devolve ok quando a requisição falhou — "salvo" falso é o pior desfecho', async () => {
    for (const fetchFalso of [
      vi.fn().mockRejectedValue(new Error('caiu')),
      responder({ ok: false, status: 404, corpo: { erro: 'Missa não encontrada' } }),
      responder({ ok: false, status: 503 }),
    ]) {
      vi.stubGlobal('fetch', fetchFalso);
      expect((await gravarArquivosNoBanco('missa-x', arquivos)).ok).toBe(false);
    }
  });
});
