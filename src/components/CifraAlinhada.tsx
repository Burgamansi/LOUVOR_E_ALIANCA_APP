import { useEffect, useMemo, useRef, useState } from 'react';
import { analisarCifra } from '../lib/cifras/parser';
import { transporCifra } from '../lib/cifras/render';
import { tomEscrito } from '../lib/cifras/acordes';

interface CifraAlinhadaProps {
  texto: string;
  tomOriginal: string;
  semitons: number;
  className?: string;
}

/**
 * Exibe a cifra com cada acorde ancorado na coluna da sílaba.
 *
 * O acorde é posicionado em `left: {col}ch` sobre a linha de letra, em fonte
 * monoespaçada. A letra é impressa tal como veio, sem nenhuma reescrita — então
 * mudar o tom não desloca uma vírgula. É a diferença entre isto e reescrever a
 * linha de acordes: 'C' vira 'Db' e ganha um caractere, mas a âncora continua
 * na mesma coluna.
 */
export function CifraAlinhada({ texto, tomOriginal, semitons, className = '' }: CifraAlinhadaProps) {
  const cifra = useMemo(() => {
    const base = analisarCifra(texto, tomOriginal || 'C', 'manual');
    if (semitons === 0) return base;
    // O destino sai na grafia da tela (Ab, não G#) e é ele que decide se os
    // acordes saem com bemol — a mesma decisão que a barra de tons exibe.
    return transporCifra(base, tomEscrito(base.tomOriginal, semitons));
  }, [texto, tomOriginal, semitons]);

  // A linha de cifra não pode quebrar: o acorde é posicionado em `left: {col}ch`
  // sobre a letra, e uma quebra jogaria o acorde para cima da sílaba errada.
  // Então ela rola para o lado — só que o app esconde toda barra de rolagem no
  // CSS (index.css, ::-webkit-scrollbar), e no celular a linha simplesmente
  // termina no meio da palavra sem nada avisar que há mais. Esta sombra na
  // borda é a barra de rolagem que falta.
  const caixa = useRef<HTMLDivElement>(null);
  const conteudo = useRef<HTMLDivElement>(null);
  const [temMais, setTemMais] = useState(false);

  useEffect(() => {
    const el = caixa.current;
    const dentro = conteudo.current;
    if (!el || !dentro) return;

    const medir = () => setTemMais(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    medir();
    el.addEventListener('scroll', medir, { passive: true });

    // Os dois precisam ser observados. A caixa muda de largura quando a janela
    // gira; o conteúdo muda quando o A+ aumenta a letra — e nesse caso a caixa
    // fica exatamente do mesmo tamanho, então observar só ela não dispara nada
    // e a sombra nunca aparece justo quando a linha passou a não caber.
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    observador.observe(dentro);

    return () => {
      el.removeEventListener('scroll', medir);
      observador.disconnect();
    };
  }, [cifra]);

  return (
    <div className="relative">
      {temMais && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 flex items-center justify-end bg-gradient-to-l from-white via-white/85 to-transparent"
        >
          <span className="material-symbols-outlined text-[#7A2332]/45 text-xl">chevron_right</span>
        </div>
      )}

      <div ref={caixa} className={`font-mono leading-6 overflow-x-auto ${className}`}>
        <div ref={conteudo} className="min-w-max">
        {cifra.linhas.map((linha, i) => {
          if (linha.tipo === 'vazia') return <div key={i} className="h-4" />;

          if (linha.tipo === 'secao') {
            return (
              <div key={i} className="mt-4 mb-1 font-sans text-xs font-bold uppercase tracking-wider text-[#C9A24A]">
                {linha.rotulo}
              </div>
            );
          }

          if (linha.tipo === 'acordes') {
            return (
              <div key={i} className="relative h-6 mb-2">
                {linha.acordes.map((a) => (
                  <span
                    key={`${a.col}-${a.acorde}`}
                    style={{ left: `${a.col}ch` }}
                    className="absolute top-0 text-[#7A2332] font-bold whitespace-pre"
                  >
                    {a.acorde}
                  </span>
                ))}
              </div>
            );
          }

          if (linha.tipo === 'letra') {
            const temAcordes = linha.acordes.length > 0;
            return (
              <div
                key={i}
                className={`relative whitespace-pre text-[#2D2118] ${temAcordes ? 'mt-6' : ''}`}
              >
                {linha.acordes.map((a) => (
                  <span
                    key={`${a.col}-${a.acorde}`}
                    style={{ left: `${a.col}ch` }}
                    className="absolute -top-5 text-[#7A2332] font-bold"
                  >
                    {a.acorde}
                  </span>
                ))}
                {linha.texto}
              </div>
            );
          }

          return <div key={i} className="text-[#5C4A3E] italic">{linha.texto}</div>;
        })}
        </div>
      </div>
    </div>
  );
}
