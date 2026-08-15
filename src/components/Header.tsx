import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  title: string;
  /** Reabre a apresentação de boas-vindas. */
  onAbrirAjuda?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onAbrirAjuda }) => {
  const logoSrc = "/logo-la.png";
  const userAvatar = "/integrantes/ana.jpg";

  return (
    <header className="fixed top-0 inset-x-0 z-40 parchment-glass pt-safe md:pl-[280px] border-b border-[#7A2332]/10 shadow-xs">
      <div className="h-16 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4D1721] ring-1 ring-[#C9A24A] md:hidden shadow-xs flex items-center justify-center overflow-hidden">
            <img
              alt="Louvor &amp; Aliança"
              className="w-[78%] h-[78%] object-contain"
              src={logoSrc}
            />
          </div>
          <div>
            <h1 className="font-headline-sm text-xl text-[#7A2332] font-semibold tracking-tight">{title}</h1>
            <p className="text-[10px] font-label-caps text-[#C9A24A] uppercase tracking-wider hidden sm:block md:hidden">
              Louvor & Aliança
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Ajuda sempre à mão: quem pulou as boas-vindas — ou quem chegou
              depois, no aparelho de outra pessoa — precisa de um caminho de
              volta que não dependa de lembrar onde ficava. */}
          {onAbrirAjuda && (
            <button
              onClick={onAbrirAjuda}
              aria-label="Como usar o app"
              title="Como usar o app"
              className="w-9 h-9 rounded-full border border-[#7A2332]/20 bg-white text-[#7A2332] flex items-center justify-center hover:border-[#7A2332]/50 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-lg">help</span>
            </button>
          )}

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-[#2D2118]">Ministério Louvor & Aliança</span>
            <span className="text-[10px] text-[#C9A24A] font-medium">Música & Liturgia</span>
          </div>
          <img 
            alt="Perfil do Integrante" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C9A24A]/60 shadow-sm" 
            src={userAvatar} 
          />
        </div>
      </div>
    </header>
  );
};

