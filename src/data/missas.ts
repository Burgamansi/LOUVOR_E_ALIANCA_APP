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

const LOCAL = 'Paróquia Nossa Senhora de Fátima';

export const MISSAS: Missa[] = [
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
