import { useEffect, useRef, useState } from 'react';
import type { LiturgicalSong } from '../types';
import { importarArquivo, importarTexto } from '../lib/cifras/importar';
import type { DiagnosticoImportacao } from '../lib/cifras/importar';
import { TONS } from '../lib/cifras/acordes';
import { MOMENTOS_LITURGICOS } from '../lib/cifras/cantos';
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
}

/**
 * Importação de cifra em duas etapas: escolher a origem e conferir o resultado.
 *
 * A etapa de conferência não é burocracia — é o que separa este fluxo do
 * anterior. O Word alinha acorde de três jeitos diferentes (espaço, tabulação,
 * tabela) e só o primeiro sobrevive à conversão para texto. Mostrar o que foi
 * reconhecido, com a cifra já renderizada do jeito que vai aparecer no palco,
 * transforma um erro que apareceria na missa num ajuste de dez segundos agora.
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
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [editandoTexto, setEditandoTexto] = useState(false);

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
    setErro(null);
    setEditandoTexto(false);
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

  if (!aberto) return null;

  const aplicarDiagnostico = (d: DiagnosticoImportacao, nomeArquivo?: string) => {
    setDiagnostico(d);
    setTom(musicaExistente?.key ?? d.tomSugerido);
    if (!titulo && nomeArquivo) {
      setTitulo(
        nomeArquivo.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
      );
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
          }))
    );
    setCantoAberto(null);
  };

  const mudarCanto = (i: number, campos: Partial<CantoEditavel>) =>
    setCantos((atual) => atual.map((c, j) => (j === i ? { ...c, ...campos } : c)));

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
      lyricsPreview:
        texto.split('\n').find((l) => l.trim() && !/^[\[(]/.test(l.trim()))?.trim().slice(0, 60) ?? '',
      fullChordText: texto,
    } as LiturgicalSong);
    onFechar();
  };

  /** Vários cantos no mesmo arquivo: cada um vira uma música com o seu tom. */
  const salvarVarios = () => {
    const escolhidos = cantos.filter((c) => c.incluir && c.titulo.trim());
    if (escolhidos.length === 0 || !onSalvarVarias) return;

    const base = Date.now();
    onSalvarVarias(
      escolhidos.map((c, i) => ({
        id: `song-${base}-${i}`,
        number: proximoNumero + i,
        part: c.momento,
        title: c.titulo.trim(),
        key: c.tom,
        lyricsPreview:
          c.texto.split('\n').find((l) => l.trim() && !/^[\[(]/.test(l.trim()))?.trim().slice(0, 60) ?? '',
        fullChordText: c.texto,
      }))
    );
    onFechar();
  };

  // O modo de vários cantos só existe quando o arquivo realmente trouxe mais
  // de um e há para onde salvá-los.
  const varios = cantos.length > 1 && Boolean(onSalvarVarias);
  const marcados = cantos.filter((c) => c.incluir && c.titulo.trim()).length;

  const podeSalvar = varios
    ? marcados > 0
    : Boolean(diagnostico && titulo.trim());

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#FFF9F2] w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl border border-[#7A2332]/20 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[#7A2332]/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <span aria-hidden className="material-symbols-outlined text-[#C9A24A]">library_music</span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-[#7A2332] truncate">
                {musicaExistente ? `Substituir cifra de “${musicaExistente.title}”` : 'Importar cifra'}
              </h3>
              <p className="text-[11px] text-[#5C4A3E]">
                {diagnostico ? 'Etapa 2 de 2 — confira e salve' : 'Etapa 1 de 2 — escolha o arquivo ou cole o texto'}
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
                    {carregando ? 'Lendo o arquivo…' : 'Arraste o arquivo do Word aqui'}
                  </p>
                  <p className="text-xs text-[#5C4A3E] mt-1">
                    Aceita <strong>.docx</strong> e <strong>.txt</strong>. Nada é salvo antes de você conferir.
                  </p>
                </div>

                <input
                  ref={inputArquivo}
                  type="file"
                  accept=".docx,.txt,text/plain"
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
                  Escolher arquivo
                </button>
              </div>

              {erro && (
                <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
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
                <strong>Vindo do Google Docs?</strong> Arquivo → Fazer download → Texto sem
                formatação (.txt). O alinhamento dos acordes se conserva melhor do que no .docx.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Diagnóstico */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { rotulo: 'Linhas com acorde', valor: diagnostico.linhasDeAcorde, icone: 'format_align_left' },
                  { rotulo: 'Acordes distintos', valor: diagnostico.acordesDistintos, icone: 'piano' },
                  { rotulo: 'Seções', valor: diagnostico.secoes.length, icone: 'segment' },
                ].map((m) => (
                  <div key={m.rotulo} className="bg-white rounded-2xl border border-[#7A2332]/15 p-3 text-center">
                    <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-lg">{m.icone}</span>
                    <p className="font-serif text-2xl font-bold text-[#7A2332] leading-none">{m.valor}</p>
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
                      Encontrei <strong>{cantos.length} cantos</strong> neste arquivo. Cada um entra como
                      uma música, com o seu próprio tom — assim você muda o tom de um sem mexer nos
                      outros. Confira os nomes e desmarque o que não quiser.
                    </p>
                  </div>

                  {cantos.map((c, i) => {
                    const aberto = cantoAberto === i;
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

                          <input
                            value={c.titulo}
                            onChange={(e) => mudarCanto(i, { titulo: e.target.value })}
                            placeholder="Nome do canto"
                            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#7A2332]/15 bg-[#FFF9F2] text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
                          />

                          <select
                            value={c.tom}
                            onChange={(e) => mudarCanto(i, { tom: e.target.value })}
                            aria-label={`Tom de ${c.titulo || `canto ${i + 1}`}`}
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
                            <label className="flex items-center gap-2">
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

                            {c.texto.trim() ? (
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
                </div>
              ) : (
                <>
                {/* Identificação */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Título</span>
                    <input
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Como é bom a gente se encontrar"
                      className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                      Tom {diagnostico.tomSugerido && <em className="font-normal normal-case">· achei {diagnostico.tomSugerido}</em>}
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

                {/* Prévia — exatamente como vai aparecer no palco */}
                <div className="bg-white rounded-2xl border border-[#7A2332]/15 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#7A2332]/10 bg-[#FFF9F2]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
                      Prévia no tom {tom}
                    </p>
                    <button
                      onClick={() => setEditandoTexto(!editandoTexto)}
                      className="text-[11px] font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                    >
                      {editandoTexto ? 'Ver prévia' : 'Ajustar alinhamento'}
                    </button>
                  </div>

                  {editandoTexto ? (
                    <textarea
                      rows={14}
                      value={diagnostico.texto}
                      onChange={(e) => setDiagnostico(importarTexto(e.target.value))}
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
                </div>
                </>
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

          <div className="flex items-center gap-2">
            <button
              onClick={onFechar}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5C4A3E] hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={varios ? salvarVarios : salvar}
              disabled={!podeSalvar}
              className="px-6 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
            >
              {varios
                ? `Salvar ${marcados} ${marcados === 1 ? 'canto' : 'cantos'}`
                : musicaExistente
                  ? 'Substituir cifra'
                  : 'Salvar no repertório'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
