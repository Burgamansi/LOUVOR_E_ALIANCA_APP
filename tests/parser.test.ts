import { describe, expect, it } from 'vitest';
import {
  analisarCifra, ehLinhaDeAcordes, deduzirTom, paraTexto,
  classificarSecao, lerMarcadorDeRevisao, ehLinhaMista,
} from '../src/lib/cifras/parser';
import { renderizar } from '../src/lib/cifras/render';
import { MARCADOR_REVISAO, linhasParaRevisar, confiancaDaCifra } from '../src/lib/cifras/tipos';
import { importarTexto } from '../src/lib/cifras/importar';

describe('classificação de linha', () => {
  it('linha só de acordes, esparsa', () => {
    expect(ehLinhaDeAcordes('G          C         G')).toBe(true);
  });
  it('linha de acordes com naipe e baixo', () => {
    expect(ehLinhaDeAcordes('   Bb        F/A      Gm7      Cm')).toBe(true);
  });
  it('linha com símbolos de compasso', () => {
    expect(ehLinhaDeAcordes('| G | D | Em | C |')).toBe(true);
  });
  it('linha só de letra', () => {
    expect(ehLinhaDeAcordes('Como é bom a gente se encontrar')).toBe(false);
  });
  it('letra começando com "E" ou "A" não é acorde', () => {
    expect(ehLinhaDeAcordes('E a paz que vem de Ti nos faz cantar')).toBe(false);
    expect(ehLinhaDeAcordes('A Deus Pai')).toBe(false);
  });
  it('linha vazia não é acorde', () => {
    expect(ehLinhaDeAcordes('')).toBe(false);
    expect(ehLinhaDeAcordes('    ')).toBe(false);
  });
});

describe('analisarCifra', () => {
  it('linha só de acordes vira tipo acordes', () => {
    const c = analisarCifra('G  D  Em  C', 'G');
    expect(c.linhas[0]).toEqual({
      tipo: 'acordes',
      acordes: [{ col: 0, acorde: 'G' }, { col: 3, acorde: 'D' }, { col: 6, acorde: 'Em' }, { col: 10, acorde: 'C' }],
    });
  });

  it('linha só de letra vira letra sem âncoras', () => {
    const c = analisarCifra('Como é bom a gente se encontrar', 'G');
    expect(c.linhas[0]).toEqual({ tipo: 'letra', texto: 'Como é bom a gente se encontrar', acordes: [] });
  });

  it('acorde + letra: âncoras nas colunas dos acordes, letra intacta', () => {
    const c = analisarCifra('G          C         G\nComo é bom a gente se encontrar', 'G');
    expect(c.linhas).toHaveLength(1);
    const l = c.linhas[0];
    if (l.tipo !== 'letra') throw new Error('esperava letra');
    expect(l.texto).toBe('Como é bom a gente se encontrar');
    expect(l.acordes).toEqual([{ col: 0, acorde: 'G' }, { col: 11, acorde: 'C' }, { col: 21, acorde: 'G' }]);
    // o C cai no "a" de "a gente"
    expect(l.texto[11]).toBe('a');
  });

  it('seção [Refrão] vira secao', () => {
    const c = analisarCifra('[Refrão]\nG        C\nCantai louvores', 'G');
    expect(c.linhas[0]).toMatchObject({ tipo: 'secao', rotulo: 'Refrão' });
    expect(c.linhas[1].tipo).toBe('letra');
  });

  it('tab vira quatro espaços para não destruir a coluna', () => {
    const c = analisarCifra('G\tC\nLetra', 'G');
    const l = c.linhas[0];
    if (l.tipo !== 'letra') throw new Error('esperava letra');
    expect(l.acordes).toEqual([{ col: 0, acorde: 'G' }, { col: 5, acorde: 'C' }]);
  });

  it('conteúdo sem acorde: tudo letra, tom cai no padrão', () => {
    const c = analisarCifra('Pai nosso que estais no céu\nSantificado seja o vosso nome', 'C');
    expect(c.linhas.every((l) => l.tipo === 'letra' && l.acordes.length === 0)).toBe(true);
    expect(deduzirTom(c, 'C')).toBe('C');
  });

  it('tom detectado pelo último acorde (tônica), preservando o menor', () => {
    expect(deduzirTom(analisarCifra('C  F  G  C\nLetra', 'C'))).toBe('C');
    expect(deduzirTom(analisarCifra('Am  F  G  Am7\nLetra', 'C'))).toBe('Am');
    expect(deduzirTom(analisarCifra('G  D/F#  Em  G/B\nLetra', 'C'))).toBe('G');
  });

  it('paraTexto devolve a cifra em monoespaçada com acorde sobre a coluna', () => {
    const texto = 'G          C         G\nComo é bom a gente se encontrar';
    const c = analisarCifra(texto, 'G');
    expect(paraTexto(c)).toBe(texto);
    const r = renderizar(c);
    expect(r[0].acordes).toBe('G          C         G');
  });
});

