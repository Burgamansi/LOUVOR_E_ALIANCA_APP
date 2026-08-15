// Separação de um arquivo de repertório nos cantos que ele contém.
//
// O arquivo que chega do Word não é uma música: é a missa inteira, com oito ou
// dez cantos em sequência. Importado como um bloco só, ele vira uma "música"
// gigante com um tom só — e baixar meio tom para o Ofertório baixava também o
// Santo, que estava bom.
//
// O sinal que usamos para achar os cortes é o momento litúrgico, não um
// heurístico genérico de "linha em maiúscula" ou "duas linhas em branco". A
// lista de momentos é fechada e é do domínio: ou a linha é um deles, ou não é.
// Isso erra muito menos — e onde ainda erra, a tela de importação mostra os
// cortes para conferência antes de salvar. Dividir errado em silêncio é pior
// do que perguntar.
//
// Um detalhe que só se vê fazendo: a divisão acontece ANTES do parser. O
// parser trata 'final', 'intro' e 'refrão' como seções dentro de uma música
// (RE_SECAO), então se ele rodasse primeiro, o "FINAL" que abre o último canto
// viraria a coda do canto anterior. Cortando antes, a linha do momento é
// consumida como fronteira e nunca chega ao parser.

import { analisarCifra, deduzirTom, ehLinhaDeAcordes } from './parser';

/** Os momentos da missa, na ordem em que acontecem. */
export const MOMENTOS_LITURGICOS = [
  'ENTRADA',
  'ATO PENITENCIAL',
  'GLÓRIA',
  'SALMO',
  'ACLAMAÇÃO',
  'OFERTÓRIO',
  'SANTO',
  'CORDEIRO',
  'COMUNHÃO',
  'PÓS-COMUNHÃO',
  'FINAL',
] as const;

export interface CantoDetectado {
  /** O momento litúrgico, quando o rótulo apareceu no arquivo. */
  momento: string | null;
  /** Primeira linha de letra do bloco — palpite de título, sempre editável. */
  titulo: string;
  /** O bloco de texto, sem a linha do rótulo, pronto para o parser. */
  texto: string;
  /** Tom deduzido só deste bloco. */
  tomSugerido: string;
  /** Linha do arquivo original onde o bloco começa — a tela mostra o corte. */
  linhaInicial: number;
  /** 'alta' quando veio de um rótulo de momento; 'media' quando foi deduzido. */
  confianca: 'alta' | 'media';
}

const semAcento = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toUpperCase();

// Cada momento com as grafias que aparecem na prática. Sem acento e em
// maiúsculas, porque é assim que a comparação é feita.
const CHAVES: { momento: string; formas: string[] }[] = [
  { momento: 'ENTRADA', formas: ['ENTRADA', 'CANTO DE ENTRADA', 'ABERTURA', 'PROCISSAO DE ENTRADA'] },
  { momento: 'ATO PENITENCIAL', formas: ['ATO PENITENCIAL', 'PENITENCIAL', 'SENHOR PIEDADE', 'KYRIE'] },
  { momento: 'GLÓRIA', formas: ['GLORIA'] },
  { momento: 'SALMO', formas: ['SALMO', 'SALMO RESPONSORIAL'] },
  { momento: 'ACLAMAÇÃO', formas: ['ACLAMACAO', 'ACLAMACAO AO EVANGELHO', 'ALELUIA'] },
  { momento: 'OFERTÓRIO', formas: ['OFERTORIO', 'OFERTAS', 'APRESENTACAO DAS OFERENDAS', 'CANTO DAS OFERENDAS'] },
  { momento: 'SANTO', formas: ['SANTO'] },
  { momento: 'CORDEIRO', formas: ['CORDEIRO', 'CORDEIRO DE DEUS', 'FRACAO DO PAO'] },
  { momento: 'COMUNHÃO', formas: ['COMUNHAO', 'CANTO DE COMUNHAO'] },
  { momento: 'PÓS-COMUNHÃO', formas: ['POS-COMUNHAO', 'POS COMUNHAO', 'ACAO DE GRACAS'] },
  { momento: 'FINAL', formas: ['FINAL', 'CANTO FINAL', 'ENVIO', 'DESPEDIDA'] },
];

/**
 * A linha é um cabeçalho de momento? Devolve o momento e o que sobrou da linha
 * depois dele — porque "OFERTÓRIO – Segue-me" traz o título junto.
 *
 * Exige que a linha seja curta e que não seja linha de acordes. 'SANTO' sozinho
 * numa linha é o momento; dentro de "Santo é o Senhor Deus do universo" não é,
 * e é por isso que a linha inteira precisa bater, não uma parte dela.
 */
