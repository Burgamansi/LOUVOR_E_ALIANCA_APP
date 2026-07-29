import React, { useState } from 'react';
import { DRIVE_FOLDERS, DRIVE_EXTERNAL_LINKS } from '../data/mockData';
import { DriveFolder } from '../types';

interface DriveViewProps {
  onOpenMidia: () => void;
}

export const DriveView: React.FC<DriveViewProps> = ({ onOpenMidia }) => {
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);

  return (
    <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto">
      {/* Decorative Header Illustration */}
      <div className="relative w-full overflow-hidden px-5 mb-6 pt-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#C9A24A] uppercase tracking-[0.2em] font-bold">
            Acervo Litúrgico Oficial
          </span>
          <h2 className="font-serif text-3xl text-[#7A2332] font-bold">
            Biblioteca Louvor & Aliança
          </h2>
          <p className="text-sm text-[#5C4A3E] max-w-[90%]">
            Partituras litúrgicas, cifras por rito, arranjos para casamentos e documentos formativos do ministério.
          </p>
        </div>

        {/* Ambient Sparkle SVG */}
        <div className="absolute -right-4 top-0 opacity-20 pointer-events-none">
          <svg fill="none" height="120" viewBox="0 0 100 100" width="120" xmlns="http://www.w3.org/2000/svg">
            <path className="text-[#C9A24A]" d="M50 0L52.5 47.5L100 50L52.5 52.5L50 100L47.5 52.5L0 50L47.5 47.5L50 0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Section: Arquivos do Ministério */}
      <section className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-[#7A2332] flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-[#C9A24A]">folder_open</span>
            Pastas do Acervo
          </h3>
          <span className="text-xs text-[#2D2118] bg-[#FFF9F2] px-3 py-1 rounded-full border border-[#7A2332]/20 font-semibold">
            248 Arquivos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {DRIVE_FOLDERS.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder)}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-xs border border-[#7A2332]/15 transition-all hover:border-[#7A2332]/40 hover:bg-[#FFF9F2] active:scale-[0.98] text-left group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-2xl">{folder.iconName}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-serif text-[#7A2332] block font-bold text-base">{folder.title}</span>
                <span className="text-[#5C4A3E] text-xs leading-snug block line-clamp-1">{folder.subtitle}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#C9A24A] font-bold">{folder.fileCount} arqs</span>
                <span className="material-symbols-outlined text-[#7A2332]/40 group-hover:text-[#7A2332]">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section: Portais Externos */}
      <section className="px-5 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <h3 className="font-serif text-xl text-[#7A2332] font-bold">Portais Litúrgicos e Referências</h3>
          <div className="h-px flex-1 bg-[#7A2332]/15 ml-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Main CNBB Link */}
          {DRIVE_EXTERNAL_LINKS.slice(0, 1).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 sm:col-span-2 flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-[#7A2332]/15"
            >
              <div
                className="h-36 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${link.imageUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#4D1721]/90 via-[#4D1721]/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs text-white bg-[#7A2332]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 font-bold">
                    {link.badge}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-serif text-lg text-[#7A2332] mb-0.5 font-bold">{link.title}</h4>
                <p className="text-xs text-[#5C4A3E]">{link.subtitle}</p>
              </div>
            </a>
          ))}

          {/* Secondary Links */}
          {DRIVE_EXTERNAL_LINKS.slice(1).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col bg-white rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow border border-[#7A2332]/15"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF9F2] border border-[#7A2332]/15 mb-3 flex items-center justify-center text-[#7A2332]">
                <span className="material-symbols-outlined text-xl">{link.iconName}</span>
              </div>
              <h4 className="font-serif font-bold text-[#7A2332] text-base leading-tight">{link.title}</h4>
              <p className="text-xs text-[#5C4A3E] mt-1">{link.subtitle}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Footer: YouTube & Social */}
      <footer className="mt-auto px-5 pb-6">
        <div className="bg-[#7A2332] rounded-2xl p-6 flex items-center justify-between text-white overflow-hidden relative shadow-md">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-xs text-[#C9A24A] uppercase tracking-widest font-bold">Ensaie Conosco</span>
            <h4 className="font-serif text-xl text-white font-bold">Canal Louvor & Aliança</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[#C9A24A] text-lg">play_circle</span>
              <span className="text-xs text-white/90">Aulas de canto litúrgico e novos arranjos</span>
            </div>
          </div>

          <a
            href="https://www.youtube.com/results?search_query=Projeto+Louvor+e+Alianca+Ministerio+Catolico"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-[#4D1721] border border-[#C9A24A]/40 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10 hover:bg-[#4D1721]/80 cursor-pointer"
          >
            <svg className="w-7 h-7 fill-[#C9A24A]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>

          {/* Decorative pattern background */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">music_note</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#5C4A3E] italic font-serif">
            "Música, liturgia e comunhão a serviço da evangelização."
          </p>
        </div>
      </footer>

      {/* Folder Detail Modal */}
      {selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fff8f4] rounded-2xl p-6 w-full max-w-lg border border-[#d9c1c1] shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#d9c1c1]/30 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedFolder.colorClass}`}>
                  <span className="material-symbols-outlined text-2xl">{selectedFolder.iconName}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg text-[#4a0e17] font-bold">{selectedFolder.title}</h3>
                  <p className="text-xs text-[#544343]">{selectedFolder.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFolder(null)}
                className="w-8 h-8 rounded-full bg-[#ffe4c8] flex items-center justify-center text-[#544343] hover:bg-[#ffead7] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5].map((itemNum) => (
                <div key={itemNum} className="flex items-center justify-between p-3 bg-[#fff1e6] rounded-xl border border-[#d9c1c1]/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#4a0e17]">description</span>
                    <div>
                      <p className="text-sm font-semibold text-[#261908]">
                        {selectedFolder.title.includes('PDF') ? `Partitura_Missa_${itemNum}.pdf` : selectedFolder.title.includes('Word') ? `Cifra_Salmo_${itemNum}.docx` : `Slide_Liturgia_${itemNum}.pptx`}
                      </p>
                      <p className="text-[10px] text-[#544343]">2.4 MB • Atualizado esta semana</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Baixando arquivo ${itemNum}...`)}
                    className="p-2 text-[#775a00] hover:bg-[#fece57]/20 rounded-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[#d9c1c1]/30 flex justify-end">
              <button
                onClick={() => setSelectedFolder(null)}
                className="bg-[#4a0e17] text-white px-5 py-2 rounded-full font-label-caps text-xs cursor-pointer hover:bg-[#2a0006]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
