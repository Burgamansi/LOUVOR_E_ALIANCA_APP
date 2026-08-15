// Renderização e transposição.
//
// Duas saídas, pelo mesmo JSON:
//
//  · `renderizar()` monta o par (linha de acordes, linha de letra) para fonte
//    monoespaçada — é o que serve para copiar, imprimir e exportar.
//  · na tela, o componente posiciona cada acorde em `left: {col}ch` sobre a
//    letra. Aí a largura do acorde não empurra nada: 'C' e 'C#' ocupam o mesmo
//    ponto de ancoragem, e o alinhamento é exato mesmo quando a transposição
//    muda o tamanho do texto do acorde.
//
// A letra NUNCA é reescrita em nenhum dos dois caminhos. Só a linha de acordes
// é reconstruída, sempre a partir das âncoras.

import { prefereBemol, semitonsEntre, transporAcorde, tomTransposto } from './acordes';
import type { Cifra, LinhaCifra, LinhaRenderizada } from './tipos';

/**
 * Transpõe a cifra inteira para um tom de destino.
 *
 * Devolve uma cifra nova; a original não é tocada — o banco guarda sempre a
 * cifra no tom em que ela foi escrita, e a transposição é calculada na hora.
 * Uma verdade só, sem cópias divergindo por aí.
 */
export function transporCifra(cifra: Cifra, tomDestino: string): Cifra {
  const semitons = semitonsEntre(cifra.tomOriginal, tomDestino);
  if (semitons === 0) return cifra;

  const comBemol = prefereBemol(tomDestino);

  const linhas: LinhaCifra[] = cifra.linhas.map(linha => {
    switch (linha.tipo) {
      case 'letra':
        return {
          ...linha,
          // texto intacto: a letra e as colunas não mudam, só o rótulo do acorde
          acordes: linha.acordes.map(a => ({
            col: a.col,
            acorde: transporAcorde(a.acorde, semitons, comBemol),
          })),
        };
      case 'acordes':
        return {
          tipo: 'acordes',
          acordes: linha.acordes.map(a => ({
            col: a.col,
            acorde: transporAcorde(a.acorde, semitons, comBemol),
          })),
        };
      default:
        return linha;
    }
  });

  return { ...cifra, tomOriginal: tomTransposto(cifra.tomOriginal, semitons, comBemol), linhas };
}

/**
 * Monta a linha de acordes a partir das âncoras.
 *
 * Dois acordes não podem se sobrepor: se o anterior for largo demais, este é
 * empurrado o mínimo necessário (um espaço de folga). É a única concessão
 * possível — e ela mexe só na linha de acordes, nunca na letra.
 */
function montarLinhaDeAcordes(acordes: { col: number; acorde: string }[]): string {
  if (acordes.length === 0) return '';
  const ordenados = [...acordes].sort((a, b) => a.col - b.col);

  let saida = '';
  for (const { col, acorde } of ordenados) {
    const alvo = Math.max(col, saida.length === 0 ? 0 : saida.length + 1);
    saida = saida.padEnd(alvo, ' ') + acorde;
  }
  return saida;
}

/** Cifra → linhas prontas para fonte monoespaçada. */
export function renderizar(cifra: Cifra): LinhaRenderizada[] {
  return cifra.linhas.map((linha): LinhaRenderizada => {
    switch (linha.tipo) {
      case 'letra':
        return {
          tipo: 'letra',
          acordes: linha.acordes.length ? montarLinhaDeAcordes(linha.acordes) : null,
          letra: linha.texto,
        };
      case 'acordes':
        return { tipo: 'acordes', acordes: montarLinhaDeAcordes(linha.acordes), letra: null };
      case 'secao':
        return { tipo: 'secao', acordes: null, letra: `[${linha.rotulo}]` };
      case 'texto':
        return { tipo: 'texto', acordes: null, letra: linha.texto };
      case 'vazia':
        return { tipo: 'vazia', acordes: null, letra: '' };
    }
  });
}

/** Todos os acordes distintos da cifra — para o campo harmônico exibido no topo. */
export function campoHarmonico(cifra: Cifra): string[] {
  const vistos = new Set<string>();
  for (const linha of cifra.linhas) {
    if (linha.tipo === 'letra' || linha.tipo === 'acordes') {
      for (const a of linha.acordes) vistos.add(a.acorde);
    }
  }
  return [...vistos];
}
