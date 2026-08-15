// YouTube — extração do id e das capas.
//
// O banco guarda o `youtube_id`, nunca a URL da imagem. Capa não é dado, é
// endereço: a `maxresdefault` some quando o vídeo não tem versão em alta, e
// uma URL gravada vira card quebrado meses depois. Com o id, a capa é derivada
// na renderização e a queda para a resolução menor acontece sozinha.
//
// Nada disso precisa de chave de API nem de servidor: as URLs de thumbnail são
// públicas e estáveis.

const PADROES = [
  /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:.*&)?v=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/shorts\/([\w-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/live\/([\w-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/v\/([\w-]{11})/,
];

/** Extrai o id de 11 caracteres de qualquer formato de link do YouTube. */
export function idDoYouTube(url: string): string | null {
  const u = url.trim();
  if (/^[\w-]{11}$/.test(u)) return u;          // já é o id
  for (const re of PADROES) {
    const m = re.exec(u);
    if (m) return m[1];
  }
  return null;
}

export type QualidadeCapa = 'maxres' | 'sd' | 'hq' | 'mq' | 'default';

const ARQUIVO: Record<QualidadeCapa, string> = {
  maxres: 'maxresdefault.jpg',   // 1280×720 — não existe em todo vídeo
  sd: 'sddefault.jpg',           //  640×480 — idem
  hq: 'hqdefault.jpg',           //  480×360 — SEMPRE existe
  mq: 'mqdefault.jpg',           //  320×180
  default: 'default.jpg',        //  120×90
};

export function capaDoYouTube(id: string, qualidade: QualidadeCapa = 'maxres'): string {
  return `https://i.ytimg.com/vi/${id}/${ARQUIVO[qualidade]}`;
}

/**
 * Cadeia de queda, da melhor para a garantida.
 * Use no `onError` do <img>: tenta maxres, cai para sd, depois hq.
 * `hqdefault` existe para todo vídeo — é o fim da linha e nunca falha.
 */
export const CADEIA_CAPAS: QualidadeCapa[] = ['maxres', 'sd', 'hq'];

/** URL de reprodução; `noCookie` evita cookies de rastreio no embed. */
export function urlDoVideo(id: string, noCookie = false): string {
  const dominio = noCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  return `https://${dominio}/watch?v=${id}`;
}

export function urlDeEmbed(id: string, noCookie = true): string {
  const dominio = noCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  return `https://${dominio}/embed/${id}?rel=0`;
}
