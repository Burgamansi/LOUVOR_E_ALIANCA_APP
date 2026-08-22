import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LiturgicalSong } from '../types';
import {
  TONS, semitonsEntre, tomEscrito, normalizarSemitons,
} from '../lib/cifras/acordes';
import { sugerirCapotraste } from '../lib/cifras/capotraste';
import { analisarCifra } from '../lib/cifras/parser';
import { linhasParaRevisar } from '../lib/cifras/tipos';
import { MOMENTOS_LITURGICOS } from '../lib/cifras/cantos';
import { useLocal } from '../hooks/useLocal';
import { usePersistente } from '../hooks/usePersistente';
import { useAutoScroll, VELOCIDADE_PADRAO, DEGRAUS_VELOCIDADE } from '../hooks/useAutoScroll';
import { CifraAlinhada } from './CifraAlinhada';
import { ControleVelocidade } from './ControleVelocidade';
import { BarraPalco } from './BarraPalco';
import { NavegacaoCantos, momentoCurto } from './NavegacaoCantos';
import { StatusSalvamento } from './StatusSalvamento';

interface CifrasViewProps {
  songs: LiturgicalSong[];
  /** Pode ser nula: o repertório fica vazio quando se apaga tudo. */
  selectedSong: LiturgicalSong | null;
  onSelectSong: (song: LiturgicalSong) => void;
  onOpenDrive: () => void;
  onImportarCifra: () => void;
  onSubstituirCifra: (song: LiturgicalSong) => void;
  /** Apaga uma cifra ou o repertório inteiro. */
  onExcluirCifras: (ids: string[]) => void;
  /** Avisa o App para recolher cabeçalho e navegação no modo de palco. */
  onModoPalco: (ativo: boolean) => void;
  /** Confirmação na tela do que acabou de acontecer — só depois de acontecer. */
  onAviso: (texto: string, tipo?: 'ok' | 'apagou' | 'erro') => void;
}

const MOMENTOS = MOMENTOS_LITURGICOS.filter((m) => m !== 'OUTRO');

type Gaveta = 'nenhuma' | 'musicas' | 'tom';

