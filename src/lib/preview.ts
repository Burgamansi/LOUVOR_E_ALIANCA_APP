// Pré-visualização de documentos sem download.
//
// Três caminhos, escolhidos pelo que o arquivo é — não por preferência:
//
//  · Google Drive/Docs/Sheets/Slides → o próprio visualizador do Drive
//    (`/preview`). Renderiza PDF, DOCX e PPTX nativamente e é o único que
//    funciona para arquivo que mora no Drive.
//  · Arquivo Office servido do NOSSO domínio → Office Online Viewer. Ele
//    precisa baixar o arquivo pela internet pública, então NÃO funciona com
//    link do Drive — é para quando o arquivo estiver hospedado por nós.
//  · PDF do nosso domínio → o visualizador nativo do navegador, num <iframe>.
//    Zero terceiros, zero latência.
//
// Duas condições operacionais, e as duas já morderam:
//
//  1. o arquivo precisa estar compartilhado como "qualquer pessoa com o link";
//  2. o navegador precisa deixar o visualizador do Google usar os cookies dele
//     dentro do nosso iframe. Edge e Chrome bloqueiam cookie de terceiro por
//     padrão, e um <iframe sandbox> sem `allow-storage-access-by-user-activation`
//     nem chega a poder pedir acesso — o resultado é a tela "Permita que o
//     Google acesse os cookies necessários" no lugar do documento.
//
// Por isso o visualizador do Google não vai mais em sandbox restritivo, e todo
// preview carrega com um plano B: miniatura da primeira página (endpoint de
// imagem, que não depende de cookie) e o link direto, sempre visível.

export type ModoPreview = 'drive' | 'office' | 'nativo' | 'indisponivel';

export interface Preview {
  modo: ModoPreview;
  src: string | null;
  /**
   * Visualizador de fornecedor conhecido (Google, Microsoft). Estes precisam de
   * acesso ao próprio armazenamento para renderizar e não são sandboxados.
   */
  confiavel: boolean;
  /**
   * Primeira página como imagem. Não passa por cookie nem por login de
   * terceiro, então é o que ainda aparece quando o iframe é bloqueado.
   */
  miniatura: string | null;
}

/** Extrai o id de um link do Drive/Docs/Sheets/Slides. */
export function idDoDrive(url: string): string | null {
  const padroes = [
    /drive\.google\.com\/file\/d\/([\w-]{20,})/,
    /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([\w-]{20,})/,
    /drive\.google\.com\/open\?id=([\w-]{20,})/,
    /[?&]id=([\w-]{20,})/,
  ];
  for (const re of padroes) {
    const m = re.exec(url);
    if (m) return m[1];
  }
  return null;
}

const TIPO_GOOGLE = /docs\.google\.com\/(document|spreadsheets|presentation)\//;

const EXT_OFFICE = /\.(docx?|xlsx?|pptx?)($|\?)/i;

/** Miniatura da primeira página de um arquivo do Drive, em imagem. */
export function miniaturaDoDrive(id: string, largura = 1600): string {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${largura}`;
}

/**
 * Resolve como pré-visualizar. `driveFileId` vem da tabela `arquivos` quando
 * já conhecemos o arquivo; senão tenta deduzir da URL.
 */
export function resolverPreview(url: string, driveFileId?: string | null): Preview {
  const id = driveFileId ?? idDoDrive(url);

  if (id) {
    const g = TIPO_GOOGLE.exec(url);
    const src = g
      ? `https://docs.google.com/${g[1]}/d/${id}/preview`
      : `https://drive.google.com/file/d/${id}/preview`;
    return { modo: 'drive', src, confiavel: true, miniatura: miniaturaDoDrive(id) };
  }

  if (EXT_OFFICE.test(url) && /^https?:\/\//.test(url)) {
    return {
      modo: 'office',
      src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
      confiavel: true,
      miniatura: null,
    };
  }

  if (/\.pdf($|\?)/i.test(url)) {
    return { modo: 'nativo', src: url, confiavel: false, miniatura: null };
  }

  return { modo: 'indisponivel', src: null, confiavel: false, miniatura: null };
}

/**
 * Atributos do <iframe> de preview.
 *
 * Visualizador conhecido (Google, Office) vai sem `sandbox`: com
 * `allow-same-origin allow-scripts` o sandbox já não protegia de nada — a
 * própria especificação avisa que essa dupla devolve ao documento os poderes
 * que o sandbox tirou — e ainda por cima impedia o Google de pedir acesso ao
 * armazenamento, que é o que produzia a tela de cookies.
 *
 * O referrer vai como `origin`: o visualizador do Drive usa o domínio de origem
 * para decidir se pode embutir. Com `no-referrer` ele não sabe quem está
 * pedindo e cai no caminho mais restrito.
 *
 * Documento de origem arbitrária (PDF solto na internet) continua em sandbox
 * fechado — ali o risco é real e não há visualizador para quebrar.
 */
export function atributosDoIframe(preview: Preview) {
  const base = {
    src: preview.src ?? undefined,
    loading: 'lazy' as const,
    referrerPolicy: 'origin' as const,
    allowFullScreen: true,
    title: 'Pré-visualização do documento',
  };

  if (preview.confiavel) return base;

  return {
    ...base,
    sandbox: 'allow-scripts allow-popups allow-storage-access-by-user-activation',
  };
}
