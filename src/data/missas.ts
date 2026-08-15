// Missas de junho a agosto de 2026 — os mesmos dados do seed do Turso
// (db/seed/0002_seed.sql), embarcados como fallback.
//
// Por que embarcar: enquanto o Turso não estiver ligado na Vercel, /api/agenda
// devolve erro e a tela ficaria vazia. Com o fallback, a listagem funciona no
// primeiro deploy e passa a ler do banco assim que ele responder — sem trocar
// uma linha de componente.
//
// As datas vêm do calendário litúrgico de 2026 (Ano A, contado a partir de
// Cristo Rei em 22/11/2026), não do nome das pastas do Drive.

export type TipoArquivoMissa = 'pdf' | 'docx' | 'pptx';

export interface ArquivoMissa {
  tipo: TipoArquivoMissa;
  driveFileId: string;
  nomeExibicao: string;
  tamanhoBytes: number;
}

export interface Missa {
  slug: string;
  data: string;            // 2026-08-02
  hora: string;
  tipo: 'domingo' | 'solenidade';
  tituloLiturgico: string;
  tituloExibicao: string;
  cor: 'verde' | 'vermelho' | 'branco' | 'roxo' | 'rosa';
  status: 'publicada' | 'rascunho';
  local: string;
  observacao?: string;
  arquivos: ArquivoMissa[];
}

const A = (tipo: TipoArquivoMissa, driveFileId: string, nomeExibicao: string, tamanhoBytes: number): ArquivoMissa =>
  ({ tipo, driveFileId, nomeExibicao, tamanhoBytes });

const LOCAL = 'Paróquia São Judas Tadeu — Americana/SP';

