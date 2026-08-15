import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LiturgicalSong } from '../types';
import {
  TONS, semitonsEntre, tomEscrito, normalizarSemitons,
} from '../lib/cifras/acordes';
import { sugerirCapotraste } from '../lib/cifras/capotraste';
import { useLocal } from '../hooks/useLocal';
import { useAutoScroll, VELOCIDADE_PADRAO, DEGRAUS_VELOCIDADE } from '../hooks/useAutoScroll';
import { CifraAlinhada } from './CifraAlinhada';
import { ControleVelocidade } from './ControleVelocidade';

interface CifrasViewProps {
  songs: LiturgicalSong[];
  selectedSong: LiturgicalSong;
  onSelectSong: (song: LiturgicalSong) => void;
  onOpenDrive: () => void;
  onImportarCifra: () => void;
  onSubstituirCifra: (song: LiturgicalSong) => void;
  /** Avisa o App para recolher cabeçalho e navegação no modo de palco. */
  onModoPalco: (ativo: boolean) => void;
}

const MOMENTOS = ['ENTRADA', 'ATO PENITENCIAL', 'GLÓRIA', 'SALMO', 'OFERTÓRIO', 'COMUNHÃO', 'FINAL'];

type Gaveta = 'nenhuma' | 'musicas' | 'tom';

/**
 * Cifras & Repertório.
 *
 * A tela anterior empilhava três ferramentas que faziam a mesma coisa sem se
 * falar: a cifra da música selecionada com um transpositor, logo abaixo um
 * segundo painel com a *sua própria* cifra de exemplo e o *seu próprio*
 * transpositor (e era só ali que se importava .docx — o arquivo importado
 * nunca chegava ao repertório), e no fim um terceiro caminho para colar cifra.
 * Quem chegava novo não tinha como saber qual dos dois seletores de tom valia.
 *
 * Aqui existe um estado só — a música selecionada e o tom em que ela está sendo
 * tocada — e cada ferramenta atua sobre ele.
 *
 * A outra mudança é de espaço. A barra fixa ocupava cerca de 280 px: no celular
 * a pessoa via a busca, os filtros, o seletor e a régua de tons antes do
 * primeiro acorde. Agora a barra tem uma linha e os controles moram em gavetas
 * que abrem sob demanda — porque a proporção certa numa tela de cifra é quase
 * toda cifra.
 */
