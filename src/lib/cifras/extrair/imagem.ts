// Foto ou captura de cifra → uma imagem para olhar, e um marcador no texto.
//
// O app não tem OCR nem leitura por modelo de visão. Dizer que "interpretou"
// a foto seria inventar conteúdo — exatamente o que a regra principal proíbe.
// O que fazemos é honesto: a imagem entra no diagnóstico para a pessoa ver, e
// o texto começa com REVISÃO NECESSÁRIA para ela transcrever a cifra ali
// mesmo, na caixa "Editar antes de salvar".

import type { ConteudoExtraido } from './tipos';
import { marcadorDeImagem } from './tipos';

function lerComoDataUrl(arquivo: Blob): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(String(leitor.result));
    leitor.onerror = () => rejeitar(leitor.error ?? new Error('Não consegui ler a imagem.'));
    leitor.readAsDataURL(arquivo);
  });
}

export async function extrairImagem(arquivo: Blob, nome: string): Promise<ConteudoExtraido> {
  const dataUrl = await lerComoDataUrl(arquivo);
  return {
    texto: marcadorDeImagem(1, nome),
    imagens: [{ indice: 1, nome, dataUrl }],
  };
}
