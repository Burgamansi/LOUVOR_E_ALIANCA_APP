import React, { useState } from 'react';
import { PastCelebration, LiturgicalSong } from '../types';

interface CelebrationHistorySectionProps {
  pastCelebrations: PastCelebration[];
  allSongs: LiturgicalSong[];
  onReuseRepertoire: (past: PastCelebration) => void;
  onOpenCifra?: (song: LiturgicalSong) => void;
}

export const CelebrationHistorySection: React.FC<CelebrationHistorySectionProps> = ({
  pastCelebrations,
  allSongs,
  onReuseRepertoire,
  onOpenCifra,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(pastCelebrations[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getLiturgicalColorBadge = (color: PastCelebration['liturgicalColor']) => {
    switch (color) {
      case 'Verde':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Branco':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Roxo':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Vermelho':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Rosa':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-[#ffead7] text-[#4a0e17] border-[#d9c1c1]';
    }
  };

  const filtered = pastCelebrations.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.dateStr.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.season.toLowerCase().includes(q) ||
      p.songs.some((s) => s.title.toLowerCase().includes(q) || s.part.toLowerCase().includes(q))
    );
  });

  const handleCopySummary = (past: PastCelebration) => {
    const songListStr = past.songs
      .map((s, idx) => `${idx + 1}. [${s.part}] ${s.title} (Tom: ${s.key})`)
      .join('\n');

    const summaryText = `📜 *Louvor & Aliança — Histórico Litúrgico*\n*${past.title}*\n🗓️ Data: ${past.dateStr} às ${past.timeStr}\n📍 Local: ${past.location} (${past.season})\n🎨 Cor Litúrgica: ${past.liturgicalColor}\n👥 Músicos (${past.musiciansCount}): ${past.musicianNames.join(', ')}\n\n*Repertório Executado:*\n${songListStr}${past.notes ? `\n\n📌 Obs: ${past.notes}` : ''}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedId(past.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#7A2332]/15 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#7A2332]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-xl">history</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#7A2332]">
                Histórico de Celebrações Realizadas
              </h3>
              <span className="bg-[#C9A24A]/20 text-[#2D2118] text-xs px-2 py-0.5 rounded-full font-bold border border-[#C9A24A]/30">
                {pastCelebrations.length} registradas
              </span>
            </div>
            <p className="text-xs text-[#5C4A3E]">
              Consulte e reutilize repertórios e escalas de missas e encontros passados
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#7A2332]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar histórico..."
            className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2118] placeholder-[#5C4A3E] outline-none focus:border-[#7A2332]"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#867273]">
            Nenhuma celebração no histórico encontrada para "{searchQuery}".
          </div>
        ) : (
          filtered.map((past) => {
            const isExpanded = expandedId === past.id;

            return (
              <div
                key={past.id}
                className="bg-white rounded-2xl p-4 border border-[#d9c1c1]/40 hover:border-[#4a0e17]/30 transition-all shadow-2xs flex flex-col gap-3"
              >
                {/* Top Summary Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : past.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffead7] text-[#4a0e17] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-headline-sm text-sm text-[#261908] font-bold">
                          {past.title}
                        </h4>
                        <span
                          className={`text-[9px] font-label-caps px-2 py-0.5 rounded-full border font-bold ${getLiturgicalColorBadge(
                            past.liturgicalColor
                          )}`}
                        >
                          Cor: {past.liturgicalColor}
                        </span>
                        <span className="bg-[#ffead7] text-[#4a0e17] text-[9px] font-label-caps px-2 py-0.5 rounded-full font-bold">
                          {past.season}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#544343] mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-[#4a0e17]">
                          <span className="material-symbols-outlined text-xs">event</span>
                          {past.dateStr} às {past.timeStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {past.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">group</span>
                          {past.musiciansCount} músicos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-gray-500">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#d9c1c1]/30 flex flex-col gap-3">
                    {/* Song List Used */}
                    <div>
                      <span className="text-xs font-label-caps text-[#4a0e17] uppercase font-bold block mb-1.5">
                        Repertório Executado ({past.songs.length} Músicas)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {past.songs.map((songItem) => {
                          const fullSong = allSongs.find((s) => s.id === songItem.id);
                          return (
                            <div
                              key={songItem.part + songItem.id}
                              className="bg-[#fff8f4] p-2.5 rounded-xl border border-[#d9c1c1]/30 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="text-[10px] font-label-caps text-[#775a00] font-bold block">
                                  {songItem.part}
                                </span>
                                <p className="font-semibold text-[#261908]">{songItem.title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-[#ffe4c8] text-[#775a00] font-bold text-[10px] px-2 py-0.5 rounded-md">
                                  Tom: {songItem.key}
                                </span>
                                {fullSong && onOpenCifra && (
                                  <button
                                    onClick={() => onOpenCifra(fullSong)}
                                    className="p-1 text-[#4a0e17] hover:bg-[#ffead7] rounded-md transition-colors cursor-pointer"
                                    title="Abrir Cifra"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      menu_book
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Musicians List */}
                    <div>
                      <span className="text-xs font-label-caps text-[#4a0e17] uppercase font-bold block mb-1">
                        Equipe de Canto Escala
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {past.musicianNames.map((m) => (
                          <span
                            key={m}
                            className="bg-[#ffead7] text-[#4a0e17] text-[11px] font-body-sm px-2.5 py-1 rounded-lg border border-[#d9c1c1]/30 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes if any */}
                    {past.notes && (
                      <div className="bg-[#fffcf5] border border-[#fece57]/50 rounded-xl p-2.5 text-xs text-[#775a00] flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                          info
                        </span>
                        <span>
                          <strong>Observação da Celebração:</strong> {past.notes}
                        </span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d9c1c1]/20">
                      <button
                        onClick={() => handleCopySummary(past)}
                        className="px-3 py-1.5 bg-[#ffead7] hover:bg-[#ffe4c8] text-[#4a0e17] rounded-xl text-xs font-label-caps flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedId === past.id ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedId === past.id ? 'Copiado!' : 'Copiar Resumo'}</span>
                      </button>

                      <button
                        onClick={() => onReuseRepertoire(past)}
                        className="px-4 py-1.5 bg-[#4a0e17] hover:bg-[#2a0006] text-white rounded-xl text-xs font-label-caps flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">replay</span>
                        <span>Reutilizar este Repertório</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