export function CifrasView({
  songs, selectedSong, onSelectSong, onOpenDrive, onImportarCifra, onSubstituirCifra, onModoPalco,
}: CifrasViewProps) {
  const [gaveta, setGaveta] = useState<Gaveta>('nenhuma');
  const [busca, setBusca] = useState('');
  const [momento, setMomento] = useState<string | null>(null);
  const [modoPalco, setModoPalco] = useState(false);
  const [telaLarga, setTelaLarga] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  const [mostrarControle, setMostrarControle] = useState(false);

  // Preferências de aparelho: sobrevivem ao fechar o app.
  const [favoritos, setFavoritos] = useLocal<string[]>('la:cifras-favoritas', []);
  const [velocidade, setVelocidade] = useLocal<number>('la:scroll-velocidade', VELOCIDADE_PADRAO);
  const [tamanho, setTamanho] = useLocal<number>('la:cifra-tamanho', 1);
  // O tom fica guardado por música: a equipe canta "Como é bom" em A há dois
  // anos: reajustar toda missa é trabalho que o app pode poupar.
  const [tonsSalvos, setTonsSalvos] = useLocal<Record<string, number>>('la:cifras-tom', {});

  const semitons = tonsSalvos[selectedSong.id] ?? 0;
  const tomAtual = tomEscrito(selectedSong.key, semitons);
  const capo = sugerirCapotraste(tomAtual);

  const definirSemitons = useCallback((valor: number) => {
    setTonsSalvos((atual) => ({ ...atual, [selectedSong.id]: normalizarSemitons(valor) }));
  }, [selectedSong.id, setTonsSalvos]);

  const { rolando, alternar, parar } = useAutoScroll({
    velocidade,
    aoTerminar: () => setMostrarControle(true),
  });

  // Trocar de música com a rolagem ligada deixaria a cifra nova correndo do
  // meio; parar é o comportamento que não surpreende.
  useEffect(() => { parar(); }, [selectedSong.id, parar]);

  useEffect(() => { onModoPalco(modoPalco); }, [modoPalco, onModoPalco]);

  // Girar o tablet muda a resposta, então não basta ler uma vez na montagem.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const aoMudar = (e: MediaQueryListEvent) => setTelaLarga(e.matches);
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);
  useEffect(() => () => onModoPalco(false), [onModoPalco]);

  // Atalhos de teclado — para quem ensaia com o notebook na estante.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;

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
      if (e.key === '+' || e.key === '=') { definirSemitons(semitons + 1); return; }
      if (e.key === '-') { definirSemitons(semitons - 1); return; }
      if (e.key === 'Escape') {
        if (gaveta !== 'nenhuma') setGaveta('nenhuma');
        else if (modoPalco) setModoPalco(false);
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [alternar, definirSemitons, semitons, gaveta, modoPalco, setVelocidade]);

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
        s.fullChordText.toLowerCase().includes(q)
      );
    });
  }, [songs, busca, momento]);

  const ehFavorita = favoritos.includes(selectedSong.id);
  const alternarFavorita = (id: string) =>
    setFavoritos((atual) => (atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id]));

  const escalaTexto = ['text-[13px]', 'text-sm', 'text-base', 'text-lg', 'text-xl'][tamanho] ?? 'text-sm';

  // Duas colunas só onde há largura sobrando. Num tablet deitado a cifra usava
  // 654 px de 1024 e sobravam 370 em branco; em duas colunas o canto inteiro
  // cabe sem rolar, que é o ponto de ler no atril. No celular a coluna ficaria
  // mais estreita que a linha e cortaria a letra ao meio, então nem se oferece.
  const duasColunas = modoPalco && telaLarga;

  return (
    <div className={`flex flex-col w-full ${modoPalco ? 'pb-32' : 'pb-nav'}`}>
      {/* ── Barra do músico: uma linha, sempre visível ────────────────────── */}
      <div
        className={`sticky z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#7A2332]/15 print:hidden ${
          modoPalco ? 'top-0' : 'top-16 md:top-16'
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-5 h-14 flex items-center gap-2">
          {/* Seletor de música */}
          <button
            onClick={() => setGaveta(gaveta === 'musicas' ? 'nenhuma' : 'musicas')}
            aria-expanded={gaveta === 'musicas'}
            className="flex-1 min-w-0 flex items-center gap-2 h-10 px-3 rounded-xl bg-white border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition text-left cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-lg shrink-0">library_music</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#7A2332] truncate leading-tight">
                {selectedSong.title}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-[#5C4A3E] truncate">
                {selectedSong.part}
              </span>
            </span>
            <span aria-hidden className="material-symbols-outlined text-[#5C4A3E] text-lg shrink-0">
              {gaveta === 'musicas' ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Tom — o número grande é o que se procura de relance */}
          <button
            onClick={() => setGaveta(gaveta === 'tom' ? 'nenhuma' : 'tom')}
            aria-expanded={gaveta === 'tom'}
            aria-label={`Tom atual ${tomAtual}. Abrir transposição`}
            className={`shrink-0 h-10 px-3 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
              semitons !== 0
                ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                : 'bg-white text-[#7A2332] border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            <span className="font-serif text-lg font-bold leading-none">{tomAtual}</span>
            {semitons !== 0 && (
              <span className="text-[10px] font-bold opacity-80">
                {semitons > 0 ? `+${semitons}` : semitons}
              </span>
            )}
          </button>

          {/* Rolagem */}
          <button
            onClick={() => { alternar(); setMostrarControle(true); }}
            aria-label={rolando ? 'Pausar rolagem automática' : 'Iniciar rolagem automática'}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              rolando ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            <span aria-hidden className="material-symbols-outlined text-xl">{rolando ? 'pause' : 'play_arrow'}</span>
          </button>

          {/* Folha A4 — imprimir ou salvar em PDF é a mesma caixa de diálogo
              no celular e no computador, e é o caminho que funciona em qualquer
              aparelho para levar a cifra ao atril. */}
          <button
            onClick={() => window.print()}
            aria-label="Folha A4 para imprimir ou salvar em PDF"
            title="Folha A4 — imprimir ou salvar em PDF"
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-xl">print</span>
          </button>

          {/* Palco */}
          <button
            onClick={() => { setModoPalco(!modoPalco); setGaveta('nenhuma'); }}
            aria-label={modoPalco ? 'Sair do modo de palco' : 'Modo de palco'}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              modoPalco ? 'bg-[#7A2332] text-[#FFF9F2]' : 'bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            <span aria-hidden className="material-symbols-outlined text-xl">
              {modoPalco ? 'close_fullscreen' : 'fullscreen'}
            </span>
          </button>
        </div>

        {/* ── Gaveta: escolher a música ──────────────────────────────────── */}
        {gaveta === 'musicas' && (
          <div className="border-t border-[#7A2332]/10 bg-white">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-2.5">
              <div className="relative flex items-center">
                <span aria-hidden className="material-symbols-outlined absolute left-3 text-[#7A2332] text-lg">search</span>
                <input
                  autoFocus
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, tom ou trecho da letra…"
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

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                {MOMENTOS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMomento(momento === m ? null : m)}
                    className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition cursor-pointer ${
                      momento === m
                        ? 'bg-[#7A2332] text-white border-[#7A2332]'
                        : 'bg-white text-[#5C4A3E] border-[#7A2332]/15 hover:border-[#7A2332]/40'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <ul className="flex flex-col gap-1 max-h-[45vh] overflow-y-auto -mx-1 px-1">
                {filtradas.length === 0 && (
                  <li className="text-sm text-[#5C4A3E] italic text-center py-6">
                    Nenhuma cifra encontrada.
                  </li>
                )}
                {filtradas.map((musica) => {
                  const ativa = musica.id === selectedSong.id;
                  const tomSalvo = tonsSalvos[musica.id] ?? 0;
                  return (
                    <li key={musica.id} className="flex items-center gap-1">
                      <button
                        onClick={() => { onSelectSong(musica); setGaveta('nenhuma'); }}
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
                            {tomSalvo !== 0 && ' (transposta)'}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => alternarFavorita(musica.id)}
                        aria-label={favoritos.includes(musica.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                          favoritos.includes(musica.id) ? 'text-[#C9A24A]' : 'text-[#5C4A3E]/40 hover:text-[#C9A24A]'
                        }`}
                      >
                        <span aria-hidden className="material-symbols-outlined text-lg">
                          {favoritos.includes(musica.id) ? 'star' : 'star_border'}
                        </span>
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
                Importar cifra do Word ou colar texto
              </button>
            </div>
          </div>
        )}

        {/* ── Gaveta: transposição ───────────────────────────────────────── */}
        {gaveta === 'tom' && (
          <div className="border-t border-[#7A2332]/10 bg-white">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 flex flex-col gap-3">
              {/* Estado atual + passo de meio tom, lado a lado */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">
                    Escrita em {selectedSong.key}
                  </p>
                  <p className="font-serif text-2xl font-bold text-[#7A2332] leading-tight">
                    Tocando em {tomAtual}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => definirSemitons(semitons - 1)}
                    aria-label="Descer meio tom"
                    className="w-11 h-11 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
                  >
                    <span aria-hidden className="material-symbols-outlined">remove</span>
                  </button>
                  <button
                    onClick={() => definirSemitons(semitons + 1)}
                    aria-label="Subir meio tom"
                    className="w-11 h-11 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
                  >
                    <span aria-hidden className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Os 12 tons */}
              <div className="grid grid-cols-6 gap-1.5">
                {TONS.map((t) => {
                  const ativo = t === tomAtual.replace(/m$/, '');
                  return (
                    <button
                      key={t}
                      onClick={() => definirSemitons(semitonsEntre(selectedSong.key, t))}
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
                {/* Capotraste: a pergunta que o violonista faz sozinho toda vez */}
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
                    onClick={() => definirSemitons(0)}
                    className="text-xs font-bold text-[#7A2332] underline decoration-dotted cursor-pointer"
                  >
                    voltar ao tom original ({selectedSong.key})
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#5C4A3E] border-t border-[#7A2332]/10 pt-2">
                A transposição muda <strong>apenas os acordes</strong>. A letra e a posição de cada
                acorde sobre a sílaba ficam exatamente como foram importadas — e o tom escolhido
                fica guardado nesta música.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── A cifra ─────────────────────────────────────────────────────── */}
      <div className={`mx-auto w-full px-3 sm:px-5 py-6 print:max-w-none print:p-0 ${
        duasColunas ? 'max-w-6xl' : 'max-w-3xl'
      }`}>
        {/* Cabeçalho da folha A4. Só no papel: o atril precisa saber que canto
            é, em que tom está sendo tocado e de quem é a folha, porque a folha
            se solta do aplicativo e vai parar na pasta de outra pessoa. */}
        <header className="hidden print:block mb-4 pb-2 border-b border-black">
          <h2 className="font-serif text-xl font-bold">{selectedSong.title}</h2>
          <p className="text-[10pt] mt-0.5">
            {selectedSong.part}
            {' · '}
            {semitons === 0
              ? `Tom ${selectedSong.key}`
              : `Escrita em ${selectedSong.key} · tocando em ${tomAtual}`}
          </p>
          <p className="text-[8pt] mt-1">
            Ministério Louvor &amp; Aliança · Paróquia São Judas Tadeu — Americana/SP
          </p>
        </header>

        {!modoPalco && (
          <header className="mb-5 flex items-start justify-between gap-3 border-b border-[#7A2332]/15 pb-4 print:hidden">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A2332] leading-tight">
                {selectedSong.title}
              </h2>
              <p className="text-[11px] font-bold text-[#C9A24A] uppercase tracking-widest mt-1">
                {selectedSong.part} · {selectedSong.season || 'Tempo Comum'}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {selectedSong.youtubeUrl && (
                <a
                  href={selectedSong.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ouvir áudio de referência"
                  className="w-10 h-10 rounded-xl bg-white border border-[#7A2332]/20 text-[#7A2332] flex items-center justify-center hover:border-[#7A2332]/50 transition"
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">headphones</span>
                </a>
              )}
              <button
                onClick={() => alternarFavorita(selectedSong.id)}
                aria-label={ehFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  ehFavorita
                    ? 'bg-[#C9A24A] text-white border-[#C9A24A]'
                    : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:text-[#C9A24A]'
                }`}
              >
                <span aria-hidden className="material-symbols-outlined text-lg">{ehFavorita ? 'star' : 'star_border'}</span>
              </button>
            </div>
          </header>
        )}

        <div className={`bg-white rounded-2xl border border-[#7A2332]/15 p-4 sm:p-6 print:border-0 print:p-0 print:rounded-none ${escalaTexto}`}>
          <CifraAlinhada
            texto={selectedSong.fullChordText}
            tomOriginal={selectedSong.key}
            semitons={semitons}
            duasColunas={duasColunas}
          />
        </div>

        {/* Tamanho da letra: perto da cifra, que é onde a dúvida aparece */}
        <div className="mt-3 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">Letra</span>
            <button
              onClick={() => setTamanho((t) => Math.max(t - 1, 0))}
              disabled={tamanho === 0}
              aria-label="Diminuir o tamanho da letra"
              className="w-8 h-8 rounded-lg border border-[#7A2332]/20 bg-white text-[#7A2332] flex items-center justify-center disabled:opacity-30 hover:border-[#7A2332]/50 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-sm">text_decrease</span>
            </button>
            <button
              onClick={() => setTamanho((t) => Math.min(t + 1, 4))}
              disabled={tamanho === 4}
              aria-label="Aumentar o tamanho da letra"
              className="w-8 h-8 rounded-lg border border-[#7A2332]/20 bg-white text-[#7A2332] flex items-center justify-center disabled:opacity-30 hover:border-[#7A2332]/50 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-sm">text_increase</span>
            </button>
          </div>

          {!modoPalco && (
            <button
              onClick={() => onSubstituirCifra(selectedSong)}
              className="text-[11px] font-bold text-[#5C4A3E] hover:text-[#7A2332] underline decoration-dotted cursor-pointer"
            >
              Corrigir esta cifra
            </button>
          )}
        </div>
      </div>

      {/* ── Rodapé: acervo. Fora do caminho de quem só quer tocar ───────── */}
      {!modoPalco && (
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-5 pb-8 grid sm:grid-cols-2 gap-2.5 print:hidden">
          <button
            onClick={onImportarCifra}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">upload_file</span>
            Importar cifra do Word
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
          onFechar={() => { parar(); setMostrarControle(false); }}
          acimaDaNavegacao={!modoPalco}
        />
      )}
    </div>
  );
}
