import { useEffect, useState } from 'react';
import { resolverPreview, atributosDoIframe } from '../lib/preview';

interface VisualizadorDocumentoProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  /** URL do documento. Para arquivo do Drive, passe também `driveFileId`. */
  url: string;
  driveFileId?: string | null;
  subtitulo?: string;
}

/**
 * Visualização rápida, estilo Quick Look: abre o documento por cima da tela,
 * sem baixar nada.
 *
 * A prévia embutida depende de duas coisas que não controlamos — o navegador
 * liberar cookie de terceiro e o arquivo estar compartilhado por link. Quando
 * qualquer uma falha, o Google devolve a tela "permita os cookies" dentro do
 * iframe, e não há evento que nos avise: o conteúdo é de outra origem e o
 * `onload` dispara igual, porque a tela de erro *também* carregou.
 *
 * Então em vez de tentar detectar a falha, damos a saída sempre à mão: o botão
 * de abrir no Drive fica visível em qualquer tamanho de tela, e alguns segundos
 * depois aparece a faixa com o plano B — a primeira página como imagem, que
 * passa por um endereço de imagem e não depende de cookie nenhum.
 *
 * `Esc` fecha, o fundo escurece e o scroll da página trava enquanto está aberto.
 */
export function VisualizadorDocumento({
  aberto, onFechar, titulo, url, driveFileId, subtitulo,
}: VisualizadorDocumentoProps) {
  const [plano, setPlano] = useState<'incorporado' | 'imagem'>('incorporado');
  const [mostrarSocorro, setMostrarSocorro] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', aoTeclar);
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto, onFechar]);

  // Reabrir precisa voltar ao plano principal — quem caiu na imagem uma vez não
  // deve ficar preso a ela no próximo documento.
  useEffect(() => {
    if (!aberto) return;
    setPlano('incorporado');
    setMostrarSocorro(false);
    const t = window.setTimeout(() => setMostrarSocorro(true), 4000);
    return () => window.clearTimeout(t);
  }, [aberto, url]);

  if (!aberto) return null;

  const preview = resolverPreview(url, driveFileId);
  const atributos = atributosDoIframe(preview);
  const temImagem = Boolean(preview.miniatura);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm p-2 sm:p-6"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={`Pré-visualização: ${titulo}`}
    >
      <div
        className="flex flex-col w-full h-full max-w-5xl mx-auto bg-[#FFF9F2] rounded-2xl overflow-hidden shadow-2xl border border-[#C9A24A]/40"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-[#4D1721] text-[#FFF9F2] shrink-0">
          <span aria-hidden className="material-symbols-outlined text-[#C9A24A] hidden sm:inline">visibility</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-bold truncate">{titulo}</h3>
            {subtitulo && <p className="text-xs text-[#C9A24A] truncate">{subtitulo}</p>}
          </div>

          {/* Saída de emergência — visível em qualquer tela. Abrir em aba nova é
              contexto de primeira parte: funciona mesmo com cookie de terceiro
              bloqueado, que é justamente quando a pessoa mais precisa dele. */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir no Drive"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full border border-[#C9A24A]/50 hover:bg-[#C9A24A]/15 transition"
          >
            <span aria-hidden className="material-symbols-outlined text-base">open_in_new</span>
            <span className="hidden sm:inline">Abrir no Drive</span>
          </a>

          <button
            onClick={onFechar}
            aria-label="Fechar pré-visualização"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 min-h-0 bg-[#2D2118] relative">
          {plano === 'imagem' && preview.miniatura ? (
            <div className="h-full overflow-auto flex items-start justify-center p-3">
              <img
                src={preview.miniatura}
                alt={`Primeira página de ${titulo}`}
                className="max-w-full rounded-lg shadow-lg bg-white"
              />
            </div>
          ) : preview.src ? (
            <iframe {...atributos} className="w-full h-full border-0" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-8 text-[#FFF9F2]">
              <span aria-hidden className="material-symbols-outlined text-5xl text-[#C9A24A]">visibility_off</span>
              <p className="text-sm max-w-sm">
                Este endereço não tem pré-visualização. Abra direto na origem para conferir.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A24A] text-[#2D2118] text-sm font-bold"
              >
                <span aria-hidden className="material-symbols-outlined text-base">open_in_new</span>
                Abrir
              </a>
            </div>
          )}

          {/* Faixa de socorro: aparece sozinha depois de alguns segundos, sem
              cobrir o documento de quem carregou normalmente. */}
          {mostrarSocorro && preview.src && (
            <div className="absolute inset-x-2 bottom-2 sm:inset-x-4 sm:bottom-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-black/75 backdrop-blur-sm px-3 py-2.5 text-[#FFF9F2] shadow-lg">
              <span className="text-[11px] sm:text-xs mr-1">
                {plano === 'imagem' ? 'Vendo a primeira página como imagem.' : 'Não carregou o documento?'}
              </span>

              {plano === 'incorporado' && temImagem && (
                <button
                  onClick={() => setPlano('imagem')}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#C9A24A] text-[#2D2118] hover:brightness-110 transition cursor-pointer"
                >
                  Ver como imagem
                </button>
              )}
              {plano === 'imagem' && (
                <button
                  onClick={() => setPlano('incorporado')}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/40 hover:bg-white/10 transition cursor-pointer"
                >
                  Tentar de novo
                </button>
              )}

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/40 hover:bg-white/10 transition"
              >
                Abrir em nova aba
              </a>

              <button
                onClick={() => setMostrarSocorro(false)}
                aria-label="Dispensar aviso"
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer"
              >
                <span aria-hidden className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        <footer className="px-4 py-2 text-[11px] text-[#5C4A3E] bg-[#FFF9F2] border-t border-[#7A2332]/10 shrink-0">
          {preview.modo === 'drive' && (
            <>
              Prévia do Google Drive. Se pedir login ou cookies, o arquivo precisa estar
              compartilhado como <strong>“qualquer pessoa com o link”</strong> — ou o navegador
              está bloqueando cookies de terceiros, e aí vale abrir em nova aba.
            </>
          )}
          {preview.modo === 'office' && <>Pré-visualização pelo Office Online.</>}
          {preview.modo === 'nativo' && <>Pré-visualização nativa do navegador.</>}
        </footer>
      </div>
    </div>
  );
}
