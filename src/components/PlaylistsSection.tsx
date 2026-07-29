import React, { useState } from 'react';
import { CelebrationPlaylist, LiturgicalSong } from '../types';

interface PlaylistsSectionProps {
  playlists: CelebrationPlaylist[];
  songs: LiturgicalSong[];
  activeSongIds: string[];
  onApplyPlaylist: (playlist: CelebrationPlaylist) => void;
  onSaveCurrentAsPlaylist: () => void;
  onOpenCreateModal: () => void;
  onDeletePlaylist?: (id: string) => void;
}

export const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({
  playlists,
  songs,
  activeSongIds,
  onApplyPlaylist,
  onSaveCurrentAsPlaylist,
  onOpenCreateModal,
  onDeletePlaylist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['TODAS', 'Solene', 'Casamento', 'Advento', 'Quaresma', 'Formatura', 'Tempo Comum', 'Outros'];

  const filteredPlaylists = playlists.filter((pl) => {
    if (selectedCategory === 'TODAS') return true;
    return pl.category === selectedCategory;
  });

  const getSongById = (id: string) => songs.find((s) => s.id === id);

  const handleSharePlaylist = (pl: CelebrationPlaylist) => {
    const songListStr = pl.songIds
      .map((id) => getSongById(id))
      .filter((s): s is LiturgicalSong => s !== undefined)
      .map((s, idx) => `${idx + 1}. [${s.part}] ${s.title} (Tom: ${s.key})`)
      .join('\n');

    const shareText = `🎵 *Cantus Nobilis — Playlist: ${pl.name}*\n_Categoria: ${pl.category}_\n\n${pl.description}\n\n*Repertório:*\n${songListStr}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(pl.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#7A2332]/15 shadow-xs flex flex-col gap-4">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#7A2332]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-xl">queue_music</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#7A2332]">
                Playlists de Celebração
              </h3>
              <span className="bg-[#C9A24A]/20 text-[#2D2118] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#C9A24A]/30">
                {playlists.length} {playlists.length === 1 ? 'template' : 'templates'}
              </span>
            </div>
            <p className="text-xs text-[#5C4A3E]">
              Agrupe e aplique repertórios prontos por tipo de celebração (Missa Solene, Casamento, etc.)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onSaveCurrentAsPlaylist}
            className="bg-[#FFF9F2] hover:bg-[#7A2332]/10 text-[#7A2332] text-xs font-semibold px-3 py-2 rounded-xl border border-[#7A2332]/20 transition-all cursor-pointer flex items-center gap-1.5"
            title="Salvar o repertório atual como um novo template"
          >
            <span className="material-symbols-outlined text-base text-[#C9A24A]">bookmark_add</span>
            <span>Salvar Atual</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="bg-[#7A2332] hover:bg-[#4D1721] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#C9A24A]">add</span>
            <span>Nova Playlist</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#7A2332] text-white shadow-xs'
                : 'bg-[#FFF9F2] text-[#5C4A3E] hover:bg-[#7A2332]/10 border border-[#7A2332]/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Playlist Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPlaylists.map((pl) => {
          const isExpanded = expandedPlaylistId === pl.id;
          const plSongs = pl.songIds
            .map((id) => getSongById(id))
            .filter((s): s is LiturgicalSong => s !== undefined);

          // Check if current celebration active songs match this playlist
          const isCurrentlyActive =
            activeSongIds.length > 0 &&
            pl.songIds.length === activeSongIds.length &&
            pl.songIds.every((id) => activeSongIds.includes(id));

          return (
            <div
              key={pl.id}
              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                isCurrentlyActive
                  ? 'border-[#775a00] ring-1 ring-[#775a00] shadow-md bg-[#fffcf5]'
                  : 'border-[#d9c1c1]/40 hover:border-[#4a0e17]/30 shadow-2xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ffead7] text-[#4a0e17] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">{pl.icon || 'church'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-headline-sm text-sm text-[#261908] font-bold">{pl.name}</h4>
                      <span className="bg-[#ffead7] text-[#4a0e17] text-[9px] font-label-caps px-2 py-0.5 rounded-full font-bold uppercase">
                        {pl.category}
                      </span>
                      {isCurrentlyActive && (
                        <span className="bg-[#fece57] text-[#735700] text-[9px] font-label-caps px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">check_circle</span>
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-xs text-[#544343] mt-1 line-clamp-2">
                      {pl.description}
                    </p>
                  </div>
                </div>

                {onDeletePlaylist && !['pl-1', 'pl-2', 'pl-3', 'pl-4'].includes(pl.id) && (
                  <button
                    onClick={() => onDeletePlaylist(pl.id)}
                    className="text-[#867273] hover:text-[#ba1a1a] p-1 transition-colors cursor-pointer"
                    title="Excluir playlist"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>

              {/* Songs Count & Expand Toggle */}
              <div className="bg-[#fff8f4] rounded-xl p-2.5 border border-[#d9c1c1]/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#4a0e17] font-semibold">
                  <span className="material-symbols-outlined text-sm text-[#775a00]">music_note</span>
                  <span>{plSongs.length} {plSongs.length === 1 ? 'música' : 'músicas'} no template</span>
                </div>

                <button
                  onClick={() => setExpandedPlaylistId(isExpanded ? null : pl.id)}
                  className="text-[11px] font-label-caps text-[#775a00] hover:text-[#4a0e17] flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <span>{isExpanded ? 'Ocultar Cifras' : 'Ver Músicas'}</span>
                  <span className="material-symbols-outlined text-sm">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {/* Expandable Song List Preview */}
              {isExpanded && (
                <div className="flex flex-col gap-1.5 bg-[#fff1e6] p-2.5 rounded-xl border border-[#d9c1c1]/30 max-h-40 overflow-y-auto scrollbar-thin">
                  {plSongs.map((song, i) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between bg-white p-2 rounded-lg text-xs border border-[#d9c1c1]/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#ffead7] text-[#4a0e17] font-bold text-[10px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#261908]">{song.title}</p>
                          <p className="text-[10px] text-[#544343]">{song.part}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-[#ffe4c8] text-[#775a00] px-2 py-0.5 rounded-md">
                        Tom: {song.key}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#d9c1c1]/20">
                <button
                  onClick={() => onApplyPlaylist(pl)}
                  disabled={isCurrentlyActive}
                  className={`flex-1 py-2 px-3 rounded-xl font-label-caps text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrentlyActive
                      ? 'bg-[#e2d5c8] text-[#867273] cursor-not-allowed'
                      : 'bg-[#4a0e17] text-white hover:bg-[#2a0006] shadow-2xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isCurrentlyActive ? 'check_circle' : 'playlist_play'}
                  </span>
                  <span>{isCurrentlyActive ? 'Aplicado' : 'Aplicar na Celebração'}</span>
                </button>

                <button
                  onClick={() => handleSharePlaylist(pl)}
                  className="p-2 bg-[#ffead7] hover:bg-[#ffe4c8] text-[#4a0e17] rounded-xl border border-[#d9c1c1]/40 transition-colors cursor-pointer flex items-center justify-center"
                  title="Copiar e compartilhar repertório"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedId === pl.id ? 'check' : 'share'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
