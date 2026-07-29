import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const logoSrc = "https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=200&auto=format&fit=crop";
  const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuADYL5Z5EOImwC68frrAqi9_9IZ3SN9jCK38dBqhDNHgLfomLwm_BJc63lDoUBdb-73MlV0kdkU3sWm45FNlJ4-IZ_rspRvZxKbtJvtTKP1gyIO-PHUXhJ7UISIoh1MVjvbItoKQX2cc5a8woFuzBM3JR-ZqznfLAFNKWvrRX-_ApMblnMKMAKlVtfPbPMo7VjWW7aBNcnyNEtLWepYq-0MJkEJZ-JaQjWLbUKo4eENpsN9aQsDKovquaH_St3bFK60HBCH0wk2GNUH";

  return (
    <header className="fixed top-0 inset-x-0 z-40 parchment-glass pt-safe md:pl-[280px] border-b border-[#7A2332]/10 shadow-xs">
      <div className="h-16 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#C9A24A] md:hidden shadow-xs">
            <img 
              alt="Louvor & Aliança" 
              className="w-full h-full object-cover" 
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

