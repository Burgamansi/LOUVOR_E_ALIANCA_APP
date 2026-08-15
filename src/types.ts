export type TabType =
  | 'programacao'
  | 'missas'
  | 'cifras'
  | 'propostas'
  | 'links'
  | 'drive'
  | 'comunidade'
  | 'midia';

export interface Musician {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials?: string;
  confirmed?: boolean;
}

export interface LiturgicalSong {
  id: string;
  part: string; // ENTRADA, ATO PENITENCIAL, GLÓRIA, SALMO, ACLAMAÇÃO, OFERTÓRIO, SANTO, CORDEIRO, COMUNHÃO, PÓS-COMUNHÃO, FINAL
  number: number;
  title: string;
  key: string;
  lyricsPreview: string;
  fullChordText: string;
  youtubeUrl?: string;
  season?: string;
  author?: string;
  responsible?: string;
  status?: 'Ensaiado' | 'Pronto' | 'A Confirmar' | 'Em Ensaio';
  presentationUrl?: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface Celebration {
  id: string;
  title: string;
  location: string;
  dateStr: string;
  timeStr: string;
  confirmed: boolean;
  season: string; // e.g. "Tempo Comum", "Advento", "Quaresma"
  coverImage?: string;
  liturgicalColor?: 'Verde' | 'Branco' | 'Roxo' | 'Vermelho' | 'Rosa';
  repertoireStatus?: 'Completo' | 'Em Análise' | 'Pendente';
  confirmedMusiciansCount?: number;
  totalMusiciansCount?: number;
  pendencies?: string[];
  nextRehearsal?: {
    dateStr: string;
    timeStr: string;
    location: string;
  };
}

export interface Notice {
  id: string;
  dateStr: string;
  tag: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  isUrgent?: boolean;
  isStarred?: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timeStr: string;
  isMe: boolean;
  avatar?: string;
}

export interface DriveFolder {
  id: string;
  title: string;
  subtitle: string;
  fileCount: number;
  iconName: string;
  colorClass: string;
}

export interface DriveExternalLink {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl?: string;
  iconName?: string;
  url: string;
}

export interface GalleryMediaItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  type: 'image' | 'video';
  dateStr: string;
  description?: string;
}

export interface QuickDownloadFile {
  id: string;
  filename: string;
  sizeStr: string;
  timeAgo: string;
  iconType: 'archive' | 'video' | 'audio';
  downloadUrl: string;
}

export interface CelebrationPlaylist {
  id: string;
  name: string;
  category: 'Solene' | 'Casamento' | 'Advento' | 'Quaresma' | 'Formatura' | 'Tempo Comum' | 'Outros';
  description: string;
  icon: string;
  songIds: string[];
  createdAt?: string;
}

export interface PastCelebration {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string;
  location: string;
  season: string;
  liturgicalColor: 'Verde' | 'Branco' | 'Roxo' | 'Vermelho' | 'Rosa';
  musiciansCount: number;
  musicianNames: string[];
  songs: {
    id: string;
    part: string;
    title: string;
    key: string;
  }[];
  notes?: string;
}


