// Conteúdo inicial do painel de Links Úteis.
// Mesma estrutura da tabela `links` (db/migrations/0003): quando a API estiver
// no ar, esta lista vira só o fallback.

export type CategoriaLink = 'sites' | 'documentos' | 'drive';

export interface LinkUtil {
  id: string;
  categoria: CategoriaLink;
  titulo: string;
  url: string;
  descricao?: string;
  icone?: string;
  driveFileId?: string | null;
}

export const ABAS: { id: CategoriaLink; emoji: string; rotulo: string; descricao: string }[] = [
  { id: 'sites', emoji: '🌐', rotulo: 'Sites Úteis',
    descricao: 'Portais litúrgicos, parceiros e referências do ministério.' },
  { id: 'documentos', emoji: '✝️', rotulo: 'Documentos Católicos',
    descricao: 'Catecismo, encíclicas, orações e documentos pastorais.' },
  { id: 'drive', emoji: '📁', rotulo: 'Google Drive',
    descricao: 'Arquivos do acervo — abrem em pré-visualização, sem baixar.' },
];

export const LINKS_INICIAIS: LinkUtil[] = [
  {
    id: 'l-cnbb', categoria: 'sites', icone: 'menu_book',
    titulo: 'Liturgia Diária Oficial — CNBB',
    url: 'https://liturgiadiaria.cnbb.org.br/',
    descricao: 'Leituras, salmo e evangelho de cada dia.',
  },
  {
    id: 'l-vaticano', categoria: 'sites', icone: 'church',
    titulo: 'Vatican.va',
    url: 'https://www.vatican.va/content/vatican/pt.html',
    descricao: 'Portal oficial da Santa Sé, em português.',
  },
  {
    id: 'l-pastoral', categoria: 'sites', icone: 'music_note',
    titulo: 'Pastoral da Música Litúrgica',
    url: 'https://www.cnbb.org.br/',
    descricao: 'Orientações e subsídios da CNBB para o canto litúrgico.',
  },

  {
    id: 'd-catecismo', categoria: 'documentos', icone: 'auto_stories',
    titulo: 'Catecismo da Igreja Católica',
    url: 'https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina-cic_po.html',
    descricao: 'Texto integral em português.',
  },
  {
    id: 'd-igm', categoria: 'documentos', icone: 'gavel',
    titulo: 'Instrução Geral do Missal Romano',
    url: 'https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_po.html',
    descricao: 'Como a celebração se estrutura — base para escolher o repertório.',
  },
  {
    id: 'd-sacrosanctum', categoria: 'documentos', icone: 'history_edu',
    titulo: 'Sacrosanctum Concilium',
    url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_po.html',
    descricao: 'Constituição sobre a Sagrada Liturgia, do Concílio Vaticano II.',
  },

  {
    id: 'g-missas', categoria: 'drive', icone: 'folder_open',
    titulo: 'MISSAS 2026 — pasta completa',
    url: 'https://drive.google.com/drive/folders/1L9grg1Ky-RKjl4BC7GPE0gi_5y0eKMUa',
    descricao: 'Todas as celebrações do ano, mês a mês.',
  },
  {
    id: 'g-roteiro-18', categoria: 'drive', icone: 'picture_as_pdf',
    titulo: 'Roteiro — 18º Domingo do Tempo Comum',
    url: 'https://drive.google.com/file/d/1megn_p1fkwHjSO9zF3Yi9aZTmYDDQInx/view',
    descricao: 'PDF · 278 KB',
    driveFileId: '1megn_p1fkwHjSO9zF3Yi9aZTmYDDQInx',
  },
  {
    id: 'g-texto-18', categoria: 'drive', icone: 'description',
    titulo: 'Texto de trabalho — 18º Domingo',
    url: 'https://drive.google.com/file/d/19Kz2HDYO-OnoE3fL-GmjB8B84pueGKwk/view',
    descricao: 'Word · 960 KB',
    driveFileId: '19Kz2HDYO-OnoE3fL-GmjB8B84pueGKwk',
  },
];
