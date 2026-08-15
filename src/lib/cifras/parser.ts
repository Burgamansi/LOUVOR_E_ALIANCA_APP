// Importação: texto de cifra (Word, Google Docs, TXT) → JSON com âncoras.
//
// O parser roda UMA vez, na importação. Depois disso a verdade é o JSON, e
// transpor nunca mais volta a mexer em texto — que é onde o alinhamento se
// perde.

import { ehAcorde, ehSimboloNeutro } from './acordes';
import { renderizar } from './render';
import type { Cifra, LinhaCifra, Ancora } from './tipos';

interface Token { texto: string; col: number }

function tokenizar(linha: string): Token[] {
  const tokens: Token[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(linha)) !== null) tokens.push({ texto: m[0], col: m.index });
  return tokens;
}

/**
 * A linha é de acordes?
 *
 * O caso perigoso é o português: "A" e "E" são palavras e também são notas.
 * Uma linha como "E a paz que vem de Ti" não pode virar acorde. Por isso não
 * basta "todos os tokens são acordes" — usamos três sinais somados:
 *
 *  - todo token precisa ser acorde ou símbolo de compasso (| % :| N.C.)
 *  - linha de acorde é esparsa: os acordes ficam espalhados sobre as sílabas,
 *    então a densidade de caracteres é baixa
 *  - um token com alteração, naipe ou baixo (Am, D7, F#, C/G) é prova forte;
 *    uma linha só de letras soltas exige a densidade baixa para passar
 */
export function ehLinhaDeAcordes(linha: string): boolean {
  const tokens = tokenizar(linha);
  if (tokens.length === 0) return false;

  const todosAcordes = tokens.every(t => ehAcorde(t.texto) || ehSimboloNeutro(t.texto));
  if (!todosAcordes) return false;

  const temProvaForte = tokens.some(t => /[#b0-9]|m|sus|dim|aug|maj|add|º|\//.test(t.texto));
  if (temProvaForte) return true;

  // Só fundamentais nuas ('A', 'E', 'G'): exige o desenho esparso da linha de
  // acordes. "E a paz" tem densidade alta e cai fora; "G      D      Em" passa.
  const densidade = linha.replace(/\s/g, '').length / Math.max(linha.length, 1);
  return densidade < 0.45 && tokens.length >= 2;
}

const RE_SECAO = /^\s*[\[({]?\s*(intro|introdu[çc][ãa]o|refr[ãa]o|estrofe|ponte|final|coda|solo|instrumental|parte\s*\w*|1[ªa]?|2[ªa]?|3[ªa]?)\b[^\]\)}]*[\])}]?\s*:?\s*$/i;

function ehSecao(linha: string): boolean {
  const t = linha.trim();
  if (!t) return false;
  if (/^\[.+\]$/.test(t)) return true;      // [Refrão]
  return RE_SECAO.test(t) && t.length <= 40;
}

/**
 * Converte texto plano em Cifra.
 *
 * Emparelhamento: uma linha de acordes seguida de uma linha de letra vira uma
 * única linha `letra` com as âncoras nas colunas onde os acordes estavam.
 * Sem letra depois (intro, solo), vira linha `acordes`.
 */
export function analisarCifra(texto: string, tomOriginal: string, origem = 'manual'): Cifra {
  const cruas = texto.replace(/\r\n?/g, '\n').split('\n');
  const linhas: LinhaCifra[] = [];

  for (let i = 0; i < cruas.length; i++) {
    const linha = cruas[i].replace(/\t/g, '    ');   // tab quebra o alinhamento

    if (!linha.trim()) { linhas.push({ tipo: 'vazia' }); continue; }

    if (ehSecao(linha)) {
      linhas.push({ tipo: 'secao', rotulo: linha.trim().replace(/^[\[({]|[\])}]$/g, '').trim() });
      continue;
    }

    if (ehLinhaDeAcordes(linha)) {
      const acordes: Ancora[] = tokenizar(linha)
        .filter(t => !ehSimboloNeutro(t.texto))
        .map(t => ({ col: t.col, acorde: t.texto }));

      const proxima = cruas[i + 1];
      const proximaEhLetra =
        proxima !== undefined && proxima.trim() !== '' &&
        !ehLinhaDeAcordes(proxima) && !ehSecao(proxima);

      if (proximaEhLetra) {
        linhas.push({ tipo: 'letra', texto: proxima.replace(/\t/g, '    '), acordes });
        i++;                                  // consome a linha de letra
      } else {
        linhas.push({ tipo: 'acordes', acordes });
      }
      continue;
    }

    linhas.push({ tipo: 'letra', texto: linha, acordes: [] });
  }

  return { versao: 1, tomOriginal, linhas, origem };
}

/** Volta ao texto plano — para exportar, imprimir ou copiar. */
export function paraTexto(cifra: Cifra): string {
  return renderizar(cifra)
    .flatMap(l => [l.acordes, l.letra].filter((x): x is string => x !== null))
    .join('\n');
}
