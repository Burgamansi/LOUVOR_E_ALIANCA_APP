// Importação de cifra vinda do Word (.docx), do Google Docs ou de um .txt.
//
// A regra do fluxo: importar NUNCA grava direto. Sempre passa por um
// diagnóstico que a pessoa confere antes de salvar. Motivo prático: o Word
// costuma posicionar acorde com tabulação ou dentro de tabela, e nesses casos a
// coluna do acorde se perde na conversão. Melhor mostrar "reconheci 2 de 14
// linhas de acorde" e deixar corrigir do que salvar uma cifra torta que só vai
// dar problema na hora de tocar.

import { analisarCifra, ehLinhaDeAcordes } from './parser';
import { ehAcorde } from './acordes';
import type { Cifra } from './tipos';

export interface DiagnosticoImportacao {
  /** Texto já normalizado, pronto para o parser e para edição manual. */
  texto: string;
  cifra: Cifra;
  /** Tom deduzido do conteúdo — palpite, sempre editável antes de salvar. */
  tomSugerido: string;
  linhasDeAcorde: number;
  acordesDistintos: number;
  secoes: string[];
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

  return {
    texto,
    cifra,
    tomSugerido,
    linhasDeAcorde,
    acordesDistintos: distintos.size,
    secoes,
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