export const MISSAS: Missa[] = [
  // ── Setembro de 2025 ───────────────────────────────────────────────────
  // As projeções deste mês foram todas salvas em 04/10/2025, num arquivamento
  // em bloco — aqui a data de modificação não confirma a celebração, então as
  // datas vêm só do calendário litúrgico.
  {
    slug: '2025-09-07-23-domingo-tempo-comum', data: '2025-09-07', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '23º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 23º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1rmqFmlCoMfz5LwNT_SK4f8r3zChzyzUS', 'Roteiro',            356540),
      A('docx', '1RkIMM-XZrrkdjYaBIaI4FhmcG19cukVO', 'Texto de trabalho',  208130),
      A('pptx', '1gcDxGfJ9TdXO2bZcxFscZ1M2_NMPHuAX', 'Projeção',         36495188),
    ],
  },
  {
    slug: '2025-09-14-exaltacao-da-santa-cruz', data: '2025-09-14', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Exaltação da Santa Cruz',
    tituloExibicao: 'Festa da Exaltação da Santa Cruz',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1xljwoDTgT7ty3ZGsxY2_dhf6F0-k21a-', 'Roteiro',            290897),
      A('docx', '10TU5Yo4BNkXg-QYziBETygVnGsn0bJyP', 'Texto de trabalho',  110319),
      A('pptx', '1pFMWdkYIBUS4uLfTv5kMwfGihZEcZxsq', 'Projeção',         33741953),
    ],
  },
  {
    slug: '2025-09-21-25-domingo-tempo-comum', data: '2025-09-21', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '25º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 25º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda lixo do Office: dois arquivos de bloqueio "~$" e um "pptE761.tmp" de 34 MB. Podem ser apagados sem perda.',
    arquivos: [
      A('pdf',  '1dmaqT1LWt2em5OwZ8AT8zrBB0KsNmr6h', 'Roteiro',            415459),
      A('docx', '1hkMKynbQzyYgK-y5PQXkUfp6lSd6pKcG', 'Texto de trabalho',  287959),
      A('pptx', '1TLqwm2jnex8dC5ndkbgD6rQAahIdVVX9', 'Projeção',         32958931),
    ],
  },
  {
    slug: '2025-09-28-26-domingo-sao-judas-tadeu', data: '2025-09-28', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: '26º Domingo do Tempo Comum — Missa de São Judas Tadeu',
    tituloExibicao: 'Missa de São Judas Tadeu — 26º Domingo do Tempo Comum',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    observacao: 'Sem roteiro em PDF no Drive. A pasta guarda também um arquivo de bloqueio "~$" e um "pptDF1D.tmp" de 29 MB, que podem ser apagados.',
    arquivos: [
      A('docx', '139TepYLLHAGRls6H9ACZJ9J6npf3l7zp', 'Texto de trabalho',  361116),
      A('pptx', '1d8q97Jfl1iLjjiBYNSr_z2eAwgmq7Lfh', 'Projeção',         29199493),
    ],
  },
  // ── Outubro de 2025 — mês do padroeiro ─────────────────────────────────
  {
    slug: '2025-10-05-27-domingo-tempo-comum', data: '2025-10-05', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '27º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 27º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1Kso3KklK19Ud0z5f1uxC8_oiXZl4N8ah', 'Roteiro',            428224),
      A('docx', '1HKaQ6C7K_bFzCKsoNBpEwFihxsto5Q4g', 'Texto de trabalho',  150486),
      A('pptx', '1WjSRxoNOiggT4FxI4Z9K3EMFXqlyiSrb', 'Projeção',         25167689),
    ],
  },
  {
    slug: '2025-10-12-nossa-senhora-aparecida', data: '2025-10-12', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Nossa Senhora Aparecida, Padroeira do Brasil',
    tituloExibicao: 'Solenidade de Nossa Senhora Aparecida',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também "Sobe Jerusalém.pptx", um canto avulso — ignorado.',
    arquivos: [
      A('pdf',  '1wZ67_aclubpVP8EGABU-MpdyJfWQE0fi', 'Roteiro',            412348),
      A('docx', '1XkDt8ClLviNaAnk5lAiXuKVQ9I5eO15P', 'Texto de trabalho',  146566),
      A('pptx', '1ApwojK0-DYr2gzg2T5sxP1Iv6ZQ_17Vr', 'Projeção',         25498202),
    ],
  },
  {
    slug: '2025-10-19-29-domingo-tempo-comum', data: '2025-10-19', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '29º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 29º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1haxmRHDYxbN4Em4F6kJ0IA07lm-td1xO', 'Roteiro',            439268),
      A('docx', '1NDZ68x1q8fiomgAP36mWzO0BXjVFW70t', 'Texto de trabalho',  151451),
      A('pptx', '1-HRuGED0tWa58w5q5xtNdx0X0WQkQGo9', 'Projeção',         28896586),
    ],
  },
  {
    slug: '2025-10-21-novena-sao-judas-tadeu', data: '2025-10-21', hora: '19:30', tipo: 'solenidade',
    tituloLiturgico: 'Novena de São Judas Tadeu — 3ª feira da 29ª semana',
    tituloExibicao: 'Novena de São Judas Tadeu',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    observacao: 'Celebração de semana, na novena do padroeiro. Horário a confirmar com a coordenação.',
    arquivos: [
      A('pdf',  '1IQodsy_scu0jN9OxxGesWgtCXZvNQI_0', 'Roteiro',            396262),
      A('docx', '1_HLpltmkYMwTbsiKQJf8e7ZL7HsuEn69', 'Texto de trabalho',  149291),
      A('pptx', '1memY0PRlmMrCBTtWTNOenp6DeVMXjmH9', 'Projeção',         27601859),
    ],
  },
  {
    slug: '2025-10-26-30-domingo-tempo-comum', data: '2025-10-26', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '30º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 30º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Roteiro e texto são os mesmos arquivos da Novena de São Judas Tadeu (mesmo tamanho).',
    arquivos: [
      A('pdf',  '1y6D5oMxYcAkOYgGi79r4BvQXIlhym-Qh', 'Roteiro',            396262),
      A('docx', '1FAd90KVXvgpX2jqt_TpbeG7quEJr56su', 'Texto de trabalho',  149291),
      A('pptx', '1F1GgJjkr8WQSSPgtjAF4jWXtZc-EPqHf', 'Projeção',         32993206),
    ],
  },
  // ── Novembro de 2025 — fim do Ano C ────────────────────────────────────
  {
    slug: '2025-11-02-finados', data: '2025-11-02', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Comemoração de Todos os Fiéis Defuntos',
    tituloExibicao: 'Missa de Finados',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1TrVqkHFSKYaDznf-ku8CTX54YQZIPZLJ', 'Roteiro',            269203),
      A('docx', '1UgDvVZZbMcEceAELD-V1YtQOxyAU_DOi', 'Texto de trabalho',  101610),
      A('pptx', '14Xy7aAHq-K4FcMv2nQWs3TYhqqKG2ByC', 'Projeção',         34562112),
    ],
  },
  {
    slug: '2025-11-09-dedicacao-basilica-latrao', data: '2025-11-09', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Dedicação da Basílica do Latrão',
    tituloExibicao: 'Festa da Dedicação da Basílica do Latrão',
    cor: 'branco', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '12ByCZitV1uxEvGcf78OtAuNdzhJYnm9K', 'Roteiro',            293110),
      A('docx', '1FW8MHL0lpMlywYP2K_884tsgUrjzhk5F', 'Texto de trabalho',   91046),
      A('pptx', '1hemAXnVBAH9sQuoIyfMo6lRj8s6tNRNy', 'Projeção',         35363431),
    ],
  },
  {
    slug: '2025-11-16-33-domingo-tempo-comum', data: '2025-11-16', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '33º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 33º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '10_ZJLKz-1KHrpBP_nj36U2DktFunxiVz', 'Roteiro',            288633),
      A('docx', '1iCQ7jI7ZR_FPhI03CZFjhu87di4sRJZh', 'Texto de trabalho',   91182),
      A('pptx', '1yaqx0tuSe0giEmh_OruJBwMjopWnmHH6', 'Projeção',         34894414),
    ],
  },
  {
    slug: '2025-11-23-cristo-rei', data: '2025-11-23', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Nosso Senhor Jesus Cristo, Rei do Universo',
    tituloExibicao: 'Solenidade de Cristo Rei — 34º Domingo do Tempo Comum',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Sem texto de trabalho (.docx) no Drive — só roteiro e projeção.',
    arquivos: [
      A('pdf',  '1TpEWhLgoB7JdXVYzbhjdR3gqs0OGPkdc', 'Roteiro',            362772),
      A('pptx', '1nNvANZkrZ3joAX6rOpjZYarKmdvRcazZ', 'Projeção',         70991013),
    ],
  },
  // ── Advento e Natal de 2025 — início do Ano A ──────────────────────────
  // Primeiro lote do acervo de 2025 (MISSAS_2025 no Drive). O Advento de
  // dezembro de 2025 já pertence ao Ano A, o mesmo ano litúrgico de 2026 —
  // por isso abre a lista.
  {
    slug: '2025-11-30-1-domingo-advento', data: '2025-11-30', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '1º Domingo do Advento',
    tituloExibicao: 'Missa das 9h — 1º Domingo do Advento',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'Roteiro e texto são o mesmo arquivo do 2º e do 3º Domingo do Advento — só a projeção é própria.',
    arquivos: [
      A('pdf',  '1_jn-ydtQ8p6ZLLqgJHeNdgtfqqnShQDc', 'Roteiro',            358947),
      A('docx', '1IFYjJ4A7gPHoKncl4CLZT-rC8WYd8V40', 'Texto de trabalho',  335409),
      A('pptx', '1V9B60tMRRQyt3KUAJXe2ldkwjF6p90na', 'Projeção',         24929621),
    ],
  },
  {
    slug: '2025-12-07-2-domingo-advento', data: '2025-12-07', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '2º Domingo do Advento',
    tituloExibicao: 'Missa das 9h — 2º Domingo do Advento',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'Roteiro e texto compartilhados com o 1º e o 3º Domingo do Advento.',
    arquivos: [
      A('pdf',  '1V06I_tzPjEMYRQO6Vjm-aF03egDeelHy', 'Roteiro',            358947),
      A('docx', '1OxupQ1iUODl-m9AMQXTDN-7FK3ovjWG9', 'Texto de trabalho',  335409),
      A('pptx', '1d5_YqNyj_8u_SgGTJWQ58tuPTEtwcRkJ', 'Projeção',         23910763),
    ],
  },
  {
    slug: '2025-12-14-3-domingo-advento', data: '2025-12-14', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '3º Domingo do Advento — Gaudete',
    tituloExibicao: 'Missa das 9h — 3º Domingo do Advento (Gaudete)',
    cor: 'rosa', status: 'publicada', local: LOCAL,
    observacao: 'Roteiro e texto compartilhados com o 1º e o 2º Domingo do Advento.',
    arquivos: [
      A('pdf',  '1r63bIbc5GDNuDDgxz7jcE4CMJsSVGCU5', 'Roteiro',            358947),
      A('docx', '18e7848dtYhcPtyF0YMPlQOsWqu33upin', 'Texto de trabalho',  335409),
      A('pptx', '1iuU1BU_A4ga1YGNkT5TKT_Obd83HAEIp', 'Projeção',         26152333),
    ],
  },
  {
    slug: '2025-12-21-4-domingo-advento', data: '2025-12-21', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '4º Domingo do Advento',
    tituloExibicao: 'Missa das 9h — 4º Domingo do Advento',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'A projeção foi salva em 23/12, depois da celebração — provavelmente atualizada junto com a do Natal. A pasta guarda também "Docações.pptx", de outro assunto.',
    arquivos: [
      A('pdf',  '1uw_Z0QE5_W-3ifqyY5gZg93jX_ajmEid', 'Roteiro',            299235),
      A('docx', '1fEVbPQq7xhd0cGK_3teoEHJt77nA9IHb', 'Texto de trabalho',  241416),
      A('pptx', '1HLkhVJadXhxDZ-szRGioC7q-ftVNqy8Q', 'Projeção',         25591447),
    ],
  },
  {
    slug: '2025-12-25-natal-do-senhor', data: '2025-12-25', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Natal do Senhor',
    tituloExibicao: 'Missa do Natal do Senhor',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também o texto do Natal de 2022 e um "Untitled design.pptx" — ignorados.',
    arquivos: [
      A('pdf',  '1Cd6Aysr3TjJ02seAeLqQ20Q87bDZZXHl', 'Roteiro',            253788),
      A('docx', '1jtOcycfVQdFaOzIgu8jBUypfgOhjUhEs', 'Texto de trabalho',  240018),
      A('pptx', '1cWV_MLO4DTcmCa1IgjQz-STlWfqJJw0m', 'Projeção',         21898173),
    ],
  },
  {
    slug: '2025-12-28-sagrada-familia', data: '2025-12-28', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: 'Festa da Sagrada Família',
    tituloExibicao: 'Festa da Sagrada Família',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Os arquivos estão rotulados "Ano C", mas dezembro de 2025 já é Ano A — provável reaproveitamento de 2024. A pasta guarda também um "Untitled design.pptx".',
    arquivos: [
      A('pdf',  '16E61KtdBGrLCns3jcPP32LtAdrwqQqp5', 'Roteiro',            254950),
      A('docx', '1a0ZrxcEX7pXzEYKVuXo_tToKPMJUA462', 'Texto de trabalho',  239869),
      A('pptx', '1ypHEaZ6WzcATMpJ4pxcpbJU0vVUNltoG', 'Projeção',         21390163),
    ],
  },
  // ── Janeiro a março de 2026 ────────────────────────────────────────────
  // Mapeadas a partir de MISSAS_2026 no Drive. As datas vêm do calendário
  // litúrgico (Páscoa em 05/04/2026) e conferem com a data de modificação de
  // cada projeção — o .pptx é sempre salvo na véspera da celebração.
  {
    slug: '2026-01-01-santa-mae-de-deus', data: '2026-01-01', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Solenidade de Santa Maria, Mãe de Deus',
    tituloExibicao: 'Solenidade da Santa Mãe de Deus',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'A projeção está duplicada no Drive (duas cópias idênticas); registrei uma.',
    arquivos: [
      A('pdf',  '1K9rpv9sZE7wjbA2VOtvdEXlPeyb1hnHM', 'Roteiro',            160220),
      A('docx', '1mrmgUj25kPMUnvpMKB0cukUxAw3Gmtpt', 'Texto de trabalho',   89135),
      A('pptx', '1NKjc-C-di4cR7nQpgZQb1fHYte57CxAG', 'Projeção',         20860721),
    ],
  },
  {
    slug: '2026-01-04-epifania-do-senhor', data: '2026-01-04', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Epifania do Senhor',
    tituloExibicao: 'Solenidade da Epifania do Senhor',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Quatro projeções na pasta — dois pares duplicados. Registrei a principal.',
    arquivos: [
      A('pdf',  '1ehXruQ8iuQqfTDfkaKdtYg4KSDLWYfld', 'Roteiro',            224586),
      A('docx', '1YA0cNqB2c7qsfSZnJ1kmtBWsxB7UbqPN', 'Texto de trabalho',   86025),
      A('pptx', '1qQ1v2oF3oENI15uFYFLqI3NKUj4jpapN', 'Projeção',         27171003),
    ],
  },
  {
    slug: '2026-01-11-batismo-do-senhor', data: '2026-01-11', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: 'Festa do Batismo do Senhor',
    tituloExibicao: 'Festa do Batismo do Senhor',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também duas projeções da Epifania e uma apostila de cifras — ignoradas.',
    arquivos: [
      A('pdf',  '1tJqZkhkXlc_yKyNVdRdOv7kfcviPXJra', 'Roteiro',            290578),
      A('docx', '1fzFGWotIn52Rso6Ipur5o1EquVrrzNJs', 'Texto de trabalho',  165943),
      A('pptx', '1c1xLSKMvfZ1DrdLZ5cA1HMGKsEDsW4xn', 'Projeção',         77274665),
    ],
  },
  {
    slug: '2026-01-18-2-domingo-tempo-comum', data: '2026-01-18', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '2º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 2º Domingo do Tempo Comum',
    cor: 'verde', status: 'rascunho', local: LOCAL,
    observacao: 'SEM MATERIAL: a pasta existe no Drive, mas sem roteiro, texto ou projeção.',
    arquivos: [],
  },
  {
    slug: '2026-01-25-3-domingo-tempo-comum', data: '2026-01-25', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '3º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 3º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '1pggjJmNHsNJMD4tIENaCsXxS9qqwXvO7', 'Roteiro',            321136),
      A('docx', '1Mh2FmNS5L6rxDkMVRW95jC_iC5-1XHFK', 'Texto de trabalho',  162195),
      A('pptx', '1mEZ6taRaM7uCjOLX2_qw0oGOsf85qHw8', 'Projeção',         69465594),
    ],
  },
  {
    slug: '2026-02-01-4-domingo-tempo-comum', data: '2026-02-01', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '4º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 4º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '12n2sfm_4Gu5JMUUw5QHqyBiP5DhiLcSA', 'Roteiro',            278469),
      A('docx', '11c8ysGzxyWLI5Al_rWneVoikG7Doalwz', 'Texto de trabalho',  126377),
      A('pptx', '1GBd0zWXqK3KySCWa3DqfEfRHIPAKwgiU', 'Projeção',         50314757),
    ],
  },
  {
    slug: '2026-02-08-5-domingo-tempo-comum', data: '2026-02-08', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '5º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 5º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '1CdXbyC_nf2oF89a0QAcQm4uYIqczCjbW', 'Roteiro',            295686),
      A('docx', '1lBxVCsC3sjnW2jpiwkOY1kbWxjRdISHf', 'Texto de trabalho',  165889),
      A('pptx', '1Xbb9-fqb8GxX1jXmaAUt4ZqkpjdMeZot', 'Projeção',         47903830),
    ],
  },
  {
    slug: '2026-02-15-6-domingo-tempo-comum', data: '2026-02-15', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '6º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 6º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também "00 1 Dom Quaresma - CF 2026.pptx", de outra celebração — ignorada.',
    arquivos: [
      A('pdf',  '1yMQd3TgcXuc2XTqBkJ-n6YQeA95C3cqg', 'Roteiro',            226820),
      A('docx', '1e0PIElacvuFSJO6_qIItn8STvupP2s5z', 'Texto de trabalho',  124994),
      A('pptx', '1eh6iSHz77HORotVSLXQvJqgJ825AAt4P', 'Projeção',         57143311),
    ],
  },
  {
    slug: '2026-02-22-1-domingo-quaresma', data: '2026-02-22', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '1º Domingo da Quaresma',
    tituloExibicao: 'Missa das 9h — 1º Domingo da Quaresma',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'Texto e projeção duplicados no Drive; registrei um de cada.',
    arquivos: [
      A('pdf',  '1h2gtNsWMLTXQ_rRV2KCQT5wzRE1_Upwx', 'Roteiro',            457308),
      A('docx', '1aPVs-5qEiR2D2Gz6cPZ502hwQ2svfd01', 'Texto de trabalho', 1335191),
      A('pptx', '1PVq3Wy_2UA0Z1XB7cgo7BSNKwtc-oP5z', 'Projeção',         59421806),
    ],
  },
  {
    slug: '2026-03-01-2-domingo-quaresma', data: '2026-03-01', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '2º Domingo da Quaresma',
    tituloExibicao: 'Missa das 9h — 2º Domingo da Quaresma',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'Guardada na pasta de fevereiro do Drive. Texto e projeção duplicados.',
    arquivos: [
      A('pdf',  '1SuFGg-RN6G7KccydCB_Y_sf_StyjLzdI', 'Roteiro',            457308),
      A('docx', '1zSpdcYtIfTeyMT-5SWRGS71ou2ZSKqH_', 'Texto de trabalho', 1335191),
      A('pptx', '1ObWs1xu5b09zUtneOYMKe5oOFX_dR5Nc', 'Projeção',         70227581),
    ],
  },
  {
    slug: '2026-03-08-3-domingo-quaresma', data: '2026-03-08', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '3º Domingo da Quaresma',
    tituloExibicao: 'Missa das 9h — 3º Domingo da Quaresma',
    cor: 'roxo', status: 'rascunho', local: LOCAL,
    observacao: 'SEM MATERIAL PRÓPRIO: a pasta "3º Domingo da Quaresma" no Drive contém os arquivos do 4º Domingo, iguais aos da pasta do 4º. Vale conferir se o material deste domingo se perdeu.',
    arquivos: [],
  },
  {
    slug: '2026-03-15-4-domingo-quaresma', data: '2026-03-15', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '4º Domingo da Quaresma',
    tituloExibicao: 'Missa das 9h — 4º Domingo da Quaresma (Laetare)',
    cor: 'rosa', status: 'publicada', local: LOCAL,
    observacao: 'Texto e projeção duplicados no Drive; registrei um de cada.',
    arquivos: [
      A('pdf',  '1doo077eQcv8nRmNBrQxj3BhOmVjKo5VX', 'Roteiro',            457308),
      A('docx', '1F2CnUUGjR2btUK1p2uRwdm4S-NCTNR8e', 'Texto de trabalho', 1335191),
      A('pptx', '1ad2V_UwceXFgW_FeVgN6fdnjZopDn70R', 'Projeção',         64041188),
    ],
  },
  {
    slug: '2026-03-22-5-domingo-quaresma', data: '2026-03-22', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '5º Domingo da Quaresma',
    tituloExibicao: 'Missa das 9h — 5º Domingo da Quaresma',
    cor: 'roxo', status: 'publicada', local: LOCAL,
    observacao: 'O texto e a projeção são o mesmo arquivo do 4º Domingo (mesmo tamanho e data) — só o roteiro é próprio.',
    arquivos: [
      A('pdf',  '15DIO-0_XKVHrMwp6-r-qztqpEaxrHJD2', 'Roteiro',            457308),
      A('docx', '1txWLWNFdm21vBuy3x1BQI4ofJO1yMm-C', 'Texto de trabalho', 1335191),
      A('pptx', '11lhBkiyPjYN0MK36eG0Y0rh8ZbcGwvMX', 'Projeção',         64041188),
    ],
  },
  {
    slug: '2026-03-29-domingo-de-ramos', data: '2026-03-29', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Domingo de Ramos da Paixão do Senhor',
    tituloExibicao: 'Domingo de Ramos da Paixão do Senhor',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    observacao: 'Há também "00 Dom Ramos 2026.pptx", uma versão reduzida — ignorada.',
    arquivos: [
      A('pdf',  '10BxbvpdVQy6hmsS1Rjqih_EUj0ZcJ3TP', 'Roteiro',            213089),
      A('docx', '1Xs9d6gQ2EievQhG2iipZXSHDEB8LQQF_', 'Texto de trabalho', 1081715),
      A('pptx', '1g7jb1S5vQni8DS7ONsAyjiy40e9g9eb8', 'Projeção',         61626170),
    ],
  },
  // ── Tríduo Pascal, Páscoa e Tempo Pascal de 2026 ───────────────────────
  {
    slug: '2026-04-02-triduo-pascal', data: '2026-04-02', hora: '19:00', tipo: 'solenidade',
    tituloLiturgico: 'Tríduo Pascal — Quinta e Sexta-feira Santa',
    tituloExibicao: 'Vigília Eucarística — Quinta e Sexta-feira Santa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Uma pasta só para os dois dias do Tríduo, como está no Drive. Sem projeção; o texto é reaproveitado de anos anteriores. Horário a confirmar.',
    arquivos: [
      A('pdf',  '1bwdiyVJznDaoSdSify_wqn-2DtxmPd7W', 'Roteiro',            870925),
      A('docx', '1RKjMEJNprRExI5diQJKKQeWLWVYIzkNq', 'Texto de trabalho', 1865435),
    ],
  },
  {
    slug: '2026-04-05-pascoa-da-ressurreicao', data: '2026-04-05', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Domingo da Páscoa da Ressurreição do Senhor',
    tituloExibicao: 'Domingo da Páscoa da Ressurreição',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Dois roteiros em PDF na pasta, "(1)" e "(2)"; registrei o mais completo. Projeção duplicada.',
    arquivos: [
      A('pdf',  '1oGZowzlbX2rK82xdQ5axL7XzuarH9udM', 'Roteiro',            231851),
      A('docx', '1gekgSSq2MD0fTUNlQVNGrzE135cjZLGA', 'Texto de trabalho',  100018),
      A('pptx', '1gjEgoiqZ5doZleltNhsgPlOftEi1ozS7', 'Projeção',         45262765),
    ],
  },
  {
    slug: '2026-04-12-2-domingo-pascoa', data: '2026-04-12', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '2º Domingo da Páscoa — da Divina Misericórdia',
    tituloExibicao: 'Missa das 9h — 2º Domingo da Páscoa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '10skF7hOTIRT29QWqECSZd2O_ZNtk0P-o', 'Roteiro',            331035),
      A('docx', '1YlPt0rERNv7SgBgWrPfm5H6xEiaWKuzh', 'Texto de trabalho',  246747),
      A('pptx', '10e3IIDokGSGVTGSzsmvr3Ve9ddDfCCRw', 'Projeção',         49829029),
    ],
  },
  {
    slug: '2026-04-19-3-domingo-pascoa', data: '2026-04-19', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '3º Domingo da Páscoa',
    tituloExibicao: 'Missa das 9h — 3º Domingo da Páscoa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '1UpD15olbaJ8F0vkWBX5TqHPlJaSjbMq3', 'Roteiro',            310026),
      A('docx', '1KVXKyP4bCvGCB22CJ8emtFMoeBaEtBAy', 'Texto de trabalho',  244286),
      A('pptx', '1whKJ0oCfYy3jhGiAJOZLUNypmoi_xKRL', 'Projeção',         58742194),
    ],
  },
  {
    slug: '2026-04-26-4-domingo-pascoa', data: '2026-04-26', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '4º Domingo da Páscoa — do Bom Pastor',
    tituloExibicao: 'Missa das 9h — 4º Domingo da Páscoa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '1m_TuY7tOw81OSKesP5q1LBxtaRHUcrNX', 'Roteiro',            193244),
      A('docx', '1XWLjEJDbaRkKmXjRE37UF3m-CeEl3p_U', 'Texto de trabalho',  101773),
      A('pptx', '1feLxFePFKodfo-NjRz9EDt-kw_Y66X3f', 'Projeção',         59257385),
    ],
  },
  {
    slug: '2026-05-03-5-domingo-pascoa', data: '2026-05-03', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '5º Domingo da Páscoa',
    tituloExibicao: 'Missa das 9h — 5º Domingo da Páscoa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Projeção duplicada no Drive; registrei uma.',
    arquivos: [
      A('pdf',  '1feiHxh_kiqCJsq73Cz6ybJ1DkhxTQvZW', 'Roteiro',            291679),
      A('docx', '1ERYNr0g2gZIK-BmR_MIKqScgzMJtzO_G', 'Texto de trabalho',  505509),
      A('pptx', '1zeyBxJ4n5Gkxo7G5WgorBkH4FrszhHXy', 'Projeção',         61408819),
    ],
  },
  {
    slug: '2026-05-10-6-domingo-pascoa', data: '2026-05-10', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '6º Domingo da Páscoa',
    tituloExibicao: 'Missa das 9h — 6º Domingo da Páscoa',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Roteiro e texto são os mesmos arquivos do 5º Domingo (mesmo tamanho) — só a projeção é própria.',
    arquivos: [
      A('pdf',  '1MtBu9etTr0MwXpmHDLW0HWs6DErhgNB2', 'Roteiro',            291679),
      A('docx', '174-IOTBQ8lImCBMDqjjVp74qiiRmlSTZ', 'Texto de trabalho',  505509),
      A('pptx', '1f0aoZegxT377iUdnSQjfzHGfuTo3fxVF', 'Projeção',         64219007),
    ],
  },
  {
    slug: '2026-05-17-ascensao-do-senhor', data: '2026-05-17', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Ascensão do Senhor',
    tituloExibicao: 'Solenidade da Ascensão do Senhor',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também um segundo texto e a projeção da Ascensão de 2024 — ignorados.',
    arquivos: [
      A('pdf',  '1OBVmYZwWNXZ8rESHd1w175uTJOI0AJUV', 'Roteiro',            277963),
      A('docx', '1gVU6Bm873FJf-YxNhM8JiC_ZMQdXLRa2', 'Texto de trabalho',  132907),
      A('pptx', '1I20hNrGr--8eywjMYDtd348Y0I_rGcSw', 'Projeção',         68275385),
    ],
  },
  {
    slug: '2026-05-24-pentecostes', data: '2026-05-24', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Pentecostes',
    tituloExibicao: 'Solenidade de Pentecostes',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    observacao: 'A pasta guarda também a projeção da Ascensão de 2024, em duas cópias — ignoradas.',
    arquivos: [
      A('pdf',  '184C-kEtltjV_159W1WvTTV65csK7XwsK', 'Roteiro',            296340),
      A('docx', '1VKoNf33LIv3gUuwodz4ukm7shOjCJemm', 'Texto de trabalho', 3184911),
      A('pptx', '1U2cCq9YLZWdydvlQ6xKIyzUfi0tQAJZg', 'Projeção',         80323240),
    ],
  },
  {
    slug: '2026-05-31-santissima-trindade', data: '2026-05-31', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Santíssima Trindade',
    tituloExibicao: 'Solenidade da Santíssima Trindade',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Texto e projeção duplicados no Drive; registrei um de cada.',
    arquivos: [
      A('pdf',  '1NoUg2AQlvNNr5wyDRZqQXkPPVEiQ4OLo', 'Roteiro',            288249),
      A('docx', '1Ee02DeyjkhultLrkEVOPrgIZXy_FbpW5', 'Texto de trabalho', 4224768),
      A('pptx', '1evfSwkaVxspCUzjd-YDJpAK2PY9Coi9I', 'Projeção',         82957517),
    ],
  },
  {
    slug: '2026-06-07-10-domingo-tempo-comum', data: '2026-06-07', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '10º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 10º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1-rJ6jWpNFDxrx7z28_IS43P9V9n4SH_n', 'Roteiro',            353625),
      A('docx', '1x86LuTS5bPJOVFWbJ3RWrSQAnW68h2IO', 'Texto de trabalho', 4224768),
      A('pptx', '1Xd6pJAA7Gv44I69-nCehOtPy67ykbzuJ', 'Projeção',         64870973),
    ],
  },
  {
    slug: '2026-06-14-11-domingo-tempo-comum', data: '2026-06-14', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '11º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 11º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1_noCa99XssS8UaDEsFsu8dPiSrE5TVzN', 'Roteiro',           353625),
      A('docx', '1BPGcyqn5PuL6ksNkLaQ4Xz9uPsmiHKaI', 'Texto de trabalho', 362641),
      A('pptx', '1kxVgKrc5WqyYCW5LeqU_QrSQfxwGQN8k', 'Projeção',        67933755),
    ],
  },
  {
    slug: '2026-06-21-12-domingo-tempo-comum', data: '2026-06-21', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '12º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 12º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'A pasta "12Dom_TempoComum_AnoC_2025" no Drive é sobra de 2025 e foi ignorada.',
    arquivos: [
      A('pdf',  '1mX9YZwtrlqCdw_Tdqu_Eswe34rOLvO0Z', 'Roteiro',           353625),
      A('docx', '1g-t1_fIzCoPwXRxSJ1wZ7e-PBMli-KNl', 'Texto de trabalho', 362641),
      A('pptx', '1OUo_s3yvPTi9_I6uwBrPcY4VtbTKAmuH', 'Projeção',        65407594),
    ],
  },
  {
    slug: '2026-06-28-solenidade-sao-pedro-e-sao-paulo', data: '2026-06-28', hora: '09:00', tipo: 'solenidade',
    tituloLiturgico: 'Solenidade de São Pedro e São Paulo',
    tituloExibicao: 'Missa das 9h — Solenidade de São Pedro e São Paulo',
    cor: 'vermelho', status: 'publicada', local: LOCAL,
    observacao: 'Substitui o 13º Domingo: 29/06 caiu numa segunda e a solenidade foi antecipada.',
    arquivos: [
      A('pdf',  '11AVNe8PMt3G8comohitl7rs9MkRF9jn8', 'Roteiro',           305951),
      A('docx', '1ANZpu3cXaVgHVJ5Vu9kQmB4DpBzrKq4s', 'Texto de trabalho', 376347),
      A('pptx', '1bnVW6cXRHymRqZPAx-KoNfGetZLSG3br', 'Projeção',        52629116),
    ],
  },
  {
    slug: '2026-07-05-14-domingo-tempo-comum', data: '2026-07-05', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '14º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 14º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1xdAaNezxtIydm8nRf8RSEgWebFlG7NDn', 'Roteiro',           241108),
      A('docx', '1d4uRxMrR3Q9XK1_vSnB5fH2_-BOXLM5A', 'Texto de trabalho', 360297),
      A('pptx', '1dgZ18BMBhklrIZeUiVGIVD8e2FC4g9Ej', 'Projeção',        79008656),
    ],
  },
  {
    slug: '2026-07-12-15-domingo-tempo-comum', data: '2026-07-12', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '15º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 15º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1s-LLInE7xKPEbHarkdLmh9sf_gH_9uUv', 'Roteiro',           346734),
      A('docx', '1EomC7ObtC85v4hn1HP2Z_ZJs3hPcH8rz', 'Texto de trabalho', 360457),
      A('pptx', '1xxbC0msdsdyGlGoAbCaFyoEWmFT00Tdh', 'Projeção',        78816611),
    ],
  },
  {
    slug: '2026-07-19-16-domingo-tempo-comum', data: '2026-07-19', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '16º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 16º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1tDZtwCCd1DF0JQtgHlWOqcp2Pvj12Vov', 'Roteiro',           346734),
      A('docx', '1hKN2nD5Bf05QbGRj3onbDcSJah70l70g', 'Texto de trabalho', 360457),
      A('pptx', '1u1LCBUb2x1SZFnWpqlYFuiuYWbkb9z-w', 'Projeção',        77920690),
    ],
  },
  {
    slug: '2026-07-26-17-domingo-tempo-comum', data: '2026-07-26', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '17º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 17º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1MWzM2CnNTU1UD92tPMN-dbr2ucoAJwj3', 'Roteiro',           346734),
      A('docx', '1_kl92pF7a99JCPwGwqMyrjusKqk11_S4', 'Texto de trabalho', 360457),
      A('pptx', '1XsI-rPFAVaYXKH3NY17gcO0y5F-6Dufm', 'Projeção',        78698305),
    ],
  },
  {
    slug: '2026-08-02-18-domingo-tempo-comum', data: '2026-08-02', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '18º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 18º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    arquivos: [
      A('pdf',  '1megn_p1fkwHjSO9zF3Yi9aZTmYDDQInx', 'Roteiro',           284478),
      A('docx', '19Kz2HDYO-OnoE3fL-GmjB8B84pueGKwk', 'Texto de trabalho', 983212),
      A('pptx', '19CpGfc4MUFVjr47gWkOFjGK0L0THDOyO', 'Projeção',        71791236),
    ],
  },
  {
    slug: '2026-08-09-19-domingo-tempo-comum', data: '2026-08-09', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '19º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 19º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Sem apresentação (.pptx) no Drive — só roteiro e texto.',
    arquivos: [
      A('pdf',  '1NLHdXtFjsR4O2zA-e7vVIIGE6iuwo8iz', 'Roteiro',           247638),
      A('docx', '1MQAJXsh_m-0V8AOFSEVuiVAhTZlQW2kr', 'Texto de trabalho', 199446),
    ],
  },
  {
    slug: '2026-08-15-assuncao-de-nossa-senhora', data: '2026-08-15', hora: '18:30', tipo: 'solenidade',
    tituloLiturgico: 'Assunção de Nossa Senhora',
    tituloExibicao: 'Solenidade da Assunção de Nossa Senhora',
    cor: 'branco', status: 'publicada', local: LOCAL,
    observacao: 'Horário a confirmar com a coordenação — usei o da missa de sábado.',
    arquivos: [
      A('pdf',  '1cHkLwU2gS25pV3J77FX1kLO33-Crgdc5', 'Roteiro',            284478),
      A('docx', '1-0OCDH5U1TtPil-8pH8vKTs5cEO0g_gV', 'Texto de trabalho',  983212),
      A('pptx', '1p_ExrPJvR_g3ELBC5kv74LtRH6Sp5nsv', 'Projeção',         79383947),
    ],
  },
  {
    slug: '2026-08-16-20-domingo-tempo-comum', data: '2026-08-16', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '20º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 20º Domingo do Tempo Comum',
    cor: 'verde', status: 'rascunho', local: LOCAL,
    observacao: 'SEM MATERIAL: não há pasta no Drive para este domingo.',
    arquivos: [],
  },
  {
    slug: '2026-08-23-21-domingo-tempo-comum', data: '2026-08-23', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '21º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 21º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Sem apresentação (.pptx) no Drive — só roteiro e texto.',
    arquivos: [
      A('pdf',  '1-BbhceqhbLoOX0YijE1tE09bQYkRceSy', 'Roteiro',           319973),
      A('docx', '1M7-I799F6Hlw0XgZr69EiRaGX0FdCT3l', 'Texto de trabalho', 195238),
    ],
  },
  {
    slug: '2026-08-30-22-domingo-tempo-comum', data: '2026-08-30', hora: '09:00', tipo: 'domingo',
    tituloLiturgico: '22º Domingo do Tempo Comum',
    tituloExibicao: 'Missa das 9h — 22º Domingo do Tempo Comum',
    cor: 'verde', status: 'publicada', local: LOCAL,
    observacao: 'Sem apresentação (.pptx) no Drive — só roteiro e texto.',
    arquivos: [
      A('pdf',  '1fWFTP9pk8U5tWOZFFpiNL1NCKIVHHPOt', 'Roteiro',           319973),
      A('docx', '1aOM-bkRNrscw--TgMVy8rkenWSPAom-I', 'Texto de trabalho', 195238),
    ],
  },
];

const MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

/** '2026-08-02' → 'Domingo, 2 de agosto de 2026'. Monta a data sem passar por
 *  `new Date(string)`, que interpreta como UTC e volta um dia no fuso do Brasil. */
export function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const dia = new Date(a, m - 1, d).getDay();
  return `${DIAS[dia]}, ${d} de ${MESES[m - 1]} de ${a}`;
}

export function mesDaMissa(iso: string): string {
  const m = Number(iso.split('-')[1]);
  return MESES[m - 1];
}

export function tamanhoLegivel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
