// O que o banco exige e o arquivo de missas não guarda.
//
// `src/data/missas.ts` foi escrito para a tela: slug, data, título, cor,
// arquivos. O banco pede mais três coisas — tempo litúrgico, ano litúrgico e
// número da semana — e todas as três dão para ler do que já está lá, sem
// inventar e sem pedir nada a ninguém.
//
// Fica em módulo próprio, e não dentro do script de carga, porque errar aqui
// erra em silêncio: 82 celebrações entram com o tempo errado e ninguém
// percebe até alguém procurar as missas da Quaresma. Módulo separado é módulo
// testável.

export type TempoLiturgico =
  | 'advento' | 'natal' | 'quaresma' | 'triduo' | 'pascoa' | 'tempo_comum';

export type TipoCelebracao = 'domingo' | 'solenidade' | 'festa';

const semAcento = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * O tempo litúrgico, lido do título da celebração.
 *
 * Ler do título em vez de calcular o calendário é decisão, não preguiça: os
 * títulos foram conferidos a mão contra as pastas do Drive, e um cálculo de
 * data da Páscoa erra sem avisar. A ordem dos testes importa e resolve os dois
 * casos que um mapeamento ingênuo erra:
 *
 *  · "Domingo de Ramos da Paixão do Senhor" tem "Paixão", mas é o último
 *    domingo da QUARESMA — por isso quaresma é testada antes de páscoa;
 *  · "Vigília Pascal na Noite Santa" tem "Pascal", mas pertence ao TRÍDUO —
 *    por isso tríduo vem antes de tudo.
 */
export function tempoLiturgico(titulo: string): TempoLiturgico {
  const t = semAcento(titulo);
  if (/triduo|vigilia pascal/.test(t)) return 'triduo';
  if (/advento/.test(t)) return 'advento';
  if (/natal|sagrada familia|santa maria, mae de deus|epifania|batismo do senhor/.test(t)) return 'natal';
  if (/quaresma|ramos/.test(t)) return 'quaresma';
  if (/pascoa|ressurreicao|ascensao|pentecostes/.test(t)) return 'pascoa';
  return 'tempo_comum';
}

/**
 * O ano litúrgico da data.
 *
 * O ciclo vira no 1º Domingo do Advento, não no dia 1º de janeiro. O Advento
 * de 2025 começa em 30/11/2025: antes disso o acervo ainda está no Ano C;
 * dali em diante, no Ano A, que cobre 2026 inteiro até o Advento seguinte.
 */
export function anoLiturgico(data: string): 'A' | 'B' | 'C' {
  return data < '2025-11-30' ? 'C' : 'A';
}

/** O número do domingo, quando o título o traz: "10º Domingo do Tempo Comum" → 10. */
export function semanaDoTitulo(titulo: string): number | null {
  const m = /(\d+)\s*[ºo°]?\s*Domingo/i.exec(titulo);
  return m ? Number(m[1]) : null;
}

/**
 * O tipo da celebração, na precisão que o banco pede.
 *
 * `missas.ts` só separa 'domingo' de 'solenidade' — é o que a tela precisa
 * para pintar o cartão. O banco separa mais e exige o número da semana quando
 * o tipo é 'domingo'. Os títulos sem número (Batismo do Senhor, Sagrada
 * Família) não são domingos comuns: são Festas, e é assim que entram.
 */
export function tipoDeCelebracao(
  tipoNoArquivo: 'domingo' | 'solenidade',
  tituloLiturgico: string
): TipoCelebracao {
  if (tipoNoArquivo === 'solenidade') return 'solenidade';
  return semanaDoTitulo(tituloLiturgico) === null ? 'festa' : 'domingo';
}
