// Modelo de dados da cifra.
//
// O ponto central: a cifra NÃO é guardada como "texto com acordes por cima".
// Nesse formato, transpor é reescrever a linha de acordes — e como 'C' vira
// 'C#' (um caractere a mais) e 'Bb' vira 'A' (um a menos), tudo o que vem
// depois desliza e o acorde deixa de cair sobre a sílaba certa.
//
// Aqui cada acorde é uma ÂNCORA: um índice de caractere dentro da linha de
// letra. Transpor troca só a string do acorde; a letra e as âncoras não são
// tocadas. O alinhamento é reconstruído na renderização, sempre a partir da
// mesma verdade.
//
// A segunda regra, tão importante quanto: o importador NÃO inventa conteúdo.
// O que ele não reconhece com segurança vira uma linha `revisao`, visível na
// tela com o rótulo REVISÃO NECESSÁRIA, e a pessoa corrige antes de salvar.

export interface Ancora {
  /** Índice do caractere da letra sobre o qual o acorde cai. 0 = primeira letra. */
  col: number;
  /** O acorde como texto: 'G', 'D7', 'Am7', 'F#m7(b5)', 'C/G'. */
  acorde: string;
}

/**
 * O papel musical de uma seção. Deduzido do rótulo escrito no arquivo
 * ("Refrão", "Intro", "Ponte"); `desconhecido` quando o rótulo não diz.
 */
export type TipoSecao =
  | 'intro'
  | 'verso'
  | 'pre_refrao'
  | 'refrao'
  | 'ponte'
  | 'instrumental'
  | 'final'
  | 'desconhecido';

export type LinhaCifra =
  /** Letra cantada, com os acordes ancorados nas sílabas. */
  | { tipo: 'letra'; texto: string; acordes: Ancora[] }
  /** Linha só de acordes: intro, solo, passagem instrumental. */
  | { tipo: 'acordes'; acordes: Ancora[] }
  /** Marcador de seção: [Intro], [Refrão], [Ponte]. `rotulo` é o que estava escrito. */
  | { tipo: 'secao'; rotulo: string; secao: TipoSecao }
  /** Observação do ministério que não é letra nem acorde. */
  | { tipo: 'texto'; texto: string }
  /**
   * Conteúdo que o importador não reconheceu com segurança. `texto` é o que
   * veio do arquivo (ou a descrição do trecho, quando era uma imagem);
   * `motivo` explica por que está marcado. `origem` diz se a marcação veio
   * escrita no texto (`[REVISÃO NECESSÁRIA] …`) ou se o parser a deduziu.
   */
  | { tipo: 'revisao'; texto: string; motivo: string; origem: 'marcador' | 'heuristica' }
  | { tipo: 'vazia' };

export interface Cifra {
  versao: 1;
  /** Tom em que a cifra foi escrita: 'G', 'Am', 'Eb'. */
  tomOriginal: string;
  linhas: LinhaCifra[];
  /** De onde veio: 'docx', 'pdf', 'imagem', 'txt', 'gdocs', 'manual', 'colado'. */
  origem?: string;
}

/** Uma linha pronta para exibição em fonte monoespaçada. */
export interface LinhaRenderizada {
  acordes: string | null;
  letra: string | null;
  tipo: LinhaCifra['tipo'];
}

/**
 * Marcador textual de trecho incerto. Fica no texto da cifra de propósito:
 * o texto é o que se edita na caixa "Editar antes de salvar", e a marcação
 * precisa sobreviver a essa ida e volta. Quem apaga a linha ou escreve a
 * cifra no lugar dela está revisando.
 */
export const MARCADOR_REVISAO = '[REVISÃO NECESSÁRIA]';

/** Quantas linhas da cifra pedem revisão. */
export function linhasParaRevisar(cifra: Cifra): number {
  return cifra.linhas.filter((l) => l.tipo === 'revisao').length;
}

/**
 * Confiança da leitura, de 0 a 1.
 *
 * É a fração de linhas com conteúdo que o parser reconheceu sem dúvida. Não
 * é uma probabilidade — é um resumo honesto do que ficou marcado para olhar.
 */
export function confiancaDaCifra(cifra: Cifra): number {
  const conteudo = cifra.linhas.filter(
    (l) => l.tipo === 'letra' || l.tipo === 'acordes' || l.tipo === 'revisao'
  );
  if (conteudo.length === 0) return 1;
  const incertas = conteudo.filter((l) => l.tipo === 'revisao').length;
  return 1 - incertas / conteudo.length;
}
