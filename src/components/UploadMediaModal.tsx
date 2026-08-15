import React, { useState } from 'react';
import { GalleryMediaItem } from '../types';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (media: GalleryMediaItem) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  onAddMedia,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DOMINGO SOLENE');
  const [imageUrl, setImageUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const defaultImage = mediaType === 'video'
      ? '/capa-missa-9h.jpg'
      : '/capa-missa-9h.jpg';

    const newMedia: GalleryMediaItem = {
      id: `gal-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'CELEBRAÇÃO',
      imageUrl: imageUrl.trim() || defaultImage,
      type: mediaType,
      dateStr: 'Hoje',
      description: 'Mídia adicionada recentemente ao acervo do ministério litúrgico.',
    };

    onAddMedia(newMedia);
    setTitle('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fff8f4] rounded-2xl p-6 w-full max-w-md border border-[#d9c1c1] shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#d9c1c1]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4a0e17]">add_a_photo</span>
            <h3 className="font-headline-sm text-lg text-[#4a0e17] font-bold">Contribuir com Mídia</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ffe4c8] flex items-center justify-center text-[#544343] hover:bg-[#ffead7] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
              Título da Foto / Vídeo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Coral na Procissão de Entrada"
              required
              className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none focus:border-[#4a0e17]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
                Momento / Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: PÁSCOA"
                required
                className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none focus:border-[#4a0e17]"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
                Tipo de Mídia
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none"
              >
                <option value="image">Foto</option>
                <option value="video">Vídeo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
              Link da Imagem / Arquivo (Opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-xs text-[#261908] outline-none focus:border-[#4a0e17]"
            />
            <p className="text-[10px] text-[#544343] mt-1">
              Ou selecione um arquivo do dispositivo:
            </p>
            <div className="mt-1.5 p-4 border-2 border-dashed border-[#d9c1c1] rounded-xl bg-white/60 text-center cursor-pointer hover:bg-white transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#4a0e17]">upload_file</span>
              <p className="text-xs text-[#261908] font-medium mt-0.5">Clique para escolher foto ou vídeo</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#d9c1c1]/30 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#ffe4c8] text-[#544343] rounded-full text-xs font-label-caps hover:bg-[#ffead7] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2a0006] text-white rounded-full text-xs font-label-caps hover:bg-[#4a0e17] cursor-pointer shadow-sm"
            >
              Enviar Mídia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
