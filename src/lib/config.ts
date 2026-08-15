// Configuração do ministério — um lugar só.
//
// Antes isto vivia espalhado: o WhatsApp era uma const no App.tsx, o grupo não
// existia em lugar nenhum. Quem precisa trocar o número não é programador; é o
// coordenador do ministério. Deixar tudo aqui, com nome óbvio e um comentário
// por campo, é o mínimo até estes valores virem de config() no Turso.

export interface ConfigMinisterio {
  /** WhatsApp de contato do ministério, em E.164: '+5511987654321'. */
  whatsappE164: string | null;
  /**
   * Convite do grupo da equipe. Aceita a URL inteira
   * ('https://chat.whatsapp.com/ABC123...') ou só o código.
   * É o link que sai no botão “Entrar no grupo da equipe”.
   */
  grupoWhatsApp: string | null;
  /** Nome do grupo, como aparece no WhatsApp. Só para rotular o botão. */
  nomeGrupo: string;
}

export const MINISTERIO: ConfigMinisterio = {
  whatsappE164: null,
  grupoWhatsApp: null,
  nomeGrupo: 'Louvor & Aliança — Equipe',
};

/**
 * Permite testar/ativar sem novo deploy: `?grupo=<código>` na URL grava o
 * convite no navegador, e a partir daí o botão aparece para aquela pessoa.
 * Útil enquanto o painel administrativo não existe.
 */
const CHAVE_GRUPO = 'la:grupo-whatsapp';

export function grupoConfigurado(): string | null {
  if (MINISTERIO.grupoWhatsApp) return MINISTERIO.grupoWhatsApp;
  if (typeof window === 'undefined') return null;

  const daUrl = new URLSearchParams(window.location.search).get('grupo');
  if (daUrl) {
    try { window.localStorage.setItem(CHAVE_GRUPO, daUrl); } catch { /* modo privado */ }
    return daUrl;
  }

  try { return window.localStorage.getItem(CHAVE_GRUPO); } catch { return null; }
}
