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
import { MissasView } from './components/MissasView';
import { LinksUteisView } from './components/LinksUteisView';
import { PropostasView } from './components/PropostasView';
import { BotaoWhatsAppFlutuante } from './components/BotaoWhatsAppFlutuante';
import { ModalPerfil } from './components/ModalPerfil';
import type { PerfilMinisterio } from './components/ModalPerfil';

import { NewNoticeModal } from './components/NewNoticeModal';
import { ImportarCifraModal } from './components/ImportarCifraModal';
import { UploadMediaModal } from './components/UploadMediaModal';
import { NewPlaylistModal } from './components/NewPlaylistModal';
import { BoasVindas } from './components/BoasVindas';
import { MINISTERIO, grupoConfigurado } from './lib/config';
import { useLocal } from './hooks/useLocal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('programacao');

  // Modo de palco recolhe cabeçalho, menu lateral e navegação: no palco a tela
  // inteira é da cifra, e qualquer coisa a mais é uma chance de tocar errado.
  const [modoPalco, setModoPalco] = useState(false);

  // Boas-vindas só no primeiro acesso deste aparelho. Depois disso, o mesmo
  // conteúdo continua acessível em Mais → Como usar o app.
  const [jaViuOnboarding, setJaViuOnboarding] = useLocal('la:onboarding-visto', false);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const grupoWhatsApp = grupoConfigurado();

  // Perfil de quem está usando o app. Enquanto não houver login, o padrão é o
  // administrador — é ele quem publica missas, cifras e avisos, e era estranho
  // o rodapé da barra lateral mostrar sempre outra pessoa da equipe.
  const [perfil, setPerfil] = useState<PerfilMinisterio>({
    nome: 'Rogério Marcos',
    apelido: 'Rogério',
    papel: 'Coordenação · administrador do app',
    foto: '/integrantes/rogerio.jpg',
    whatsappE164: null,
    whatsappPublico: false,
  });
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);

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
  const [isImportarCifraOpen, setIsImportarCifraOpen] = useState<boolean>(false);
  const [cifraEmEdicao, setCifraEmEdicao] = useState<LiturgicalSong | null>(null);
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

  // Grava a cifra importada: substitui quando o id já existe, senão acrescenta.
  // É o mesmo caminho para "importar nova" e "corrigir esta" — uma cifra só por
  // música, sem cópia divergindo do original.
  const handleSalvarCifra = (song: LiturgicalSong) => {
    setSongs((prev) =>
      prev.some((s) => s.id === song.id)
        ? prev.map((s) => (s.id === song.id ? song : s))
        : [...prev, song]
    );
    setSelectedSong(song);
    setCurrentTab('cifras');
    setCifraEmEdicao(null);
  };

  /**
   * Um arquivo de missa traz a celebração inteira. Cada canto entra como uma
   * música própria — é isso que dá a cada um o seu tom, já que o tom é guardado
   * por id de música. Abre no primeiro, que é a Entrada.
   */
  const handleSalvarVariasCifras = (novas: LiturgicalSong[]) => {
    if (novas.length === 0) return;
    setSongs((prev) => {
      const ids = new Set(novas.map((n) => n.id));
      return [...prev.filter((s) => !ids.has(s.id)), ...novas];
    });
    setSelectedSong(novas[0]);
    setCurrentTab('cifras');
    setCifraEmEdicao(null);
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
      case 'missas': return 'Missas & Arquivos';
      case 'cifras': return 'Cifras & Repertório';
      case 'propostas': return 'Propostas Musicais';
      case 'links': return 'Links Úteis';
      case 'drive': return 'Biblioteca Louvor & Aliança';
      case 'comunidade': return 'Comunidade & Oração';
      case 'midia': return 'Galeria de Memórias';
      default: return 'Louvor & Aliança';
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#261908] font-sans antialiased flex flex-col">
      {/* No palco, tudo o que não é cifra sai da tela. */}
      {!modoPalco && (
        <>
          <Header
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            title={getTabTitle()}
            onAbrirAjuda={() => setAjudaAberta(true)}
          />

          <Sidebar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            perfil={perfil}
            onAbrirPerfil={() => setIsPerfilOpen(true)}
            grupo={grupoWhatsApp}
            nomeGrupo={MINISTERIO.nomeGrupo}
            onAbrirAjuda={() => setAjudaAberta(true)}
          />
        </>
      )}

      <main
        className={`flex-1 min-h-screen bg-[#fff8f4] ${
          modoPalco ? 'pt-0 pb-8' : 'pt-20 pb-24 md:pb-8 md:pl-[280px]'
        }`}
      >
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


        {currentTab === 'missas' && <MissasView />}

        {currentTab === 'links' && <LinksUteisView />}

        {currentTab === 'propostas' && <PropostasView />}

        {currentTab === 'cifras' && (
          <CifrasView
            songs={songs}
            selectedSong={selectedSong}
            onSelectSong={setSelectedSong}
            onOpenDrive={() => setCurrentTab('drive')}
            onImportarCifra={() => { setCifraEmEdicao(null); setIsImportarCifraOpen(true); }}
            onSubstituirCifra={(musica) => { setCifraEmEdicao(musica); setIsImportarCifraOpen(true); }}
            onModoPalco={setModoPalco}
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

      {!modoPalco && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          grupo={grupoWhatsApp}
          nomeGrupo={MINISTERIO.nomeGrupo}
          onAbrirAjuda={() => setAjudaAberta(true)}
        />
      )}

      {/* Botão flutuante do WhatsApp — some sozinho se não houver número nem
          grupo. Fica fora das Cifras: ali embaixo mora o controle de rolagem, e
          dois botões flutuantes disputando o mesmo canto é um toque errado
          esperando para acontecer. */}
      {currentTab !== 'cifras' && (
        <BotaoWhatsAppFlutuante
          e164={MINISTERIO.whatsappE164 || perfil.whatsappE164}
          grupo={grupoWhatsApp}
          nomeGrupo={MINISTERIO.nomeGrupo}
        />
      )}

      <BoasVindas
        aberto={ajudaAberta || !jaViuOnboarding}
        onFechar={() => { setAjudaAberta(false); setJaViuOnboarding(true); }}
        onIrPara={setCurrentTab}
        grupo={grupoWhatsApp}
        nomeGrupo={MINISTERIO.nomeGrupo}
      />

      {/* Modals */}
      <ModalPerfil
        aberto={isPerfilOpen}
        onFechar={() => setIsPerfilOpen(false)}
        perfil={perfil}
        onSalvar={setPerfil}
      />

      <NewNoticeModal
        isOpen={isNewNoticeOpen}
        onClose={() => setIsNewNoticeOpen(false)}
        onAddNotice={handleAddNotice}
      />

      <ImportarCifraModal
        aberto={isImportarCifraOpen}
        onFechar={() => { setIsImportarCifraOpen(false); setCifraEmEdicao(null); }}
        onSalvar={handleSalvarCifra}
        onSalvarVarias={handleSalvarVariasCifras}
        musicaExistente={cifraEmEdicao}
        proximoNumero={songs.length + 1}
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

