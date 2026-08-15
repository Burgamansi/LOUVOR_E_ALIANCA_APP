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

export interface Ancora {
  /** Índice do caractere da letra sobre o qual o acorde cai. 0 = primeira letra. */
  col: number;
  /** O acorde como texto: 'G', 'D7', 'Am7', 'F#m7(b5)', 'C/G'. */
  acorde: string;
}

export type LinhaCifra =
  /** Letra cantada, com os acordes ancorados nas sílabas. */
  | { tipo: 'letra'; texto: string; acordes: Ancora[] }
  /** Linha só de acordes: intro, solo, passagem instrumental. */
  | { tipo: 'acordes'; acordes: Ancora[] }
  /** Marcador de seção: [Intro], [Refrão], [Ponte]. */
  | { tipo: 'secao'; rotulo: string }
  /** Observação do ministério que não é letra nem acorde. */
  | { tipo: 'texto'; texto: string }
  | { tipo: 'vazia' };

export interface Cifra {
  versao: 1;
  /** Tom em que a cifra foi escrita: 'G', 'Am', 'Eb'. */
  tomOriginal: string;
  linhas: LinhaCifra[];
  /** De onde veio: 'docx', 'txt', 'gdocs', 'manual'. Só para rastreabilidade. */
  origem?: string;
}

/** Uma linha pronta para exibição em fonte monoespaçada. */
export interface LinhaRenderizada {
  acordes: string | null;
  letra: string | null;
  tipo: LinhaCifra['tipo'];
}
