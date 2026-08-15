// Importação de cifra vinda do Word (.docx), do Google Docs ou de um .txt.
//
// A regra do fluxo: importar NUNCA grava direto. Sempre passa por um
// diagnóstico que a pessoa confere antes de salvar. Motivo prático: o Word
// costuma posicionar acorde com tabulação ou dentro de tabela, e nesses casos a
// coluna do acorde se perde na conversão. Melhor mostrar "reconheci 2 de 14
// linhas de acorde" e deixar corrigir do que salvar uma cifra torta que só vai
// dar problema na hora de tocar.

import { analisarCifra, deduzirTom, ehLinhaDeAcordes } from './parser';
import { ehAcorde } from './acordes';
import { dividirEmCantos } from './cantos';
import type { CantoDetectado } from './cantos';
import type { Cifra } from './tipos';

// deduzirTom mora no parser, que é onde ela opera (sobre uma Cifra), mas
// continua saindo daqui para quem já a importava deste módulo.
export { deduzirTom };

export interface DiagnosticoImportacao {
  /** Texto já normalizado, pronto para o parser e para edição manual. */
  texto: string;
  cifra: Cifra;
  /** Tom deduzido do conteúdo — palpite, sempre editável antes de salvar. */
  tomSugerido: string;
  linhasDeAcorde: number;
  acordesDistintos: number;
  secoes: string[];
  /**
   * Os cantos encontrados dentro do arquivo. Um arquivo de missa traz oito ou
   * dez; um arquivo de uma música só traz um, e aí o fluxo é o de sempre.
   */
  cantos: CantoDetectado[];
  /** O que pode ter se perdido. Vazio = importação limpa. */
  avisos: string[];
  origem: 'docx' | 'txt' | 'colado';
}

/**
 * Normaliza o texto preservando o desenho da página.
 *
 * O que é preservado (e por quê): os espaços à esquerda e entre acordes são a
 * própria informação de alinhamento — cada espaço é uma coluna. Por isso nada
 * aqui colapsa espaço em branco.
 *
 * O que é convertido: caracteres que *parecem* espaço mas não medem um espaço
 * em fonte monoespaçada. Um NBSP colado do Word ocupa lugar diferente e
 * desalinha o acorde em uma casa.
 */
export function normalizarTexto(bruto: string): string {
  return bruto
    .replace(/\r\n?/g, '\n')
    // NBSP, espaços tipográficos e o espaço estreito do Word: parecem espaço,
    // mas não medem um espaço em fonte monoespaçada — e um deles no meio da
    // linha desloca o acorde uma casa.
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')             // largura zero
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\t/g, '    ')                              // tab = 4 colunas
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))                   // sobra à direita não serve
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')                        // respiro, sem buraco
    .replace(/^\n+/, '');
}

function analisarConteudo(texto: string, origem: DiagnosticoImportacao['origem']): DiagnosticoImportacao {
  const linhas = texto.split('\n');
  const cifra = analisarCifra(texto, 'C', origem);
  const tomSugerido = deduzirTom(cifra);

  const distintos = new Set<string>();
  let linhasDeAcorde = 0;
  const secoes: string[] = [];

  for (const linha of cifra.linhas) {
    if (linha.tipo === 'secao') secoes.push(linha.rotulo);
    if (linha.tipo === 'letra' || linha.tipo === 'acordes') {
      if (linha.acordes.length > 0) linhasDeAcorde++;
      for (const a of linha.acordes) distintos.add(a.acorde);
    }
  }

  const avisos: string[] = [];

  // Tem acorde solto no texto, mas nenhuma linha inteira foi reconhecida como
  // linha de acordes: é a assinatura de um Word que alinhou com tabulação ou
  // com tabela, e a coluna não sobreviveu à conversão.
  const acordesSoltos = linhas.some((l) =>
    !ehLinhaDeAcordes(l) && l.trim().split(/\s+/).filter(ehAcorde).length >= 2
  );
  if (linhasDeAcorde === 0) {
    avisos.push(
      'Não reconheci nenhuma linha de acordes. Se o arquivo veio do Word com os acordes em tabela ou alinhados por tabulação, salve como "Texto sem formatação (.txt)" e importe de novo.'
    );
  } else if (acordesSoltos) {
    avisos.push(
      'Algumas linhas têm acordes que não ficaram alinhados — confira a prévia antes de salvar e ajuste os espaços onde precisar.'
    );
  }

  if (linhas.length > 0 && linhasDeAcorde > 0 && secoes.length === 0) {
    avisos.push('Nenhuma marcação de seção ([Intro], [Refrão]) foi encontrada — a cifra vai aparecer corrida.');
  }

  const cantos = dividirEmCantos(texto);

  // Vale a pena avisar só quando o arquivo é claramente uma missa inteira e
  // mesmo assim não deu para separar: um arquivo de uma música só cai aqui
  // legitimamente, e não é problema nenhum.
  if (cantos.length === 1 && linhas.length > 80) {
    avisos.push(
      'O arquivo é longo mas não encontrei os nomes dos momentos da missa (ENTRADA, OFERTÓRIO, SANTO…) — ele entra como um canto só. Se são vários, escreva o momento numa linha sozinha antes de cada um e importe de novo.'
    );
  }

  return {
    texto,
    cifra,
    tomSugerido,
    linhasDeAcorde,
    acordesDistintos: distintos.size,
    secoes,
    cantos,
    avisos,
    origem,
  };
}

/** Lê o arquivo escolhido e devolve o diagnóstico, sem salvar nada. */
export async function importarArquivo(arquivo: File): Promise<DiagnosticoImportacao> {
  if (/\.docx$/i.test(arquivo.name)) {
    // Sob demanda: o mammoth (≈ 200 KB) só entra no bundle de quem importa um
    // .docx, não no carregamento do app inteiro.
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ arrayBuffer: await arquivo.arrayBuffer() });
    return analisarConteudo(normalizarTexto(value), 'docx');
  }

  if (/\.docx?$/i.test(arquivo.name)) {
    throw new Error(
      'Arquivos .doc (Word antigo) não são lidos no navegador. Abra no Word e salve como .docx ou como .txt.'
    );
  }

  return analisarConteudo(normalizarTexto(await arquivo.text()), 'txt');
}

/** Mesmo diagnóstico, para texto colado direto na caixa. */
export function importarTexto(bruto: string): DiagnosticoImportacao {
  return analisarConteudo(normalizarTexto(bruto), 'colado');
}
