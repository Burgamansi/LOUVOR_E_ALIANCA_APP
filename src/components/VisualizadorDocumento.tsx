import { useEffect } from 'react';
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
 * sem baixar nada. PDF, Word e PowerPoint que moram no Drive são renderizados
 * pelo próprio visualizador do Drive.
 *
 * `Esc` fecha, o fundo escurece e o scroll da página trava enquanto está aberto
 * — é o que faz parecer nativo em vez de "mais uma aba".
 */
export function VisualizadorDocumento({
  aberto, onFechar, titulo, url, driveFileId, subtitulo,
}: VisualizadorDocumentoProps) {
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

  if (!aberto) return null;

  const preview = resolverPreview(url, driveFileId);
  const atributos = atributosDoIframe(preview);

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
        <header className="flex items-center gap-3 px-4 py-3 bg-[#4D1721] text-[#FFF9F2] shrink-0">
          <span className="material-symbols-outlined text-[#C9A24A]">visibility</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-bold truncate">{titulo}</h3>
            {subtitulo && <p className="text-xs text-[#C9A24A] truncate">{subtitulo}</p>}
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#C9A24A]/50 hover:bg-[#C9A24A]/15 transition"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Abrir no Drive
          </a>

          <button
            onClick={onFechar}
            aria-label="Fechar pré-visualização"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 min-h-0 bg-[#2D2118]">
          {preview.src ? (
            <iframe {...atributos} className="w-full h-full border-0" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-8 text-[#FFF9F2]">
              <span className="material-symbols-outlined text-5xl text-[#C9A24A]">visibility_off</span>
              <p className="text-sm max-w-sm">
                Este endereço não tem pré-visualização. Abra direto na origem para conferir.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A24A] text-[#2D2118] text-sm font-bold"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Abrir
              </a>
            </div>
          )}
        </div>

        <footer className="px-4 py-2 text-[11px] text-[#5C4A3E] bg-[#FFF9F2] border-t border-[#7A2332]/10 shrink-0">
          {preview.modo === 'drive' && (
            <>Pré-visualização do Google Drive. Se aparecer uma tela de login, o arquivo ainda não está compartilhado como “qualquer pessoa com o link”.</>
          )}
          {preview.modo === 'office' && <>Pré-visualização pelo Office Online.</>}
          {preview.modo === 'nativo' && <>Pré-visualização nativa do navegador.</>}
        </footer>
      </div>
    </div>
  );
}
