import { describe, expect, it } from 'vitest';
import { analisarCifra, ehLinhaDeAcordes, deduzirTom, paraTexto } from '../src/lib/cifras/parser';
import { renderizar } from '../src/lib/cifras/render';

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
