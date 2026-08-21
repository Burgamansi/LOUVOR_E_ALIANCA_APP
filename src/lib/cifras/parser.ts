// Importação: texto de cifra (Word, Google Docs, TXT) → JSON com âncoras.
//
// O parser roda UMA vez, na importação. Depois disso a verdade é o JSON, e
// transpor nunca mais volta a mexer em texto — que é onde o alinhamento se
// perde.

import { ehAcorde, ehSimboloNeutro } from './acordes';
import { renderizar } from './render';
import type { Cifra, LinhaCifra, Ancora, TipoSecao } from './tipos';

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

// Um rótulo de seção é a palavra da seção, sozinha na linha, com no máximo um
// complemento curto ("Estrofe 2", "Parte B", "Refrão:"). Sem isto, "Final
// feliz da canção" e "Ponte de amor" — versos — viravam seção.
const RE_SECAO = /^\s*[\[({]?\s*(intro|introdu[çc][ãa]o|pr[eé][\s-]?refr[ãa]o|refr[ãa]o|coro|estribilho|estrofe|verso|ponte|final|coda|solo|instrumental|interl[úu]dio|parte|1[ªa]?|2[ªa]?|3[ªa]?)\s*([A-Za-z0-9]{1,3})?\s*[\])}]?\s*:?\s*$/i;

function ehSecao(linha: string): boolean {
  const t = linha.trim();
  if (!t) return false;
  if (/^\[.+\]$/.test(t)) return true;      // [Refrão]
  return RE_SECAO.test(t) && t.length <= 40;
}

/**
 * "Intro: G D Em C" / "Refrão: Am F" — rótulo de seção seguido só de acordes.
 * Não há letra para alinhar, então não há nada a inventar: vira uma seção e
 * uma linha de acordes, as duas reconhecidas. Devolve null quando a linha
 * não tem esse desenho.
 */
