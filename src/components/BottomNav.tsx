import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const items: { tab: TabType; label: string; icon: string }[] = [
    { tab: 'programacao', label: 'Programação', icon: 'event_note' },
    { tab: 'missas', label: 'Missas', icon: 'event_available' },
    { tab: 'cifras', label: 'Cifras', icon: 'music_note' },
    { tab: 'propostas', label: 'Propostas', icon: 'queue_music' },
    { tab: 'links', label: 'Links', icon: 'link' },
    { tab: 'drive', label: 'Biblioteca', icon: 'auto_stories' },
    { tab: 'midia', label: 'Galeria', icon: 'photo_camera' },
    { tab: 'comunidade', label: 'Comunidade', icon: 'diversity_3' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe parchment-glass border-t border-[#7A2332]/15 shadow-md">
      <div className="flex items-center h-16 px-2 gap-1 overflow-x-auto">
        {items.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`shrink-0 min-w-[70px] flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-[#7A2332] font-bold scale-105' : 'text-[#5C4A3E] hover:text-[#2D2118]'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#7A2332]' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] tracking-wider font-label-caps ${isActive ? 'text-[#7A2332]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

