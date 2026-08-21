import { useEffect, useMemo, useRef, useState } from 'react';
import type { LiturgicalSong } from '../types';
import { importarArquivo, importarTexto, reanalisar } from '../lib/cifras/importar';
import type { DiagnosticoImportacao } from '../lib/cifras/importar';
import { TONS } from '../lib/cifras/acordes';
import { analisarCifra } from '../lib/cifras/parser';
import { campoHarmonico } from '../lib/cifras/render';
import { linhasParaRevisar } from '../lib/cifras/tipos';
import { MOMENTOS_LITURGICOS } from '../lib/cifras/cantos';
import { EXTENSOES_CIFRA, descreverAceitos, limiteLegivel, LIMITE_CIFRA_BYTES } from '../lib/upload/validar';
import { CifraAlinhada } from './CifraAlinhada';

// A mesma lista que o separador de cantos usa para achar as fronteiras. Se as
// duas divergirem, um canto detectado como PÓS-COMUNHÃO cai num <select> que
// não tem essa opção e o campo aparece vazio.
const MOMENTOS = MOMENTOS_LITURGICOS;

interface ImportarCifraModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (musica: LiturgicalSong) => void;
  /** Salva de uma vez os vários cantos encontrados num arquivo de missa. */
  onSalvarVarias?: (musicas: LiturgicalSong[]) => void;
  /** Quando vem preenchido, o modal substitui a cifra desta música. */
  musicaExistente?: LiturgicalSong | null;
  proximoNumero: number;
}

/** Um canto detectado, já editável pela pessoa antes de salvar. */
interface CantoEditavel {
  incluir: boolean;
  titulo: string;
  momento: string;
  tom: string;
  texto: string;
  confianca: 'alta' | 'media';
  editando: boolean;
}

/** Quantas linhas deste texto o parser marca para revisão — recalculado a cada edição. */
const contarRevisao = (texto: string) => linhasParaRevisar(analisarCifra(texto, 'C'));

const primeiroVerso = (texto: string) =>
  texto.split('\n').find((l) => l.trim() && !/^[\[(]/.test(l.trim()))?.trim().slice(0, 60) ?? '';

/**
 * Legenda do que a prévia mostra. A tela distingue cinco coisas, e a pessoa
 * precisa saber qual é qual antes de confirmar: acorde, letra, título/seção,
 * e o que ficou incerto.
 */
function Legenda() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#5C4A3E]" aria-label="Legenda da prévia">
      <li className="flex items-center gap-1"><span className="font-mono font-bold text-[#7A2332]">G7</span> acorde</li>
      <li className="flex items-center gap-1"><span className="font-mono text-[#2D2118]">Letra</span> texto reconhecido</li>
      <li className="flex items-center gap-1"><span className="font-bold uppercase tracking-wider text-[#C9A24A]">Refrão</span> seção</li>
      <li className="flex items-center gap-1">
        <span className="px-1.5 rounded border border-amber-300 bg-amber-50 text-amber-800 font-bold uppercase tracking-wider">revisão</span>
        conteúdo incerto
      </li>
    </ul>
  );
}

function ChipsDeAcordes({ acordes }: { acordes: string[] }) {
  if (acordes.length === 0) {
    return <p className="text-[11px] italic text-[#5C4A3E]">Nenhum acorde reconhecido.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Acordes encontrados">
      {acordes.map((a) => (
        <li key={a} className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#7A2332]/10 text-[#7A2332]">
          {a}
        </li>
      ))}
    </ul>
  );
}

/**
 * Importação de cifra em duas etapas: escolher a origem e conferir o resultado.
 *
 * A etapa de conferência não é burocracia — é o que separa este fluxo do
 * anterior. O Word alinha acorde de três jeitos diferentes (espaço, tabulação,
 * tabela) e só o primeiro sobrevive à conversão para texto. Mostrar o que foi
 * reconhecido, com a cifra já renderizada do jeito que vai aparecer no palco,
 * transforma um erro que apareceria na missa num ajuste de dez segundos agora.
 *
 * Regra que vale para tudo aqui: nada é inventado. O que o importador não
 * reconhece fica marcado como REVISÃO NECESSÁRIA, e confirmar com trecho
 * marcado exige dizer, explicitamente, que se sabe disso.
 */
