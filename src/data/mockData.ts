import { Celebration, Musician, LiturgicalSong, Notice, ChatMessage, DriveFolder, DriveExternalLink, GalleryMediaItem, QuickDownloadFile, CelebrationPlaylist, PastCelebration } from '../types';

export const INITIAL_CELEBRATION: Celebration = {
  id: 'cel-1',
  title: 'Missa das 9 Horas — Missão Louvor & Aliança',
  location: 'Paróquia São Judas Tadeu — Americana/SP',
  dateStr: 'Domingo, 02 de Agosto',
  timeStr: '09:00',
  confirmed: true,
  season: 'Tempo Comum',
  coverImage: '/capa-missa-9h.jpg',
  liturgicalColor: 'Verde',
  repertoireStatus: 'Completo',
  confirmedMusiciansCount: 5,
  totalMusiciansCount: 5,
  pendencies: [
    'Ajustar tom do Salmo Responsorial com a salmista Ana',
    'Testar microfone sem fio da equipe de acolhida'
  ],
  nextRehearsal: {
    dateStr: 'Quinta-feira, 30 de Julho',
    timeStr: '20:00',
    location: 'Salão Paroquial São Judas Tadeu'
  }
};

export const INITIAL_MUSICIANS: Musician[] = [
  {
    id: 'm1',
    name: 'Rogério Marcos',
    role: 'Coordenação, violão e voz',
    initials: 'RM',
    avatar: '/integrantes/rogerio.jpg',
    confirmed: true
  },
  {
    id: 'm2',
    name: 'João Vítor',
    role: 'Violão, voz e arranjos',
    initials: 'JV',
    avatar: '/integrantes/joao.jpg',
    confirmed: true
  },
  {
    id: 'm3',
    name: 'Aninha',
    role: 'Pré-coordenação, vocal solo e salmo',
    initials: 'AM',
    avatar: '/integrantes/ana.jpg',
    confirmed: true
  },
  {
    id: 'm4',
    name: 'Lucas Creato',
    role: 'Teclado e contrabaixo',
    initials: 'LC',
    avatar: '/integrantes/lucas.jpg',
    confirmed: true
  },
  {
    id: 'm5',
    name: 'Edson Silva',
    role: 'Percussão leve e cajón',
    initials: 'ES',
    avatar: '/integrantes/edson.jpg',
    confirmed: true
  }
];

