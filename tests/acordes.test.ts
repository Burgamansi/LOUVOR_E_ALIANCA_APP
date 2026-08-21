import { describe, expect, it } from 'vitest';
import {
  analisarAcorde, ehAcorde, transporAcorde, semitonsEntre, tomEscrito,
  prefereBemol, normalizarSemitons, TONS,
} from '../src/lib/cifras/acordes';
import { analisarCifra } from '../src/lib/cifras/parser';
import { transporCifra, campoHarmonico } from '../src/lib/cifras/render';

// Estratégia de grafia adotada pelo projeto:
//
//   A grafia enarmônica (G# ou Ab) é decidida pelo TOM DE DESTINO, nunca por
//   uma preferência global. Os 12 tons oferecidos na tela (`TONS`) fixam a
//   grafia de cada destino: C C# D Eb E F F# G Ab A Bb B. Subir G em meio tom
//   leva a Ab, e em Ab tudo sai com bemol (Ab7, Db, Eb). Subir C leva a C#, e
//   em C# tudo sai com sustenido (C#/F, F#m7).
//
//   `transporAcorde` recebe a grafia explícita (`comBemol`) — é a função de
//   baixo nível. `transporCifra` aplica a estratégia a partir do tom.

describe('reconhecimento de acorde', () => {
  it.each([
    'C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'C#7', 'Db7', 'Gsus4', 'Gsus2', 'Cadd9',
    'F#m7', 'C/E', 'Bb/D', 'Cº', 'C°', 'Cdim', 'Caug', 'C+', 'Am7(b5)', 'Cø', 'CΔ',
    'G/B', 'F#m7(b5)/A', 'E7(#9)', 'Dm6', 'A9', 'C13',
  ])('%s é acorde', (a) => {
    expect(ehAcorde(a)).toBe(true);
  });

  it.each(['Como', 'paz', 'H', 'Cx', 'C/algumacoisa', '', 'Senhor', 'Deus'])(
    '"%s" NÃO é acorde', (t) => {
      expect(ehAcorde(t)).toBe(false);
    }
  );

  it('decompõe fundamental, alteração, naipe e baixo', () => {
    expect(analisarAcorde('F#m7(b5)/A')).toEqual({
      fundamental: 'F', alteracao: '#', naipe: 'm7(b5)', baixo: 'A',
    });
    expect(analisarAcorde('Bb/D')).toEqual({
      fundamental: 'B', alteracao: 'b', naipe: '', baixo: 'D',
    });
  });

  it('normaliza ♯ e ♭ tipográficos', () => {
    expect(analisarAcorde('F♯m')?.alteracao).toBe('#');
    expect(analisarAcorde('B♭')?.alteracao).toBe('b');
  });
});

describe('transposição de um acorde (grafia explícita)', () => {
  it.each([
    ['C', 1, false, 'C#'],
    ['C#', 1, false, 'D'],
    ['B', 1, false, 'C'],
    ['Am', 1, false, 'A#m'],
    ['Am', 1, true, 'Bbm'],
    ['G7', 1, false, 'G#7'],
    ['G7', 1, true, 'Ab7'],
    ['F#m7', 1, false, 'Gm7'],
    ['C/E', 1, false, 'C#/F'],
    ['Bb/D', 1, false, 'B/D#'],
    ['Cmaj7', 2, false, 'Dmaj7'],
    ['Cm7', 2, false, 'Dm7'],
    ['Db7', -1, false, 'C7'],
    ['Gsus4', 2, false, 'Asus4'],
    ['Gsus2', -2, false, 'Fsus2'],
    ['Cadd9', 3, true, 'Ebadd9'],
    ['Cº', 1, false, 'C#º'],
    ['Cdim', 1, true, 'Dbdim'],
    ['Caug', 1, false, 'C#aug'],
    ['C+', 1, false, 'C#+'],
    ['Am7(b5)', 1, true, 'Bbm7(b5)'],
  ])('%s +%i semitons (bemol=%s) → %s', (acorde, semitons, bemol, esperado) => {
    expect(transporAcorde(acorde, semitons, bemol)).toBe(esperado);
  });

  it('preserva extensões e baixo invertido ao descer', () => {
    expect(transporAcorde('C#m7/G#', -1, false)).toBe('Cm7/G');
    expect(transporAcorde('Eb/G', -1, false)).toBe('D/F#');
  });

  it('volta ao mesmo acorde depois de 12 semitons', () => {
    // A grafia de saída segue `comBemol`; um acorde escrito com bemol precisa
    // pedir bemol para voltar idêntico. A altura, essa é sempre a mesma.
    for (const a of ['C', 'F#m7', 'Bb/D', 'Gsus4']) {
      const comBemol = a.includes('b');
      expect(transporAcorde(a, 12, comBemol)).toBe(a);
      expect(transporAcorde(a, -12, comBemol)).toBe(a);
    }
  });

  it('deixa intacto o que não é acorde — a letra nunca é transposta', () => {
    expect(transporAcorde('Como', 1, false)).toBe('Como');
    expect(transporAcorde('Amor', 3, true)).toBe('Amor');
  });

  it('0 semitons devolve a string original sem reescrever a grafia', () => {
    expect(transporAcorde('G#', 0, true)).toBe('G#');
  });
});

