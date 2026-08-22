import { StatusSalvamento } from './StatusSalvamento';
import type { StatusSalvamento as Status } from '../lib/repositorio/tipos';
import { rotuloVelocidade, DEGRAUS_VELOCIDADE } from '../hooks/useAutoScroll';

interface BarraPalcoProps {
  /** O que está aberto: a música, ou o documento inteiro. */
  titulo: string;
  subtitulo: string;
  onAbrirMusicas: () => void;

  tomOriginal: string;
  tomAtual: string;
  semitons: number;
  onSemitons: (delta: number) => void;
  onResetar: () => void;

  tamanho: number;
  tamanhoMax: number;
  onTamanho: (delta: number) => void;

  rolando: boolean;
  onAlternarRolagem: () => void;
  velocidade: number;
  onVelocidade: (delta: number) => void;

  status: Status;
  erro: string | null;
  sujo: boolean;
  onSalvar: () => void;

  onSair: () => void;
}

const BOTAO = 'shrink-0 h-11 min-w-11 px-2.5 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';
const BOTAO_CLARO = `${BOTAO} bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50`;

/**
 * A barra do modo de palco: tudo o que se mexe durante a missa, numa linha
 * (duas no celular), com botões de 44 px.
 *
 * A ordem segue a frequência de uso no altar: música e tom à esquerda (o que
 * se confere de relance), rolagem no meio (o que se aperta no meio do verso),
 * salvar e sair à direita (o que se faz uma vez).
 */
