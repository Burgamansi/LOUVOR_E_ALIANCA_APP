// O que todo extrator devolve: o texto do documento, na ordem em que as
// coisas aparecem nele, e as imagens que ele trazia.
//
// Imagem não é interpretada — o app não tem OCR. No lugar dela entra uma
// linha marcada com REVISÃO NECESSÁRIA, na posição exata em que a imagem
// estava (texto → imagem → texto continua texto → marcador → texto), e a
// própria imagem vai junto para a tela mostrar ao lado do marcador.

import type { ImagemDoDocumento } from '../importar';
import { MARCADOR_REVISAO } from '../tipos';

export interface ConteudoExtraido {
  texto: string;
  imagens: ImagemDoDocumento[];
}

/** A linha que entra no texto no lugar de uma imagem. */
export function marcadorDeImagem(indice: number, nome: string, onde?: string): string {
  const local = onde ? ` ${onde}` : '';
  return `${MARCADOR_REVISAO} Imagem ${indice} (${nome})${local} — o conteúdo da imagem não foi lido; transcreva a cifra deste trecho olhando para ela.`;
}

/** Extensão de arquivo a partir do tipo MIME da imagem. */
export function extensaoDaImagem(contentType: string): string {
  const m = /^image\/(jpeg|jpg|png|webp|gif|bmp|tiff|svg\+xml)$/i.exec(contentType.trim());
  if (!m) return 'img';
  const e = m[1].toLowerCase();
  return e === 'jpeg' ? 'jpg' : e === 'svg+xml' ? 'svg' : e;
}