export const INITIAL_SONGS: LiturgicalSong[] = [
  {
    id: 'song-1',
    number: 1,
    part: 'ENTRADA',
    title: 'Como É Bom A Gente Se Encontrar',
    key: 'G',
    author: 'Pe. Zezinho',
    responsible: 'Rogério Marcos (Vocal & Violão)',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Como+E+Bom+A+Gente+Se+Encontrar',
    presentationUrl: '#',
    notes: 'Entrada festiva acolhendo as famílias e os casais do ministério.',
    lyricsPreview: '"Como é bom a gente se encontrar aqui neste lugar onde o amor de Deus reluz..."',
    fullChordText: `G          C          G
Como é bom a gente se encontrar
D7                    G
Neste lugar onde o amor de Deus reluz

G          C          G
Povo de Deus, caminha unido
D7                    G
Celebrando a Aliança com Jesus

G7         C
Cantai louvores ao Senhor
D7         G
Cantai louvores sem cessar
Em         Am
Ao Deus que é Pai, ao Deus Amor
D7         G
Vinde todos celebrar!`
  },
  {
    id: 'song-2',
    number: 2,
    part: 'ATO PENITENCIAL',
    title: 'Senhor Que Viestes Salvar',
    key: 'Am',
    author: 'D.R. / Tradicional Litúrgico',
    responsible: 'Ana Maria (Solo)',
    status: 'Ensaiado',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Senhor+que+viestes+salvar+os+coracoes+arrependidos',
    presentationUrl: '#',
    notes: 'Execução suave com teclado e voz principal solo.',
    lyricsPreview: '"Senhor, que viestes salvar os corações arrependo, tende piedade de nós..."',
    fullChordText: `Am        Dm        Am
Senhor, que viestes salvar os corações arrependo.
C         G         Am
Tende piedade de nós!

Am        Dm        Am
Cristo, que viestes chamar os pecadores humilhados.
C         G         Am
Tende piedade de nós!

Am        Dm        Am
Senhor, que intercedeis por nós junto do Pai das misericórdias.
C         G         Am
Tende piedade de nós!`
  },
  {
    id: 'song-3',
    number: 3,
    part: 'GLÓRIA',
    title: 'Glória a Deus nas Alturas',
    key: 'D',
    author: 'Eliana Ribeiro / Liturgia',
    responsible: 'João Vítor & Coro',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Gloria+a+Deus+nas+alturas+eliana+ribeiro',
    presentationUrl: '#',
    notes: 'Hino festivo com ritmo animado em Ré Maior.',
    lyricsPreview: '"Glória a Deus nas alturas, e paz na terra aos homens por Ele amados..."',
    fullChordText: `D         A         Bm        F#m
Glória a Deus nas alturas,
G         D         Em        A7
e paz na terra aos homens por Ele amados.

D         A         Bm        F#m
Senhor Deus, Rei dos céus, Deus Pai todo-poderoso:
G         D         Em        A7       D
Nós vos louvamos, nós vos bendizemos, nós vos adoramos!`
  },
  {
    id: 'song-4',
    number: 4,
    part: 'SALMO',
    title: 'O Senhor É o Meu Pastor (Salmo 22)',
    key: 'E',
    author: 'Salmo Responsorial',
    responsible: 'Ana Maria (Salmista)',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Salmo+22+O+Senhor+e+o+meu+pastor',
    presentationUrl: '#',
    notes: 'Atenção ao tom E Maior no refrão da assembleia.',
    lyricsPreview: '"O Senhor é o meu pastor, nada me faltará. Em verdes pastagens me faz descansar..."',
    fullChordText: `E         B7        C#m       A
O Senhor é o meu pastor, nada me faltará.
E         B7        A         E
O Senhor é o meu pastor, nada me faltará.

C#m       G#m       A         B7
Pelos prados e campinas verdejantes me conduz.
C#m       G#m       A         B7
Junto às águas de descanso restaura minhas forças.`
  },
  {
    id: 'song-5',
    number: 5,
    part: 'ACLAMAÇÃO',
    title: 'Aleluia, Alguém do Povo Exclamou',
    key: 'C',
    author: 'Pe. Zezinho',
    responsible: 'Lucas Creato & Vozes',
    status: 'Ensaiado',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Aleluia+alguem+do+povo+exclamou',
    presentationUrl: '#',
    lyricsPreview: '"Aleluia, Aleluia, Aleluia, Aleluia! Como é feliz quem ouve a Palavra do Senhor..."',
    fullChordText: `C         G         Am        Em
Aleluia, Aleluia, Aleluia, Aleluia!
F         C         G         C
Aleluia, Aleluia, Aleluia, Aleluia!

C         G         Am        Em
Alguém do povo exclamou: Como é feliz quem te gerou!
F         C         G
Jesus responde: Muito mais quem ouve a Deus e guarda a sua Palavra!`
  },
  {
    id: 'song-6',
    number: 6,
    part: 'OFERTÓRIO',
    title: 'Sabes Senhor O Que Temos É Pouco',
    key: 'F',
    author: 'Ministério de Música Litúrgica',
    responsible: 'Rogério Marcos',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Sabes+Senhor+o+que+temos+e+pouco',
    presentationUrl: '#',
    lyricsPreview: '"Sabes Senhor o que temos é pouco pra dar, mas este pouco nós queremos com os irmãos compartilhar..."',
    fullChordText: `F         C7        Dm        Bb
Sabes, Senhor, o que temos é pouco pra dar.
F         C7        Bb        F
Mas este pouco nós queremos compartilhar!

Dm        Am        Bb        F
Toma o nosso pão, toma o nosso vinho,
Gm        Dm        C7
Recebe o amor deste nosso caminho.`
  },
  {
    id: 'song-7',
    number: 7,
    part: 'SANTO',
    title: 'Santo, Santo É o Senhor',
    key: 'G',
    author: 'Canto Litúrgico',
    responsible: 'Coro Geral do Louvor',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Santo+Santo+e+o+Senhor+Deus+do+universo',
    presentationUrl: '#',
    lyricsPreview: '"Santo, Santo, Santo é o Senhor Deus do universo. O céu e a terra proclamam a vossa glória..."',
    fullChordText: `G         D         Em        C
Santo, Santo, Santo é o Senhor Deus do Universo!
G         D         C         G
O céu e a terra proclamam a vossa glória!

G         C         D         G
Hosana nas alturas, Hosana ao Nosso Rei!
Em        Am        D7        G
Bendito o que vem em nome do Senhor!`
  },
  {
    id: 'song-8',
    number: 8,
    part: 'CORDEIRO',
    title: 'Cordeiro de Deus Que Tirais o Pecado',
    key: 'Em',
    author: 'Liturgia da Missa',
    responsible: 'Ana Maria & João Vítor',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Cordeiro+de+Deus+que+tirais+o+pecado+do+mundo',
    presentationUrl: '#',
    lyricsPreview: '"Cordeiro de Deus que tirais o pecado do mundo, tende piedade de nós..."',
    fullChordText: `Em        Am        Em
Cordeiro de Deus que tirais o pecado do mundo,
C         B7        Em
Tende piedade de nós!

Em        Am        Em
Cordeiro de Deus que tirais o pecado do mundo,
C         D         G       B7
Dai-nos a vossa paz, dai-nos a paz!`
  },
  {
    id: 'song-9',
    number: 9,
    part: 'COMUNHÃO',
    title: 'Amar Como Jesus Amou',
    key: 'A',
    author: 'Pe. Zezinho',
    responsible: 'Rogério Marcos & Ana Maria',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Amar+como+Jesus+amou',
    presentationUrl: '#',
    notes: 'Hino orante central da celebração dos casais e do amor cristão.',
    lyricsPreview: '"Um dia um criança me parou, olhou-me nos meus olhos a sorrir... Amar como Jesus amou!"',
    fullChordText: `A         E7        F#m       C#m
Um dia uma criança me parou,
D         A         Bm        E7
Olhou-me nos meus olhos a sorrir.
A         E7        F#m       C#m
Perguntou-me se eu conhecia a Deus
D         A         E7        A
E o que eu devia a Ele responder.

F#m       C#m       D         A
Amar como Jesus amou, sonhar como Jesus sonhou,
Bm        F#m       E7        A
Pensar como Jesus pensou, viver como Jesus viveu!`
  },
  {
    id: 'song-10',
    number: 10,
    part: 'PÓS-COMUNHÃO',
    title: 'Te Louvo Em Verdade',
    key: 'D',
    author: 'Martin Valverde',
    responsible: 'Ana Maria (Solo Acompanhado)',
    status: 'Ensaiado',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Te+louvo+em+verdade+martin+valverde',
    presentationUrl: '#',
    notes: 'Momento de silêncio e profunda contemplação pós-comunhão.',
    lyricsPreview: '"Mesmo na tempestade, mesmo que o mar se agite... Te louvo, te louvo em verdade!"',
    fullChordText: `D         A         Bm        F#m
Mesmo na tempestade, mesmo que o mar se agite,
G         D         Em        A7
Mesmo que a noite venha, te louvo em verdade!

G         A         F#m       Bm
Pois somente tenho a Ti, Tu és a minha herança,
G         A7        D
Te louvo, te louvo em verdade!`
  },
  {
    id: 'song-11',
    number: 11,
    part: 'FINAL',
    title: 'Maria de Nazaré',
    key: 'E',
    author: 'Pe. Zezinho',
    responsible: 'Todos os Músicos do Louvor & Aliança',
    status: 'Pronto',
    youtubeUrl: 'https://www.youtube.com/results?search_query=Maria+de+Nazare+maria+me+cativou',
    presentationUrl: '#',
    notes: 'Cântico marianos festivo abençoando o envio da assembleia.',
    lyricsPreview: '"Maria de Nazaré, Maria me cativou... Fez-me gostar de falar de Deus!"',
    fullChordText: `E         B7        C#m       G#m
Maria de Nazaré, Maria me cativou!
A         E         F#m       B7
Fez-me gostar de orar, fez-me amar o meu Senhor!

E         B7        A         E
Ave Maria, mãe do Redentor,
A         E         B7        E
Rogai por nós, Mãe de Deus Amor!`
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-assuncao',
    dateStr: '15 Ago',
    tag: 'Solenidade',
    title: 'Assunção de Nossa Senhora — Solenidade de 15 de agosto',
    content:
      'Celebramos a Assunção da Virgem Maria, elevada em corpo e alma à glória do céu. ' +
      'Nesta solenidade a paróquia terá missa festiva, e durante todo o mês de agosto o ' +
      'repertório da Missa das 9h dá lugar de honra aos cantos marianos. O ministério ' +
      'canta na missa solene — confirme sua presença na Programação.',
    authorName: 'Pe. Cleiton',
    authorRole: 'Pároco — São Judas Tadeu',
    isUrgent: true
  },
  {
    id: 'notice-missas',
    dateStr: 'Agosto',
    tag: 'Horários',
    title: 'Missas do fim de semana na Paróquia São Judas Tadeu',
    content:
      'Sábado, às 19h: missa dominical antecipada. ' +
      'Domingo, às 9h: Missa das 9h, animada pelo ministério Louvor & Aliança — ' +
      'é a nossa missa, e a escala de cada domingo está na Programação. ' +
      'Domingo, às 19h: missa vespertina. ' +
      'Paróquia São Judas Tadeu, Americana/SP.',
    authorName: 'Pe. Cleiton',
    authorRole: 'Pároco — São Judas Tadeu',
    isStarred: true
  },
  {
    id: 'notice-maria',
    dateStr: 'Agosto',
    tag: 'Formação',
    title: 'Mês mariano: o que cantamos quando cantamos a Maria',
    content:
      'Durante agosto, a pílula litúrgica é sobre o canto mariano na liturgia — o lugar ' +
      'certo de cada cântico e por que a Salve Rainha não substitui o canto de Comunhão. ' +
      'Leitura sugerida no acervo da Biblioteca.',
    authorName: 'Rogério Marcos',
    authorRole: 'Formação Litúrgica'
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'João Vítor',
    senderRole: 'Violão & Arranjos',
    content: 'Irmãos, o tom do Salmo ficou ajustado em Mi Maior com a Ana. A cifra já está atualizada no app!',
    timeStr: '09:15',
    isMe: false
  },
  {
    id: 'msg-2',
    senderName: 'Você',
    senderRole: 'Coordenação de Canto',
    content: 'Excelente, João! Muito obrigado. Vamos repassar tudo no ensaio de quinta.',
    timeStr: '09:18',
    isMe: true
  },
  {
    id: 'msg-3',
    senderName: 'Lucas Creato',
    senderRole: 'Teclado',
    content: 'Perfeito! Já preparei o timbre de cordas e piano acústico para o canto de Pós-Comunhão.',
    timeStr: '09:22',
    isMe: false,
    avatar: '/integrantes/lucas.jpg'
  }
];