describe('seções com papel musical', () => {
  it.each([
    ['Refrão', 'refrao'], ['REFRÃO:', 'refrao'], ['Coro', 'refrao'], ['Estribilho', 'refrao'],
    ['Intro', 'intro'], ['Introdução', 'intro'], ['Pré-refrão', 'pre_refrao'],
    ['Ponte', 'ponte'], ['Solo', 'instrumental'], ['Instrumental', 'instrumental'],
    ['Final', 'final'], ['Coda', 'final'], ['Estrofe 2', 'verso'], ['1ª', 'verso'],
    ['Parte B', 'verso'], ['Qualquer coisa', 'desconhecido'],
  ])('%s → %s', (rotulo, tipo) => {
    expect(classificarSecao(rotulo)).toBe(tipo);
  });

  it('a seção no texto carrega o tipo e o rótulo original', () => {
    const c = analisarCifra('[Refrão]\nG   C\nCantai', 'G');
    expect(c.linhas[0]).toEqual({ tipo: 'secao', rotulo: 'Refrão', secao: 'refrao' });
  });
});

describe('REVISÃO NECESSÁRIA — nada é inventado', () => {
  it('linha com marcador explícito vira revisao e sobrevive à ida e volta em texto', () => {
    const texto = `${MARCADOR_REVISAO} Imagem 1 (foto.png) não foi interpretada\nG   C\nLetra`;
    const c = analisarCifra(texto, 'G');
    expect(c.linhas[0]).toEqual({
      tipo: 'revisao',
      texto: 'Imagem 1 (foto.png) não foi interpretada',
      motivo: 'Marcado para revisão na importação',
      origem: 'marcador',
    });
    expect(paraTexto(c).split('\n')[0]).toBe(`${MARCADOR_REVISAO} Imagem 1 (foto.png) não foi interpretada`);
  });

  it('o marcador aceita variações de caixa e acento', () => {
    expect(lerMarcadorDeRevisao('[revisao necessaria] x')).toBe('x');
    expect(lerMarcadorDeRevisao('[ REVISÃO NECESSÁRIA ]')).toBe('');
    expect(lerMarcadorDeRevisao('[Refrão]')).toBeNull();
  });

  it('acordes misturados com texto na mesma linha ficam marcados, sem chute de alinhamento', () => {
    expect(ehLinhaMista('Senhor Am tende Em7 piedade D7')).toBe(true);
    expect(ehLinhaMista('CC7  F  G  C  Am')).toBe(true);
    const c = analisarCifra('CC7  F  G  C  Am\nLetra da música', 'C');
    expect(c.linhas[0]).toMatchObject({ tipo: 'revisao', texto: 'CC7  F  G  C  Am', origem: 'heuristica' });
    expect(c.linhas[1]).toEqual({ tipo: 'letra', texto: 'Letra da música', acordes: [] });
  });

  it('"Intro: Am G F E Am" é seção + acordes — reconhecido, não marcado', () => {
    const c = analisarCifra('INTRO: Am G F E Am\nLetra', 'C');
    expect(c.linhas[0]).toEqual({ tipo: 'secao', rotulo: 'INTRO', secao: 'intro' });
    expect(c.linhas[1]).toMatchObject({ tipo: 'acordes' });
    if (c.linhas[1].tipo !== 'acordes') throw new Error();
    expect(c.linhas[1].acordes.map((a) => a.acorde)).toEqual(['Am', 'G', 'F', 'E', 'Am']);
  });

  it('verso que começa com palavra de seção continua letra', () => {
    const c = analisarCifra('Final feliz da canção\nPonte de amor entre nós', 'C');
    expect(c.linhas.every((l) => l.tipo === 'letra')).toBe(true);
  });

  it('letra com uma palavra que parece acorde continua letra', () => {
    expect(ehLinhaMista('Em Deus confio')).toBe(false);
    expect(ehLinhaMista('A Deus Pai todo poderoso')).toBe(false);
    expect(ehLinhaMista('E a paz que vem de Ti')).toBe(false);
  });

  it('confiança e contagem refletem as linhas marcadas', () => {
    const limpa = analisarCifra('G   C\nComo é bom\nD7   G\nNeste lugar', 'G');
    expect(linhasParaRevisar(limpa)).toBe(0);
    expect(confiancaDaCifra(limpa)).toBe(1);

    const suja = analisarCifra(`G   C\nComo é bom\n${MARCADOR_REVISAO} trecho ilegível`, 'G');
    expect(linhasParaRevisar(suja)).toBe(1);
    expect(confiancaDaCifra(suja)).toBe(0.5);
  });

  it('o diagnóstico de importação expõe acordes, trechos a revisar e confiança', () => {
    const d = importarTexto(`[Refrão]\nG   C   D7\nCantai louvores\n${MARCADOR_REVISAO} Imagem 1`);
    expect(d.acordes).toEqual(['G', 'C', 'D7']);
    expect(d.paraRevisar).toBe(1);
    expect(d.confianca).toBe(0.5);
    expect(d.secoes).toEqual(['Refrão']);
    expect(d.avisos.some((a) => a.includes('REVISÃO NECESSÁRIA'))).toBe(true);
  });
});
