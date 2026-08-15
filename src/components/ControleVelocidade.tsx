import { DEGRAUS_VELOCIDADE, rotuloVelocidade } from '../hooks/useAutoScroll';

interface ControleVelocidadeProps {
  rolando: boolean;
  velocidade: number;
  onVelocidade: (v: number) => void;
  onAlternar: () => void;
  onFechar: () => void;
  /** Sobe a barra para não cobrir a navegação inferior no celular. */
  acimaDaNavegacao?: boolean;
}

const MAX = DEGRAUS_VELOCIDADE.length;

/**
 * Barra de rolagem automática — o "pedal" da cifra.
 *
 * Três decisões de uso, todas vindas do contexto: o músico está de pé, com o
 * instrumento na mão, e olha para isto por meio segundo.
 *
 *  · **Play/pause é o maior alvo da barra.** É o que se aperta no meio do
 *    verso quando o padre resolve falar. 56 px, canto esquerdo, sempre no
 *    mesmo lugar — não muda de posição quando o estado muda.
 *  · **A velocidade tem duas formas de ajuste.** Os botões −/+ são para o
 *    ajuste fino com o polegar sem olhar; o slider é para saltar de "bem
 *    lento" para "rápido" de uma vez. Quem usa luva de palco ou tem a mão
 *    ocupada usa os botões; quem está sentado ensaiando usa o slider.
 *  · **O número tem nome.** "6" não diz nada; "6 · Moderado" diz. O degrau
 *    aparece junto porque é o que se combina entre músicos ("põe no 4").
 *
 * Ajustar a velocidade não interrompe a rolagem: o novo valor entra no próximo
 * quadro, sem solavanco.
 */
export function ControleVelocidade({
  rolando, velocidade, onVelocidade, onAlternar, onFechar, acimaDaNavegacao = true,
}: ControleVelocidadeProps) {
  const mudar = (delta: number) =>
    onVelocidade(Math.min(Math.max(velocidade + delta, 1), MAX));

  return (
    <div
      className={`fixed inset-x-0 z-40 px-3 pointer-events-none ${
        acimaDaNavegacao ? 'bottom-20 md:bottom-6' : 'bottom-4'
      }`}
    >
      <div className="pointer-events-auto mx-auto max-w-md flex items-center gap-2 rounded-full bg-[#4D1721] text-[#FFF9F2] shadow-2xl shadow-black/30 border border-[#C9A24A]/30 pl-2 pr-3 py-2">
        {/* Play / pause */}
        <button
          onClick={onAlternar}
          aria-label={rolando ? 'Pausar rolagem' : 'Iniciar rolagem'}
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
            rolando ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-[#FFF9F2] text-[#7A2332]'
          }`}
        >
          <span aria-hidden className="material-symbols-outlined text-2xl">
            {rolando ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Ajuste fino + slider */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A24A]">
              Velocidade
            </span>
            <span className="text-[11px] font-bold tabular-nums">
              {velocidade} · {rotuloVelocidade(velocidade)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => mudar(-1)}
              disabled={velocidade <= 1}
              aria-label="Diminuir a velocidade"
              className="shrink-0 w-7 h-7 rounded-full border border-[#FFF9F2]/30 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-base">remove</span>
            </button>

            <input
              type="range"
              min={1}
              max={MAX}
              step={1}
              value={velocidade}
              onChange={(e) => onVelocidade(Number(e.target.value))}
              aria-label="Velocidade da rolagem automática"
              aria-valuetext={`${velocidade} de ${MAX}, ${rotuloVelocidade(velocidade)}`}
              className="flex-1 min-w-0 h-1.5 accent-[#C9A24A] cursor-pointer"
            />

            <button
              onClick={() => mudar(1)}
              disabled={velocidade >= MAX}
              aria-label="Aumentar a velocidade"
              className="shrink-0 w-7 h-7 rounded-full border border-[#FFF9F2]/30 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
            >
              <span aria-hidden className="material-symbols-outlined text-base">add</span>
            </button>
          </div>
        </div>

        <button
          onClick={onFechar}
          aria-label="Fechar o controle de rolagem"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
        >
          <span aria-hidden className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Atalhos: quem ensaia com o notebook aberto na estante não quer mirar
          num botão de 12 px com o mouse. Escondido no celular, onde não existe. */}
      <p className="hidden md:block text-center text-[10px] text-[#5C4A3E] mt-1.5 pointer-events-none">
        <kbd className="font-bold">espaço</kbd> toca ou pausa ·
        <kbd className="font-bold"> ↑ ↓ </kbd> ajustam a velocidade
      </p>
    </div>
  );
}