export function lerCabecalhoDeMomento(linha: string): { momento: string; resto: string } | null {
  const cru = linha.trim();
  if (!cru || cru.length > 60) return null;

  // [Final] entre colchetes é marcação de seção da música, não momento da
  // missa. Quem escreve o momento não usa colchete.
  if (/^\[.*\]$/.test(cru)) return null;
  if (ehLinhaDeAcordes(cru)) return null;

  // Tira numeração e enfeites: "1 - ", "2. ", "•", "*ENTRADA*", "== SANTO =="
  const limpa = cru
    .replace(/^[\s*_=~•·\-–—]+/, '')
    .replace(/[\s*_=~•·]+$/, '')
    .replace(/^\d+\s*[).\-–—:]?\s*/, '');

  const alvo = semAcento(limpa);

  for (const { momento, formas } of CHAVES) {
    for (const forma of formas) {
      if (alvo === forma) return { momento, resto: '' };

      // "OFERTÓRIO: Segue-me" / "ENTRADA – Vem, Senhor" / "COMUNHÃO 2"
      const comSeparador = new RegExp(`^${forma}\\s*(?:\\d+\\s*)?[:\\-–—|]\\s*(.+)$`);
      const m = comSeparador.exec(alvo);
      if (m) {
        // O resto sai da linha original, com acento e caixa preservados.
        const corte = limpa.length - m[1].length;
        return { momento, resto: limpa.slice(corte).trim() };
      }

      // "COMUNHÃO 2" sem separador nenhum.
      if (new RegExp(`^${forma}\\s+\\d+$`).test(alvo)) return { momento, resto: '' };
    }
  }

  return null;
}

/** A última linha com conteúdo antes de `i` — '' se não houver nenhuma. */
function ultimaLinhaComTexto(linhas: string[], i: number): string {
  for (let j = i - 1; j >= 0; j--) {
    if (linhas[j].trim()) return linhas[j];
  }
  return '';
}

/** O primeiro verso do bloco — o que serve de título quando não há outro. */
function primeiraLinhaDeLetra(linhas: string[]): string {
  for (const l of linhas) {
    const t = l.trim();
    if (!t) continue;
    if (ehLinhaDeAcordes(t)) continue;
    if (/^\[.*\]$/.test(t)) continue;
    return t.replace(/\s+/g, ' ').slice(0, 60);
  }
  return '';
}

function montarCanto(
  momento: string | null,
  tituloDoCabecalho: string,
  corpo: string[],
  linhaInicial: number,
  confianca: CantoDetectado['confianca']
): CantoDetectado | null {
  // Corta o vazio das pontas sem mexer no meio, que é alinhamento.
  while (corpo.length && !corpo[0].trim()) corpo.shift();
  while (corpo.length && !corpo[corpo.length - 1].trim()) corpo.pop();
  if (corpo.length === 0) return null;

  const texto = corpo.join('\n');
  const cifra = analisarCifra(texto, 'C', 'manual');

  return {
    momento,
    titulo: tituloDoCabecalho || primeiraLinhaDeLetra(corpo),
    texto,
    tomSugerido: deduzirTom(cifra),
    linhaInicial,
    confianca,
  };
}

/**
 * Divide o texto do arquivo nos cantos que ele contém.
 *
 * Devolve sempre pelo menos um canto: um arquivo com uma música só volta com um
 * elemento, e o fluxo de importação continua igual ao que era.
 */
export function dividirEmCantos(texto: string): CantoDetectado[] {
  const linhas = texto.split('\n');

  const marcos: { indice: number; momento: string; resto: string }[] = [];
  linhas.forEach((linha, i) => {
    const cab = lerCabecalhoDeMomento(linha);
    if (!cab) return;

    // Vários momentos dão nome ao próprio canto: o Santo começa com "Santo", o
    // Cordeiro com "Cordeiro de Deus", o Glória com "Glória a Deus". Sozinha, a
    // linha "Cordeiro de Deus" é indistinguível do rótulo — e sem isto o canto
    // do Cordeiro se parte em dois, um deles só com a linha de acordes.
    //
    // O que separa os dois é a vizinhança, não o texto: um verso vem depois da
    // sua linha de acordes; um rótulo de momento não tem acorde antes dele.
    //
    // Precisa ser "a última linha com conteúdo", não "a linha de cima": o
    // mammoth separa os parágrafos do .docx com DUAS quebras de linha, então
    // no arquivo de verdade sempre há uma linha em branco entre o acorde e a
    // letra. Olhando só uma linha acima, isto funcionava com texto colado e
    // falhava com todo .docx — que é justamente o caminho principal.
    if (ehLinhaDeAcordes(ultimaLinhaComTexto(linhas, i))) return;

    marcos.push({ indice: i, momento: cab.momento, resto: cab.resto });
  });

  // Nenhum rótulo de momento: não há sinal confiável para cortar. Volta o
  // arquivo inteiro como um canto e a tela avisa que não deu para separar —
  // melhor do que inventar fronteiras onde não há.
  if (marcos.length === 0) {
    const unico = montarCanto(null, '', [...linhas], 0, 'media');
    return unico ? [unico] : [];
  }

  const cantos: CantoDetectado[] = [];

  // O que vem antes do primeiro rótulo, se tiver conteúdo, é um canto sem
  // momento declarado — normalmente a primeira música, cujo rótulo o arquivo
  // não trouxe.
  const antes = linhas.slice(0, marcos[0].indice);
  if (antes.some((l) => l.trim())) {
    const c = montarCanto(null, '', antes, 0, 'media');
    if (c) cantos.push(c);
  }

  marcos.forEach((marco, i) => {
    const fim = i + 1 < marcos.length ? marcos[i + 1].indice : linhas.length;
    const corpo = linhas.slice(marco.indice + 1, fim);
    const c = montarCanto(marco.momento, marco.resto, corpo, marco.indice, 'alta');
    if (c) cantos.push(c);
  });

  return cantos;
}
