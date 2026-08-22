import type { LiturgicalSong } from '../types';

interface NavegacaoCantosProps {
  cantos: LiturgicalSong[];
  ativoId: string | null;
  onIr: (canto: LiturgicalSong) => void;
}

/** Nome curto do momento, para caber num chip. */
export function momentoCurto(momento: string): string {
  const m = momento.toUpperCase();
  const curtos: Record<string, string> = {
    'ENTRADA': 'Entrada',
    'ATO PENITENCIAL': 'Penitencial',
    'GLÓRIA': 'Glória',
    'SALMO': 'Salmo',
    'ACLAMAÇÃO': 'Aclamação',
    'OFERTÓRIO': 'Ofertório',
    'SANTO': 'Santo',
    'CORDEIRO': 'Cordeiro',
    'COMUNHÃO': 'Comunhão',
    'PÓS-COMUNHÃO': 'Pós-Comunhão',
    'FINAL': 'Final',
    'OUTRO': 'Outro',
  };
  return curtos[m] ?? momento;
}

/**
 * Navegação rápida entre os cantos do documento: Entrada · Penitencial ·
 * Glória · … · Final. Um toque rola até o canto.
 *
 * Vive dentro do mesmo bloco grudado da barra, logo abaixo dela, e rola para
 * o lado no celular: durante a missa a pessoa precisa do Santo agora, não de
 * uma lista para abrir.
 */
export function NavegacaoCantos({ cantos, ativoId, onIr }: NavegacaoCantosProps) {
  if (cantos.length < 2) return null;

  return (
    <nav aria-label="Cantos do documento" className="border-t border-[#7A2332]/10 print:hidden">
      <ol className="mx-auto max-w-7xl px-2 sm:px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto">
        {cantos.map((c, i) => {
          const ativo = c.id === ativoId;
          return (
            <li key={c.id} className="shrink-0">
              <button
                onClick={() => onIr(c)}
                aria-current={ativo ? 'true' : undefined}
                aria-label={`${momentoCurto(c.part)}: ${c.title}`}
                title={c.title}
                className={`h-9 px-3 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  ativo
                    ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                    : 'bg-white text-[#5C4A3E] border-[#7A2332]/15 hover:border-[#7A2332]/40'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${
                  ativo ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-[#7A2332]/10 text-[#7A2332]'
                }`}>
                  {i + 1}
                </span>
                {momentoCurto(c.part)}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
