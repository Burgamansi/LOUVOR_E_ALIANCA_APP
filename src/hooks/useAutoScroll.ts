import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Rolagem automática com velocidade regulável.
 *
 * O motor antigo era `setInterval(() => scrollBy(1), 40)`: um pixel de cada
 * vez, a cada 40 ms. Isso tem três defeitos que aparecem justamente no palco:
 *
 *  1. a granularidade mínima é 1 px por tique, então "mais devagar" só existe
 *     aumentando o intervalo — e aí a rolagem vira soluço visível;
 *  2. o intervalo não acompanha o refresh da tela, então o passo cai fora do
 *     frame e treme;
 *  3. um pixel por tique é uma velocidade só. Não dá para ter 10.
 *
 * Aqui a velocidade é declarada em **pixels por segundo** e o passo é
 * calculado pelo tempo real decorrido entre frames (`requestAnimationFrame`).
 * A fração de pixel que sobra é acumulada, não descartada — é o que permite
 * rolar a 8 px/s sem engasgo num aparelho de 120 Hz.
 */

/**
 * Os 10 degraus do controle, em px/s.
 *
 * A curva é geométrica, não linear: perto do começo, 4 px/s de diferença já se
 * percebe; lá em cima, não. Degraus iguais em px dariam metade do controle
 * inútil. Referência prática: o degrau 4 (≈34 px/s) acompanha uma música
 * moderada de 4 minutos numa cifra de tela e meia.
 */
export const DEGRAUS_VELOCIDADE = [8, 14, 22, 34, 48, 66, 88, 116, 150, 195] as const;

export const VELOCIDADE_PADRAO = 4;

/** Rótulo humano do degrau — o músico pensa em música, não em pixel. */
export function rotuloVelocidade(degrau: number): string {
  if (degrau <= 2) return 'Bem lento';
  if (degrau <= 4) return 'Lento';
  if (degrau <= 6) return 'Moderado';
  if (degrau <= 8) return 'Rápido';
  return 'Bem rápido';
}

interface OpcoesAutoScroll {
  /** Degrau de 1 a 10. */
  velocidade: number;
  /** Chamado quando a rolagem termina sozinha (chegou ao fim da cifra). */
  aoTerminar?: () => void;
}

export function useAutoScroll({ velocidade, aoTerminar }: OpcoesAutoScroll) {
  const [rolando, setRolando] = useState(false);

  const frame = useRef<number | null>(null);
  const ultimoTempo = useRef<number>(0);
  const restoDePixel = useRef<number>(0);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  // A velocidade vive numa ref para que mexer no controle no meio da música não
  // reinicie o loop — sem isso, cada toque no slider derruba e recria o rAF, e
  // a rolagem dá um solavanco bem no meio do refrão.
  const pxPorSegundo = useRef(DEGRAUS_VELOCIDADE[VELOCIDADE_PADRAO - 1]);
  useEffect(() => {
    const i = Math.min(Math.max(Math.round(velocidade), 1), DEGRAUS_VELOCIDADE.length) - 1;
    pxPorSegundo.current = DEGRAUS_VELOCIDADE[i];
  }, [velocidade]);

  const aoTerminarRef = useRef(aoTerminar);
  useEffect(() => { aoTerminarRef.current = aoTerminar; }, [aoTerminar]);

  const parar = useCallback(() => setRolando(false), []);
  const alternar = useCallback(() => setRolando((r) => !r), []);

  useEffect(() => {
    if (!rolando) return;

    ultimoTempo.current = performance.now();
    restoDePixel.current = 0;

    const passo = (agora: number) => {
      const delta = (agora - ultimoTempo.current) / 1000;
      ultimoTempo.current = agora;

      // Aba em segundo plano devolve deltas enormes no retorno; limitar em
      // 100 ms evita o pulo de meia tela quando a pessoa volta pro app.
      const avanco = pxPorSegundo.current * Math.min(delta, 0.1) + restoDePixel.current;
      const inteiro = Math.floor(avanco);
      restoDePixel.current = avanco - inteiro;

      if (inteiro > 0) {
        const antes = window.scrollY;
        window.scrollBy(0, inteiro);

        // Não se mexeu: chegou ao fim da página. Parar sozinho é melhor do que
        // deixar um botão vermelho piscando enquanto nada acontece.
        if (window.scrollY === antes) {
          setRolando(false);
          aoTerminarRef.current?.();
          return;
        }
      }

      frame.current = requestAnimationFrame(passo);
    };

    frame.current = requestAnimationFrame(passo);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [rolando]);

  // Tela acesa enquanto rola. Um celular apoiado na estante bloqueia em 30 s —
  // e a mão do músico está no instrumento, não na tela.
  useEffect(() => {
    let cancelado = false;

    const pedir = async () => {
      if (!('wakeLock' in navigator)) return;
      try {
        const sentinela = await navigator.wakeLock.request('screen');
        if (cancelado) { void sentinela.release(); return; }
        wakeLock.current = sentinela;
      } catch { /* negado ou sem suporte: seguir sem manter a tela acesa */ }
    };

    const soltar = () => {
      void wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };

    if (rolando) void pedir(); else soltar();

    // Voltar de segundo plano invalida o wake lock; é preciso pedir de novo.
    const aoVoltar = () => {
      if (rolando && document.visibilityState === 'visible' && !wakeLock.current) void pedir();
    };
    document.addEventListener('visibilitychange', aoVoltar);

    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', aoVoltar);
      soltar();
    };
  }, [rolando]);

  return { rolando, alternar, parar, iniciar: () => setRolando(true) };
}
