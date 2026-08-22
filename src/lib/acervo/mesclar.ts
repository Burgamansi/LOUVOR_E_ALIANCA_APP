// De onde a tela de Missas tira o acervo.
//
// Duas fontes, e a ordem entre elas é a decisão que importa:
//
//  · `src/data/missas.ts` — embarcado no bundle. Abre instantâneo, funciona
//    sem rede e é o que a equipe vê hoje. Numa igreja com sinal ruim, isso
//    não é detalhe: é a diferença entre ter o roteiro na hora da missa e não
//    ter.
//  · `/api/acervo` — o banco. Sempre atual, igual para todo mundo, e é o que
//    permite alguém corrigir um arquivo no domingo de manhã e a equipe
//    inteira ver.
//
// A tela desenha com o embarcado no primeiro quadro e troca pelo do banco
// quando ele chega. Sem tela em branco, sem "carregando", sem depender de
// rede para funcionar.
//
// A mesclagem NUNCA subtrai. Se o banco tiver menos celebrações que o
// arquivo — banco atrás, carga incompleta, recorte de período — o que só
// existe no arquivo continua aparecendo. Perder acervo em silêncio seria o
// pior desfecho possível para quem procura a missa do mês passado.

import type { Missa } from '../../data/missas';

/** O que `/api/acervo` devolve. Espelha a rota, não o banco. */
export interface MissaDaApi {
  slug: string;
  data: string;
  hora: string;
  tipo: string;
  tituloLiturgico: string;
  tituloExibicao: string;
  cor: string;
  status: string;
  local: string;
  observacao: string | null;
  arquivos: {
    tipo: string;
    driveFileId: string | null;
    nomeExibicao: string;
    tamanhoBytes: number;
  }[];
}

const TIPOS_ARQUIVO = ['pdf', 'docx', 'pptx'] as const;
const CORES = ['verde', 'vermelho', 'branco', 'roxo', 'rosa'] as const;

type TipoArquivo = (typeof TIPOS_ARQUIVO)[number];
type Cor = (typeof CORES)[number];

const ehTipoArquivo = (v: string): v is TipoArquivo =>
  (TIPOS_ARQUIVO as readonly string[]).includes(v);
const ehCor = (v: string): v is Cor => (CORES as readonly string[]).includes(v);

/**
 * Converte uma linha da API no formato que a tela já sabe desenhar.
 *
 * Devolve `null` quando a linha não serve — sem slug, sem data, com cor que a
 * tela não sabe pintar. Uma linha estranha vinda do servidor não pode derrubar
 * a lista inteira: ela é descartada e as outras seguem.
 */
export function converter(bruta: MissaDaApi): Missa | null {
  if (!bruta?.slug || !bruta?.data) return null;
  if (!ehCor(bruta.cor)) return null;

  const status = bruta.status === 'rascunho' ? 'rascunho' : 'publicada';

  // 'festa' existe no banco e não no arquivo embarcado. A tela usa o tipo só
  // para decidir o selo de "Solenidade", então festa cai em domingo sem
  // mudar nada do que se vê.
  const tipo = bruta.tipo === 'solenidade' ? 'solenidade' : 'domingo';

  return {
    slug: bruta.slug,
    data: bruta.data,
    hora: bruta.hora || '09:00',
    tipo,
    tituloLiturgico: bruta.tituloLiturgico,
    tituloExibicao: bruta.tituloExibicao || bruta.tituloLiturgico,
    cor: bruta.cor,
    status,
    local: bruta.local,
    ...(bruta.observacao ? { observacao: bruta.observacao } : {}),
    arquivos: (bruta.arquivos ?? [])
      .filter((a) => ehTipoArquivo(a.tipo) && a.driveFileId)
      .map((a) => ({
        tipo: a.tipo as TipoArquivo,
        driveFileId: String(a.driveFileId),
        nomeExibicao: a.nomeExibicao,
        tamanhoBytes: Number(a.tamanhoBytes) || 0,
      })),
  };
}

/**
 * Junta o que veio do banco com o que está embarcado.
 *
 * Onde as duas fontes falam da mesma celebração, o banco vence — é ele que
 * tem a correção de ontem. Onde só o arquivo tem, o arquivo fica. O resultado
 * sai em ordem de data, da mais recente para a mais antiga, que é a ordem em
 * que a tela lista.
 */
export function mesclar(embarcadas: Missa[], daApi: MissaDaApi[]): Missa[] {
  const porSlug = new Map<string, Missa>(embarcadas.map((m) => [m.slug, m]));

  for (const bruta of daApi) {
    const convertida = converter(bruta);
    if (!convertida) continue;

    // Celebração sem nenhum arquivo no banco, mas com arquivos no embarcado,
    // é quase sempre carga incompleta — não uma missa que perdeu o material.
    // Nesse caso ficam os arquivos que já conhecíamos.
    const antiga = porSlug.get(convertida.slug);
    if (antiga && convertida.arquivos.length === 0 && antiga.arquivos.length > 0) {
      porSlug.set(convertida.slug, { ...convertida, arquivos: antiga.arquivos });
      continue;
    }

    porSlug.set(convertida.slug, convertida);
  }

  return [...porSlug.values()].sort((a, b) => b.data.localeCompare(a.data));
}