describe('estratégia de grafia pelo tom de destino', () => {
  it.each([
    ['G', 1, 'Ab'], ['C', 1, 'C#'], ['D', 1, 'Eb'], ['F', 1, 'F#'], ['A', 1, 'Bb'],
    ['Am', 1, 'Bbm'], ['Em', -1, 'Ebm'], ['B', 1, 'C'],
  ])('tomEscrito(%s, %i) = %s', (tom, n, esperado) => {
    expect(tomEscrito(tom, n)).toBe(esperado);
  });

  it('tons com bemol preferem bemol; D maior não vira Dm', () => {
    expect(prefereBemol('Ab')).toBe(true);
    expect(prefereBemol('Bbm')).toBe(true);
    expect(prefereBemol('D')).toBe(false);
    expect(prefereBemol('Abm7')).toBe(true);
  });

  it('transporCifra: G7 → Ab7 subindo meio tom a partir de G', () => {
    const cifra = analisarCifra('G7         C\nCantai louvores', 'G', 'txt');
    const t = transporCifra(cifra, tomEscrito('G', 1));
    expect(campoHarmonico(t)).toEqual(['Ab7', 'Db']);
  });

  it('transporCifra: C/E → C#/F subindo meio tom a partir de C', () => {
    const cifra = analisarCifra('C/E   F#m7   Bb/D\nLetra qualquer aqui', 'C', 'txt');
    const t = transporCifra(cifra, tomEscrito('C', 1));
    expect(campoHarmonico(t)).toEqual(['C#/F', 'Gm7', 'B/D#']);
  });

  it('semitonsEntre usa o caminho mais curto', () => {
    expect(semitonsEntre('C', 'G')).toBe(-5);
    expect(semitonsEntre('G', 'C')).toBe(5);
    expect(semitonsEntre('C', 'F#')).toBe(6);
    expect(normalizarSemitons(7)).toBe(-5);
    expect(normalizarSemitons(-7)).toBe(5);
  });
});

describe('invariante: transpor nunca altera letra nem âncora', () => {
  const ORIGINAL = [
    '[Intro]',
    'G   D/F#  Em   C',
    '',
    'G          C         G',
    'Como é bom a gente se encontrar',
    '       D7                    G',
    'Neste lugar onde o amor de Deus reluz',
    'E a paz que vem de Ti nos faz cantar',
    '   Bb        F/A      Gm7      Cm',
    'Senhor, aqui estamos para Te louvar',
  ].join('\n');

  const cifra = analisarCifra(ORIGINAL, 'G', 'txt');
  const letras = cifra.linhas.filter((l) => l.tipo === 'letra');

  it.each(TONS)('tom %s: letra byte a byte igual e âncoras na mesma coluna', (tom) => {
    const t = transporCifra(cifra, tom);
    const tl = t.linhas.filter((l) => l.tipo === 'letra');
    expect(tl.length).toBe(letras.length);
    tl.forEach((l, i) => {
      const o = letras[i];
      if (l.tipo !== 'letra' || o.tipo !== 'letra') throw new Error('tipo mudou');
      expect(l.texto).toBe(o.texto);
      expect(l.acordes.map((a) => a.col)).toEqual(o.acordes.map((a) => a.col));
    });
  });

  it('em Ab sai com bemol; em D sai com sustenido', () => {
    const emAb = campoHarmonico(transporCifra(cifra, 'Ab')).join(' ');
    const emD = campoHarmonico(transporCifra(cifra, 'D')).join(' ');
    expect(emAb).toMatch(/b/);
    expect(emAb).not.toMatch(/#/);
    expect(emD).toMatch(/#/);
  });
});
