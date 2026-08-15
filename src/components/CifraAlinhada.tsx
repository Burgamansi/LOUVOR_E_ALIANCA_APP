import { useMemo } from 'react';
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

  return (
    <div className={`font-mono leading-6 overflow-x-auto ${className}`}>
      <div className="min-w-max">
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
  );
}