const TAMANHO_MAX = 4;
const ESCALA_TEXTO = ['text-[13px]', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

/** Um arquivo importado com vários cantos, reagrupado a partir das músicas. */
interface Documento {
  id: string;
  titulo: string;
  cantos: LiturgicalSong[];
}

function agruparDocumentos(songs: LiturgicalSong[]): Documento[] {
  const mapa = new Map<string, Documento>();
  for (const s of songs) {
    if (!s.documentoId) continue;
    const doc = mapa.get(s.documentoId) ?? { id: s.documentoId, titulo: s.documentoTitulo ?? 'Documento', cantos: [] };
    doc.cantos.push(s);
    mapa.set(s.documentoId, doc);
  }
  for (const doc of mapa.values()) {
    doc.cantos.sort((a, b) => (a.ordemNoDocumento ?? a.number) - (b.ordemNoDocumento ?? b.number));
  }
  return [...mapa.values()];
}

const contarRevisao = (texto: string) => linhasParaRevisar(analisarCifra(texto, 'C'));

/**
 * Cifras & Repertório.
 *
 * Um estado só — a música selecionada e o tom em que ela está sendo tocada —
 * e cada ferramenta atua sobre ele. A barra tem uma linha e os controles
 * moram em gavetas que abrem sob demanda, porque a proporção certa numa tela
 * de cifra é quase toda cifra.
 *
 * Dois modos de leitura:
 *  · **uma música** — a cifra da música selecionada, com transposição;
 *  · **documento inteiro** — todos os cantos do arquivo importado, em
 *    sequência, cada um com o seu tom, e uma navegação rápida por momento
 *    (Entrada → … → Final). É o modo da missa: o arquivo inteiro na mão.
 *
 * O tom tocado é guardado por música, à parte do tom original (que nunca
 * muda). Mudar o tom é rascunho até apertar **Salvar**; o "Tom salvo" só
 * aparece depois que a gravação confirma.
 */
export function CifrasView({
  songs, selectedSong, onSelectSong, onOpenDrive, onImportarCifra, onSubstituirCifra,
  onExcluirCifras, onModoPalco, onAviso,
}: CifrasViewProps) {
  const [gaveta, setGaveta] = useState<Gaveta>('nenhuma');
  const [busca, setBusca] = useState('');
  const [momento, setMomento] = useState<string | null>(null);
  const [modoPalco, setModoPalco] = useState(false);
  const [modoDocumento, setModoDocumento] = useState(false);
  const [telaLarga, setTelaLarga] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  const [mostrarControle, setMostrarControle] = useState(false);

  // Apagar é o único movimento sem volta desta tela, então nada acontece no
  // primeiro toque: o botão vira "confirmar?" e só o segundo apaga.
  const [confirmando, setConfirmando] = useState<string | null>(null);

  // Preferências de aparelho: sobrevivem ao fechar o app.
  const [favoritos, setFavoritos] = useLocal<string[]>('la:cifras-favoritas', []);
  const [velocidade, setVelocidade] = useLocal<number>('la:scroll-velocidade', VELOCIDADE_PADRAO);
  const [tamanho, setTamanho] = useLocal<number>('la:cifra-tamanho', 1);

  // O tom tocado, por música. Não é preferência de aparelho — é dado do
  // ministério — mas enquanto não há banco ligado, grava neste aparelho e a
  // tela diz isso. Modo manual: muda na tela, grava no Salvar.
  const tons = usePersistente<Record<string, number>>('la:cifras-tom', {}, { automatico: false });

  const idSelecionado = selectedSong?.id ?? '';
  const semitonsDe = useCallback((id: string) => tons.valor[id] ?? 0, [tons.valor]);
  const semitons = semitonsDe(idSelecionado);
  const tomAtual = selectedSong ? tomEscrito(selectedSong.key, semitons) : '';
  const capo = sugerirCapotraste(tomAtual);

  const { setValor: setTons, salvar: gravarTons } = tons;
  const definirSemitons = useCallback((id: string, valor: number) => {
    if (!id) return;
    setTons((atual) => ({ ...atual, [id]: normalizarSemitons(valor) }));
  }, [setTons]);

  const salvarTom = useCallback(async () => {
    const ok = await gravarTons();
    onAviso(ok ? 'Tom salvo com sucesso' : 'Não foi possível salvar o tom', ok ? 'ok' : 'erro');
  }, [gravarTons, onAviso]);

  const { rolando, alternar, parar, reiniciar } = useAutoScroll({
    velocidade,
    aoTerminar: () => setMostrarControle(true),
  });

  // Trocar de música com a rolagem ligada deixaria a cifra nova correndo do
  // meio; parar é o comportamento que não surpreende.
  useEffect(() => { parar(); }, [idSelecionado, parar]);

  useEffect(() => { onModoPalco(modoPalco); }, [modoPalco, onModoPalco]);

  // Girar o tablet muda a resposta, então não basta ler uma vez na montagem.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const aoMudar = (e: MediaQueryListEvent) => setTelaLarga(e.matches);
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);
  useEffect(() => () => onModoPalco(false), [onModoPalco]);

  const documentos = useMemo(() => agruparDocumentos(songs), [songs]);
  const documentoAtual = useMemo(
    () => (selectedSong?.documentoId ? documentos.find((d) => d.id === selectedSong.documentoId) ?? null : null),
    [documentos, selectedSong]
  );
  const emDocumento = modoDocumento && documentoAtual !== null && documentoAtual.cantos.length > 1;

  const tonsDoDocumento = useMemo(
    () => (documentoAtual ? new Set(documentoAtual.cantos.map((c) => tomEscrito(c.key, semitonsDe(c.id)))) : new Set<string>()),
    [documentoAtual, semitonsDe]
  );
  const tonsDiferentes = tonsDoDocumento.size > 1;

  /** Transposição geral: o mesmo deslocamento para todos os cantos do documento. */
  const transporTodas = (delta: number) => {
    if (!documentoAtual) return;
    tons.setValor((atual) => {
      const novo = { ...atual };
      for (const c of documentoAtual.cantos) novo[c.id] = normalizarSemitons((atual[c.id] ?? 0) + delta);
      return novo;
    });
  };

  const irParaCanto = (canto: LiturgicalSong) => {
    onSelectSong(canto);
    document.getElementById(`canto-${canto.id}`)?.scrollIntoView({ block: 'start' });
  };

  const sairDoPalco = useCallback(() => { setModoPalco(false); setGaveta('nenhuma'); }, []);

  // Atalhos de teclado — para quem ensaia com o notebook na estante.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (tons.sujo || tons.status === 'erro') void salvarTom();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === ' ') { e.preventDefault(); alternar(); setMostrarControle(true); return; }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVelocidade((v) => Math.min(v + 1, DEGRAUS_VELOCIDADE.length));
        setMostrarControle(true);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVelocidade((v) => Math.max(v - 1, 1));
        setMostrarControle(true);
        return;
      }
      if (e.key === '+' || e.key === '=') { definirSemitons(idSelecionado, semitons + 1); return; }
      if (e.key === '-') { definirSemitons(idSelecionado, semitons - 1); return; }
      if (e.key === 'Escape') {
        if (gaveta !== 'nenhuma') setGaveta('nenhuma');
        else if (modoPalco) sairDoPalco();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [alternar, definirSemitons, idSelecionado, semitons, gaveta, modoPalco, setVelocidade, salvarTom, tons.sujo, tons.status, sairDoPalco]);

  const filtradas = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return songs.filter((s) => {
      if (momento && s.part.toUpperCase() !== momento) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.part.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.lyricsPreview.toLowerCase().includes(q) ||
        s.fullChordText.toLowerCase().includes(q) ||
        (s.documentoTitulo ?? '').toLowerCase().includes(q)
      );
    });
  }, [songs, busca, momento]);

  const ehFavorita = favoritos.includes(idSelecionado);
  const alternarFavorita = (id: string) =>
    setFavoritos((atual) => (atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id]));

  const escalaTexto = ESCALA_TEXTO[tamanho] ?? 'text-sm';
  const mudarTamanho = (delta: number) => setTamanho((t) => Math.min(Math.max(t + delta, 0), TAMANHO_MAX));
  const mudarVelocidade = (delta: number) => {
    setVelocidade((v) => Math.min(Math.max(v + delta, 1), DEGRAUS_VELOCIDADE.length));
    setMostrarControle(true);
  };

  const paraRevisar = useMemo(() => (selectedSong ? contarRevisao(selectedSong.fullChordText) : 0), [selectedSong]);

  // Duas colunas só onde há largura sobrando e numa música só: no documento
  // inteiro cada canto já tem o seu bloco, e colunas misturariam dois cantos.
  const duasColunas = modoPalco && telaLarga && !emDocumento;

  // Repertório vazio. Depois de todos os ganchos, que não podem ficar atrás de um `if`.
  if (!selectedSong) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 px-6 py-20 max-w-md mx-auto">
        <span aria-hidden className="material-symbols-outlined text-5xl text-[#C9A24A]">library_music</span>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#7A2332]">O repertório está vazio</h2>
          <p className="text-sm text-[#5C4A3E] mt-1.5 leading-relaxed">
            Importe o arquivo da missa (Word, PDF ou foto) e cada canto entra aqui como uma música,
            com o seu próprio tom.
          </p>
        </div>
        <button
          onClick={onImportarCifra}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer"
        >
          <span aria-hidden className="material-symbols-outlined text-lg">upload_file</span>
          Importar cifra
        </button>
        <button
          onClick={onOpenDrive}
          className="text-xs font-bold text-[#5C4A3E] hover:text-[#7A2332] underline decoration-dotted cursor-pointer"
        >
          ou abrir a Biblioteca L&amp;A
        </button>
      </div>
    );
  }

  const tituloBarra = emDocumento ? documentoAtual!.titulo : selectedSong.title;
  const subtituloBarra = emDocumento
    ? `Documento inteiro · ${documentoAtual!.cantos.length} cantos`
    : selectedSong.part;

  /* ── Gaveta: escolher a música / o documento ─────────────────────────── */
  const gavetaMusicas = (
    <div className="border-t border-[#7A2332]/10 bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-2.5">
        {documentos.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E] shrink-0">Documento</span>
              <select
                value={documentoAtual?.id ?? ''}
                onChange={(e) => {
                  const doc = documentos.find((d) => d.id === e.target.value);
                  if (doc) { onSelectSong(doc.cantos[0]); setModoDocumento(true); }
                  else setModoDocumento(false);
                }}
                className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-[#7A2332]/20 bg-[#FFF9F2] text-sm text-[#2D2118] focus:outline-none cursor-pointer"
              >
                <option value="">— músicas avulsas —</option>
                {documentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.titulo} ({d.cantos.length} cantos)</option>
                ))}
              </select>
            </label>

            {documentoAtual && documentoAtual.cantos.length > 1 && (
              <div role="group" aria-label="Modo de leitura" className="flex rounded-xl border border-[#7A2332]/20 overflow-hidden shrink-0">
                {[{ v: false, r: 'Uma música' }, { v: true, r: 'Documento inteiro' }].map((o) => (
                  <button
                    key={String(o.v)}
                    onClick={() => setModoDocumento(o.v)}
                    aria-pressed={modoDocumento === o.v}
                    className={`px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      modoDocumento === o.v ? 'bg-[#7A2332] text-[#FFF9F2]' : 'bg-white text-[#5C4A3E] hover:bg-[#7A2332]/5'
                    }`}
                  >
                    {o.r}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {documentoAtual && documentoAtual.cantos.length > 1 && !emDocumento && (
          <label className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E] shrink-0">Canto</span>
            <select
              value={selectedSong.id}
              onChange={(e) => {
                const c = documentoAtual.cantos.find((x) => x.id === e.target.value);
                if (c) { onSelectSong(c); setGaveta('nenhuma'); }
              }}
              className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-[#7A2332]/20 bg-[#FFF9F2] text-sm text-[#2D2118] focus:outline-none cursor-pointer"
            >
              {documentoAtual.cantos.map((c) => (
                <option key={c.id} value={c.id}>{momentoCurto(c.part)} — {c.title}</option>
              ))}
            </select>
          </label>
        )}

        <div className="relative flex items-center">
          <span aria-hidden className="material-symbols-outlined absolute left-3 text-[#7A2332] text-lg">search</span>
          <input
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, tom, documento ou trecho da letra…"
            aria-label="Buscar cifra"
            className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#2D2118] outline-none focus:border-[#7A2332]"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute right-2 p-1 text-[#5C4A3E] hover:text-[#7A2332] cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filtrar por momento">
          {MOMENTOS.map((m) => (
            <button
              key={m}
              onClick={() => setMomento(momento === m ? null : m)}
              aria-pressed={momento === m}
              className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition cursor-pointer ${
                momento === m
                  ? 'bg-[#7A2332] text-white border-[#7A2332]'
                  : 'bg-white text-[#5C4A3E] border-[#7A2332]/15 hover:border-[#7A2332]/40'
              }`}
            >
              {momentoCurto(m)}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-1 max-h-[45vh] overflow-y-auto -mx-1 px-1">
          {filtradas.length === 0 && (
            <li className="text-sm text-[#5C4A3E] italic text-center py-6">Nenhuma cifra encontrada.</li>
          )}
          {filtradas.map((musica) => {
            const ativa = musica.id === idSelecionado;
            const tomSalvo = semitonsDe(musica.id);
            return (
              <li key={musica.id} className="flex items-center gap-1">
                <button
                  onClick={() => { onSelectSong(musica); setGaveta('nenhuma'); }}
                  aria-current={ativa ? 'true' : undefined}
                  className={`flex-1 min-w-0 flex items-center gap-2.5 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    ativa ? 'bg-[#7A2332] text-white' : 'bg-[#FFF9F2] hover:bg-[#7A2332]/10 text-[#2D2118]'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    ativa ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-[#7A2332]/10 text-[#7A2332]'
                  }`}>
                    {musica.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold truncate">{musica.title}</span>
                    <span className={`block text-[10px] truncate ${ativa ? 'text-amber-100' : 'text-[#5C4A3E]'}`}>
                      {musica.part} · tom {tomEscrito(musica.key, tomSalvo)}
                      {tomSalvo !== 0 && ` (original ${musica.key})`}
                      {musica.documentoTitulo && ` · ${musica.documentoTitulo}`}
                    </span>
                  </span>
                  {musica.revisada === false && (
                    <span
                      className="shrink-0 material-symbols-outlined text-base text-amber-600"
                      aria-label="Tem trechos para revisar"
                      title="Tem trechos para revisar"
                    >
                      warning
                    </span>
                  )}
                </button>
                <button
                  onClick={() => alternarFavorita(musica.id)}
                  aria-label={favoritos.includes(musica.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  aria-pressed={favoritos.includes(musica.id)}
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    favoritos.includes(musica.id) ? 'text-[#C9A24A]' : 'text-[#5C4A3E]/40 hover:text-[#C9A24A]'
                  }`}
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">
                    {favoritos.includes(musica.id) ? 'star' : 'star_border'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (confirmando === musica.id) { onExcluirCifras([musica.id]); setConfirmando(null); }
                    else setConfirmando(musica.id);
                  }}
                  onBlur={() => setConfirmando((c) => (c === musica.id ? null : c))}
                  aria-label={confirmando === musica.id ? `Confirmar exclusão de ${musica.title}` : `Excluir ${musica.title}`}
                  className={`shrink-0 h-9 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
                    confirmando === musica.id
                      ? 'px-2.5 bg-red-600 text-white text-[10px] font-bold'
                      : 'w-9 text-[#5C4A3E]/40 hover:text-red-600'
                  }`}
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">delete</span>
                  {confirmando === musica.id && 'Apagar?'}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => { setGaveta('nenhuma'); onImportarCifra(); }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-[#7A2332]/25 text-[#7A2332] text-xs font-bold hover:bg-[#7A2332]/5 transition cursor-pointer"
        >
          <span aria-hidden className="material-symbols-outlined text-lg">upload_file</span>
          Importar cifra (Word, PDF, foto ou texto)
        </button>

        {songs.length > 0 && (
          <button
            onClick={() => {
              if (confirmando === 'todas') {
                onExcluirCifras(filtradas.map((m) => m.id));
                setConfirmando(null);
                setGaveta('nenhuma');
              } else setConfirmando('todas');
            }}
            onBlur={() => setConfirmando((c) => (c === 'todas' ? null : c))}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              confirmando === 'todas' ? 'bg-red-600 text-white' : 'text-[#5C4A3E] hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <span aria-hidden className="material-symbols-outlined text-lg">delete_sweep</span>
            {confirmando === 'todas'
              ? `Apagar ${filtradas.length} ${filtradas.length === 1 ? 'cifra' : 'cifras'}? Toque de novo`
              : busca.trim() || momento
                ? `Excluir as ${filtradas.length} desta busca`
                : 'Excluir todas as cifras'}
          </button>
        )}
      </div>
    </div>
  );

  /* ── Gaveta: transposição ────────────────────────────────────────────── */
  const gavetaTom = (
    <div className="border-t border-[#7A2332]/10 bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">
              Tom original: {selectedSong.key}
            </p>
            <p className="font-serif text-2xl font-bold text-[#7A2332] leading-tight">
              Tocando em {tomAtual}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => definirSemitons(idSelecionado, semitons - 1)}
              aria-label="Descer meio tom"
              className="w-11 h-11 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined">remove</span>
            </button>
            <button
              onClick={() => definirSemitons(idSelecionado, semitons + 1)}
              aria-label="Subir meio tom"
              className="w-11 h-11 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Escolher o tom">
          {TONS.map((t) => {
            const ativo = t === tomAtual.replace(/m$/, '');
            return (
              <button
                key={t}
                onClick={() => definirSemitons(idSelecionado, semitonsEntre(selectedSong.key, t))}
                aria-pressed={ativo}
                className={`h-10 rounded-xl text-sm font-bold border transition cursor-pointer ${
                  ativo
                    ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                    : 'bg-[#FFF9F2] text-[#2D2118] border-[#7A2332]/15 hover:border-[#7A2332]/50'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          {capo ? (
            <p className="text-xs text-[#5C4A3E] flex items-center gap-1.5">
              <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-base">straighten</span>
              Capotraste na <strong className="text-[#7A2332]">{capo.casa}ª casa</strong> e toque as formas de{' '}
              <strong className="text-[#7A2332]">{capo.forma}</strong>
            </p>
          ) : (
            <p className="text-xs text-[#5C4A3E] flex items-center gap-1.5">
              <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-base">check_circle</span>
              Tom de forma fácil no violão, sem capotraste.
            </p>
          )}

          {semitons !== 0 && (
            <button
              onClick={() => definirSemitons(idSelecionado, 0)}
              className="text-xs font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
            >
              voltar ao tom original ({selectedSong.key})
            </button>
          )}
        </div>

        {/* Salvar: o tom vira rascunho até aqui. */}
        <div className="flex items-center justify-between gap-2 border-t border-[#7A2332]/10 pt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => void salvarTom()}
              disabled={!tons.sujo && tons.status !== 'erro'}
              className="h-10 px-4 rounded-xl bg-[#7A2332] text-[#FFF9F2] text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
            >
              <span aria-hidden className="material-symbols-outlined text-lg">save</span>
              Salvar tom
            </button>
            {tons.sujo && (
              <button
                onClick={tons.descartar}
                className="text-xs font-bold text-[#5C4A3E] hover:text-[#7A2332] underline decoration-dotted cursor-pointer"
              >
                descartar
              </button>
            )}
            <StatusSalvamento status={tons.status} erro={tons.erro} sujo={tons.sujo} textoSalvo="Tom salvo" />
          </div>
          <p className="text-[11px] text-[#5C4A3E]">
            {tons.alcance === 'aparelho'
              ? 'Salvo neste aparelho. Quando o banco do ministério estiver ligado, a equipe verá o mesmo tom.'
              : 'Salvo para toda a equipe.'}
          </p>
        </div>

        <p className="text-[11px] text-[#5C4A3E]">
          A transposição muda <strong>apenas os acordes</strong>. A letra e a posição de cada
          acorde sobre a sílaba ficam exatamente como foram importadas.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col w-full ${modoPalco ? 'pb-32' : 'pb-nav'}`}>
      {/* ── Barra: uma linha, sempre visível; no palco, completa ───────── */}
      <div
        className={`sticky z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#7A2332]/15 print:hidden ${
          modoPalco ? 'top-0' : 'top-16 md:top-16'
        }`}
      >
        {modoPalco ? (
          <BarraPalco
            titulo={tituloBarra}
            subtitulo={subtituloBarra}
            onAbrirMusicas={() => setGaveta(gaveta === 'musicas' ? 'nenhuma' : 'musicas')}
            tomOriginal={selectedSong.key}
            tomAtual={tomAtual}
            semitons={semitons}
            onSemitons={(d) => definirSemitons(idSelecionado, semitons + d)}
            onResetar={() => definirSemitons(idSelecionado, 0)}
            tamanho={tamanho}
            tamanhoMax={TAMANHO_MAX}
            onTamanho={mudarTamanho}
            rolando={rolando}
            onAlternarRolagem={() => { alternar(); setMostrarControle(true); }}
            velocidade={velocidade}
            onVelocidade={mudarVelocidade}
            status={tons.status}
            erro={tons.erro}
            sujo={tons.sujo}
            onSalvar={() => void salvarTom()}
            onSair={sairDoPalco}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-3 sm:px-5 h-14 flex items-center gap-2">
            <button
              onClick={() => setGaveta(gaveta === 'musicas' ? 'nenhuma' : 'musicas')}
              aria-expanded={gaveta === 'musicas'}
              className="flex-1 min-w-0 flex items-center gap-2 h-10 px-3 rounded-xl bg-white border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition text-left cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-lg shrink-0">library_music</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#7A2332] truncate leading-tight">{tituloBarra}</span>
                <span className="block text-[10px] uppercase tracking-wider text-[#5C4A3E] truncate">{subtituloBarra}</span>
              </span>
              <span aria-hidden className="material-symbols-outlined text-[#5C4A3E] text-lg shrink-0">
                {gaveta === 'musicas' ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <button
              onClick={() => setGaveta(gaveta === 'tom' ? 'nenhuma' : 'tom')}
              aria-expanded={gaveta === 'tom'}
              aria-label={`Tom atual ${tomAtual}${tons.sujo ? ', não salvo' : ''}. Abrir transposição`}
              className={`shrink-0 h-10 px-3 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                semitons !== 0
                  ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                  : 'bg-white text-[#7A2332] border-[#7A2332]/20 hover:border-[#7A2332]/50'
              }`}
            >
              <span className="font-serif text-lg font-bold leading-none">{tomAtual}</span>
              {semitons !== 0 && (
                <span className="text-[10px] font-bold opacity-80">{semitons > 0 ? `+${semitons}` : semitons}</span>
              )}
              {tons.sujo && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Tom não salvo" />}
            </button>

            <button
              onClick={() => { alternar(); setMostrarControle(true); }}
              aria-label={rolando ? 'Pausar rolagem automática' : 'Iniciar rolagem automática'}
              title={rolando ? 'Pausar (espaço)' : 'Rolar (espaço)'}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                rolando ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50'
              }`}
            >
              <span aria-hidden className="material-symbols-outlined text-xl">{rolando ? 'pause' : 'play_arrow'}</span>
            </button>

            <button
              onClick={() => window.print()}
              aria-label="Folha A4 para imprimir ou salvar em PDF"
              title="Folha A4 — imprimir ou salvar em PDF"
              className="shrink-0 w-10 h-10 rounded-xl hidden sm:flex items-center justify-center bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-xl">print</span>
            </button>

            <button
              onClick={() => { setModoPalco(true); setGaveta('nenhuma'); }}
              aria-label="Tela cheia (modo de palco)"
              title="Tela cheia"
              className="shrink-0 h-10 px-3 rounded-xl flex items-center gap-1 bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition cursor-pointer text-xs font-bold"
            >
              <span aria-hidden className="material-symbols-outlined text-xl">fullscreen</span>
              <span className="hidden md:inline">Tela cheia</span>
            </button>
          </div>
        )}

        {gaveta === 'musicas' && gavetaMusicas}
        {gaveta === 'tom' && !modoPalco && gavetaTom}

        {emDocumento && (
          <NavegacaoCantos cantos={documentoAtual!.cantos} ativoId={idSelecionado} onIr={irParaCanto} />
        )}
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      {emDocumento ? (
        <div className="mx-auto w-full max-w-4xl px-3 sm:px-5 py-5 flex flex-col gap-5 print:max-w-none print:p-0">
          {!modoPalco && (
            <header className="flex items-start justify-between gap-3 border-b border-[#7A2332]/15 pb-3 print:hidden">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#C9A24A] uppercase tracking-widest">Documento inteiro</p>
                <h2 className="font-serif text-2xl font-bold text-[#7A2332] leading-tight truncate">{documentoAtual!.titulo}</h2>
              </div>
              <button
                onClick={() => setModoDocumento(false)}
                className="shrink-0 text-xs font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
              >
                ver uma música só
              </button>
            </header>
          )}

          {tonsDiferentes ? (
            <div className="flex flex-wrap items-center gap-2 bg-[#C9A24A]/15 border border-[#C9A24A]/40 rounded-xl px-3 py-2.5 print:hidden">
              <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-base">info</span>
              <p className="text-xs text-[#7A2332] flex-1 min-w-[200px]">
                <strong>Este documento possui músicas em tons diferentes</strong> ({[...tonsDoDocumento].join(', ')}).
                Cada canto tem o seu controle; "todas" desloca cada uma pelo mesmo intervalo.
              </p>
              <div className="flex items-center gap-1" role="group" aria-label="Transpor todas as músicas">
                <button onClick={() => transporTodas(-1)} aria-label="Baixar meio tom em todas" className="h-9 px-2.5 rounded-lg bg-white border border-[#7A2332]/20 text-[#7A2332] text-xs font-bold cursor-pointer hover:border-[#7A2332]/50">− todas</button>
                <button onClick={() => transporTodas(1)} aria-label="Subir meio tom em todas" className="h-9 px-2.5 rounded-lg bg-white border border-[#7A2332]/20 text-[#7A2332] text-xs font-bold cursor-pointer hover:border-[#7A2332]/50">+ todas</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <p className="text-xs text-[#5C4A3E] flex-1">Todas as músicas estão em {[...tonsDoDocumento][0]}.</p>
              <div className="flex items-center gap-1" role="group" aria-label="Transpor todas as músicas">
                <button onClick={() => transporTodas(-1)} aria-label="Baixar meio tom em todas" className="h-9 px-2.5 rounded-lg bg-white border border-[#7A2332]/20 text-[#7A2332] text-xs font-bold cursor-pointer hover:border-[#7A2332]/50">− todas</button>
                <button onClick={() => transporTodas(1)} aria-label="Subir meio tom em todas" className="h-9 px-2.5 rounded-lg bg-white border border-[#7A2332]/20 text-[#7A2332] text-xs font-bold cursor-pointer hover:border-[#7A2332]/50">+ todas</button>
              </div>
            </div>
          )}

          {documentoAtual!.cantos.map((canto, i) => {
            const st = semitonsDe(canto.id);
            const tom = tomEscrito(canto.key, st);
            const selecionado = canto.id === idSelecionado;
            return (
              <section
                key={canto.id}
                id={`canto-${canto.id}`}
                aria-labelledby={`canto-${canto.id}-titulo`}
                onClick={() => { if (!selecionado) onSelectSong(canto); }}
                className={`scroll-mt-40 rounded-2xl border bg-white p-4 sm:p-6 print:border-0 print:p-0 print:rounded-none print:break-before-page ${
                  selecionado ? 'border-[#C9A24A] ring-1 ring-[#C9A24A]/40' : 'border-[#7A2332]/15'
                } ${escalaTexto}`}
              >
                <header className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#7A2332]/10">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-[#C9A24A] text-[#4D1721] text-xs font-bold flex items-center justify-center font-sans">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#C9A24A] uppercase tracking-widest font-sans">{momentoCurto(canto.part)}</p>
                      <h3 id={`canto-${canto.id}-titulo`} className="font-serif text-lg font-bold text-[#7A2332] leading-tight truncate">{canto.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-sans print:hidden" role="group" aria-label={`Tom de ${canto.title}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); definirSemitons(canto.id, st - 1); }}
                      aria-label="Descer meio tom"
                      className="w-9 h-9 rounded-lg border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 cursor-pointer"
                    >
                      <span aria-hidden className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className={`h-9 px-2.5 rounded-lg flex flex-col items-center justify-center leading-none ${st !== 0 ? 'bg-[#7A2332] text-[#FFF9F2]' : 'bg-[#FFF9F2] text-[#7A2332] border border-[#7A2332]/15'}`}>
                      <span className="font-serif text-base font-bold">{tom}</span>
                      {st !== 0 && <span className="text-[9px] uppercase tracking-wider opacity-80">orig. {canto.key}</span>}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); definirSemitons(canto.id, st + 1); }}
                      aria-label="Subir meio tom"
                      className="w-9 h-9 rounded-lg border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 cursor-pointer"
                    >
                      <span aria-hidden className="material-symbols-outlined text-lg">add</span>
                    </button>
                    {st !== 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); definirSemitons(canto.id, 0); }}
                        aria-label={`Voltar ao tom original ${canto.key}`}
                        title="Tom original"
                        className="w-9 h-9 rounded-lg border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 cursor-pointer"
                      >
                        <span aria-hidden className="material-symbols-outlined text-lg">restart_alt</span>
                      </button>
                    )}
                  </div>
                  <p className="hidden print:block text-[10pt] font-sans">
                    {st === 0 ? `Tom ${canto.key}` : `Escrita em ${canto.key} · tocando em ${tom}`}
                  </p>
                </header>
                <CifraAlinhada texto={canto.fullChordText} tomOriginal={canto.key} semitons={st} />
              </section>
            );
          })}

          {tons.sujo && !modoPalco && (
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => void salvarTom()}
                className="h-11 px-5 rounded-xl bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
              >
                <span aria-hidden className="material-symbols-outlined text-lg">save</span>
                Salvar tons
              </button>
              <StatusSalvamento status={tons.status} erro={tons.erro} sujo={tons.sujo} textoSalvo="Tons salvos" />
            </div>
          )}
        </div>
      ) : (
        <div className={`mx-auto w-full px-3 sm:px-5 py-6 print:max-w-none print:p-0 ${duasColunas ? 'max-w-6xl' : 'max-w-3xl'}`}>
          {/* Cabeçalho da folha A4. Só no papel. */}
          <header className="hidden print:block mb-4 pb-2 border-b border-black">
            <h2 className="font-serif text-xl font-bold">{selectedSong.title}</h2>
            <p className="text-[10pt] mt-0.5">
              {selectedSong.part}
              {' · '}
              {semitons === 0 ? `Tom ${selectedSong.key}` : `Escrita em ${selectedSong.key} · tocando em ${tomAtual}`}
            </p>
            <p className="text-[8pt] mt-1">Ministério Louvor &amp; Aliança · Paróquia São Judas Tadeu — Americana/SP</p>
          </header>

          {!modoPalco && (
            <header className="mb-5 flex items-start justify-between gap-3 border-b border-[#7A2332]/15 pb-4 print:hidden">
              <div className="min-w-0">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A2332] leading-tight">{selectedSong.title}</h2>
                <p className="text-[11px] font-bold text-[#C9A24A] uppercase tracking-widest mt-1">
                  {selectedSong.part} · {selectedSong.season || 'Tempo Comum'}
                  {selectedSong.documentoTitulo && <span className="normal-case tracking-normal text-[#5C4A3E] font-normal"> · {selectedSong.documentoTitulo}</span>}
                </p>
                <p className="text-[11px] text-[#5C4A3E] mt-1">
                  Tom original: <strong className="text-[#7A2332]">{selectedSong.key}</strong>
                  {semitons !== 0 && <> · Tom usado: <strong className="text-[#7A2332]">{tomAtual}</strong></>}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {selectedSong.youtubeUrl && (
                  <a
                    href={selectedSong.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ouvir áudio de referência"
                    title="Ouvir áudio de referência"
                    className="w-10 h-10 rounded-xl bg-white border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:border-[#7A2332]/50 transition"
                  >
                    <span aria-hidden className="material-symbols-outlined text-lg">headphones</span>
                  </a>
                )}
                <button
                  onClick={() => alternarFavorita(selectedSong.id)}
                  aria-label={ehFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  aria-pressed={ehFavorita}
                  title={ehFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    ehFavorita ? 'bg-[#C9A24A] text-white border-[#C9A24A]' : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:text-[#C9A24A]'
                  }`}
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">{ehFavorita ? 'star' : 'star_border'}</span>
                </button>
              </div>
            </header>
          )}

          {paraRevisar > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 print:hidden">
              <span aria-hidden className="material-symbols-outlined text-amber-700 text-base">warning</span>
              <p className="text-xs text-amber-900 flex-1 min-w-[200px]">
                Esta cifra tem {paraRevisar === 1 ? '1 trecho marcado' : `${paraRevisar} trechos marcados`} como{' '}
                <strong>REVISÃO NECESSÁRIA</strong> — o que está lá é o que veio do arquivo, sem nada inventado.
              </p>
              {!modoPalco && (
                <button
                  onClick={() => onSubstituirCifra(selectedSong)}
                  className="text-xs font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                >
                  corrigir agora
                </button>
              )}
            </div>
          )}

          <div className={`bg-white rounded-2xl border border-[#7A2332]/15 p-4 sm:p-6 print:border-0 print:p-0 print:rounded-none ${escalaTexto}`}>
            <CifraAlinhada
              texto={selectedSong.fullChordText}
              tomOriginal={selectedSong.key}
              semitons={semitons}
              duasColunas={duasColunas}
            />
          </div>

          {!modoPalco && (
            <div className="mt-3 flex items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">Letra</span>
                <button
                  onClick={() => mudarTamanho(-1)}
                  disabled={tamanho === 0}
                  aria-label="Diminuir o tamanho da letra"
                  className="w-8 h-8 rounded-lg border border-[#7A2332]/20 bg-white text-[#7A2332] flex items-center justify-center disabled:opacity-30 hover:border-[#7A2332]/50 transition cursor-pointer"
                >
                  <span aria-hidden className="material-symbols-outlined text-sm">text_decrease</span>
                </button>
                <button
                  onClick={() => mudarTamanho(1)}
                  disabled={tamanho === TAMANHO_MAX}
                  aria-label="Aumentar o tamanho da letra"
                  className="w-8 h-8 rounded-lg border border-[#7A2332]/20 bg-white text-[#7A2332] flex items-center justify-center disabled:opacity-30 hover:border-[#7A2332]/50 transition cursor-pointer"
                >
                  <span aria-hidden className="material-symbols-outlined text-sm">text_increase</span>
                </button>
              </div>

              <button
                onClick={() => onSubstituirCifra(selectedSong)}
                className="text-[11px] font-bold text-[#5C4A3E] hover:text-[#7A2332] underline decoration-dotted cursor-pointer"
              >
                Corrigir esta cifra
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Rodapé: acervo. Fora do caminho de quem só quer tocar ───────── */}
      {!modoPalco && (
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-5 pb-8 grid sm:grid-cols-2 gap-2.5 print:hidden">
          <button
            onClick={onImportarCifra}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">upload_file</span>
            Importar cifra
          </button>
          <button
            onClick={onOpenDrive}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-white text-[#7A2332] border border-[#7A2332]/20 text-sm font-bold hover:border-[#7A2332]/50 transition cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">folder_open</span>
            Biblioteca L&amp;A
          </button>
        </div>
      )}

      {(mostrarControle || rolando) && (
        <ControleVelocidade
          rolando={rolando}
          velocidade={velocidade}
          onVelocidade={setVelocidade}
          onAlternar={alternar}
          onReiniciar={reiniciar}
          onFechar={() => { parar(); setMostrarControle(false); }}
          acimaDaNavegacao={!modoPalco}
        />
      )}
    </div>
  );
}
