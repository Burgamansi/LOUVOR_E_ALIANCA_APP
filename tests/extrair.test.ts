import { describe, expect, it } from 'vitest';
import { extrairDocx } from '../src/lib/cifras/extrair/docx';
import { reconstruirLinhas } from '../src/lib/cifras/extrair/pdf';
import { MARCADOR_REVISAO } from '../src/lib/cifras/tipos';
import { analisarConteudo } from '../src/lib/cifras/importar';
import { normalizarTexto } from '../src/lib/cifras/importar';
import { montarDocx } from './_docx';

describe('Word com imagens no meio da cifra', () => {
  it('preserva a ordem texto → imagem → texto → imagem e marca cada imagem para revisão', async () => {
    const docx = montarDocx([
      { tipo: 'texto', linhas: ['ENTRADA', 'G          C         G', 'Como é bom a gente se encontrar'] },
      { tipo: 'imagem' },
      { tipo: 'texto', linhas: ['D7                    G', 'Neste lugar onde o amor de Deus reluz'] },
      { tipo: 'imagem' },
    ]);

    const { texto, imagens } = await extrairDocx(docx);
    const linhas = texto.split('\n');

    expect(linhas[0]).toBe('ENTRADA');
    expect(linhas[1]).toBe('G          C         G');           // espaços intactos
    expect(linhas[2]).toBe('Como é bom a gente se encontrar');
    expect(linhas[3]).toContain(`${MARCADOR_REVISAO} Imagem 1 (imagem-1.png)`);
    expect(linhas[4]).toBe('D7                    G');
    expect(linhas[5]).toBe('Neste lugar onde o amor de Deus reluz');
    expect(linhas[6]).toContain(`${MARCADOR_REVISAO} Imagem 2 (imagem-2.png)`);

    expect(imagens).toHaveLength(2);
    expect(imagens[0].dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(imagens[1].indice).toBe(2);
  });

  it('o diagnóstico conta as imagens como trechos a revisar, sem inventar acorde', async () => {
    const docx = montarDocx([
      { tipo: 'texto', linhas: ['G   C', 'Cantai'] },
      { tipo: 'imagem' },
    ]);
    const { texto, imagens } = await extrairDocx(docx);
    const d = analisarConteudo(normalizarTexto(texto), 'docx', imagens);

    expect(d.paraRevisar).toBe(1);
    expect(d.acordes).toEqual(['G', 'C']);
    expect(d.imagens).toHaveLength(1);
    expect(d.cifra.linhas.find((l) => l.tipo === 'revisao')).toMatchObject({ origem: 'marcador' });
  });

  it('acordes em tabela viram linha com as células separadas', async () => {
    const docx = montarDocx([
      { tipo: 'tabela', linhas: [['G', 'C', 'G'], ['Como é bom', 'a gente', 'se encontrar']] },
    ]);
    const { texto } = await extrairDocx(docx);
    expect(texto.split('\n')[0]).toBe('G\tC\tG');
    expect(normalizarTexto(texto).split('\n')[0]).toBe('G    C    G');
  });

  it('documento só de texto continua igual ao de antes', async () => {
    const docx = montarDocx([{ tipo: 'texto', linhas: ['Refrão', 'Am   E7', 'Senhor, tende piedade'] }]);
    const { texto, imagens } = await extrairDocx(docx);
    expect(texto).toBe('Refrão\nAm   E7\nSenhor, tende piedade');
    expect(imagens).toEqual([]);
  });
});

describe('PDF — reconstrução das colunas a partir das posições', () => {
  // Fonte monoespaçada de 6 pt de largura por caractere, origem x = 50.
  const item = (str: string, col: number, y: number) => ({
    str, x: 50 + col * 6, y, largura: str.length * 6, altura: 10,
  });

  it('acorde sobre a sílaba certa: a coluna sai da posição x', () => {
    const linhas = reconstruirLinhas([
      item('Como é bom a gente se encontrar', 0, 700),
      item('G', 0, 712), item('C', 11, 712), item('G', 21, 712),
      item('Neste lugar', 0, 676),
      item('D7', 7, 688),
    ]);
    expect(linhas).toEqual([
      'G          C         G',
      'Como é bom a gente se encontrar',
      '       D7',
      'Neste lugar',
    ]);
  });

  it('pedaços da mesma linha com y ligeiramente diferente ficam juntos', () => {
    const linhas = reconstruirLinhas([
      item('G', 0, 712), { ...item('C', 11, 712), y: 713.4 },
    ]);
    expect(linhas).toEqual(['G          C']);
  });

  it('dois pedaços que se sobreporiam não se engolem', () => {
    const linhas = reconstruirLinhas([item('Senhor', 0, 700), item('piedade', 3, 700)]);
    expect(linhas).toEqual(['Senhor piedade']);
  });

  it('página sem texto devolve nenhuma linha (vira imagem no extrator)', () => {
    expect(reconstruirLinhas([])).toEqual([]);
    expect(reconstruirLinhas([{ str: '   ', x: 0, y: 0, largura: 0, altura: 0 }])).toEqual([]);
  });
});