function lerSecaoComAcordes(linha: string): { rotulo: string; acordes: Ancora[] } | null {
  const m = /^\s*([^:\[\]]{1,25}?)\s*:\s*(\S.*)$/.exec(linha);
  if (!m) return null;
  if (classificarSecao(m[1]) === 'desconhecido') return null;
  if (!ehLinhaDeAcordes(m[2])) return null;
  const inicio = linha.indexOf(m[2]);
  const acordes = tokenizar(m[2])
    .filter((t) => !ehSimboloNeutro(t.texto))
    .map((t) => ({ col: t.col + inicio, acorde: t.texto }));
  return { rotulo: m[1].trim(), acordes };
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase();

/**
 * O papel musical de um rótulo de seção. "Refrão", "REFRÃO:", "[Coro]" e
 * "Estribilho" são todos refrão; o que não se reconhece fica `desconhecido`
 * — nunca se chuta.
 */
export function classificarSecao(rotulo: string): TipoSecao {
  const r = semAcento(rotulo.trim());
  if (/^(intro|introducao)\b/.test(r)) return 'intro';
  if (/^(pre[\s-]?refrao|pre[\s-]?coro)\b/.test(r)) return 'pre_refrao';
  if (/^(refrao|coro|estribilho)\b/.test(r)) return 'refrao';
  if (/^ponte\b/.test(r)) return 'ponte';
  if (/^(solo|instrumental|interludio|passagem)\b/.test(r)) return 'instrumental';
  if (/^(final|coda|ending|encerramento)\b/.test(r)) return 'final';
  if (/^(estrofe|verso|parte|[123](a|ª)?)\b/.test(r)) return 'verso';
  return 'desconhecido';
}

const RE_MARCADOR = /^\s*\[\s*revis[aã]o\s+necess[aá]ria\s*\]\s*(.*)$/i;

/** A linha traz o marcador explícito de revisão? Devolve o texto depois dele. */
export function lerMarcadorDeRevisao(linha: string): string | null {
  const m = RE_MARCADOR.exec(linha);
  return m ? m[1].trim() : null;
}

/**
 * Linha que mistura acordes com texto: "INTRO: Am G F E Am", "CC7 F G C Am",
 * "Refrão: G D Em". Não dá para saber sobre qual sílaba cada acorde cai —
 * então nada é inventado; a linha fica marcada e a pessoa decide.
 *
 * A regra é por maioria, com prova forte: ou dois tokens que só podem ser
 * acorde (Am, D7, F#, C/G) com metade da linha sendo acorde, ou um token
 * forte numa linha longa que é quase toda acorde ("CC7 F G C Am" — um erro de
 * digitação numa linha de acordes). "Em Deus confio" tem um acorde em três
 * tokens e continua letra.
 */
export function ehLinhaMista(linha: string): boolean {
  const tokens = tokenizar(linha);
  if (tokens.length < 2) return false;
  const acordes = tokens.filter((t) => ehAcorde(t.texto) || ehSimboloNeutro(t.texto)).length;
  const fortes = tokens.filter(
    (t) => ehAcorde(t.texto) && /[#b0-9]|m(?!aj)|sus|dim|aug|maj|add|º|°|ø|Δ|\//.test(t.texto)
  ).length;
  const fracao = acordes / tokens.length;
  return (fortes >= 2 && fracao >= 0.5) || (fortes >= 1 && tokens.length >= 4 && fracao >= 0.75);
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

    // O marcador vem antes de tudo: "[REVISÃO NECESSÁRIA] …" começa com
    // colchete e, sem esta guarda, viraria uma seção chamada "REVISÃO".
    const marcado = lerMarcadorDeRevisao(linha);
    if (marcado !== null) {
      linhas.push({ tipo: 'revisao', texto: marcado, motivo: 'Marcado para revisão na importação', origem: 'marcador' });
      continue;
    }

    if (ehSecao(linha)) {
      const rotulo = linha.trim().replace(/^[\[({]|[\])}]$/g, '').replace(/:$/, '').trim();
      linhas.push({ tipo: 'secao', rotulo, secao: classificarSecao(rotulo) });
      continue;
    }

    const secaoComAcordes = lerSecaoComAcordes(linha);
    if (secaoComAcordes) {
      linhas.push({ tipo: 'secao', rotulo: secaoComAcordes.rotulo, secao: classificarSecao(secaoComAcordes.rotulo) });
      linhas.push({ tipo: 'acordes', acordes: secaoComAcordes.acordes });
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

    if (ehLinhaMista(linha)) {
      linhas.push({
        tipo: 'revisao',
        texto: linha,
        motivo: 'Acordes misturados com texto na mesma linha — não dá para saber sobre qual sílaba cada um cai',
        origem: 'heuristica',
      });
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

/**
 * Deduz o tom.
 *
 * Heurística de cifra popular, nesta ordem: o último acorde da música é quase
 * sempre a tônica; se não der, o primeiro. É palpite declarado como palpite — a
 * tela mostra "achei que é G" com o seletor do lado.
 */
export function deduzirTom(cifra: Cifra, padrao = 'C'): string {
  const acordes: string[] = [];
  for (const linha of cifra.linhas) {
    if (linha.tipo === 'letra' || linha.tipo === 'acordes') {
      for (const a of linha.acordes) acordes.push(a.acorde);
    }
  }
  if (acordes.length === 0) return padrao;

  const limpar = (a: string) => a.split('/')[0];
  const ultimo = limpar(acordes[acordes.length - 1]);
  const primeiro = limpar(acordes[0]);

  // Menor continua menor: 'Am7' vira 'Am', 'Cmaj7' vira 'C'.
  const raiz = (a: string) => {
    const m = /^([A-G][#b]?)(m(?!aj))?/.exec(a);
    return m ? m[1] + (m[2] ?? '') : a;
  };

  return raiz(ultimo) || raiz(primeiro) || padrao;
}
