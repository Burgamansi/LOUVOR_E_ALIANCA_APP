import { useEffect, useState } from 'react';
import type { TabType } from '../types';
import { linkGrupoWhatsApp } from '../lib/whatsapp';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  /** Convite do grupo da equipe, se configurado. */
  grupo?: string | null;
  nomeGrupo?: string;
  onAbrirAjuda?: () => void;
}

/**
 * Navegação inferior.
 *
 * Antes eram oito abas numa barra rolável. Barra inferior que rola é um mau
 * negócio conhecido: nada indica que existe mais coisa à direita, o alvo se
 * move debaixo do dedo, e quem nunca arrastou nunca descobre as quatro últimas
 * áreas — Comunidade e Galeria simplesmente não existiam para a maior parte da
 * equipe.
 *
 * Agora são quatro destinos fixos e um “Mais”, que é o padrão das barras de
 * navegação justamente porque o quinto lugar acomoda um número indefinido de
 * itens sem esconder nenhum: a folha do “Mais” mostra todos de uma vez, com
 * nome e uma linha de explicação — o que a barra nunca conseguiria.
 *
 * Os quatro fixos são os do dia da missa. O resto é consulta.
 */
export function BottomNav({ currentTab, onTabChange, grupo, nomeGrupo, onAbrirAjuda }: BottomNavProps) {
  const [maisAberto, setMaisAberto] = useState(false);

  const principais: { tab: TabType; label: string; icon: string }[] = [
    { tab: 'programacao', label: 'Programação', icon: 'event_note' },
    { tab: 'cifras', label: 'Cifras', icon: 'music_note' },
    { tab: 'missas', label: 'Missas', icon: 'event_available' },
    { tab: 'propostas', label: 'Propostas', icon: 'queue_music' },
  ];

  const secundarias: { tab: TabType; label: string; icon: string; texto: string }[] = [
    { tab: 'comunidade', label: 'Comunidade', icon: 'diversity_3',
      texto: 'Avisos da coordenação, recados e pedidos de oração.' },
    { tab: 'links', label: 'Links Úteis', icon: 'link',
      texto: 'Liturgia diária, documentos da Igreja e a pasta do Drive.' },
    { tab: 'drive', label: 'Biblioteca', icon: 'auto_stories',
      texto: 'O acervo: partituras, áudios e materiais de estudo.' },
    { tab: 'midia', label: 'Galeria', icon: 'photo_camera',
      texto: 'Fotos e vídeos das celebrações que já passaram.' },
  ];

  const emMais = secundarias.some((s) => s.tab === currentTab);
  const linkDoGrupo = linkGrupoWhatsApp(grupo);

  useEffect(() => {
    if (!maisAberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') setMaisAberto(false); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [maisAberto]);

  const ir = (tab: TabType) => { onTabChange(tab); setMaisAberto(false); };

  return (
    <>
      {maisAberto && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-[#2D2118]/50 backdrop-blur-xs"
            onClick={() => setMaisAberto(false)}
            aria-hidden
          />
          <div
            className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#FFF9F2] rounded-t-3xl border-t border-[#C9A24A]/40 shadow-2xl pb-safe max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Mais áreas do app"
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="w-10 h-1 rounded-full bg-[#7A2332]/20" />
            </div>

            <div className="px-4 pb-4 flex flex-col gap-1.5">
              {secundarias.map((s) => (
                <button
                  key={s.tab}
                  onClick={() => ir(s.tab)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                    currentTab === s.tab
                      ? 'bg-[#7A2332] text-white border-[#7A2332]'
                      : 'bg-white border-[#7A2332]/15 hover:border-[#7A2332]/40'
                  }`}
                >
                  <span className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentTab === s.tab ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-[#7A2332] text-[#C9A24A]'
                  }`}>
                    <span aria-hidden className="material-symbols-outlined text-lg">{s.icon}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-sm font-bold">{s.label}</span>
                    <span className={`block text-[11px] leading-snug ${
                      currentTab === s.tab ? 'text-amber-100' : 'text-[#5C4A3E]'
                    }`}>
                      {s.texto}
                    </span>
                  </span>
                </button>
              ))}

              {/* O grupo da equipe mora aqui: lugar fixo, sempre no mesmo
                  toque, sem competir com a cifra na tela do palco. */}
              {linkDoGrupo && (
                <a
                  href={linkDoGrupo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMaisAberto(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#25D366] text-white transition hover:brightness-95"
                >
                  <span className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <span aria-hidden className="material-symbols-outlined text-lg">group</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-sm font-bold">Grupo da equipe</span>
                    <span className="block text-[11px] opacity-90 truncate">{nomeGrupo ?? 'WhatsApp'}</span>
                  </span>
                  <span aria-hidden className="material-symbols-outlined">open_in_new</span>
                </a>
              )}

              {onAbrirAjuda && (
                <button
                  onClick={() => { setMaisAberto(false); onAbrirAjuda(); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#7A2332]/15 text-left hover:border-[#7A2332]/40 transition cursor-pointer"
                >
                  <span className="shrink-0 w-10 h-10 rounded-xl bg-[#C9A24A]/20 text-[#7A2332] flex items-center justify-center">
                    <span aria-hidden className="material-symbols-outlined text-lg">help</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-sm font-bold text-[#7A2332]">Como usar o app</span>
                    <span className="block text-[11px] text-[#5C4A3E]">A apresentação de boas-vindas, de novo.</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe parchment-glass border-t border-[#7A2332]/15 shadow-md">
        <div className="flex items-stretch h-16">
          {principais.map((item) => {
            const ativo = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => ir(item.tab)}
                aria-current={ativo ? 'page' : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                  ativo ? 'text-[#7A2332]' : 'text-[#5C4A3E] hover:text-[#2D2118]'
                }`}
              >
                <span aria-hidden className={`material-symbols-outlined text-[22px] ${ativo ? 'text-[#7A2332]' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] tracking-wide truncate max-w-full px-1 ${ativo ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setMaisAberto(!maisAberto)}
            aria-expanded={maisAberto}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              maisAberto || emMais ? 'text-[#7A2332]' : 'text-[#5C4A3E] hover:text-[#2D2118]'
            }`}
          >
            <span aria-hidden className="material-symbols-outlined text-[22px]">
              {maisAberto ? 'expand_more' : 'apps'}
            </span>
            <span className={`text-[10px] tracking-wide ${maisAberto || emMais ? 'font-bold' : ''}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
