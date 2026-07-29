import React, { useState } from 'react';
import { Celebration, Musician, LiturgicalSong, TabType, CelebrationPlaylist, PastCelebration } from '../types';
import { PlaylistsSection } from './PlaylistsSection';
import { CelebrationHistorySection } from './CelebrationHistorySection';

interface ProgramacaoViewProps {
  celebration: Celebration;
  onToggleConfirm: () => void;
  musicians: Musician[];
  songs: LiturgicalSong[];
  playlists: CelebrationPlaylist[];
  pastCelebrations: PastCelebration[];
  activeSongIds: string[];
  onApplyPlaylist: (playlist: CelebrationPlaylist) => void;
  onReusePastRepertoire: (past: PastCelebration) => void;
  onSaveCurrentAsPlaylist: () => void;
  onOpenCreatePlaylistModal: () => void;
  onDeletePlaylist?: (id: string) => void;
  onOpenCifra: (song: LiturgicalSong) => void;
  onSelectTab: (tab: TabType) => void;
}

export const ProgramacaoView: React.FC<ProgramacaoViewProps> = ({
  celebration,
  onToggleConfirm,
  musicians,
  songs,
  playlists,
  pastCelebrations,
  activeSongIds,
  onApplyPlaylist,
  onReusePastRepertoire,
  onSaveCurrentAsPlaylist,
  onOpenCreatePlaylistModal,
  onDeletePlaylist,
  onOpenCifra,
  onSelectTab,
}) => {

  const [expandedSongId, setExpandedSongId] = useState<string | null>('song-1');
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSongId(prev => (prev === id ? null : id));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleReminders = async () => {
    const nextState = !remindersEnabled;
    setRemindersEnabled(nextState);

    if (nextState) {
      showToast('🔔 Lembretes ativos! Você receberá um aviso 24 horas antes das celebrações.');
    } else {
      showToast('Lembretes de celebração desativados.');
    }
  };

  const handleConfirmWithReminder = () => {
    onToggleConfirm();
    if (!celebration.confirmed) {
      showToast('✨ Presença confirmada! Que a paz de Cristo acompanhe o seu servir.');
    } else {
      showToast('Presença desmarcada para a celebração.');
    }
  };

  // Liturgical parts in exact order
  const liturgicalParts = [
    'ENTRADA',
    'ATO PENITENCIAL',
    'GLÓRIA',
    'SALMO',
    'ACLAMAÇÃO',
    'OFERTÓRIO',
    'SANTO',
    'CORDEIRO',
    'COMUNHÃO',
    'PÓS-COMUNHÃO',
    'FINAL'
  ];

  const confirmedMusicians = musicians.filter(m => m.confirmed);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 gap-8 max-w-5xl mx-auto relative pb-12">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#4D1721] text-[#FFF9F2] px-5 py-3 rounded-2xl text-xs font-medium shadow-2xl border border-[#C9A24A]/50 z-50 animate-bounce flex items-center gap-2 max-w-md text-center">
          <span className="material-symbols-outlined text-[#C9A24A] text-lg">auto_awesome</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HERO SECTION: PRÓXIMA CELEBRAÇÃO */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-[#7A2332]/15 shadow-md">
        {/* Cover Image Header with Dark Gradient Overlay */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={celebration.coverImage || 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=1200&auto=format&fit=crop'}
            alt={celebration.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4D1721] via-[#4D1721]/60 to-transparent" />
          
          {/* Liturgical Color & Season Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D2118]/80 text-[#FFF9F2] backdrop-blur-md border border-[#C9A24A]/40 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/50" />
              Liturgia: {celebration.liturgicalColor || 'Verde'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#7A2332]/90 text-white backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-sm text-[#C9A24A]">auto_awesome</span>
              {celebration.season || 'Tempo Comum'}
            </span>
          </div>

          {/* Repertoire Status Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A24A] text-[#2D2118] shadow-sm">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Repertório {celebration.repertoireStatus || 'Completo'}
            </span>
          </div>

          {/* Title on Hero Cover */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs uppercase tracking-widest text-[#C9A24A] font-semibold flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-sm">event</span> Próxima Celebração
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#FFF9F2] leading-tight">
              {celebration.title}
            </h2>
          </div>
        </div>

        {/* Hero Details Grid */}
        <div className="p-5 sm:p-6 bg-[#FFF9F2] flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-[#2D2118]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#7A2332]/10">
              <div className="w-10 h-10 rounded-lg bg-[#7A2332]/10 flex items-center justify-center text-[#7A2332]">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="text-xs text-[#5C4A3E]">Data e Horário</p>
                <p className="font-semibold text-[#2D2118]">{celebration.dateStr} às {celebration.timeStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#7A2332]/10">
              <div className="w-10 h-10 rounded-lg bg-[#7A2332]/10 flex items-center justify-center text-[#7A2332]">
                <span className="material-symbols-outlined">church</span>
              </div>
              <div>
                <p className="text-xs text-[#5C4A3E]">Local do Encontro</p>
                <p className="font-semibold text-[#2D2118] line-clamp-1">{celebration.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#7A2332]/10">
              <div className="w-10 h-10 rounded-lg bg-[#7A2332]/10 flex items-center justify-center text-[#7A2332]">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="text-xs text-[#5C4A3E]">Músicos Escalados</p>
                <p className="font-semibold text-[#2D2118]">
                  {celebration.confirmedMusiciansCount || confirmedMusicians.length} de {celebration.totalMusiciansCount || musicians.length} Confirmados
                </p>
              </div>
            </div>
          </div>

          {/* Pendências e Próximo Ensaio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Box Pendências */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-[#C9A24A]/30">
              <div className="flex items-center gap-2 mb-2 text-[#7A2332] font-semibold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base text-[#C9A24A]">assignment_late</span>
                Pendências Técnicas e Litúrgicas
              </div>
              <ul className="space-y-1 text-xs text-[#2D2118]">
                {celebration.pendencies && celebration.pendencies.length > 0 ? (
                  celebration.pendencies.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#C9A24A] font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-700 font-medium">Nenhuma pendência pendente para esta celebração!</li>
                )}
              </ul>
            </div>

            {/* Box Próximo Ensaio */}
            <div className="p-4 rounded-xl bg-[#7A2332]/5 border border-[#7A2332]/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 text-[#7A2332] font-semibold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base">music_note</span>
                  Próximo Ensaio Geral
                </div>
                <p className="text-xs font-semibold text-[#2D2118]">
                  {celebration.nextRehearsal?.dateStr || 'Quinta-feira, 30 de Julho'} às {celebration.nextRehearsal?.timeStr || '20:00'}
                </p>
                <p className="text-xs text-[#5C4A3E]">
                  Local: {celebration.nextRehearsal?.location || 'Salão Paroquial do Louvor'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar inside Hero */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#7A2332]/10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleReminders}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  remindersEnabled 
                    ? 'bg-[#7A2332]/10 text-[#7A2332] border-[#7A2332]/20'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {remindersEnabled ? 'notifications_active' : 'notifications_off'}
                </span>
                {remindersEnabled ? 'Lembrete 24h Ativo' : 'Ativar Lembrete'}
              </button>
            </div>

            <button
              onClick={handleConfirmWithReminder}
              className={`px-6 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                celebration.confirmed
                  ? 'bg-[#C9A24A] text-[#2D2118] hover:bg-[#b89139]'
                  : 'bg-[#7A2332] text-white hover:bg-[#4D1721] active:scale-98'
              }`}
            >
              <span>{celebration.confirmed ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR PRESENÇA'}</span>
              <span className="material-symbols-outlined text-lg">
                {celebration.confirmed ? 'check_circle' : 'task_alt'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* CARTÕES DE ACESSO RÁPIDO */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => {
            const el = document.getElementById('liturgical-timeline');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332] hover:shadow-md transition-all cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#7A2332]/10 text-[#7A2332] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">event_note</span>
          </div>
          <span className="text-xs font-semibold text-[#2D2118]">Ver Programação</span>
        </button>

        <button
          onClick={() => onSelectTab('cifras')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332] hover:shadow-md transition-all cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#7A2332]/10 text-[#7A2332] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">music_note</span>
          </div>
          <span className="text-xs font-semibold text-[#2D2118]">Abrir Cifras</span>
        </button>

        <button
          onClick={handleConfirmWithReminder}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332] hover:shadow-md transition-all cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#C9A24A]/20 text-[#7A2332] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <span className="text-xs font-semibold text-[#2D2118]">Confirmar Presença</span>
        </button>

        <button
          onClick={() => onSelectTab('drive')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332] hover:shadow-md transition-all cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#7A2332]/10 text-[#7A2332] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <span className="text-xs font-semibold text-[#2D2118]">Acessar Biblioteca</span>
        </button>

        <button
          onClick={() => onSelectTab('midia')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332] hover:shadow-md transition-all cursor-pointer group text-center col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-full bg-[#7A2332]/10 text-[#7A2332] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">photo_camera</span>
          </div>
          <span className="text-xs font-semibold text-[#2D2118]">Fotos e Vídeos</span>
        </button>
      </section>

      {/* ESCALA DE MÚSICOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-[#7A2332] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A24A]">groups</span>
            Escala de Músicos & Servidores
          </h3>
          <span className="text-xs font-semibold text-[#7A2332] bg-[#7A2332]/10 px-3 py-1 rounded-full">
            {confirmedMusicians.length} Confirmados
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pt-1">
          {musicians.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1.5 min-w-[90px] group">
              <div className={`w-16 h-16 rounded-full p-0.5 relative transition-transform group-hover:scale-105 ${
                m.confirmed ? 'ring-2 ring-[#C9A24A]' : 'ring-1 ring-gray-300'
              }`}>
                {m.avatar ? (
                  <img
                    alt={m.name}
                    className="w-full h-full rounded-full object-cover border border-white"
                    src={m.avatar}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#7A2332] text-[#FFF9F2] flex items-center justify-center border border-white font-serif font-bold text-lg">
                    {m.initials || m.name.charAt(0)}
                  </div>
                )}
                {m.confirmed && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-xs text-center text-[#2D2118] font-semibold leading-tight">
                {m.name}<br />
                <span className="text-[#5C4A3E] font-normal text-[10px]">{m.role}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYLISTS / TEMPLATES DE CELEBRAÇÃO */}
      <PlaylistsSection
        playlists={playlists}
        songs={songs}
        activeSongIds={activeSongIds}
        onApplyPlaylist={(pl) => {
          onApplyPlaylist(pl);
          showToast(`🎵 Template "${pl.name}" aplicado à celebração!`);
        }}
        onSaveCurrentAsPlaylist={onSaveCurrentAsPlaylist}
        onOpenCreateModal={onOpenCreatePlaylistModal}
        onDeletePlaylist={onDeletePlaylist}
      />

      {/* HISTÓRICO DE CELEBRAÇÕES */}
      <CelebrationHistorySection
        pastCelebrations={pastCelebrations}
        allSongs={songs}
        onReuseRepertoire={(past) => {
          onReusePastRepertoire(past);
          showToast(`📜 Repertório do "${past.title}" reutilizado com sucesso!`);
        }}
        onOpenCifra={onOpenCifra}
      />

      {/* LINHA DO TEMPO LITÚRGICA COMPLETA (11 PARTES) */}
      <section id="liturgical-timeline" className="flex flex-col gap-6 pt-4">
        <div className="border-b border-[#7A2332]/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#7A2332] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A24A]">auto_stories</span>
              Sequência Litúrgica da Celebração
            </h3>
            <p className="text-xs text-[#5C4A3E]">
              11 cânticos organizados para a perfeita ordem da santa missa
            </p>
          </div>

          <button
            onClick={() => {
              if (expandedSongId) setExpandedSongId(null);
              else setExpandedSongId('song-1');
            }}
            className="text-xs text-[#7A2332] font-semibold hover:underline self-start sm:self-auto cursor-pointer"
          >
            {expandedSongId ? 'Recolher Todos' : 'Expandir Detalhes'}
          </button>
        </div>

        {/* 11 Steps rendering */}
        <div className="space-y-4">
          {liturgicalParts.map((partName, idx) => {
            const matchingSongs = songs.filter(s => s.part === partName);
            const song = matchingSongs[0]; // primary song assigned for this part

            return (
              <div key={partName} className="flex gap-3 sm:gap-4 items-start">
                {/* Timeline Connector Pillar */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    song 
                      ? 'bg-[#7A2332] text-white' 
                      : 'bg-gray-200 text-gray-500 border border-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < liturgicalParts.length - 1 && (
                    <div className="w-0.5 h-full bg-[#7A2332]/20 min-h-[3rem] my-1" />
                  )}
                </div>

                {/* Song Item Box */}
                <div className="flex-1">
                  {song ? (
                    renderSongCard(song, expandedSongId, toggleExpand, onOpenCifra)
                  ) : (
                    <div className="p-4 rounded-xl bg-[#FFF9F2] border border-dashed border-[#7A2332]/30 flex items-center justify-between text-xs text-[#5C4A3E]">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[#7A2332]">{partName}</span>
                        <p className="text-[11px] text-gray-500">Nenhum cântico selecionado para este momento litúrgico.</p>
                      </div>
                      <button
                        onClick={() => onSelectTab('cifras')}
                        className="px-3 py-1.5 rounded-lg bg-[#7A2332]/10 text-[#7A2332] font-semibold hover:bg-[#7A2332]/20 transition-colors cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

function renderSongCard(
  song: LiturgicalSong,
  expandedSongId: string | null,
  toggleExpand: (id: string) => void,
  onOpenCifra: (song: LiturgicalSong) => void
) {
  const isExpanded = expandedSongId === song.id;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-[#7A2332]/15 shadow-xs transition-all hover:shadow-md overflow-hidden">
      <div
        onClick={() => toggleExpand(song.id)}
        className="p-4 flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A24A]">
              {song.part}
            </span>
            <h4 className="font-serif font-bold text-[#7A2332] text-base leading-snug">
              {song.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#2D2118]">
              <span className="inline-flex items-center gap-1 font-semibold bg-[#FFF9F2] px-2 py-0.5 rounded border border-[#7A2332]/15">
                Tom: <span className="text-[#7A2332] font-bold">{song.key}</span>
              </span>
              <span className="text-[#5C4A3E]">
                Resp: <span className="font-medium text-[#2D2118]">{song.responsible || 'Equipe de Canto'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            song.status === 'Pronto'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {song.status || 'Pronto'}
          </span>

          <span className={`material-symbols-outlined text-[#7A2332] transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}>
            expand_more
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#7A2332]/10 bg-[#FFF9F2]/50 flex flex-col gap-3 animate-fadeIn">
          {song.notes && (
            <p className="text-xs text-[#5C4A3E] bg-white p-2.5 rounded-lg border border-[#7A2332]/10">
              💡 <strong>Orientação Litúrgica:</strong> {song.notes}
            </p>
          )}

          <div className="p-3 bg-white rounded-lg text-xs italic font-serif text-[#2D2118] leading-relaxed border border-[#7A2332]/10">
            {song.lyricsPreview}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onOpenCifra(song)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-[#7A2332] text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-[#4D1721] transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">music_note</span> Abrir Cifra
            </button>

            {song.youtubeUrl && (
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-white text-[#7A2332] border border-[#7A2332]/30 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-[#7A2332]/5 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-red-600">play_circle</span> Áudio / Vídeo
              </a>
            )}

            <a
              href={song.presentationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 bg-[#C9A24A]/20 text-[#2D2118] py-2 px-3 rounded-lg text-xs font-semibold hover:bg-[#C9A24A]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-base">present_to_all</span> Slide / Telão
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

