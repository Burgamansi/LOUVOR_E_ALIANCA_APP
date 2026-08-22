import { describe, expect, it } from 'vitest';
import { converter, mesclar } from '../src/lib/acervo/mesclar';
import type { MissaDaApi } from '../src/lib/acervo/mesclar';
import type { Missa } from '../src/data/missas';
import { MISSAS } from '../src/data/missas';

const daApi = (over: Partial<MissaDaApi> = {}): MissaDaApi => ({
  slug: '2026-08-02-18-domingo-tempo-comum',
  data: '2026-08-02',
  hora: '09:00',
  tipo: 'domingo',
  tituloLiturgico: '18º Domingo do Tempo Comum',
  tituloExibicao: 'Missa das 9h — 18º Domingo do Tempo Comum',
  cor: 'verde',
  status: 'publicada',
  local: 'Paróquia São Judas Tadeu — Americana/SP',
  observacao: null,
  arquivos: [
    { tipo: 'pdf', driveFileId: 'abc123', nomeExibicao: 'Roteiro', tamanhoBytes: 1000 },
  ],
  ...over,
});

const embarcada = (over: Partial<Missa> = {}): Missa => ({
  slug: '2026-08-02-18-domingo-tempo-comum',
  data: '2026-08-02',
  hora: '09:00',
  tipo: 'domingo',
  tituloLiturgico: '18º Domingo do Tempo Comum',
  tituloExibicao: 'Missa das 9h — 18º Domingo do Tempo Comum',
  cor: 'verde',
  status: 'publicada',
  local: 'Paróquia São Judas Tadeu — Americana/SP',
  arquivos: [
    { tipo: 'pdf', driveFileId: 'antigo', nomeExibicao: 'Roteiro', tamanhoBytes: 500 },
  ],
  ...over,
});

describe('converter uma linha da API', () => {
  it('traduz para o formato que a tela desenha', () => {
    const m = converter(daApi());
    expect(m).toMatchObject({
      slug: '2026-08-02-18-domingo-tempo-comum',
      tipo: 'domingo',
      cor: 'verde',
      status: 'publicada',
    });
    expect(m?.arquivos).toEqual([
      { tipo: 'pdf', driveFileId: 'abc123', nomeExibicao: 'Roteiro', tamanhoBytes: 1000 },
    ]);
  });

  it('"festa" vira domingo — a tela só usa o tipo para o selo de Solenidade', () => {
    expect(converter(daApi({ tipo: 'festa' }))?.tipo).toBe('domingo');
    expect(converter(daApi({ tipo: 'solenidade' }))?.tipo).toBe('solenidade');
  });

  it('descarta linha sem slug ou sem data, em vez de derrubar a lista', () => {
    expect(converter(daApi({ slug: '' }))).toBeNull();
    expect(converter(daApi({ data: '' }))).toBeNull();
  });

  it('descarta cor que a tela não sabe pintar', () => {
    expect(converter(daApi({ cor: 'dourado' }))).toBeNull();
    expect(converter(daApi({ cor: 'roxo' }))?.cor).toBe('roxo');
  });

  it('ignora arquivo de tipo desconhecido ou sem id do Drive', () => {
    const m = converter(daApi({
      arquivos: [
        { tipo: 'pdf', driveFileId: 'ok', nomeExibicao: 'Roteiro', tamanhoBytes: 1 },
        { tipo: 'exe', driveFileId: 'x', nomeExibicao: 'Estranho', tamanhoBytes: 1 },
        { tipo: 'pdf', driveFileId: null, nomeExibicao: 'Sem id', tamanhoBytes: 1 },
      ],
    }));
    expect(m?.arquivos.map((a) => a.driveFileId)).toEqual(['ok']);
  });

  it('só inclui observação quando existe', () => {
    expect(converter(daApi())).not.toHaveProperty('observacao');
    expect(converter(daApi({ observacao: 'sem pptx' }))?.observacao).toBe('sem pptx');
  });
});

describe('mesclar banco com embarcado — nunca subtrai', () => {
  it('o banco vence onde as duas fontes falam da mesma celebração', () => {
    const r = mesclar([embarcada()], [daApi()]);
    expect(r).toHaveLength(1);
    expect(r[0].arquivos[0].driveFileId).toBe('abc123');   // o do banco
  });

  it('o que só existe embarcado continua aparecendo', () => {
    const so2025 = embarcada({ slug: '2025-06-08-pentecostes', data: '2025-06-08' });
    const r = mesclar([so2025, embarcada()], [daApi()]);
    expect(r.map((m) => m.slug)).toContain('2025-06-08-pentecostes');
    expect(r).toHaveLength(2);
  });

  it('o que só existe no banco entra', () => {
    const nova = daApi({ slug: '2026-09-06-23-domingo-tempo-comum', data: '2026-09-06' });
    const r = mesclar([embarcada()], [nova]);
    expect(r).toHaveLength(2);
    expect(r[0].slug).toBe('2026-09-06-23-domingo-tempo-comum');   // mais recente primeiro
  });

  it('banco vazio devolve o acervo embarcado intacto', () => {
    expect(mesclar(MISSAS, [])).toHaveLength(MISSAS.length);
  });

  it('celebração sem arquivos no banco mantém os arquivos que já conhecíamos', () => {
    const r = mesclar([embarcada()], [daApi({ arquivos: [] })]);
    expect(r[0].arquivos).toHaveLength(1);
    expect(r[0].arquivos[0].driveFileId).toBe('antigo');
  });

  it('mas uma celebração nova sem arquivos entra vazia mesmo', () => {
    const r = mesclar([], [daApi({ arquivos: [] })]);
    expect(r[0].arquivos).toEqual([]);
  });

  it('sai em ordem de data, da mais recente para a mais antiga', () => {
    const r = mesclar(
      [
        embarcada({ slug: 'a', data: '2025-01-01' }),
        embarcada({ slug: 'c', data: '2026-12-01' }),
        embarcada({ slug: 'b', data: '2026-01-01' }),
      ],
      []
    );
    expect(r.map((m) => m.data)).toEqual(['2026-12-01', '2026-01-01', '2025-01-01']);
  });

  it('linha inválida do servidor não derruba as válidas', () => {
    const r = mesclar([], [daApi({ slug: 'boa' }), daApi({ slug: '' })]);
    expect(r.map((m) => m.slug)).toEqual(['boa']);
  });

  it('o acervo real sobrevive a uma resposta vazia — 82 celebrações continuam de pé', () => {
    const r = mesclar(MISSAS, []);
    expect(r).toHaveLength(82);
    expect(r.reduce((s, m) => s + m.arquivos.length, 0)).toBe(211);
  });
});
