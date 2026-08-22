import type { StatusSalvamento as Status } from '../lib/repositorio/tipos';

interface StatusSalvamentoProps {
  status: Status;
  erro?: string | null;
  /** Há mudança ainda não gravada (modo manual). */
  sujo?: boolean;
  /** Texto do estado "salvo" — "Salvo", "Tom salvo", "Atualizado e salvo". */
  textoSalvo?: string;
  className?: string;
}

/**
 * O estado da gravação, em palavras: "Salvando…", "Salvo", "Não foi possível
 * salvar", "Não salvo". Aparece ao lado do que está sendo gravado.
 *
 * `aria-live` faz o leitor de tela anunciar a mudança sem roubar o foco —
 * o músico pode estar com o foco no seletor de tom quando o "Salvo" chega.
 */
export function StatusSalvamento({
  status, erro, sujo = false, textoSalvo = 'Salvo', className = '',
}: StatusSalvamentoProps) {
  const base = `inline-flex items-center gap-1 text-[11px] font-bold whitespace-nowrap ${className}`;

  if (status === 'salvando') {
    return (
      <span role="status" aria-live="polite" className={`${base} text-[#5C4A3E]`}>
        <span aria-hidden className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        Salvando…
      </span>
    );
  }
  if (status === 'erro') {
    return (
      <span role="alert" className={`${base} text-red-700`} title={erro ?? undefined}>
        <span aria-hidden className="material-symbols-outlined text-sm">error</span>
        Não foi possível salvar
      </span>
    );
  }
  if (status === 'salvo') {
    return (
      <span role="status" aria-live="polite" className={`${base} text-emerald-700`}>
        <span aria-hidden className="material-symbols-outlined text-sm">check_circle</span>
        {textoSalvo}
      </span>
    );
  }
  if (sujo) {
    return (
      <span role="status" aria-live="polite" className={`${base} text-amber-700`}>
        <span aria-hidden className="material-symbols-outlined text-sm">edit</span>
        Não salvo
      </span>
    );
  }
  return null;
}
