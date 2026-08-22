// PDF → texto com as colunas reconstruídas, página a página.
//
// Dois casos, decididos por página e não por arquivo — um PDF pode ter a
// primeira página digitada e a segunda escaneada:
//
//  · página com texto selecionável: o pdf.js entrega cada pedaço de texto com
//    a sua posição (x, y). Agrupamos por linha (mesmo y), ordenamos por x e
//    convertemos x em coluna de caractere. É isso que põe o acorde de volta
//    sobre a sílaba: o PDF não tem "espaços", tem posições;
//  · página sem texto (escaneada, ou cifra colada como figura): vira imagem.
//    No navegador a página é desenhada num canvas e vai para a tela como
//    data: URL; no texto entra a linha REVISÃO NECESSÁRIA. Nada é chutado.

import type { ConteudoExtraido } from './tipos';
import { marcadorDeImagem } from './tipos';
import type { ImagemDoDocumento } from '../importar';

/** Um pedaço de texto posicionado — o que o pdf.js devolve, reduzido ao que usamos. */
export interface ItemDeTexto {
  str: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/**
 * Reconstrói as linhas de uma página a partir dos pedaços posicionados.
 *
 * Coluna = (x − x mínimo da página) ÷ largura média de um caractere. A largura
 * média sai dos próprios pedaços (largura ÷ número de caracteres), pela
 * mediana, para uma palavra em negrito não puxar a conta. Em fonte
 * proporcional a coluna é aproximada — mas é a mesma aproximação para o
 * acorde e para a sílaba embaixo dele, então os dois caem juntos.
 *
 * Função pura, sem pdf.js: é o que os testes exercitam.
 */
export function reconstruirLinhas(itens: ItemDeTexto[]): string[] {
  const comTexto = itens.filter((i) => i.str.length > 0 && i.str.trim().length > 0);
  if (comTexto.length === 0) return [];

  const larguras = comTexto
    .filter((i) => i.largura > 0)
    .map((i) => i.largura / i.str.length)
    .sort((a, b) => a - b);
  const larguraChar = larguras.length ? larguras[Math.floor(larguras.length / 2)] : 1;

  const alturaTipica = (() => {
    const hs = comTexto.map((i) => i.altura).filter((h) => h > 0).sort((a, b) => a - b);
    return hs.length ? hs[Math.floor(hs.length / 2)] : 10;
  })();
  const tolerancia = Math.max(alturaTipica * 0.5, 1);

  const xMin = Math.min(...comTexto.map((i) => i.x));

  // Agrupa por y com tolerância: pedaços da mesma linha têm y quase igual.
  const ordenados = [...comTexto].sort((a, b) => b.y - a.y || a.x - b.x);
  const grupos: ItemDeTexto[][] = [];
  for (const item of ordenados) {
    const grupo = grupos[grupos.length - 1];
    if (grupo && Math.abs(grupo[0].y - item.y) <= tolerancia) grupo.push(item);
    else grupos.push([item]);
  }

  return grupos.map((grupo) => {
    let linha = '';
    for (const item of [...grupo].sort((a, b) => a.x - b.x)) {
      const col = Math.max(0, Math.round((item.x - xMin) / larguraChar));
      const alvo = linha.length === 0 ? col : Math.max(col, linha.length + (linha.endsWith(' ') ? 0 : 1));
      linha = linha.padEnd(alvo, ' ') + item.str;
    }
    return linha.replace(/\s+$/, '');
  });
}

/** Desenha a página num canvas e devolve PNG em data: URL. Só no navegador. */
async function paginaComoImagem(pagina: {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
}): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const viewport = pagina.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await pagina.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

export async function extrairPdf(arrayBuffer: ArrayBuffer): Promise<ConteudoExtraido> {
  // Sob demanda e na build "legacy", que funciona tanto no navegador quanto
  // no Node dos testes. O worker só existe no navegador.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (typeof window !== 'undefined') {
    const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  }

  const documento = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const paginas: string[] = [];
  const imagens: ImagemDoDocumento[] = [];

  try {
    for (let n = 1; n <= documento.numPages; n++) {
      const pagina = await documento.getPage(n);
      const conteudo = await pagina.getTextContent();

      const itens: ItemDeTexto[] = [];
      for (const item of conteudo.items) {
        if (!('str' in item)) continue;
        itens.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
          largura: item.width,
          altura: item.height,
        });
      }

      const linhas = reconstruirLinhas(itens);
      if (linhas.length > 0) {
        paginas.push(linhas.join('\n'));
        continue;
      }

      // Página sem texto: escaneada ou figura. Vira imagem + marcador.
      const indice = imagens.length + 1;
      const nome = `pagina-${n}.png`;
      const dataUrl = await paginaComoImagem(pagina);
      imagens.push({ indice, nome, dataUrl: dataUrl ?? '', pagina: n });
      paginas.push(marcadorDeImagem(indice, nome, `— página ${n} do PDF, sem texto selecionável`));
    }
  } finally {
    await documento.destroy();
  }

  return { texto: paginas.join('\n\n'), imagens };
}
