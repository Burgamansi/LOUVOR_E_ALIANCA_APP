// Reconhecimento e transposição de um acorde isolado.
//
// Regra crítica do pedido: transpor altera SÓ o acorde. Nada aqui toca em
// letra — por construção, porque estas funções nunca recebem uma linha de
// texto, só a string de um acorde vinda do JSON.

const PC_POR_NOTA: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

const SUSTENIDOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BEMOIS     = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Tons que se escrevem com bemol. Em Láb o músico de igreja lê Ab/Db/Eb;
 * escrever G#/C#/D# é tecnicamente equivalente e praticamente ilegível.
 */
const TONS_COM_BEMOL = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
                                'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm']);

/** Símbolos que aparecem em linha de acorde e não são acordes. */
const SIMBOLOS_NEUTROS = new Set(['|', '||', ':|', '|:', '%', '/', '-', '(', ')', 'N.C.', 'NC']);

/**
 * Um acorde: fundamental + alteração + naipe (qualidade/extensões) + baixo.
 * Cobre a notação usada em cifra brasileira, incluindo º, ø, Δ, sus, add,
 * parênteses de tensão e baixo invertido.
 */
const RE_ACORDE = /^([A-G])([#b♯♭]{0,2})((?:maj|Maj|M|min|m|dim|aug|sus|add|alt|[2-9]|1[0-3]|[#b+\-()º°ø∅Δ,])*)$/;

export interface AcordePartes {
  fundamental: string;   // 'F'
  alteracao: string;     // '#'
  naipe: string;         // 'm7(b5)'
  baixo: string | null;  // 'A' em 'C/A'
}

/** Decompõe um acorde. Devolve null se a string não for um acorde. */
export function analisarAcorde(texto: string): AcordePartes | null {
  const t = texto.trim();
  if (!t) return null;

  const [parteAcorde, ...resto] = t.split('/');
  const parteBaixo = resto.length ? resto.join('/') : null;

  const m = RE_ACORDE.exec(parteAcorde);
  if (!m) return null;

  let baixo: string | null = null;
  if (parteBaixo !== null) {
    const mb = /^([A-G])([#b♯♭]{0,2})$/.exec(parteBaixo);
    if (!mb) return null;             // 'C/algumacoisa' não é acorde
    baixo = mb[1] + normalizarAlteracao(mb[2]);
  }

  return {
    fundamental: m[1],
    alteracao: normalizarAlteracao(m[2]),
    naipe: m[3] ?? '',
    baixo,
  };
}

function normalizarAlteracao(a: string): string {
  return a.replace(/♯/g, '#').replace(/♭/g, 'b');
}

/** É um acorde? */
export function ehAcorde(texto: string): boolean {
  return analisarAcorde(texto) !== null;
}

/** É um token que pode aparecer numa linha de acordes sem ser acorde? */
export function ehSimboloNeutro(texto: string): boolean {
  return SIMBOLOS_NEUTROS.has(texto.trim());
}

/** Classe de altura (0–11) de uma nota escrita, ou null. */
export function classeDeAltura(fundamental: string, alteracao: string): number | null {
  const base = PC_POR_NOTA[fundamental.toUpperCase()];
  if (base === undefined) return null;
  let pc = base;
  for (const c of alteracao) {
    if (c === '#') pc += 1;
    if (c === 'b') pc -= 1;
  }
  return ((pc % 12) + 12) % 12;
}

/** O tom de destino se escreve com bemol? */
export function prefereBemol(tomDestino: string): boolean {
  const t = tomDestino.trim();
  if (TONS_COM_BEMOL.has(t)) return true;
  // 'Abm7' → considera só fundamental + alteração + o 'm' de menor, se houver.
  // Cuidado: concatenar 'm' sem o menor faria 'D' virar 'Dm' e sair com bemol.
  const m = /^([A-G][#b]?)(m(?!aj))?/.exec(t);
  if (!m) return false;
  return TONS_COM_BEMOL.has(m[1] + (m[2] ?? ''));
}

function escrever(pc: number, comBemol: boolean): string {
  return (comBemol ? BEMOIS : SUSTENIDOS)[pc];
}

/**
 * Transpõe um acorde por N semitons.
 *
 * `comBemol` decide a grafia enarmônica e deve vir do TOM DE DESTINO, não de
 * uma preferência global: em Láb sai Ab/Db/Eb; em Ré sai F#/C#.
 * Se a string não for um acorde, volta intacta — é a garantia de que nada
 * fora do vocabulário harmônico é alterado.
 */
export function transporAcorde(acorde: string, semitons: number, comBemol: boolean): string {
  const partes = analisarAcorde(acorde);
  if (!partes) return acorde;
  if (semitons === 0) return acorde;

  const pc = classeDeAltura(partes.fundamental, partes.alteracao);
  if (pc === null) return acorde;

  const novoPc = (((pc + semitons) % 12) + 12) % 12;
  let saida = escrever(novoPc, comBemol) + partes.naipe;

  if (partes.baixo) {
    const mb = /^([A-G])([#b]{0,2})$/.exec(partes.baixo);
    if (mb) {
      const pcBaixo = classeDeAltura(mb[1], mb[2]);
      if (pcBaixo !== null) {
        const novoBaixo = (((pcBaixo + semitons) % 12) + 12) % 12;
        saida += '/' + escrever(novoBaixo, comBemol);
      }
    }
  }

  return saida;
}

/** Distância em semitons entre dois tons, pelo caminho mais curto (−6..+6). */
export function semitonsEntre(tomOrigem: string, tomDestino: string): number {
  const a = raizDoTom(tomOrigem);
  const b = raizDoTom(tomDestino);
  if (a === null || b === null) return 0;
  let d = (b - a) % 12;
  if (d > 6) d -= 12;
  if (d < -6) d += 12;
  return d;
}

function raizDoTom(tom: string): number | null {
  const m = /^([A-G])([#b♯♭]{0,2})/.exec(tom.trim());
  if (!m) return null;
  return classeDeAltura(m[1], normalizarAlteracao(m[2]));
}

/** Nome do tom depois de transpor, preservando o 'm' de menor. */
export function tomTransposto(tomOriginal: string, semitons: number, comBemol: boolean): string {
  const m = /^([A-G])([#b♯♭]{0,2})(.*)$/.exec(tomOriginal.trim());
  if (!m) return tomOriginal;
  const pc = classeDeAltura(m[1], normalizarAlteracao(m[2]));
  if (pc === null) return tomOriginal;
  const novo = (((pc + semitons) % 12) + 12) % 12;
  return escrever(novo, comBemol) + (m[3] ?? '');
}

/**
 * Nome do tom depois de N semitons, já na grafia que o músico espera ler.
 *
 * A grafia sai de `TONS`, a mesma lista que o seletor de tons mostra na tela —
 * e é por isso que ela é a fonte da verdade aqui: o que a pessoa escolhe no
 * botão "Ab" é exatamente o que aparece escrito na cifra.
 *
 * O caminho óbvio — transpor com sustenido e depois perguntar se aquele tom
 * prefere bemol — não funciona, e o erro é discreto: a resposta é sempre
 * "não", porque a pergunta foi feita para a grafia sustenida, que por
 * construção nunca é um tom de bemol. Subir um semitom a partir de G devolvia
 * G#/D#/A# onde toda equipe de igreja lê Ab/Eb/Bb.
 */
export function tomEscrito(tomOriginal: string, semitons: number): string {
  const m = /^([A-G])([#b♯♭]{0,2})(.*)$/.exec(tomOriginal.trim());
  if (!m) return tomOriginal;

  const pc = classeDeAltura(m[1], normalizarAlteracao(m[2]));
  if (pc === null) return tomOriginal;

  const novo = (((pc + semitons) % 12) + 12) % 12;
  return TONS[novo] + (m[3] ?? '');     // preserva o 'm' de menor e o resto
}

/** Reduz um deslocamento qualquer ao caminho mais curto: −5 e +7 são o mesmo tom. */
export function normalizarSemitons(semitons: number): number {
  let d = ((semitons % 12) + 12) % 12;
  if (d > 6) d -= 12;
  return d;
}

/** Os 12 tons oferecidos no seletor, na grafia mais usada em cifra de igreja. */
export const TONS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
