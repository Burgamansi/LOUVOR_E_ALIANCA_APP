import { useCallback, useEffect, useRef, useState } from 'react';

export type TipoAviso = 'ok' | 'apagou' | 'erro';

export interface AvisoAtual {
  texto: string;
  tipo: TipoAviso;
  /** Muda a cada aviso para o mesmo texto reaparecer e reiniciar o relógio. */
  chave: number;
}

/**
 * Confirmação do que acabou de acontecer.
 *
 * Salvar e apagar não davam retorno nenhum: a gaveta fechava e a pessoa ficava
 * sem saber se o toque valeu. Com exclusão isso é pior — dá para tocar de novo
 * achando que não pegou.
 */
export function useAviso() {
  const [aviso, setAviso] = useState<AvisoAtual | null>(null);
  const contador = useRef(0);

  const mostrar = useCallback((texto: string, tipo: TipoAviso = 'ok') => {
    contador.current += 1;
    setAviso({ texto, tipo, chave: contador.current });
  }, []);

  return { aviso, mostrar, fechar: useCallback(() => setAviso(null), []) };
}

interface AvisoProps {
  aviso: AvisoAtual | null;
  onFechar: () => void;
}

const CORES: Record<TipoAviso, string> = {
  ok: 'bg-[#7A2332] text-[#FFF9F2] border-[#C9A24A]/50',
  apagou: 'bg-[#2D2118] text-[#FFF9F2] border-[#C9A24A]/40',
  erro: 'bg-red-700 text-white border-red-300/50',
};

const ICONES: Record<TipoAviso, string> = {
  ok: 'check_circle',
  apagou: 'delete',
  erro: 'error',
};

/**
 * A tarja fica acima da navegação de baixo, que é onde o polegar já está, e
 * some sozinha em quatro segundos — tempo de ler sem virar entulho na tela.
 */
export function Aviso({ aviso, onFechar }: AvisoProps) {
  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(onFechar, 4000);
    return () => window.clearTimeout(t);
  }, [aviso, onFechar]);

  if (!aviso) return null;

  return (
    <div
      // 'polite' e não 'assertive': é confirmação do que a pessoa fez, não
      // emergência — não deve cortar o que o leitor de tela está falando.
      role="status"
      aria-live="polite"
      key={aviso.chave}
      className="fixed inset-x-0 bottom-20 md:bottom-6 z-[70] flex justify-center px-4 pointer-events-none print:hidden"
    >
      <div
        className={`flex items-center gap-2.5 max-w-md w-fit px-4 py-3 rounded-2xl border shadow-lg pointer-events-auto ${CORES[aviso.tipo]}`}
      >
        <span aria-hidden className="material-symbols-outlined text-lg shrink-0">
          {ICONES[aviso.tipo]}
        </span>
        <span className="text-sm font-semibold">{aviso.texto}</span>
        <button
          onClick={onFechar}
          aria-label="Fechar aviso"
          className="shrink-0 ml-1 opacity-70 hover:opacity-100 cursor-pointer"
        >
          <span aria-hidden className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
}
