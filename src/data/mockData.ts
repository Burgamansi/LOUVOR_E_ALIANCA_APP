import { Celebration, Musician, LiturgicalSong, Notice, ChatMessage, DriveFolder, DriveExternalLink, GalleryMediaItem, QuickDownloadFile, CelebrationPlaylist, PastCelebration } from '../types';

export const INITIAL_CELEBRATION: Celebration = {
  id: 'cel-1',
  title: 'Missa das 9 Horas — Missão Louvor & Aliança',
  location: 'Santuário Paroquial Nossa Senhora da Aliança',
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
    'Testar microfone sem fio para os casais de acolhida'
  ],
  nextRehearsal: {
    dateStr: 'Quinta-feira, 30 de Julho',
    timeStr: '20:00',
    location: 'Salão Paroquial do Louvor'
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
    id: 'notice-1',
    dateStr: '28 Jul',
    tag: 'Importante',
    title: 'Encontro de Casais & Famílias no Domingo',
    content: 'Caros irmãos do Louvor & Aliança, neste domingo a missa será dedicada aos casais da comunidade. Lembramos do ensaio geral na quinta-feira às 20h.',
    authorName: 'Ana Maria',
    authorRole: 'Coordenação',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADYL5Z5EOImwC68frrAqi9_9IZ3SN9jCK38dBqhDNHgLfomLwm_BJc63lDoUBdb-73MlV0kdkU3sWm45FNlJ4-IZ_rspRvZxKbtJvtTKP1gyIO-PHUXhJ7UISIoh1MVjvbItoKQX2cc5a8woFuzBM3JR-ZqznfLAFNKWvrRX-_ApMblnMKMAKlVtfPbPMo7VjWW7aBNcnyNEtLWepYq-0MJkEJZ-JaQjWLbUKo4eENpsN9aQsDKovquaH_St3bFK60HBCH0wk2GNUH',
    isUrgent: true
  },
  {
    id: 'notice-2',
    dateStr: '25 Jul',
    tag: 'Formação',
    title: 'Pílula Litúrgica: O Sentido das Alianças',
    content: 'Neste mês refletimos sobre a teologia da música na Celebração do Matrimônio e na união do casal cristão. Leitura sugerida no acervo da biblioteca.',
    authorName: 'Rogério Marcos',
    authorRole: 'Formação Litúrgica',
    isStarred: true
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
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRlVVCTpCI6dToGV8l_C34Jrj0g3lTqgOp8Va86YLbZdB7UjiVgfWbEmUw6n0WOxNPXyo4HikDhiDtT2uXc47Gl5t8vzi2gCjKZpkX-_HwPrwXm-Pn_6u6Vw9vR3xZH0QJiLnBgSuXUaVeTPw-3sR3UOJxkRi76qdI3CXCiB6pOGLX4PAUErienLtRdzjDHYHTcvpY5dwCN1kWsxwnIH5qLHLUyTwO8IV8GK2ahA-FLMbAWuMxQCcAuhXmUrgxamJld2NczHeazjHF'
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
    subtitle: 'Subsídios litúrgicos e estudo de casais',
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
    imageUrl: 'https://images.unsplash.com/photo-1509021436468-d510300e08f5?q=80&w=1200&auto=format&fit=crop',
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

export const GALLERY_MEDIA: GalleryMediaItem[] = [
  {
    id: 'gal-1',
    title: 'Celebração de Casamentos e Famílias no Santuário',
    category: 'Encontros de casais',
    imageUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=1200&auto=format&fit=crop',
    type: 'image',
    dateStr: 'Julho 2026',
    description: 'Bênção das alianças e renovação dos votos matrimoniais com momentos de profundo louvor.'
  },
  {
    id: 'gal-2',
    title: 'Ensaio Geral com Cânticos e Violões',
    category: 'Ensaios e bastidores',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    type: 'video',
    dateStr: 'Julho 2026',
    description: 'Harmonização de vozes para o canto de Entrada no salão do Louvor & Aliança.'
  },
  {
    id: 'gal-3',
    title: 'Missa Jubilar do Ministério',
    category: 'Nossa história',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    dateStr: 'Junho 2026',
    description: 'Celebração de 10 anos do projeto Louvor & Aliança a serviço da comunidade.'
  },
  {
    id: 'gal-4',
    title: 'Retiro Espiritual e Formação de Músicos',
    category: 'Formação e espiritualidade',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    dateStr: 'Maio 2026',
    description: 'Dia de oração, escuta da Palavra e partilha espiritual da equipe.'
  }
];

export const QUICK_DOWNLOADS: QuickDownloadFile[] = [
  {
    id: 'dl-1',
    filename: 'Folheto_Missa_Casais_Agosto.pdf',
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
    location: 'Santuário Nossa Senhora da Aliança',
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



