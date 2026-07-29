import React, { useState } from 'react';
import { LiturgicalSong } from '../types';

interface AddChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: LiturgicalSong) => void;
}

export const AddChordModal: React.FC<AddChordModalProps> = ({
  isOpen,
  onClose,
  onAddSong,
}) => {
  const [title, setTitle] = useState('');
  const [part, setPart] = useState('ENTRADA');
  const [key, setKey] = useState('G');
  const [chordText, setChordText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chordText.trim()) return;

    const newSong: LiturgicalSong = {
      id: `song-${Date.now()}`,
      number: Math.floor(Math.random() * 50) + 5,
      part,
      title: title.trim(),
      key: key.trim() || 'G',
      lyricsPreview: `"${chordText.split('\n').slice(0, 2).join(' ')}..."`,
      fullChordText: chordText.trim(),
    };

    onAddSong(newSong);
    setTitle('');
    setChordText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fff8f4] rounded-2xl p-6 w-full max-w-lg border border-[#d9c1c1] shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#d9c1c1]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4a0e17]">library_music</span>
            <h3 className="font-headline-sm text-lg text-[#4a0e17] font-bold">Adicionar Nova Cifra Litúrgica</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ffe4c8] flex items-center justify-center text-[#544343] hover:bg-[#ffead7] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
                Nome do Cântico
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Hino da Vitória"
                required
                className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none focus:border-[#4a0e17]"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
                Tom Original
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ex: G, Am, C, D"
                required
                className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none focus:border-[#4a0e17]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
              Momento Litúrgico (Parte da Missa)
            </label>
            <select
              value={part}
              onChange={(e) => setPart(e.target.value)}
              className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-sm text-[#261908] outline-none"
            >
              <option value="ENTRADA">Entrada</option>
              <option value="ATO PENITENCIAL">Ato Penitencial</option>
              <option value="GLÓRIA">Glória</option>
              <option value="SALMO">Salmo Responsorial</option>
              <option value="ACLAMAÇÃO">Aclamação ao Evangelho</option>
              <option value="OFERTÓRIO">Ofertório</option>
              <option value="SANTO">Santo</option>
              <option value="CORDEIRO">Cordeiro de Deus</option>
              <option value="COMUNHÃO">Comunhão</option>
              <option value="FINAL">Final / Pós-Comunhão</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-label-caps text-[#544343] uppercase mb-1">
              Texto com Cifras e Letra
            </label>
            <textarea
              value={chordText}
              onChange={(e) => setChordText(e.target.value)}
              rows={6}
              placeholder={`G          C          G\nPovo de Deus, foi libertado\nD7                    G\nPovo de Deus, foi escolhido`}
              required
              className="w-full bg-white border border-[#d9c1c1] rounded-xl p-3 text-xs font-mono text-[#261908] outline-none focus:border-[#4a0e17] resize-none"
            />
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
              className="px-5 py-2 bg-[#4a0e17] text-white rounded-full text-xs font-label-caps hover:bg-[#2a0006] cursor-pointer shadow-sm"
            >
              Salvar Cifra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
