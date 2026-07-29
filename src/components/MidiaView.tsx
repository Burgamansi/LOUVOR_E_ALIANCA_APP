import React, { useState } from 'react';
import { GALLERY_MEDIA, QUICK_DOWNLOADS } from '../data/mockData';
import { GalleryMediaItem, QuickDownloadFile } from '../types';

interface MidiaViewProps {
  galleryMedia?: GalleryMediaItem[];
  onOpenUploadModal: () => void;
}

export const MidiaView: React.FC<MidiaViewProps> = ({
  galleryMedia = GALLERY_MEDIA,
  onOpenUploadModal,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<GalleryMediaItem | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const mediaList = galleryMedia && galleryMedia.length > 0 ? galleryMedia : GALLERY_MEDIA;

  const parishEmblem = "https://lh3.googleusercontent.com/aida/AP1WRLuPTg0F5hA5eMgZDJOC20xBv0_QhQMxLRlQB0jwWIEcpgp5JLHb-AcVkn4_HW3jCRUSJfVvDpjin6BQgqq0invrxtXPsN8QrRWGz_iy1erD3yUaYKRwJSWMy0UFAwG5V7T0sud59A9JHNN9dyAFZ7j8SSWDgvKXWjF4tQd709ilQjO7pXVnG0DfERJF6Z-m5Tz3JEFCWm2w3u1ju5s9Y54TAUSnOYpv90wPeqA1zt9TL4_xdE0JUkVPFmjH";

  const handleDownload = (file: QuickDownloadFile) => {
    setDownloadToast(`Iniciando download de ${file.filename}...`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#7A2332] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest shadow-2xl z-50 animate-bounce border border-[#C9A24A]">
          {downloadToast}
        </div>
      )}

      {/* Header Section */}
      <div className="px-5 mb-6 pt-2">
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-xs border border-[#7A2332]/15">
          <div className="w-12 h-12 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">photo_library</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#C9A24A] uppercase tracking-wider font-bold">
              Memória Litúrgica & Vivência
            </span>
            <h2 className="font-serif text-2xl text-[#7A2332] font-bold">
              Galeria Louvor & Aliança
            </h2>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="px-5 mb-8">
        <div className="relative group overflow-hidden bg-white p-6 rounded-2xl border border-[#7A2332]/15 shadow-xs">
          <div className="absolute -right-8 -bottom-8 opacity-5 text-[#7A2332] pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">cloud_upload</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shadow-md ring-4 ring-[#FFF9F2]">
              <span className="material-symbols-outlined text-2xl">add_a_photo</span>
            </div>

            <div>
              <h3 className="font-serif text-lg text-[#7A2332] font-bold">Contribuir com o Acervo</h3>
              <p className="text-xs text-[#5C4A3E] max-w-xs mx-auto mt-1">
                Compartilhe fotos e vídeos das celebrações, encontros de casais e momentos de comunhão do ministério.
              </p>
            </div>

            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-8 py-3 bg-[#7A2332] text-white rounded-xl font-bold tracking-widest text-xs hover:bg-[#4D1721] transition-all active:scale-95 shadow-sm cursor-pointer mt-1"
            >
              FAZER UPLOAD DE MÍDIA
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-[#7A2332] font-bold">Registros Recentes</h3>
          <span className="text-[#C9A24A] text-xs font-bold uppercase tracking-wider">
            {mediaList.length} Mídias
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Main Featured Item */}
          {mediaList.slice(0, 1).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="col-span-2 relative h-56 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-[#7A2332]/15"
            >
              <img
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={item.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4D1721]/90 via-[#4D1721]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] text-white bg-[#7A2332]/80 px-2.5 py-0.5 rounded-md backdrop-blur-md mb-1.5 inline-block border border-white/20 font-bold">
                  {item.category}
                </span>
                <p className="text-white font-serif italic text-lg font-bold">
                  {item.title}
                </p>
              </div>
            </div>
          ))}

          {/* Secondary Items */}
          {mediaList.slice(1).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="relative h-40 rounded-2xl overflow-hidden shadow-xs group cursor-pointer border border-[#7A2332]/15"
            >
              <img
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={item.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4D1721]/80 to-transparent opacity-90"></div>
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-xs">
                <span className="material-symbols-outlined text-sm text-[#7A2332]">
                  {item.type === 'video' ? 'play_circle' : 'image'}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-xs font-bold line-clamp-1">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Downloads */}
      <div className="px-5 pb-6">
        <h3 className="font-serif text-xl text-[#7A2332] mb-4 font-bold">Downloads do Ministério</h3>
        <div className="space-y-3">
          {QUICK_DOWNLOADS.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border-l-4 border-[#C9A24A] border-y border-r border-[#7A2332]/15 shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9F2] border border-[#7A2332]/15 flex items-center justify-center text-[#7A2332] shadow-xs">
                  <span className="material-symbols-outlined text-xl">
                    {file.iconType === 'archive' ? 'description' : file.iconType === 'video' ? 'movie' : 'audio_file'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#2D2118] text-sm">{file.filename}</span>
                  <span className="text-[10px] text-[#5C4A3E] uppercase tracking-wider font-semibold">
                    {file.sizeStr} • {file.timeAgo}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="p-2.5 text-[#7A2332] hover:bg-[#7A2332]/10 rounded-full transition-colors cursor-pointer"
                title="Fazer Download"
              >
                <span className="material-symbols-outlined text-xl">download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full border border-[#7A2332]/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="relative h-64 bg-black">
              <img
                alt={selectedMedia.title}
                className="w-full h-full object-contain"
                src={selectedMedia.imageUrl}
              />
              {selectedMedia.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="material-symbols-outlined text-6xl text-white drop-shadow-md">
                    play_circle
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              <span className="text-xs text-[#C9A24A] font-bold uppercase tracking-wider">
                {selectedMedia.category} • {selectedMedia.dateStr}
              </span>
              <h3 className="font-serif text-xl text-[#7A2332] font-bold mt-1 mb-2">
                {selectedMedia.title}
              </h3>
              <p className="text-sm text-[#5C4A3E] leading-relaxed">
                {selectedMedia.description || 'Registro de momentos do Projeto Louvor & Aliança.'}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    alert('Compartilhado com sucesso!');
                    setSelectedMedia(null);
                  }}
                  className="flex-1 bg-[#FFF9F2] text-[#7A2332] border border-[#7A2332]/20 py-2.5 rounded-xl text-xs font-bold hover:bg-[#7A2332]/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">share</span> Compartilhar
                </button>
                <button
                  onClick={() => {
                    handleDownload({
                      id: 'dl-media',
                      filename: `${selectedMedia.title.replace(/\s+/g, '_')}.jpg`,
                      sizeStr: '4.8MB',
                      timeAgo: 'Hoje',
                      iconType: 'archive',
                      downloadUrl: selectedMedia.imageUrl,
                    });
                    setSelectedMedia(null);
                  }}
                  className="flex-1 bg-[#7A2332] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#4D1721] cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">download</span> Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
