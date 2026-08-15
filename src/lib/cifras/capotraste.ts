// Sugestão de capotraste.
//
// Transpor resolve o tom para quem canta; o capotraste resolve a mão de quem
// toca. Se a equipe canta em Ab, o violão não quer quatro pestanas — quer
// capotraste na 1ª casa e as formas de G. É a pergunta que o músico faz sozinho
// toda vez, e o app já tem os dois dados para responder.

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Formas que a mão faz sem esforço no violão, da mais aberta para a menos. */
const FORMAS_FACEIS = ['G', 'E', 'C', 'A', 'D'] as const;

function classe(tom: string): number | null {
  const m = /^([A-G])([#b]?)/.exec(tom.trim());
  if (!m) return null;
  const base = PC[m[1]];
  if (base === undefined) return null;
  const alt = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return ((base + alt) % 12 + 12) % 12;
}

export interface SugestaoCapotraste {
  /** Casa do capotraste, de 1 a 5. */
  casa: number;
  /** Forma que a mão faz com o capotraste posto. */
  forma: string;
}

/**
 * Melhor capotraste para tocar `tomDestino` com forma fácil.
 *
 * Devolve null quando o próprio tom já é uma forma fácil — sugerir capotraste
 * para tocar em G quando o tom É G seria ruído. Só passa casas de 1 a 5: acima
 * disso o braço encurta e o timbre fica fino demais para acompanhar canto.
 */
export function sugerirCapotraste(tomDestino: string): SugestaoCapotraste | null {
  const destino = classe(tomDestino);
  if (destino === null) return null;

  const menor = /^[A-G][#b]?m(?!aj)/.test(tomDestino.trim());

  for (const forma of FORMAS_FACEIS) {
    const base = classe(forma);
    if (base === null) continue;
    if (base === destino) return null;                 // já é fácil, sem capo

    const casa = ((destino - base) % 12 + 12) % 12;
    if (casa >= 1 && casa <= 5) return { casa, forma: menor ? `${forma}m` : forma };
  }

  return null;
}
