import React, { useState, useEffect, useRef } from 'react';
import { LiturgicalSong, TabType } from '../types';
import {
  transposeChordBlock,
  KEY_LIST,
  calculateSemitones,
  getTransposedKeyName
} from '../utils/chordTransposer';

interface CifrasViewProps {
  songs: LiturgicalSong[];
  selectedSong: LiturgicalSong;
  onSelectSong: (song: LiturgicalSong) => void;
  onOpenDrive: () => void;
  onOpenAddChordModal: () => void;
}

export const CifrasView: React.FC<CifrasViewProps> = ({
  songs,
  selectedSong,
  onSelectSong,
  onOpenDrive,
  onOpenAddChordModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [semitones, setSemitones] = useState<number>(0);
  const [isStageMode, setIsStageMode] = useState<boolean>(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['s-1', 's-2']);
  const [scrollSpeed] = useState<number>(40); // ms per step
  const scrollIntervalRef = useRef<number | null>(null);

  // Filter songs based on search query
  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.part.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      s.lyricsPreview.toLowerCase().includes(q) ||
      s.fullChordText.toLowerCase().includes(q)
    );
  });

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const isFavorite = favorites.includes(selectedSong.id);

  // Reset transposition when selected song changes
  useEffect(() => {
    setSemitones(0);
  }, [selectedSong.id]);

  // Handle auto-scroll
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = window.setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'auto' });
      }, scrollSpeed);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  const handleTransposeUp = () => setSemitones(prev => prev + 1);
  const handleTransposeDown = () => setSemitones(prev => prev - 1);

  // Transposed song chords
  const transposedContent = transposeChordBlock(selectedSong.fullChordText, semitones);

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Search & Liturgical Floating Toolbar */}
      <div className="sticky top-16 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#7A2332]/15 px-4 py-3 shadow-xs">
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {/* Top Search Input Bar */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[#7A2332]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar cifra por título, momento, tom ou letra..."
              className="w-full bg-white border border-[#7A2332]/20 rounded-xl pl-11 pr-10 py-2.5 text-sm text-[#2D2118] placeholder-[#5C4A3E] outline-none focus:border-[#7A2332] focus:ring-1 focus:ring-[#7A2332] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#5C4A3E] hover:text-[#7A2332] p-1 cursor-pointer"
                title="Limpar pesquisa"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>

          {/* Quick Filter Tags & Results Badge */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide py-0.5">
            <div className="flex items-center gap-1.5 min-w-max">
              {['ENTRADA', 'ATO PENITENCIAL', 'GLÓRIA', 'SALMO', 'OFERTÓRIO', 'COMUNHÃO'].map((partTag) => (
                <button
                  key={partTag}
                  onClick={() => setSearchQuery(searchQuery === partTag ? '' : partTag)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    searchQuery.toUpperCase() === partTag
                      ? 'bg-[#7A2332] text-white border-[#7A2332]'
                      : 'bg-white text-[#5C4A3E] border-[#7A2332]/15 hover:bg-[#7A2332]/10'
                  }`}
                >
                  {partTag}
                </button>
              ))}
            </div>
            {searchQuery && (
              <span className="text-[10px] font-bold text-[#7A2332] bg-[#C9A24A]/20 border border-[#C9A24A]/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                {filteredSongs.length} {filteredSongs.length === 1 ? 'encontrada' : 'encontradas'}
              </span>
            )}
          </div>

          {/* Song Selector Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedSong.id}
              onChange={(e) => {
                const song = songs.find(s => s.id === e.target.value);
                if (song) onSelectSong(song);
              }}
              className="flex-1 bg-white text-[#7A2332] font-semibold text-sm rounded-xl p-2.5 border border-[#7A2332]/20 outline-none cursor-pointer"
            >
              {filteredSongs.length > 0 ? (
                filteredSongs.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.number}. {s.title} ({s.part}) - Tom: {s.key} {favorites.includes(s.id) ? '★' : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma cifra encontrada para "{searchQuery}"</option>
              )}
            </select>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(selectedSong.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                isFavorite
                  ? 'bg-[#C9A24A] text-white border-[#C9A24A]'
                  : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:text-[#7A2332]'
              }`}
              title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <span className="material-symbols-outlined text-lg">
                {isFavorite ? 'star' : 'star_border'}
              </span>
            </button>
          </div>

          {/* Transposition & Key Selector Toolbar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#7A2332]/15 shadow-xs flex flex-col gap-3">
            {/* Top Row: Current Transposed Key Badge & Direct Key Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C9A24A] text-xl">tune</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#5C4A3E] uppercase tracking-wider">
                    Tom Original: <strong className="text-[#2D2118]">{selectedSong.key}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#7A2332]">
                      Tom Transposto: {getTransposedKeyName(selectedSong.key, semitones)}
                    </span>
                    {semitones !== 0 && (
                      <span className="text-[10px] text-[#2D2118] bg-[#C9A24A]/30 px-2 py-0.5 rounded-full font-bold border border-[#C9A24A]/40">
                        {semitones > 0 ? `+${semitones}` : semitones} {Math.abs(semitones) === 1 ? 'semitom' : 'semitons'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Target Key Selector Dropdown */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-[#5C4A3E] hidden sm:inline">Transpor para:</label>
                <select
                  value={getTransposedKeyName(selectedSong.key, semitones).replace(/m$/, '')}
                  onChange={(e) => {
                    const targetKey = e.target.value;
                    const newSemitones = calculateSemitones(selectedSong.key, targetKey);
                    setSemitones(newSemitones);
                  }}
                  className="bg-[#FFF9F2] text-[#7A2332] font-bold text-xs rounded-xl px-3 py-1.5 border border-[#7A2332]/20 outline-none cursor-pointer hover:border-[#7A2332]"
                >
                  {KEY_LIST.map((keyNote) => (
                    <option key={keyNote} value={keyNote}>
                      Tom: {keyNote}
                    </option>
                  ))}
                </select>

                {semitones !== 0 && (
                  <button
                    onClick={() => setSemitones(0)}
                    className="text-[10px] font-bold text-[#7A2332] bg-[#FFF9F2] hover:bg-[#7A2332]/10 px-2.5 py-1.5 rounded-xl border border-[#7A2332]/20 cursor-pointer flex items-center gap-1"
                    title="Restaurar tom original"
                  >
                    <span className="material-symbols-outlined text-xs">restart_alt</span>
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Middle Row: Quick Chromatic Key Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              <span className="text-[10px] font-bold text-[#5C4A3E] mr-1 min-w-max uppercase tracking-wider">Acesso Rápido:</span>
              {KEY_LIST.map((keyNote) => {
                const isSelected = getTransposedKeyName(selectedSong.key, semitones).replace(/m$/, '').toUpperCase() === keyNote.toUpperCase();
                return (
                  <button
                    key={keyNote}
                    onClick={() => {
                      const newSemitones = calculateSemitones(selectedSong.key, keyNote);
                      setSemitones(newSemitones);
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer min-w-[32px] text-center ${
                      isSelected
                        ? 'bg-[#7A2332] text-white border-[#7A2332] shadow-xs scale-105'
                        : 'bg-[#FFF9F2] text-[#2D2118] border-[#7A2332]/15 hover:bg-[#7A2332]/10'
                    }`}
                  >
                    {keyNote}
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Stepper Buttons, Audio Reference & Auto-Scroll */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#7A2332]/10 pt-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTransposeDown}
                  className="px-3 py-1.5 bg-[#FFF9F2] text-[#7A2332] rounded-xl border border-[#7A2332]/20 hover:bg-[#7A2332]/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Diminuir meio tom (-1)"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                  -1 Semitom
                </button>
                <button
                  onClick={handleTransposeUp}
                  className="px-3 py-1.5 bg-[#FFF9F2] text-[#7A2332] rounded-xl border border-[#7A2332]/20 hover:bg-[#7A2332]/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Aumentar meio tom (+1)"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  +1 Semitom
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Reference Audio Shortcut */}
                {selectedSong.audioUrl && (
                  <a
                    href={selectedSong.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 h-9 rounded-xl text-xs font-bold px-3 bg-[#FFF9F2] text-[#7A2332] border border-[#7A2332]/20 hover:bg-[#7A2332]/10 transition-colors"
                    title="Ouvir áudio de referência"
                  >
                    <span className="material-symbols-outlined text-base text-[#C9A24A]">headphones</span>
                    <span className="hidden sm:inline">Áudio Referência</span>
                  </a>
                )}

                {/* Auto-Scroll Button */}
                <button
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold px-3 shadow-xs transition-all cursor-pointer ${
                    isAutoScrolling
                      ? 'bg-red-700 text-white animate-pulse'
                      : 'bg-[#C9A24A] text-white hover:bg-[#b08d3e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isAutoScrolling ? 'pause' : 'south'}
                  </span>
                  <span>{isAutoScrolling ? 'Parar' : 'Auto-Scroll'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsStageMode(!isStageMode)}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-semibold text-xs border border-[#7A2332]/20 transition-colors cursor-pointer ${
                isStageMode
                  ? 'bg-[#7A2332] text-white'
                  : 'bg-[#FFF9F2] text-[#7A2332] hover:bg-[#7A2332]/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isStageMode ? 'close_fullscreen' : 'fullscreen'}
              </span>
              <span>{isStageMode ? 'Sair do Modo Palco' : 'Modo de Palco'}</span>
            </button>

            <button
              onClick={onOpenDrive}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FFF9F2] text-[#7A2332] h-10 rounded-xl font-semibold text-xs border border-[#7A2332]/20 hover:bg-[#7A2332]/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>Biblioteca L&A</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Quick Results Tray when searching */}
      {searchQuery && filteredSongs.length > 0 && (
        <div className="px-5 pt-4 max-w-2xl mx-auto w-full">
          <div className="bg-white border border-[#7A2332]/20 rounded-2xl p-3 shadow-xs">
            <span className="text-xs font-bold text-[#7A2332] uppercase block mb-2 px-1">
              Resultados da Pesquisa ({filteredSongs.length})
            </span>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    onSelectSong(song);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    song.id === selectedSong.id
                      ? 'bg-[#7A2332] text-white'
                      : 'bg-[#FFF9F2] text-[#2D2118] hover:bg-[#7A2332]/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      song.id === selectedSong.id ? 'bg-[#C9A24A] text-white' : 'bg-[#7A2332]/10 text-[#7A2332]'
                    }`}>
                      {song.number}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{song.title}</p>
                      <p className={`text-[10px] ${song.id === selectedSong.id ? 'text-amber-100' : 'text-[#5C4A3E]'}`}>
                        {song.part} • Tom: {song.key}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm">
                    {song.id === selectedSong.id ? 'check_circle' : 'chevron_right'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Music Content Area */}
      <div className={`px-5 py-8 transition-all duration-300 max-w-2xl mx-auto ${isStageMode ? 'text-xl' : 'text-base'}`}>
        <header className="mb-8 text-center border-b border-[#7A2332]/15 pb-4">
          <h2 className="font-serif text-3xl font-bold text-[#7A2332] mb-1">{selectedSong.title}</h2>
          <p className="text-xs font-bold text-[#C9A24A] uppercase tracking-widest">
            {selectedSong.part} • {selectedSong.season || 'Tempo Comum'}
          </p>
        </header>

        {/* Lyrics & Chords Section */}
        <div className="font-mono text-[#2D2118] leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-2xl border border-[#7A2332]/15 shadow-xs">
          {transposedContent.split('\n').map((line, idx) => {
            // Check if line looks like chords
            const isChordLine = /^[A-G][#b]?(?:m|maj|dim|aug|sus[24]?|add[91113]?|[2456789]|11|13)*(?:\/[A-G][#b]?)?(\s+[A-G][#b]?(?:m|maj|dim|aug|sus[24]?|add[91113]?|[2456789]|11|13)*(?:\/[A-G][#b]?)?)*\s*$/.test(line.trim());

            if (isChordLine) {
              return (
                <div key={idx} className="text-[#7A2332] font-bold text-lg tracking-wide my-1">
                  {line}
                </div>
              );
            }
            return (
              <div key={idx} className="my-0.5 text-[#2D2118]">
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload / Empty State Zone */}
      <div className="px-5 pb-8 mt-6 max-w-xl mx-auto w-full">
        <div className="rounded-2xl bg-white border-2 border-dashed border-[#7A2332]/20 p-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#7A2332] border border-[#7A2332]/15 shadow-xs">
            <span className="material-symbols-outlined text-2xl">post_add</span>
          </div>
          <div>
            <p className="font-serif font-bold text-base text-[#7A2332]">Adicionar Nova Cifra Litúrgica</p>
            <p className="text-xs text-[#5C4A3E] max-w-xs mx-auto mt-0.5">
              Cole o texto ou faça upload de um arquivo PDF/Word para o acervo do ministério.
            </p>
          </div>
          <div className="flex gap-2.5 w-full max-w-xs mt-2">
            <button
              onClick={onOpenAddChordModal}
              className="flex-1 bg-[#7A2332] hover:bg-[#4D1721] text-white h-11 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Upload / Colar Cifra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
