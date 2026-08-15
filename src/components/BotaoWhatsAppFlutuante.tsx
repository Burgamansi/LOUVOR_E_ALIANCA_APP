import { useState } from 'react';
import { linkWhatsApp, linkGrupoWhatsApp, formatarBR } from '../lib/whatsapp';

interface BotaoWhatsAppFlutuanteProps {
  /** Número do ministério em E.164. Vem de config('whatsapp_ministerio'). */
  e164?: string | null;
  /** Convite do grupo da equipe: URL do chat.whatsapp.com ou só o código. */
  grupo?: string | null;
  nomeGrupo?: string;
  mensagemPadrao?: string;
}

/**
 * Botão flutuante do WhatsApp.
 *
 * Duas coisas diferentes moram aqui, e a ordem importa:
 *
 *  · **entrar no grupo da equipe** — para quem já é do ministério. É a ação
 *    mais frequente e por isso vem primeiro, destacada, com o nome do grupo à
 *    vista para ninguém achar que vai cair numa conversa com um desconhecido;
 *  · **falar com o ministério** — para quem chegou de fora e quer participar,
 *    sugerir música ou tirar dúvida da missa.
 *
 * Cada assunto já leva a mensagem escrita: quem cai numa conversa em branco
 * costuma fechar antes de digitar.
 *
 * O botão some sozinho se não houver nem número nem grupo configurado — melhor
 * ausente do que levando a equipe para uma página de convite expirado.
 */
export function BotaoWhatsAppFlutuante({
  e164,
  grupo,
  nomeGrupo = 'Grupo da equipe',
  mensagemPadrao = 'Olá! Vim pelo app do Louvor & Aliança.',
}: BotaoWhatsAppFlutuanteProps) {
  const [aberto, setAberto] = useState(false);

  const linkDoGrupo = linkGrupoWhatsApp(grupo);
  if (!e164 && !linkDoGrupo) return null;

  const assuntos = [
    { rotulo: 'Quero cantar no ministério', icone: 'music_note',
      texto: 'Olá! Vi o app do Louvor & Aliança e gostaria de participar do ministério de música.' },
    { rotulo: 'Dúvida sobre a missa das 9h', icone: 'event',
      texto: 'Olá! Tenho uma dúvida sobre a missa das 9h.' },
    { rotulo: 'Sugerir uma música', icone: 'library_music',
      texto: 'Olá! Queria sugerir uma música para o repertório.' },
  ];

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setAberto(false)}
          aria-hidden
        />
      )}

      <div className="fixed right-4 bottom-20 md:bottom-6 z-50 flex flex-col items-end gap-2">
        {aberto && (
          <div className="w-72 bg-white rounded-2xl shadow-2xl border border-[#7A2332]/15 overflow-hidden">
            <div className="px-4 py-3 bg-[#25D366] text-white">
              <p className="font-serif font-bold text-sm">Louvor &amp; Aliança no WhatsApp</p>
              {e164 && <p className="text-[11px] opacity-90">{formatarBR(e164)}</p>}
            </div>

            <ul className="p-2 flex flex-col gap-1">
              {linkDoGrupo && (
                <li>
                  <a
                    href={linkDoGrupo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setAberto(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/20 transition"
                  >
                    <span aria-hidden className="material-symbols-outlined text-lg">group_add</span>
                    <span className="min-w-0 flex-1">
                      <span className="block">Entrar no grupo da equipe</span>
                      <span className="block text-[11px] font-normal text-[#5C4A3E] truncate">
                        {nomeGrupo}
                      </span>
                    </span>
                  </a>
                </li>
              )}

              {e164 && (
                <>
                  {linkDoGrupo && (
                    <li className="px-3 pt-2 pb-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">
                        Falar com a coordenação
                      </span>
                    </li>
                  )}
                  {assuntos.map((a) => (
                    <li key={a.rotulo}>
                      <a
                        href={linkWhatsApp(e164, a.texto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setAberto(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#2D2118] hover:bg-[#FFF9F2] transition"
                      >
                        <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-lg">{a.icone}</span>
                        {a.rotulo}
                      </a>
                    </li>
                  ))}
                  <li className="border-t border-[#7A2332]/10 mt-1 pt-1">
                    <a
                      href={linkWhatsApp(e164, mensagemPadrao)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAberto(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#5C4A3E] hover:bg-[#FFF9F2] transition"
                    >
                      <span aria-hidden className="material-symbols-outlined text-lg">chat</span>
                      Outro assunto
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={() => setAberto(!aberto)}
          aria-label={aberto ? 'Fechar contato do WhatsApp' : 'Abrir WhatsApp do ministério'}
          aria-expanded={aberto}
          className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 flex items-center justify-center hover:brightness-95 active:scale-95 transition cursor-pointer"
        >
          {aberto
            ? <span aria-hidden className="material-symbols-outlined text-2xl">close</span>
            : <IconeZap className="w-7 h-7" />}
        </button>
      </div>
    </>
  );
}

function IconeZap({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}