export const DRIVE_FOLDERS: DriveFolder[] = [
  {
    id: 'f1',
    title: 'Cifras Louvor & Aliança',
    subtitle: 'Repertório completo formatado com tons',
    fileCount: 142,
    iconName: 'music_note',
    colorClass: 'bg-[#7A2332] text-white'
  },
  {
    id: 'f2',
    title: 'Letras e Folhetos',
    subtitle: 'Textos para a assembleia e encartes',
    fileCount: 88,
    iconName: 'description',
    colorClass: 'bg-[#C9A24A] text-[#2D2118]'
  },
  {
    id: 'f3',
    title: 'Áudios de Referência',
    subtitle: 'Gravações de ensaios e guias de voz',
    fileCount: 64,
    iconName: 'graphic_eq',
    colorClass: 'bg-[#4D1721] text-white'
  },
  {
    id: 'f4',
    title: 'Apresentações e Slides',
    subtitle: 'Projeções de letras para o telão',
    fileCount: 52,
    iconName: 'slideshow',
    colorClass: 'bg-[#2D2118] text-[#FFF9F2]'
  },
  {
    id: 'f5',
    title: 'Formação & Espiritualidade',
    subtitle: 'Subsídios litúrgicos e formação da equipe',
    fileCount: 38,
    iconName: 'church',
    colorClass: 'bg-[#C9A24A]/20 text-[#7A2332]'
  },
  {
    id: 'f6',
    title: 'Fotos e Vídeos do Grupo',
    subtitle: 'Registros dos momentos de comunhão',
    fileCount: 195,
    iconName: 'photo_library',
    colorClass: 'bg-[#7A2332]/15 text-[#7A2332]'
  }
];

