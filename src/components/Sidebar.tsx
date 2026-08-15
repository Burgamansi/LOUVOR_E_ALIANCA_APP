import React from 'react';
import { TabType } from '../types';
import { linkGrupoWhatsApp } from '../lib/whatsapp';
import type { PerfilMinisterio } from './ModalPerfil';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  perfil: PerfilMinisterio;
  onAbrirPerfil: () => void;
  /** Convite do grupo da equipe, se configurado. */
  grupo?: string | null;
  nomeGrupo?: string;
  onAbrirAjuda?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab, onTabChange, perfil, onAbrirPerfil, grupo, nomeGrupo, onAbrirAjuda,
}) => {
  const userAvatar = "/integrantes/ana.jpg";

  const navItems: { tab: TabType; label: string; icon: string }[] = [
    { tab: 'programacao', label: 'Programação', icon: 'calendar_today' },
    { tab: 'missas', label: 'Missas & Arquivos', icon: 'event_available' },
    { tab: 'cifras', label: 'Cifras', icon: 'music_note' },
    { tab: 'propostas', label: 'Propostas Musicais', icon: 'queue_music' },
    { tab: 'links', label: 'Links Úteis', icon: 'link' },
    { tab: 'drive', label: 'Biblioteca', icon: 'auto_stories' },
    { tab: 'midia', label: 'Galeria', icon: 'photo_camera' },
    { tab: 'comunidade', label: 'Comunidade', icon: 'diversity_3' },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] flex-col bg-[#FFF9F2] border-r border-[#7A2332]/15 z-50 shadow-sm">
      {/* Header / Logo */}
      <div className="shrink-0 p-6 flex flex-col items-center text-center gap-2 border-b border-[#7A2332]/10 bg-gradient-to-b from-[#7A2332]/5 to-transparent">
        {/* A arte circular do ministério, no lugar do ícone genérico de igreja.
            Neste tamanho ela ainda se lê: "A MISSA DAS 9H" e os rostos da
            equipe aparecem. No cabeçalho do celular, que é menos da metade
            disto, continua valendo o monograma sozinho. */}
        <img
          src="/logo-missa.png"
          alt="Louvor &amp; Aliança — A Missa das 9h"
          className="w-16 h-16 rounded-full shadow-md ring-2 ring-[#C9A24A] object-cover"
        />
        <h2 className="font-headline-md text-xl text-[#7A2332] font-bold tracking-tight mt-1">
          LOUVOR & ALIANÇA
        </h2>
        <p className="text-[11px] text-[#5C4A3E] leading-tight font-serif italic px-2">
          Música, liturgia e comunhão a serviço da evangelização
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 min-h-0 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                isActive
                  ? 'bg-[#7A2332] text-white font-semibold shadow-sm ring-1 ring-[#C9A24A]/50'
                  : 'text-[#2D2118] hover:bg-[#F8ECE0] hover:text-[#7A2332]'
              }`}
            >
              <span aria-hidden className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#C9A24A]' : 'text-[#7A2332]'}`}>
                {item.icon}
              </span>
              <span className="font-body-md text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Grupo da equipe e ajuda — logo acima do perfil, no rodapé fixo, que é
          onde a barra lateral guarda o que é da pessoa e não do conteúdo. */}
      <div className="shrink-0 px-4 pb-3 flex flex-col gap-1.5">
        {linkGrupoWhatsApp(grupo) && (
          <a
            href={linkGrupoWhatsApp(grupo) as string}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#25D366] text-white hover:brightness-95 transition"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px]">group</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Grupo da equipe</span>
              <span className="block text-[10px] opacity-90 truncate">{nomeGrupo ?? 'WhatsApp'}</span>
            </span>
            <span aria-hidden className="material-symbols-outlined text-base">open_in_new</span>
          </a>
        )}

        {onAbrirAjuda && (
          <button
            onClick={onAbrirAjuda}
            className="flex items-center gap-3 p-2.5 rounded-xl text-[#2D2118] hover:bg-[#F8ECE0] hover:text-[#7A2332] transition text-left cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-[20px] text-[#7A2332]">help</span>
            <span className="text-sm">Como usar o app</span>
          </button>
        )}
      </div>

      {/* User Profile Footer */}
      <button
        onClick={onAbrirPerfil}
        className="shrink-0 p-4 border-t border-[#7A2332]/10 flex items-center gap-3 bg-[#F8ECE0]/60 hover:bg-[#F8ECE0] transition text-left cursor-pointer w-full"
      >
        <img
          alt=""
          className="w-10 h-10 rounded-full object-cover shadow-xs ring-2 ring-[#C9A24A]"
          src={perfil.foto || userAvatar}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-label-caps text-xs text-[#2D2118] font-bold truncate">
            {perfil.apelido || perfil.nome}
          </span>
          <span className="text-[11px] text-[#5C4A3E] truncate">{perfil.papel}</span>
        </div>
        <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-lg">edit</span>
      </button>
    </aside>
  );
};

