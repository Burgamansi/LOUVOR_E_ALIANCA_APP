// Gravar a lista de arquivos de uma missa no banco do ministério.
//
// Manda a lista inteira daquela celebração, não um arquivo por vez: é o que a
// tela tem em mãos, e resolve a remoção de graça — o que sumiu da lista some
// do banco, sem uma segunda rota só para apagar.
//
// Devolve o resultado em vez de lançar. Quem chama precisa saber a diferença
// entre "gravei para a equipe" e "não deu, guardei só aqui", porque são duas
// mensagens diferentes na tela — e dizer "salvo" quando ficou só no aparelho
// é o tipo de mentira que só aparece na hora da missa.

import type { ArquivoMissa } from '../../data/missas';

export type ResultadoGravacao =
  | { ok: true }
  | { ok: false; motivo: string };

export async function gravarArquivosNoBanco(
  slug: string,
  arquivos: ArquivoMissa[]
): Promise<ResultadoGravacao> {
  try {
    const resposta = await fetch('/api/arquivos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        arquivos: arquivos.map((a) => ({
          tipo: a.tipo,
          driveFileId: a.driveFileId,
          nomeExibicao: a.nomeExibicao,
          tamanhoBytes: a.tamanhoBytes,
        })),
      }),
    });

    if (resposta.ok) return { ok: true };

    // O servidor recusou por um motivo que ele sabe explicar — tipo de arquivo
    // inválido, missa que não existe. Vale mostrar: é erro de conteúdo, e
    // guardar no aparelho não conserta.
    const corpo = (await resposta.json().catch(() => null)) as { erro?: string } | null;
    return { ok: false, motivo: corpo?.erro ?? `O servidor recusou (HTTP ${resposta.status}).` };
  } catch {
    // Sem rede, servidor fora, banco desligado. Aqui o aparelho ainda serve.
    return { ok: false, motivo: 'Sem conexão com o servidor.' };
  }
}