export const DRIVE_EXTERNAL_LINKS: DriveExternalLink[] = [
  {
    id: 'ext-1',
    title: 'Liturgia Diária Oficial — CNBB',
    subtitle: 'Acompanhe as leituras, salmos e evangeliário diário.',
    badge: 'CNBB Oficial',
    imageUrl: '/capa-missa-9h.jpg',
    url: 'https://liturgia.cnbb.org.br/'
  },
  {
    id: 'ext-2',
    title: 'Vatican News Brasil',
    subtitle: 'Notícias da Santa Sé e do Papa Francisco',
    iconName: 'public',
    url: 'https://www.vaticannews.va/pt.html'
  },
  {
    id: 'ext-3',
    title: 'Canção Nova Liturgia',
    subtitle: 'Orientações para cantores e músicos católicos',
    iconName: 'auto_awesome',
    url: 'https://musica.cancaonova.com/'
  }
];

// Galeria: só material do próprio ministério.
//
// As quatro entradas anteriores eram fotos de banco de imagens — pessoas
// desconhecidas ilustrando "encontro de casais" e "retiro". Numa galeria que se
// chama Memórias, foto de estranho não é ilustração, é ruído: quem abre procura
// reconhecer os irmãos da equipe.
//
// Para acrescentar fotos novas, ponha o arquivo em `public/galeria/` e crie uma
// entrada aqui apontando para `/galeria/<arquivo>`.
export const GALLERY_MEDIA: GalleryMediaItem[] = [
  {
    id: 'gal-capa',
    title: 'A Missa das 9h — Louvor & Aliança',
    category: 'Nossa missa',
    imageUrl: '/capa-missa-9h.jpg',
    type: 'image',
    dateStr: 'Todo domingo',
    description: 'Mais que cantar, é servir. Mais que música, é oração. Mais que um grupo, é família.'
  },
  {
    id: 'gal-rogerio',
    title: 'Rogério Marcos',
    category: 'Nossa equipe',
    imageUrl: '/integrantes/rogerio.jpg',
    type: 'image',
    dateStr: 'Coordenação',
    description: 'Coordenação, violão e voz.'
  },
  {
    id: 'gal-ana',
    title: 'Aninha',
    category: 'Nossa equipe',
    imageUrl: '/integrantes/ana.jpg',
    type: 'image',
    dateStr: 'Vocal e salmo',
    description: 'Pré-coordenação, vocal solo e salmo responsorial.'
  },
  {
    id: 'gal-joao',
    title: 'João Vítor',
    category: 'Nossa equipe',
    imageUrl: '/integrantes/joao.jpg',
    type: 'image',
    dateStr: 'Violão',
    description: 'Violão, voz e arranjos.'
  },
  {
    id: 'gal-lucas',
    title: 'Lucas Creato',
    category: 'Nossa equipe',
    imageUrl: '/integrantes/lucas.jpg',
    type: 'image',
    dateStr: 'Teclado',
    description: 'Teclado e contrabaixo.'
  },
  {
    id: 'gal-edson',
    title: 'Edson Silva',
    category: 'Nossa equipe',
    imageUrl: '/integrantes/edson.jpg',
    type: 'image',
    dateStr: 'Percussão',
    description: 'Percussão leve e cajón.'
  }
];

