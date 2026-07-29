import React, { useState } from 'react';
import { CelebrationPlaylist, LiturgicalSong } from '../types';

interface NewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: LiturgicalSong[];
  onSavePlaylist: (playlist: CelebrationPlaylist) => void;
}

const CATEGORIES: CelebrationPlaylist['category'][] = [
  'Solene',
  'Casamento',
  'Advento',
  'Quaresma',
  'Formatura',
  'Tempo Comum',
  'Outros',
];

const ICONS = [
  { name: 'church', label: 'Igreja' },
  { name: 'favorite', label: 'Coração / Casamento' },
  { name: 'auto_awesome', label: 'Estrela / Advento' },
  { name: 'school', label: 'Formatura' },
  { name: 'queue_music', label: 'Música' },
  { name: 'celebration', label: 'Festa' },
  { name: 'light_mode', label: 'Luz' },
];

export const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({
  isOpen,
  onClose,
  songs,
  onSavePlaylist,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CelebrationPlaylist['category']>('Solene');
  const [icon, setIcon] = useState('church');
  const [description, setDescription] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSongSelection = (songId: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist: CelebrationPlaylist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      category,
      icon,
      description: description.trim() || 'Playlist personalizada de celebração.',
      songIds: selectedSongIds.length > 0 ? selectedSongIds : songs.slice(0, 3).map((s) => s.id),
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSavePlaylist(newPlaylist);
    // Reset form
    setName('');
    setDescription('');
    setSelectedSongIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fff1e6] border border-[#d9c1c1] rounded-3xl w-full max-w-lg shadow-2xl p-6 relative flex flex-col gap-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d9c1c1]/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4a0e17] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">playlist_add</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg text-[#4a0e17] font-bold">Nova Playlist de Celebração</h2>
              <p className="font-body-sm text-xs text-[#544343]">Criar template de agrupamento de músicas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ffead7] text-[#544343] hover:text-[#261908] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-label-caps text-[#4a0e17] uppercase mb-1 font-bold">
              Nome do Template *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Missa Solene de Páscoa, Casamento da Ana & Pedro"
              className="w-full bg-white border border-[#d9c1c1] rounded-xl px-3.5 py-2 text-sm text-[#261908] placeholder-[#867273] outline-none focus:border-[#4a0e17] focus:ring-1 focus:ring-[#4a0e17]"
            />
          </div>

          {/* Categoria e Ícone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-[#4a0e17] uppercase mb-1 font-bold">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CelebrationPlaylist['category'])}
                className="w-full bg-white border border-[#d9c1c1] rounded-xl px-3 py-2 text-xs font-semibold text-[#4a0e17] outline-none focus:border-[#4a0e17]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-[#4a0e17] uppercase mb-1 font-bold">
                Ícone
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-white border border-[#d9c1c1] rounded-xl px-3 py-2 text-xs font-semibold text-[#4a0e17] outline-none focus:border-[#4a0e17]"
              >
                {ICONS.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-label-caps text-[#4a0e17] uppercase mb-1 font-bold">
              Descrição do Rito
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Seleção especial para entrada dos padrinhos, salmo responsorial e bênção inicial."
              className="w-full bg-white border border-[#d9c1c1] rounded-xl px-3.5 py-2 text-xs text-[#261908] placeholder-[#867273] outline-none focus:border-[#4a0e17] focus:ring-1 focus:ring-[#4a0e17]"
            />
          </div>

          {/* Seleção de Músicas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-label-caps text-[#4a0e17] uppercase font-bold">
                Músicas Incluídas ({selectedSongIds.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedSongIds(
                    selectedSongIds.length === songs.length ? [] : songs.map((s) => s.id)
                  )
                }
                className="text-[10px] text-[#775a00] font-bold underline cursor-pointer"
              >
                {selectedSongIds.length === songs.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto bg-white border border-[#d9c1c1] rounded-2xl p-2.5 flex flex-col gap-1.5 scrollbar-thin">
              {songs.map((song) => {
                const isChecked = selectedSongIds.includes(song.id);
                return (
                  <label
                    key={song.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                      isChecked
                        ? 'bg-[#ffead7] border-[#4a0e17]/30 text-[#4a0e17] font-semibold'
                        : 'bg-white border-transparent text-[#261908] hover:bg-[#fff8f4]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSongSelection(song.id)}
                        className="rounded border-[#d9c1c1] text-[#4a0e17] focus:ring-[#4a0e17]"
                      />
                      <div>
                        <p className="font-bold">{song.title}</p>
                        <p className="text-[10px] text-[#544343]">
                          {song.part} • Tom: {song.key}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-label-caps px-2 py-0.5 rounded-full bg-[#ffe4c8] text-[#775a00]">
                      #{song.number}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#d9c1c1]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#d9c1c1] text-[#544343] font-label-caps text-xs hover:bg-[#ffead7] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4a0e17] text-white font-label-caps text-xs hover:bg-[#2a0006] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Salvar Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
