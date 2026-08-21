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
import { campoHarmonico } from './render';
import { dividirEmCantos } from './cantos';
import type { CantoDetectado } from './cantos';
import { confiancaDaCifra, linhasParaRevisar } from './tipos';
import type { Cifra } from './tipos';
import { validarArquivo, EXTENSOES_CIFRA, LIMITE_CIFRA_BYTES } from '../upload/validar';

export type OrigemImportacao = 'docx' | 'pdf' | 'imagem' | 'txt' | 'colado';

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
  /** Os acordes encontrados, na ordem em que aparecem — a tela mostra como chips. */
  acordes: string[];
  secoes: string[];
  /** Linhas marcadas como REVISÃO NECESSÁRIA. Zero = leitura limpa. */
  paraRevisar: number;
  /** 0 a 1 — fração do conteúdo reconhecido sem dúvida. */
  confianca: number;
  /**
   * Os cantos encontrados dentro do arquivo. Um arquivo de missa traz oito ou
   * dez; um arquivo de uma música só traz um, e aí o fluxo é o de sempre.
   */
  cantos: CantoDetectado[];
  /** O que pode ter se perdido. Vazio = importação limpa. */
  avisos: string[];
  origem: OrigemImportacao;
  /**
   * Imagens que vieram dentro do documento (Word com figura no meio da cifra,
   * PDF escaneado, foto). Não são interpretadas — o app não tem OCR — mas
   * ficam aqui para a tela mostrar ao lado do trecho marcado para revisão,
   * de modo que a pessoa transcreva olhando para a imagem.
   */
  imagens: ImagemDoDocumento[];
}

export interface ImagemDoDocumento {
  /** Número de ordem no documento, a partir de 1 — é o que a linha de revisão cita. */
  indice: number;
  nome: string;
  /** data: URL, pronta para <img src>. */
  dataUrl: string;
  /** Página de origem, quando faz sentido (PDF). */
  pagina?: number;
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

export function analisarConteudo(
  texto: string,
  origem: OrigemImportacao,
  imagens: ImagemDoDocumento[] = []
): DiagnosticoImportacao {
  const linhas = texto.split('\n');
  const cifra = analisarCifra(texto, 'C', origem);
  const tomSugerido = deduzirTom(cifra);
  const paraRevisar = linhasParaRevisar(cifra);

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

  if (paraRevisar > 0) {
    avisos.push(
      `${paraRevisar} ${paraRevisar === 1 ? 'trecho ficou marcado' : 'trechos ficaram marcados'} como REVISÃO NECESSÁRIA. Nada foi inventado no lugar: confira e corrija antes de confirmar.`
    );
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
    acordes: campoHarmonico(cifra),
    secoes,
    paraRevisar,
    confianca: confiancaDaCifra(cifra),
    cantos,
    avisos,
    origem,
    imagens,
  };
}

/**
 * Lê o arquivo escolhido e devolve o diagnóstico, sem salvar nada.
 *
 * Valida extensão, MIME e tamanho ANTES de ler qualquer byte. Cada formato
 * tem o seu extrator em `./extrair/`, carregado sob demanda para não pesar o
 * bundle de quem nunca importa aquele tipo.
 */
export async function importarArquivo(arquivo: File): Promise<DiagnosticoImportacao> {
  if (/\.doc$/i.test(arquivo.name)) {
    throw new Error(
      'Arquivos .doc (Word antigo) não são lidos no navegador. Abra no Word e salve como .docx ou como .txt.'
    );
  }

  const validacao = validarArquivo(arquivo, { extensoes: EXTENSOES_CIFRA, limiteBytes: LIMITE_CIFRA_BYTES });
  if (!validacao.ok) throw new Error(validacao.erro);

  switch (validacao.extensao) {
    case 'docx': {
      const { extrairDocx } = await import('./extrair/docx');
      const { texto, imagens } = await extrairDocx(await arquivo.arrayBuffer());
      return analisarConteudo(normalizarTexto(texto), 'docx', imagens);
    }
    case 'pdf': {
      const { extrairPdf } = await import('./extrair/pdf');
      const { texto, imagens } = await extrairPdf(await arquivo.arrayBuffer());
      return analisarConteudo(normalizarTexto(texto), 'pdf', imagens);
    }
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp': {
      const { extrairImagem } = await import('./extrair/imagem');
      const { texto, imagens } = await extrairImagem(arquivo, validacao.nome);
      return analisarConteudo(normalizarTexto(texto), 'imagem', imagens);
    }
    default:
      return analisarConteudo(normalizarTexto(await arquivo.text()), 'txt');
  }
}

/** Mesmo diagnóstico, para texto colado direto na caixa. */
export function importarTexto(bruto: string): DiagnosticoImportacao {
  return analisarConteudo(normalizarTexto(bruto), 'colado');
}

/**
 * Reanalisa o texto depois de a pessoa editar na tela de revisão. Mantém a
 * origem e as imagens do diagnóstico anterior: editar o texto não faz o
 * arquivo deixar de ter sido um PDF, nem some com a figura que ele trazia.
 */
export function reanalisar(anterior: DiagnosticoImportacao, texto: string): DiagnosticoImportacao {
  return analisarConteudo(normalizarTexto(texto), anterior.origem, anterior.imagens);
}