export function BarraPalco({
  titulo, subtitulo, onAbrirMusicas,
  tomOriginal, tomAtual, semitons, onSemitons, onResetar,
  tamanho, tamanhoMax, onTamanho,
  rolando, onAlternarRolagem, velocidade, onVelocidade,
  status, erro, sujo, onSalvar,
  onSair,
}: BarraPalcoProps) {
  const transposta = semitons !== 0;

  return (
    <div
      role="toolbar"
      aria-label="Controles do modo de palco"
      className="print:hidden"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-4 py-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Música / documento */}
        <button
          onClick={onAbrirMusicas}
          className="flex-1 min-w-[160px] basis-full sm:basis-auto h-11 px-3 rounded-xl bg-white border border-[#7A2332]/20 hover:border-[#7A2332]/50 transition text-left cursor-pointer flex items-center gap-2"
          aria-label={`${titulo}. Trocar de música`}
          title="Trocar de música"
        >
          <span aria-hidden className="material-symbols-outlined text-[#C9A24A] text-lg shrink-0">library_music</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#7A2332] truncate leading-tight">{titulo}</span>
            <span className="block text-[10px] uppercase tracking-wider text-[#5C4A3E] truncate">{subtitulo}</span>
          </span>
          <span aria-hidden className="material-symbols-outlined text-[#5C4A3E] text-lg shrink-0">expand_more</span>
        </button>

        {/* Tom */}
        <div role="group" aria-label="Tom" className="flex items-center gap-1">
          <button
            onClick={() => onSemitons(-1)}
            className={BOTAO_CLARO}
            aria-label="Baixar meio tom"
            title="Baixar meio tom (−)"
          >
            <span aria-hidden className="material-symbols-outlined">remove</span>
          </button>

          <div
            className={`h-11 px-3 rounded-xl flex flex-col items-center justify-center leading-none ${
              transposta ? 'bg-[#7A2332] text-[#FFF9F2]' : 'bg-white text-[#7A2332] border border-[#7A2332]/20'
            }`}
            aria-live="polite"
          >
            <span className="font-serif text-xl font-bold">{tomAtual}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">
              {transposta ? `orig. ${tomOriginal}` : 'tom original'}
            </span>
          </div>

          <button
            onClick={() => onSemitons(1)}
            className={BOTAO_CLARO}
            aria-label="Subir meio tom"
            title="Subir meio tom (+)"
          >
            <span aria-hidden className="material-symbols-outlined">add</span>
          </button>

          <button
            onClick={onResetar}
            disabled={!transposta}
            className={`${BOTAO_CLARO} text-xs font-bold`}
            aria-label={`Voltar ao tom original ${tomOriginal}`}
            title="Voltar ao tom original"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">restart_alt</span>
            <span className="hidden md:inline">Original</span>
          </button>
        </div>

        {/* Fonte */}
        <div role="group" aria-label="Tamanho da letra" className="flex items-center gap-1">
          <button
            onClick={() => onTamanho(-1)}
            disabled={tamanho <= 0}
            className={BOTAO_CLARO}
            aria-label="Diminuir a letra"
            title="Letra menor"
          >
            <span aria-hidden className="material-symbols-outlined">text_decrease</span>
          </button>
          <button
            onClick={() => onTamanho(1)}
            disabled={tamanho >= tamanhoMax}
            className={BOTAO_CLARO}
            aria-label="Aumentar a letra"
            title="Letra maior"
          >
            <span aria-hidden className="material-symbols-outlined">text_increase</span>
          </button>
        </div>

        {/* Rolagem */}
        <div role="group" aria-label="Rolagem automática" className="flex items-center gap-1">
          <button
            onClick={onAlternarRolagem}
            className={`${BOTAO} ${rolando ? 'bg-[#C9A24A] text-[#4D1721]' : 'bg-white text-[#7A2332] border border-[#7A2332]/20 hover:border-[#7A2332]/50'}`}
            aria-label={rolando ? 'Pausar rolagem automática' : 'Iniciar rolagem automática'}
            title={rolando ? 'Pausar (espaço)' : 'Rolar (espaço)'}
          >
            <span aria-hidden className="material-symbols-outlined text-xl">{rolando ? 'pause' : 'play_arrow'}</span>
          </button>
          <button
            onClick={() => onVelocidade(-1)}
            disabled={velocidade <= 1}
            className={BOTAO_CLARO}
            aria-label="Rolar mais devagar"
            title="Mais devagar (↓)"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">keyboard_double_arrow_down</span>
          </button>
          <span
            className="h-11 px-2 rounded-xl bg-white border border-[#7A2332]/20 text-[#2D2118] flex flex-col items-center justify-center leading-none min-w-[52px]"
            aria-label={`Velocidade ${velocidade} de ${DEGRAUS_VELOCIDADE.length}, ${rotuloVelocidade(velocidade)}`}
          >
            <span className="text-sm font-bold tabular-nums">{velocidade}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#5C4A3E]">{rotuloVelocidade(velocidade)}</span>
          </span>
          <button
            onClick={() => onVelocidade(1)}
            disabled={velocidade >= DEGRAUS_VELOCIDADE.length}
            className={BOTAO_CLARO}
            aria-label="Rolar mais rápido"
            title="Mais rápido (↑)"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">keyboard_double_arrow_up</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Salvar + sair */}
        <div className="flex items-center gap-2">
          <StatusSalvamento status={status} erro={erro} sujo={sujo} textoSalvo="Tom salvo" />
          <button
            onClick={onSalvar}
            disabled={!sujo && status !== 'erro'}
            className={`${BOTAO} px-4 text-sm font-bold ${
              sujo || status === 'erro'
                ? 'bg-[#7A2332] text-[#FFF9F2] hover:brightness-110'
                : 'bg-white text-[#5C4A3E] border border-[#7A2332]/20'
            }`}
            aria-label="Salvar o tom desta música"
            title="Salvar o tom (Ctrl+S)"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">save</span>
            <span className="hidden sm:inline">Salvar</span>
          </button>
          <button
            onClick={onSair}
            className={`${BOTAO_CLARO} px-3 text-sm font-bold`}
            aria-label="Sair da tela cheia"
            title="Sair da tela cheia (Esc)"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">close_fullscreen</span>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
