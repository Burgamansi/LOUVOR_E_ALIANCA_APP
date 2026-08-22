// Word (.docx) → texto na ordem do documento, com as imagens no lugar.
//
// O `mammoth.extractRawText` que usávamos descarta as imagens em silêncio —
// e cifra de igreja vem com figura no meio com frequência: a partitura do
// refrão colada como foto, o acorde desenhado. Perder isso sem avisar é o
// pior caso: a pessoa só descobre no altar.
//
// Aqui percorremos a árvore do documento que o mammoth monta (parágrafos,
// runs, texto, tabulação, quebra, imagem, tabela) e produzimos o texto nós
// mesmos. Cada imagem vira uma linha marcada para revisão, exatamente onde
// estava, e vai para a lista de imagens com o seu conteúdo em data: URL.
//
// Tabela: cada linha da tabela vira uma linha de texto com as células
// separadas por tabulação (que o normalizador transforma em quatro espaços).
// É o melhor que dá para fazer com acorde em célula — e o diagnóstico avisa
// quando o alinhamento não sobreviveu.

import type { ConteudoExtraido } from './tipos';
import { marcadorDeImagem, extensaoDaImagem } from './tipos';
import type { ImagemDoDocumento } from '../importar';

// A árvore interna do mammoth não é tipada no pacote; este é o subconjunto
// que percorremos.
interface No {
  type: string;
  children?: No[];
  value?: string;
  contentType?: string;
  altText?: string;
  readAsBase64String?: () => Promise<string>;
}

export async function extrairDocx(arrayBuffer: ArrayBuffer): Promise<ConteudoExtraido> {
  // Sob demanda: o mammoth (≈ 200 KB) só entra no bundle de quem importa um
  // .docx, não no carregamento do app inteiro.
  const mammoth = await import('mammoth');

  const linhas: string[] = [];
  const imagens: ImagemDoDocumento[] = [];
  const pendentes: Promise<void>[] = [];

  const registrarImagem = (no: No): string => {
    const indice = imagens.length + 1;
    const contentType = no.contentType ?? 'image/png';
    const nome = `imagem-${indice}.${extensaoDaImagem(contentType)}`;
    const entrada: ImagemDoDocumento = { indice, nome, dataUrl: '' };
    imagens.push(entrada);

    if (no.readAsBase64String) {
      pendentes.push(
        no.readAsBase64String().then((b64) => {
          entrada.dataUrl = `data:${contentType};base64,${b64}`;
        })
      );
    }
    return marcadorDeImagem(indice, nome);
  };

  // Texto de um parágrafo. Uma imagem no meio do parágrafo quebra a linha:
  // o que vinha antes fica numa linha, o marcador na seguinte, o resto depois.
  const textoDoParagrafo = (no: No): string[] => {
    const saida: string[] = [];
    let atual = '';
    const fechar = () => { saida.push(atual); atual = ''; };

    const visitar = (n: No) => {
      switch (n.type) {
        case 'text': atual += n.value ?? ''; break;
        case 'tab': atual += '\t'; break;
        case 'break': fechar(); break;
        case 'image':
          if (atual.trim()) fechar(); else atual = '';
          saida.push(registrarImagem(n));
          break;
        default:
          for (const filho of n.children ?? []) visitar(filho);
      }
    };
    for (const filho of no.children ?? []) visitar(filho);
    // Parágrafo vazio é uma linha em branco de verdade (respiro entre
    // estrofes). Mas depois de uma imagem, o resto vazio não é linha nenhuma.
    if (saida.length === 0 || atual.length > 0) fechar();
    return saida;
  };

  const visitarBloco = (no: No) => {
    switch (no.type) {
      case 'paragraph':
        linhas.push(...textoDoParagrafo(no));
        break;
      case 'table':
        for (const linha of no.children ?? []) {
          if (linha.type !== 'tableRow') { visitarBloco(linha); continue; }
          const celulas = (linha.children ?? []).map((celula) =>
            (celula.children ?? []).flatMap((p) => (p.type === 'paragraph' ? textoDoParagrafo(p) : [])).join(' ')
          );
          linhas.push(celulas.join('\t'));
        }
        break;
      default:
        for (const filho of no.children ?? []) visitarBloco(filho);
    }
  };

  // No navegador o mammoth lê `arrayBuffer`; no Node (testes) lê `buffer`.
  // Os dois juntos atendem às duas builds sem ramificar o código.
  const entrada = { arrayBuffer, buffer: new Uint8Array(arrayBuffer) } as unknown as { arrayBuffer: ArrayBuffer };

  await mammoth.convertToHtml(
    entrada,
    {
      // Percorre a árvore antes da conversão. Devolvemos o documento intacto;
      // o HTML que sai é descartado — só queríamos passar pela árvore.
      transformDocument: (documento: No) => { visitarBloco(documento); return documento; },
      convertImage: mammoth.images.imgElement(async () => ({ src: '' })),
    }
  );

  await Promise.all(pendentes);

  return { texto: linhas.join('\n'), imagens };
}