export function ImportarCifraModal({
  aberto,
  onFechar,
  onSalvar,
  onSalvarVarias,
  musicaExistente = null,
  proximoNumero,
}: ImportarCifraModalProps) {
  const [diagnostico, setDiagnostico] = useState<DiagnosticoImportacao | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [editandoTexto, setEditandoTexto] = useState(false);
  const [cienteDaRevisao, setCienteDaRevisao] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [momento, setMomento] = useState('ENTRADA');
  const [tom, setTom] = useState('G');
  const [colado, setColado] = useState('');

  // Os cantos encontrados no arquivo, já editáveis. Vazio ou com um só, o
  // fluxo é o de sempre — uma cifra, um título, um tom.
  const [cantos, setCantos] = useState<CantoEditavel[]>([]);
  const [cantoAberto, setCantoAberto] = useState<number | null>(null);

  const inputArquivo = useRef<HTMLInputElement>(null);

  // Reabrir o modal precisa começar limpo: um diagnóstico antigo na tela faria
  // a pessoa salvar a cifra da música anterior por cima desta.
  useEffect(() => {
    if (!aberto) return;
    setDiagnostico(null);
    setNomeArquivo(null);
    setErro(null);
    setEditandoTexto(false);
    setCienteDaRevisao(false);
    setColado('');
    setTitulo(musicaExistente?.title ?? '');
    setMomento(musicaExistente?.part ?? 'ENTRADA');
    setTom(musicaExistente?.key ?? 'G');
    setCantos([]);
    setCantoAberto(null);
  }, [aberto, musicaExistente]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  // O modo de vários cantos só existe quando o arquivo realmente trouxe mais
  // de um e há para onde salvá-los.
  const varios = cantos.length > 1 && Boolean(onSalvarVarias);

  const revisaoPorCanto = useMemo(() => cantos.map((c) => contarRevisao(c.texto)), [cantos]);
  const escolhidos = cantos.filter((c) => c.incluir && c.titulo.trim());
  const paraRevisar = varios
    ? cantos.reduce((soma, c, i) => (c.incluir && c.titulo.trim() ? soma + revisaoPorCanto[i] : soma), 0)
    : diagnostico?.paraRevisar ?? 0;

  if (!aberto) return null;

  const aplicarDiagnostico = (d: DiagnosticoImportacao, arquivo?: string) => {
    setDiagnostico(d);
    setNomeArquivo(arquivo ?? null);
    setCienteDaRevisao(false);
    setTom(musicaExistente?.key ?? d.tomSugerido);
    if (!titulo && arquivo) {
      setTitulo(arquivo.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim());
    }

    // Substituir a cifra de uma música existente é sempre uma coisa só, mesmo
    // que o arquivo colado tenha vários cantos: quem clicou em "corrigir esta
    // cifra" quer corrigir aquela, não criar oito.
    setCantos(
      musicaExistente
        ? []
        : d.cantos.map((c) => ({
            // O canto que veio sem conteúdo entra desmarcado: salvar uma
            // música vazia não ajuda ninguém, mas ele precisa aparecer para a
            // pessoa ver que aquele momento está em branco no arquivo dela.
            incluir: c.texto.trim().length > 0,
            titulo: c.titulo,
            momento: c.momento ?? 'OUTRO',
            tom: c.tomSugerido,
            texto: c.texto,
            confianca: c.confianca,
            editando: false,
          }))
    );
    setCantoAberto(null);
  };

  const mudarCanto = (i: number, campos: Partial<CantoEditavel>) =>
    setCantos((atual) => atual.map((c, j) => (j === i ? { ...c, ...campos } : c)));

  const marcarTodos = (incluir: boolean) =>
    setCantos((atual) => atual.map((c) => ({ ...c, incluir: incluir && c.texto.trim().length > 0 })));

  const receberArquivo = async (arquivo: File) => {
    setErro(null);
    setCarregando(true);
    try {
      aplicarDiagnostico(await importarArquivo(arquivo), arquivo.name);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui ler este arquivo.');
    } finally {
      setCarregando(false);
      if (inputArquivo.current) inputArquivo.current.value = '';
    }
  };

  const origem = diagnostico?.origem ?? 'colado';
  const tituloDocumento =
    nomeArquivo?.replace(/\.[^.]+$/, '') ??
    `Texto colado em ${new Date().toLocaleDateString('pt-BR')}`;

  const salvar = () => {
    if (!diagnostico || !titulo.trim()) return;
    const texto = diagnostico.texto;
    onSalvar({
      ...(musicaExistente ?? {}),
      id: musicaExistente?.id ?? `song-${Date.now()}`,
      number: musicaExistente?.number ?? proximoNumero,
      part: momento,
      title: titulo.trim(),
      key: tom,
      lyricsPreview: primeiroVerso(texto),
      fullChordText: texto,
      origem,
      revisada: diagnostico.paraRevisar === 0,
    } as LiturgicalSong);
    onFechar();
  };

  /** Vários cantos no mesmo arquivo: cada um vira uma música com o seu tom. */
  const salvarVarios = () => {
    if (escolhidos.length === 0 || !onSalvarVarias) return;

    const base = Date.now();
    const documentoId = `doc-${base}`;
    onSalvarVarias(
      escolhidos.map((c, i) => ({
        id: `song-${base}-${i}`,
        number: proximoNumero + i,
        part: c.momento,
        title: c.titulo.trim(),
        key: c.tom,
        lyricsPreview: primeiroVerso(c.texto),
        fullChordText: c.texto,
        documentoId,
        documentoTitulo: tituloDocumento,
        ordemNoDocumento: i,
        origem,
        revisada: contarRevisao(c.texto) === 0,
      }))
    );
    onFechar();
  };

  const podeSalvar =
    (varios ? escolhidos.length > 0 : Boolean(diagnostico && titulo.trim())) &&
    (paraRevisar === 0 || cienteDaRevisao);

  const rotuloConfirmar = varios
    ? `Confirmar importação (${escolhidos.length} ${escolhidos.length === 1 ? 'canto' : 'cantos'})`
    : musicaExistente
      ? 'Confirmar substituição'
      : 'Confirmar importação';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="importar-cifra-titulo"
        className="bg-[#FFF9F2] w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl border border-[#7A2332]/20 shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Cabeçalho */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[#7A2332]/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <span aria-hidden className="material-symbols-outlined text-[#C9A24A]">library_music</span>
            <div className="min-w-0">
              <h3 id="importar-cifra-titulo" className="font-serif text-lg font-bold text-[#7A2332] truncate">
                {musicaExistente ? `Substituir cifra de “${musicaExistente.title}”` : 'Importar cifra'}
              </h3>
              <p className="text-[11px] text-[#5C4A3E]">
                {diagnostico ? 'Etapa 2 de 2 — confira antes de confirmar' : 'Etapa 1 de 2 — escolha o arquivo ou cole o texto'}
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#7A2332]/20 text-[#5C4A3E] flex items-center justify-center hover:text-[#7A2332] cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!diagnostico ? (
            <div className="flex flex-col gap-4">
              {/* Zona de arrastar — o caminho principal */}
              <div
                onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                onDragLeave={() => setArrastando(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setArrastando(false);
                  const arquivo = e.dataTransfer.files?.[0];
                  if (arquivo) void receberArquivo(arquivo);
                }}
                className={`rounded-3xl border-2 border-dashed p-8 flex flex-col items-center text-center gap-3 transition ${
                  arrastando
                    ? 'border-[#7A2332] bg-[#7A2332]/5'
                    : 'border-[#7A2332]/25 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF9F2] border border-[#7A2332]/15 flex items-center justify-center text-[#7A2332]">
                  <span aria-hidden className="material-symbols-outlined text-3xl">
                    {carregando ? 'hourglass_top' : 'upload_file'}
                  </span>
                </div>
                <div>
                  <p className="font-serif font-bold text-[#7A2332]">
                    {carregando ? 'Lendo o arquivo…' : 'Arraste o arquivo aqui'}
                  </p>
                  <p className="text-xs text-[#5C4A3E] mt-1">
                    Aceita <strong>{descreverAceitos(EXTENSOES_CIFRA)}</strong> até {limiteLegivel(LIMITE_CIFRA_BYTES)}.
                    Nada é salvo antes de você conferir.
                  </p>
                </div>

                <input
                  ref={inputArquivo}
                  type="file"
                  accept={EXTENSOES_CIFRA.map((e) => `.${e}`).join(',')}
                  className="hidden"
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    if (arquivo) void receberArquivo(arquivo);
                  }}
                />
                <button
                  onClick={() => inputArquivo.current?.click()}
                  disabled={carregando}
                  className="mt-1 px-5 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold disabled:opacity-50 hover:brightness-110 transition cursor-pointer"
                >
                  Escolher arquivo do computador
                </button>
              </div>

              {erro && (
                <p role="alert" className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  {erro}
                </p>
              )}

              {/* Colar — o caminho alternativo, igualmente legítimo */}
              <div className="bg-white rounded-2xl border border-[#7A2332]/15 p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-lg">content_paste</span>
                  <p className="text-sm font-bold text-[#7A2332]">Ou cole o texto da cifra</p>
                </div>
                <textarea
                  rows={5}
                  value={colado}
                  onChange={(e) => setColado(e.target.value)}
                  aria-label="Texto da cifra"
                  placeholder={'G          C         G\nComo é bom a gente se encontrar'}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#7A2332]/20 font-mono text-xs text-[#2D2118] focus:outline-none focus:border-[#7A2332] resize-y whitespace-pre"
                />
                <button
                  onClick={() => { if (colado.trim()) aplicarDiagnostico(importarTexto(colado)); }}
                  disabled={!colado.trim()}
                  className="self-end px-5 py-2 rounded-full bg-[#7A2332] text-[#FFF9F2] text-xs font-bold disabled:opacity-40 hover:brightness-110 transition cursor-pointer"
                >
                  Conferir
                </button>
              </div>

              <p className="text-[11px] text-[#5C4A3E] leading-relaxed bg-[#C9A24A]/10 border border-[#C9A24A]/30 rounded-xl px-3 py-2.5">
                <strong>Vindo do Google Drive ou do Google Docs?</strong> Baixe o arquivo (Arquivo → Fazer download →
                Word ou Texto sem formatação) e escolha-o aqui. Fotos e PDFs escaneados entram também, mas o
                conteúdo da imagem <strong>não é lido automaticamente</strong> — ele aparece marcado para você transcrever.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Diagnóstico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { rotulo: 'Linhas com acorde', valor: diagnostico.linhasDeAcorde, icone: 'format_align_left', alerta: false },
                  { rotulo: 'Acordes distintos', valor: diagnostico.acordesDistintos, icone: 'piano', alerta: false },
                  { rotulo: 'Seções', valor: diagnostico.secoes.length, icone: 'segment', alerta: false },
                  { rotulo: 'Para revisar', valor: diagnostico.paraRevisar, icone: 'warning', alerta: diagnostico.paraRevisar > 0 },
                ].map((m) => (
                  <div
                    key={m.rotulo}
                    className={`rounded-2xl border p-3 text-center ${
                      m.alerta ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#7A2332]/15'
                    }`}
                  >
                    <span aria-hidden className={`material-symbols-outlined text-lg ${m.alerta ? 'text-amber-700' : 'text-[#C9A24A]'}`}>{m.icone}</span>
                    <p className={`font-serif text-2xl font-bold leading-none ${m.alerta ? 'text-amber-800' : 'text-[#7A2332]'}`}>{m.valor}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#5C4A3E] font-bold mt-1">{m.rotulo}</p>
                  </div>
                ))}
              </div>

              {diagnostico.avisos.map((aviso) => (
                <p
                  key={aviso}
                  className="text-xs text-[#7A2332] bg-[#C9A24A]/15 border border-[#C9A24A]/40 rounded-xl px-3 py-2.5 flex gap-2"
                >
                  <span aria-hidden className="material-symbols-outlined text-base shrink-0">info</span>
                  <span>{aviso}</span>
                </p>
              ))}

              {/* Imagens que vieram dentro do documento — mostradas, não interpretadas */}
              {diagnostico.imagens.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-300 p-3 flex flex-col gap-2">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span aria-hidden className="material-symbols-outlined text-base">image</span>
                    {diagnostico.imagens.length === 1
                      ? '1 imagem veio dentro do documento'
                      : `${diagnostico.imagens.length} imagens vieram dentro do documento`}
                  </p>
                  <p className="text-[11px] text-[#5C4A3E] leading-relaxed">
                    O app não lê o conteúdo de imagens. Cada uma está marcada no texto como{' '}
                    <strong>REVISÃO NECESSÁRIA</strong>, no lugar exato em que aparecia. Abra
                    “Editar antes de salvar” e transcreva a cifra olhando para a imagem.
                  </p>
                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {diagnostico.imagens.map((img) => (
                      <li key={img.indice} className="flex flex-col gap-1">
                        <a href={img.dataUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir imagem ${img.indice} em tamanho real`}>
                          <img
                            src={img.dataUrl}
                            alt={`Imagem ${img.indice} do documento${img.pagina ? `, página ${img.pagina}` : ''}`}
                            className="w-full h-24 object-contain rounded-lg border border-[#7A2332]/15 bg-[#FFF9F2]"
                          />
                        </a>
                        <span className="text-[10px] text-[#5C4A3E] truncate">Imagem {img.indice} · {img.nome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {varios ? (
                /* ── Vários cantos no mesmo arquivo ─────────────────────────
                   O arquivo é a missa inteira. Cada canto vira uma música com
                   o seu próprio tom — que é o que permite baixar o Ofertório
                   sem mexer no Santo.

                   Os cortes ficam à vista e editáveis de propósito. Nenhuma
                   heurística acerta sempre, e dividir errado o repertório em
                   silêncio é pior do que mostrar e deixar corrigir. */
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-2 bg-[#C9A24A]/15 border border-[#C9A24A]/40 rounded-xl px-3 py-2.5">
                    <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-base shrink-0">
                      library_music
                    </span>
                    <p className="text-xs text-[#7A2332] leading-relaxed">
                      <strong>Músicas encontradas no documento: {cantos.length}.</strong> Cada uma entra como
                      uma música, com o seu próprio tom — assim você muda o tom de uma sem mexer nas
                      outras. Confira os nomes e escolha quais importar.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 px-1">
                    <p className="text-[11px] text-[#5C4A3E]">
                      {escolhidos.length} de {cantos.length} selecionadas
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => marcarTodos(true)}
                        className="text-[11px] font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                      >
                        Selecionar todas
                      </button>
                      <span aria-hidden className="text-[#5C4A3E]/40">·</span>
                      <button
                        onClick={() => marcarTodos(false)}
                        className="text-[11px] font-bold text-[#5C4A3E] underline decoration-dotted cursor-pointer"
                      >
                        Nenhuma
                      </button>
                    </div>
                  </div>

                  {cantos.map((c, i) => {
                    const aberto = cantoAberto === i;
                    const revisar = revisaoPorCanto[i];
                    return (
                      <div
                        key={i}
                        className={`bg-white rounded-2xl border overflow-hidden transition ${
                          c.incluir ? 'border-[#7A2332]/20' : 'border-dashed border-[#7A2332]/15 opacity-55'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 p-3">
                          <input
                            type="checkbox"
                            checked={c.incluir}
                            onChange={(e) => mudarCanto(i, { incluir: e.target.checked })}
                            aria-label={`Importar ${c.titulo || `canto ${i + 1}`}`}
                            className="w-4 h-4 shrink-0 accent-[#7A2332] cursor-pointer"
                          />

                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#C9A24A] w-[92px] truncate">
                            {c.momento}
                          </span>

                          {!c.texto.trim() && (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              vazio no arquivo
                            </span>
                          )}

                          {revisar > 0 && (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <span aria-hidden className="material-symbols-outlined text-xs">warning</span>
                              {revisar} p/ revisar
                            </span>
                          )}

                          <input
                            value={c.titulo}
                            onChange={(e) => mudarCanto(i, { titulo: e.target.value })}
                            placeholder="Nome do canto"
                            aria-label={`Título do canto ${i + 1}`}
                            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#7A2332]/15 bg-[#FFF9F2] text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
                          />

                          <select
                            value={c.tom}
                            onChange={(e) => mudarCanto(i, { tom: e.target.value })}
                            aria-label={`Tom original de ${c.titulo || `canto ${i + 1}`}`}
                            className="shrink-0 px-2 py-1.5 rounded-lg border border-[#7A2332]/20 bg-white text-sm font-bold text-[#7A2332] focus:outline-none cursor-pointer"
                          >
                            {TONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            {TONS.map((t) => <option key={`${t}m`} value={`${t}m`}>{t}m</option>)}
                          </select>

                          <button
                            onClick={() => setCantoAberto(aberto ? null : i)}
                            aria-expanded={aberto}
                            aria-label={`Ver a cifra de ${c.titulo || `canto ${i + 1}`}`}
                            className="shrink-0 w-8 h-8 rounded-lg border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:border-[#7A2332]/50 transition cursor-pointer"
                          >
                            <span aria-hidden className={`material-symbols-outlined text-lg transition-transform ${aberto ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                        </div>

                        {aberto && (
                          <div className="border-t border-[#7A2332]/10 bg-[#FFF9F2]/60 px-3 py-3 flex flex-col gap-2.5">
                            <div className="flex flex-wrap items-center gap-3">
                              <label className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                                  Momento
                                </span>
                                <select
                                  value={c.momento}
                                  onChange={(e) => mudarCanto(i, { momento: e.target.value })}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none cursor-pointer"
                                >
                                  {MOMENTOS.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </label>
                              <button
                                onClick={() => mudarCanto(i, { editando: !c.editando })}
                                className="text-[11px] font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                              >
                                {c.editando ? 'Ver prévia' : 'Editar antes de salvar'}
                              </button>
                            </div>

                            <ChipsDeAcordes acordes={campoHarmonico(analisarCifra(c.texto, c.tom))} />

                            {c.editando ? (
                              <textarea
                                rows={12}
                                value={c.texto}
                                onChange={(e) => mudarCanto(i, { texto: e.target.value })}
                                aria-label={`Texto da cifra de ${c.titulo || `canto ${i + 1}`}`}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white font-mono text-xs text-[#2D2118] focus:outline-none focus:border-[#7A2332] resize-y whitespace-pre"
                              />
                            ) : c.texto.trim() ? (
                              <div className="max-h-56 overflow-auto rounded-xl bg-white border border-[#7A2332]/10 p-3">
                                <CifraAlinhada
                                  texto={c.texto}
                                  tomOriginal={c.tom}
                                  semitons={0}
                                  className="text-xs"
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-[#5C4A3E] italic bg-white border border-dashed border-[#7A2332]/20 rounded-xl px-3 py-3">
                                O título está no arquivo, mas não há nada escrito embaixo dele.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Legenda />
                </div>
              ) : (
                <>
                {/* Identificação */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                      Título {nomeArquivo && <em className="font-normal normal-case">· detectado do nome do arquivo</em>}
                    </span>
                    <input
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Como é bom a gente se encontrar"
                      className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                      Tom original {diagnostico.tomSugerido && <em className="font-normal normal-case">· achei {diagnostico.tomSugerido}</em>}
                    </span>
                    <select
                      value={tom}
                      onChange={(e) => setTom(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm font-bold text-[#7A2332] focus:outline-none focus:border-[#7A2332] cursor-pointer"
                    >
                      {TONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      {TONS.map((t) => <option key={`${t}m`} value={`${t}m`}>{t}m</option>)}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Momento da celebração</span>
                  <select
                    value={momento}
                    onChange={(e) => setMomento(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332] cursor-pointer"
                  >
                    {MOMENTOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Acordes encontrados</span>
                  <ChipsDeAcordes acordes={diagnostico.acordes} />
                </div>

                {/* Prévia — exatamente como vai aparecer no palco */}
                <div className="bg-white rounded-2xl border border-[#7A2332]/15 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#7A2332]/10 bg-[#FFF9F2]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                      {editandoTexto ? 'Editando o texto' : `Prévia no tom ${tom}`}
                    </p>
                    <button
                      onClick={() => setEditandoTexto(!editandoTexto)}
                      className="text-[11px] font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                    >
                      {editandoTexto ? 'Ver prévia' : 'Editar antes de salvar'}
                    </button>
                  </div>

                  {editandoTexto ? (
                    <textarea
                      rows={14}
                      value={diagnostico.texto}
                      onChange={(e) => setDiagnostico(reanalisar(diagnostico, e.target.value))}
                      aria-label="Texto da cifra"
                      className="w-full px-4 py-3 font-mono text-xs text-[#2D2118] focus:outline-none resize-y whitespace-pre"
                    />
                  ) : (
                    <div className="p-4 max-h-72 overflow-auto">
                      <CifraAlinhada
                        texto={diagnostico.texto}
                        tomOriginal={tom}
                        semitons={0}
                        className="text-xs"
                      />
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-[#7A2332]/10 bg-[#FFF9F2]">
                    <Legenda />
                  </div>
                </div>
                </>
              )}

              {/* Confirmar com trecho incerto exige dizer que se sabe disso. A
                  cifra entra com o trecho marcado, visível no palco, até alguém
                  corrigir em "Corrigir esta cifra". */}
              {paraRevisar > 0 && (
                <label className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cienteDaRevisao}
                    onChange={(e) => setCienteDaRevisao(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#7A2332]"
                  />
                  <span className="text-xs text-amber-900 leading-relaxed">
                    Entendi: {paraRevisar === 1 ? 'há 1 trecho' : `há ${paraRevisar} trechos`} marcado{paraRevisar === 1 ? '' : 's'} como{' '}
                    <strong>REVISÃO NECESSÁRIA</strong>. Nada foi inventado no lugar; a marcação continua
                    visível na cifra até eu corrigir.
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <footer className="shrink-0 flex items-center justify-between gap-2 px-5 py-3.5 border-t border-[#7A2332]/15 bg-white/60">
          {diagnostico ? (
            <button
              onClick={() => { setDiagnostico(null); setErro(null); }}
              className="text-xs font-bold text-[#5C4A3E] hover:text-[#7A2332] px-3 py-2 rounded-full cursor-pointer flex items-center gap-1"
            >
              <span aria-hidden className="material-symbols-outlined text-base">arrow_back</span>
              Trocar arquivo
            </button>
          ) : <span />}

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={onFechar}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5C4A3E] hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>
            {diagnostico && !varios && (
              <button
                onClick={() => setEditandoTexto(!editandoTexto)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#7A2332] border border-[#7A2332]/30 hover:bg-[#7A2332]/5 cursor-pointer"
              >
                {editandoTexto ? 'Ver prévia' : 'Editar antes de salvar'}
              </button>
            )}
            <button
              onClick={varios ? salvarVarios : salvar}
              disabled={!podeSalvar}
              className="px-6 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
            >
              {rotuloConfirmar}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
