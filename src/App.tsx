import { useState } from 'react';
import { TabType, Celebration, Musician, LiturgicalSong, Notice, ChatMessage, GalleryMediaItem, CelebrationPlaylist, PastCelebration } from './types';
import {
  INITIAL_CELEBRATION,
  INITIAL_MUSICIANS,
  INITIAL_SONGS,
  INITIAL_NOTICES,
  INITIAL_MESSAGES,
  GALLERY_MEDIA,
  INITIAL_PLAYLISTS,
  INITIAL_PAST_CELEBRATIONS,
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ProgramacaoView } from './components/ProgramacaoView';
import { CifrasView } from './components/CifrasView';
import { DriveView } from './components/DriveView';
import { ComunidadeView } from './components/ComunidadeView';
import { MidiaView } from './components/MidiaView';

import { NewNoticeModal } from './components/NewNoticeModal';
import { AddChordModal } from './components/AddChordModal';
import { UploadMediaModal } from './components/UploadMediaModal';
import { NewPlaylistModal } from './components/NewPlaylistModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('programacao');

  // Application State
  const [celebration, setCelebration] = useState<Celebration>(INITIAL_CELEBRATION);
  const [musicians] = useState<Musician[]>(INITIAL_MUSICIANS);
  const [songs, setSongs] = useState<LiturgicalSong[]>(INITIAL_SONGS);
  const [selectedSong, setSelectedSong] = useState<LiturgicalSong>(INITIAL_SONGS[0]);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>(GALLERY_MEDIA);
  const [playlists, setPlaylists] = useState<CelebrationPlaylist[]>(INITIAL_PLAYLISTS);
  const [pastCelebrations] = useState<PastCelebration[]>(INITIAL_PAST_CELEBRATIONS);
  const [activeSongIds, setActiveSongIds] = useState<string[]>(INITIAL_SONGS.map((s) => s.id));

  // Modal Controllers
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState<boolean>(false);
  const [isAddChordOpen, setIsAddChordOpen] = useState<boolean>(false);
  const [isUploadMediaOpen, setIsUploadMediaOpen] = useState<boolean>(false);
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState<boolean>(false);

  // Apply playlist to current celebration schedule
  const handleApplyPlaylist = (playlist: CelebrationPlaylist) => {
    setActiveSongIds(playlist.songIds);
    setCelebration((prev) => ({
      ...prev,
      title: `${playlist.name}`,
    }));
  };

  // Reuse past celebration repertoire
  const handleReusePastRepertoire = (past: PastCelebration) => {
    const songIds = past.songs.map((s) => s.id);
    setActiveSongIds(songIds);
    setCelebration((prev) => ({
      ...prev,
      title: `Repertório: ${past.title}`,
    }));
  };

  // Save current active songs as a new template playlist
  const handleSaveCurrentAsPlaylist = () => {
    const newPl: CelebrationPlaylist = {
      id: `pl-${Date.now()}`,
      name: `Template ${celebration.title}`,
      category: 'Tempo Comum',
      description: `Repertório salvo diretamente da celebração "${celebration.title}".`,
      icon: 'bookmark',
      songIds: [...activeSongIds],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  // Save new custom playlist from modal
  const handleSaveNewPlaylist = (newPlaylist: CelebrationPlaylist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  // Delete custom playlist
  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };


  // Toggle confirmation for celebration
  const handleToggleConfirm = () => {
    setCelebration(prev => ({ ...prev, confirmed: !prev.confirmed }));
  };

  // Open Cifra from Programação view
  const handleOpenCifra = (song: LiturgicalSong) => {
    setSelectedSong(song);
    setCurrentTab('cifras');
  };

  // Add new notice
  const handleAddNotice = (notice: Notice) => {
    setNotices(prev => [notice, ...prev]);
  };

  // Add new song/chord
  const handleAddSong = (song: LiturgicalSong) => {
    setSongs(prev => [...prev, song]);
    setSelectedSong(song);
    setCurrentTab('cifras');
  };

  // Add new media item
  const handleAddMedia = (media: GalleryMediaItem) => {
    setGalleryMedia(prev => [media, ...prev]);
    setCurrentTab('midia');
  };

  // Send message in ministry chat
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'Você',
      senderRole: 'Cantor',
      content: text,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Title generator per tab
  const getTabTitle = () => {
    switch (currentTab) {
      case 'programacao': return 'Programação Litúrgica';
      case 'cifras': return 'Cifras & Repertório';
      case 'drive': return 'Biblioteca Louvor & Aliança';
      case 'comunidade': return 'Comunidade & Oração';
      case 'midia': return 'Galeria de Memórias';
      default: return 'Louvor & Aliança';
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#261908] font-sans antialiased flex flex-col">
      {/* Top Header Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        title={getTabTitle()}
      />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 md:pb-8 md:pl-[280px] min-h-screen bg-[#fff8f4]">
        {currentTab === 'programacao' && (
          <ProgramacaoView
            celebration={celebration}
            onToggleConfirm={handleToggleConfirm}
            musicians={musicians}
            songs={songs}
            playlists={playlists}
            pastCelebrations={pastCelebrations}
            activeSongIds={activeSongIds}
            onApplyPlaylist={handleApplyPlaylist}
            onReusePastRepertoire={handleReusePastRepertoire}
            onSaveCurrentAsPlaylist={handleSaveCurrentAsPlaylist}
            onOpenCreatePlaylistModal={() => setIsNewPlaylistOpen(true)}
            onDeletePlaylist={handleDeletePlaylist}
            onOpenCifra={handleOpenCifra}
            onSelectTab={setCurrentTab}
          />
        )}


        {currentTab === 'cifras' && (
          <CifrasView
            songs={songs}
            selectedSong={selectedSong}
            onSelectSong={setSelectedSong}
            onOpenDrive={() => setCurrentTab('drive')}
            onOpenAddChordModal={() => setIsAddChordOpen(true)}
          />
        )}

        {currentTab === 'drive' && (
          <DriveView
            onOpenMidia={() => setCurrentTab('midia')}
          />
        )}

        {currentTab === 'comunidade' && (
          <ComunidadeView
            notices={notices}
            messages={messages}
            musicians={musicians}
            pastCelebrations={pastCelebrations}
            onAddNotice={handleAddNotice}
            onSendMessage={handleSendMessage}
            onOpenNewNoticeModal={() => setIsNewNoticeOpen(true)}
          />
        )}

        {currentTab === 'midia' && (
          <MidiaView
            galleryMedia={galleryMedia}
            onOpenUploadModal={() => setIsUploadMediaOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Modals */}
      <NewNoticeModal
        isOpen={isNewNoticeOpen}
        onClose={() => setIsNewNoticeOpen(false)}
        onAddNotice={handleAddNotice}
      />

      <AddChordModal
        isOpen={isAddChordOpen}
        onClose={() => setIsAddChordOpen(false)}
        onAddSong={handleAddSong}
      />

      <UploadMediaModal
        isOpen={isUploadMediaOpen}
        onClose={() => setIsUploadMediaOpen(false)}
        onAddMedia={handleAddMedia}
      />

      <NewPlaylistModal
        isOpen={isNewPlaylistOpen}
        onClose={() => setIsNewPlaylistOpen(false)}
        songs={songs}
        onSavePlaylist={handleSaveNewPlaylist}
      />
    </div>
  );
}

