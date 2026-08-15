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
// Requisito operacional do primeiro caso: o arquivo precisa estar compartilhado
// como "qualquer pessoa com o link". Sem isso o visitante vê a tela de login do
// Google, não o documento.

export type ModoPreview = 'drive' | 'office' | 'nativo' | 'indisponivel';

export interface Preview {
  modo: ModoPreview;
  src: string | null;
  /** true quando o iframe precisa de allow-same-origin (Drive e Office exigem). */
  precisaMesmaOrigem: boolean;
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
    return { modo: 'drive', src, precisaMesmaOrigem: true };
  }

  if (EXT_OFFICE.test(url) && /^https?:\/\//.test(url)) {
    return {
      modo: 'office',
      src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
      precisaMesmaOrigem: true,
    };
  }

  if (/\.pdf($|\?)/i.test(url)) {
    return { modo: 'nativo', src: url, precisaMesmaOrigem: false };
  }

  return { modo: 'indisponivel', src: null, precisaMesmaOrigem: false };
}

/**
 * Atributos do <iframe> de preview.
 *
 * O sandbox é o que impede um documento de terceiro de navegar a janela de
 * cima ou abrir pop-up. `allow-same-origin` entra só quando o visualizador
 * precisa (Drive e Office), nunca no PDF nativo.
 */
export function atributosDoIframe(preview: Preview) {
  const sandbox = [
    'allow-scripts',
    'allow-popups',
    'allow-forms',
    ...(preview.precisaMesmaOrigem ? ['allow-same-origin'] : []),
  ].join(' ');

  return {
    src: preview.src ?? undefined,
    sandbox,
    loading: 'lazy' as const,
    referrerPolicy: 'no-referrer' as const,
    allowFullScreen: true,
    title: 'Pré-visualização do documento',
  };
}
