// Validação de arquivo escolhido pela pessoa — antes de ler um byte dele.
//
// Tudo o que entra pelo <input type="file"> ou por arrastar é conteúdo
// externo. Três regras, nesta ordem:
//
//  1. extensão E tipo MIME precisam bater com a lista permitida. Um `.pdf` com
//     MIME de executável é recusado; um MIME vazio (acontece no Windows com
//     .webp e .docx) é aceito se a extensão estiver na lista — o MIME é dica
//     do sistema operacional, não prova;
//  2. tamanho tem teto. Cifra é texto; 20 MB já é uma foto grande;
//  3. o nome é saneado antes de ser exibido ou guardado: sem caminho, sem
//     caracteres de controle, sem `..`, comprimento limitado.
//
// O conteúdo do documento nunca é executado: .docx é lido como ZIP+XML pelo
// mammoth, PDF pelo pdf.js, imagem vira <img>. Nada passa por eval, por
// innerHTML sem sanitização, nem por URL de terceiro.

export type Extensao =
  | 'docx' | 'doc' | 'txt' | 'pdf'
  | 'jpg' | 'jpeg' | 'png' | 'webp'
  | 'ppt' | 'pptx';

/** Tipos MIME aceitos para cada extensão. Lista fechada. */
const MIME_POR_EXTENSAO: Record<Extensao, readonly string[]> = {
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc:  ['application/msword'],
  txt:  ['text/plain'],
  pdf:  ['application/pdf'],
  jpg:  ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png:  ['image/png'],
  webp: ['image/webp'],
  ppt:  ['application/vnd.ms-powerpoint'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

/** O que a importação de cifra aceita. `.doc` fica de fora: não há leitor no navegador. */
export const EXTENSOES_CIFRA: readonly Extensao[] = ['docx', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'webp'];

/** O que um arquivo de missa pode ser. */
export const EXTENSOES_ARQUIVO_MISSA: readonly Extensao[] =
  ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'webp'];

export const LIMITE_CIFRA_BYTES = 20 * 1024 * 1024;
export const LIMITE_ARQUIVO_BYTES = 100 * 1024 * 1024;

export interface ResultadoValidacao {
  ok: boolean;
  /** Mensagem para a pessoa, já em português. Vazia quando ok. */
  erro: string;
  extensao: Extensao | null;
  /** Nome saneado, seguro para exibir e guardar. */
  nome: string;
}

/** Extensão em minúsculas, sem o ponto — ou null se não houver. */
export function extensaoDe(nome: string): string | null {
  const m = /\.([a-z0-9]{1,8})$/i.exec(nome.trim());
  return m ? m[1].toLowerCase() : null;
}

/**
 * Nome de arquivo seguro.
 *
 * Remove qualquer caminho (`../../x`, `C:\x`), caracteres de controle e os
 * que não podem aparecer em nome de arquivo em nenhum sistema. Colapsa `..`
 * para impedir travessia de diretório caso o nome um dia vire caminho no
 * servidor. Limita a 120 caracteres preservando a extensão.
 */
export function sanitizarNome(bruto: string): string {
  let nome = bruto
    .replace(/[\\/]+/g, ' ')                 // separadores de caminho viram espaço
    .replace(/[\u0000-\u001F\u007F]/g, '')     // caracteres de controle
    .replace(/[<>:"|?*]/g, '')                 // proibidos no Windows
    .split(/\s+/)
    // Cada pedaço: sem ponto no início (nome oculto, "..") e sem ".." no meio.
    .map((pedaco) => pedaco.replace(/^\.+/, '').replace(/\.{2,}/g, '.'))
    .filter(Boolean)
    .join(' ');

  if (!nome) nome = 'arquivo';

  if (nome.length > 120) {
    const ext = extensaoDe(nome);
    const base = ext ? nome.slice(0, -(ext.length + 1)) : nome;
    nome = ext ? `${base.slice(0, 120 - ext.length - 1)}.${ext}` : base.slice(0, 120);
  }
  return nome;
}

/** "Word (.docx), texto (.txt), PDF ou imagem (JPG, PNG, WEBP)" — para a tela. */
export function descreverAceitos(extensoes: readonly Extensao[]): string {
  const partes: string[] = [];
  const tem = (e: Extensao) => extensoes.includes(e);
  if (tem('docx') || tem('doc')) partes.push(`Word (${[tem('doc') && '.doc', tem('docx') && '.docx'].filter(Boolean).join(', ')})`);
  if (tem('txt')) partes.push('texto (.txt)');
  if (tem('pdf')) partes.push('PDF');
  if (tem('pptx') || tem('ppt')) partes.push(`PowerPoint (${[tem('ppt') && '.ppt', tem('pptx') && '.pptx'].filter(Boolean).join(', ')})`);
  const imagens = (['jpg', 'jpeg', 'png', 'webp'] as Extensao[]).filter(tem);
  if (imagens.length) partes.push(`imagem (${imagens.map((i) => i.toUpperCase()).join(', ')})`);
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} ou ${partes[partes.length - 1]}`;
}

export function limiteLegivel(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${Math.round(bytes / 1024 / 1024)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Valida nome, extensão, MIME e tamanho. Não lê o conteúdo.
 *
 * `arquivo` é o mínimo que um File tem — assim a função também serve em Node,
 * nos testes, sem precisar do objeto File do navegador.
 */
export function validarArquivo(
  arquivo: { name: string; type: string; size: number },
  opcoes: { extensoes: readonly Extensao[]; limiteBytes: number }
): ResultadoValidacao {
  const nome = sanitizarNome(arquivo.name);
  const ext = extensaoDe(nome);
  const aceitas = opcoes.extensoes;

  if (!ext || !(aceitas as readonly string[]).includes(ext)) {
    return {
      ok: false,
      extensao: null,
      nome,
      erro: `Este tipo de arquivo não é aceito aqui${ext ? ` (.${ext})` : ''}. Aceita ${descreverAceitos(aceitas)}.`,
    };
  }

  const extensao = ext as Extensao;
  const mime = arquivo.type.trim().toLowerCase();

  // MIME vazio acontece (Windows com .webp/.docx); MIME errado não.
  if (mime && !MIME_POR_EXTENSAO[extensao].includes(mime)) {
    return {
      ok: false,
      extensao,
      nome,
      erro: `O conteúdo do arquivo não corresponde à extensão .${extensao} (tipo informado: ${mime}). Por segurança, ele não será lido.`,
    };
  }

  if (arquivo.size <= 0) {
    return { ok: false, extensao, nome, erro: 'O arquivo está vazio.' };
  }

  if (arquivo.size > opcoes.limiteBytes) {
    return {
      ok: false,
      extensao,
      nome,
      erro: `O arquivo tem ${limiteLegivel(arquivo.size)} e o limite é ${limiteLegivel(opcoes.limiteBytes)}.`,
    };
  }

  return { ok: true, extensao, nome, erro: '' };
}