export const QUICK_DOWNLOADS: QuickDownloadFile[] = [
  {
    id: 'dl-1',
    filename: 'Folheto_Assuncao_15Agosto.pdf',
    sizeStr: '4.2MB',
    timeAgo: 'Hoje',
    iconType: 'archive',
    downloadUrl: '#'
  },
  {
    id: 'dl-2',
    filename: 'Audio_Guia_Salmo_22_AnaMaria.mp3',
    sizeStr: '18MB',
    timeAgo: 'Ontem',
    iconType: 'audio',
    downloadUrl: '#'
  },
  {
    id: 'dl-3',
    filename: 'Slides_Letras_Missa_17Domingo.pptx',
    sizeStr: '12MB',
    timeAgo: 'Há 2 dias',
    iconType: 'video',
    downloadUrl: '#'
  }
];

export const INITIAL_PLAYLISTS: CelebrationPlaylist[] = [
  {
    id: 'pl-1',
    name: 'Missa de Casamentos & Famílias',
    category: 'Casamento',
    description: 'Repertório acolhedor e orante enfatizando o amor cristão, união de casais e paz familiar.',
    icon: 'favorite',
    songIds: ['song-1', 'song-4', 'song-9', 'song-11'],
    createdAt: '2026-07-28'
  },
  {
    id: 'pl-2',
    name: 'Missa Dominical Solene',
    category: 'Solene',
    description: 'Sequência litúrgica completa tradicional do Tempo Comum.',
    icon: 'church',
    songIds: ['song-1', 'song-2', 'song-3', 'song-4', 'song-5', 'song-6', 'song-7', 'song-8', 'song-9', 'song-10', 'song-11'],
    createdAt: '2026-07-20'
  }
];

export const INITIAL_PAST_CELEBRATIONS: PastCelebration[] = [
  {
    id: 'past-1',
    title: '16º Domingo do Tempo Comum — Missa dos Dizimistas',
    dateStr: '26 de Julho, 2026',
    timeStr: '19:00',
    location: 'Paróquia São Judas Tadeu — Americana/SP',
    season: 'Tempo Comum',
    liturgicalColor: 'Verde',
    musiciansCount: 5,
    musicianNames: ['Rogério Marcos', 'João Vítor', 'Ana Maria', 'Lucas Creato', 'Edson Silva'],
    songs: [
      { id: 'song-1', part: 'ENTRADA', title: 'Como É Bom A Gente Se Encontrar', key: 'G' },
      { id: 'song-2', part: 'ATO PENITENCIAL', title: 'Senhor Que Viestes Salvar', key: 'Am' },
      { id: 'song-4', part: 'SALMO', title: 'O Senhor É o Meu Pastor (Salmo 22)', key: 'E' },
      { id: 'song-9', part: 'COMUNHÃO', title: 'Amar Como Jesus Amou', key: 'A' }
    ],
    notes: 'Bênção especial e envio para os casais vocacionados no final.'
  }
];



