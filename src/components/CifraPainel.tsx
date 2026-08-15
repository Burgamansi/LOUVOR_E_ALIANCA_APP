import { useMemo, useRef, useState } from 'react';
import { analisarCifra } from '../lib/cifras/parser';
import { transporCifra, campoHarmonico, renderizar } from '../lib/cifras/render';
import { TONS, semitonsEntre, tomTransposto, prefereBemol } from '../lib/cifras/acordes';
import type { Cifra } from '../lib/cifras/tipos';

const EXEMPLO = `[Intro]
G   D/F#  Em   C

G          C         G
Como é bom a gente se encontrar
       D7                    G
Neste lugar onde o amor de Deus reluz
E a paz que vem de Ti nos faz cantar
   Am        D7        G
Aleluia, aleluia, aleluia!`;

interface CifraPainelProps {
  /** Cifra inicial. Se vier em texto, é convertida na montagem. */
  textoInicial?: string;
  tomInicial?: string;
  titulo?: string;
}

/**
 * Painel de cifra: importa, exibe alinhado e transpõe.
 *
 * O acorde é posicionado em `left: {col}ch` sobre a letra, em fonte
 * monoespaçada. Assim a largura do acorde não empurra nada — 'C' e 'C#'
 * ancoram no mesmo ponto — e a letra nunca é reescrita.
 */
export function CifraPainel({
  textoInicial = EXEMPLO,
  tomInicial = 'G',
  titulo = 'Como É Bom A Gente Se Encontrar',
}: CifraPainelProps) {
  const [cifraBase, setCifraBase] = useState<Cifra>(() => analisarCifra(textoInicial, tomInicial, 'manual'));
  const [tom, setTom] = useState(tomInicial);
  const [importando, setImportando] = useState(false);
  const [erroImport, setErroImport] = useState<string | null>(null);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [textoColado, setTextoColado] = useState('');
  const inputArquivo = useRef<HTMLInputElement>(null);

  const cifra = useMemo(() => transporCifra(cifraBase, tom), [cifraBase, tom]);
  const linhas = useMemo(() => renderizar(cifra), [cifra]);
  const acordes = useMemo(() => campoHarmonico(cifra), [cifra]);
  const semitons = semitonsEntre(cifraBase.tomOriginal, tom);

  const mover = (passos: number) => {
    const novo = tomTransposto(tom, passos, prefereBemol(tom));
    const index = TONS.findIndex((t) => t === novo);
    setTom(index >= 0 ? TONS[index] : novo);
  };

  const carregarTexto = (texto: string, origem: Cifra['origem']) => {
    setCifraBase(analisarCifra(texto, cifraBase.tomOriginal, origem));
    setTom(cifraBase.tomOriginal);
  };

  const aoEscolherArquivo = async (arquivo: File) => {
    setErroImport(null);
    setImportando(true);
    try {
      if (/\.docx$/i.test(arquivo.name)) {
        // Carregado sob demanda: o mammoth só entra no bundle de quem importa
        // um .docx, não no carregamento inicial do app.
        const mammoth = await import('mammoth');
        const buffer = await arquivo.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        carregarTexto(value, 'docx');
      } else {
        carregarTexto(await arquivo.text(), 'txt');
      }
    } catch (e) {
      setErroImport(
        e instanceof Error ? e.message : 'Não consegui ler este arquivo.'
      );
    } finally {
      setImportando(false);
      if (inputArquivo.current) inputArquivo.current.value = '';
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-[#7A2332]/15 shadow-xs overflow-hidden">
      {/* Cabeçalho e controles */}
      <header className="p-4 bg-[#FFF9F2] border-b border-[#7A2332]/10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-[#7A2332] font-bold truncate">{titulo}</h3>
            <p className="text-xs text-[#5C4A3E]">
              Escrita em <strong>{cifraBase.tomOriginal}</strong>
              {semitons !== 0 && (
                <> · tocando em <strong className="text-[#7A2332]">{tom}</strong> ({semitons > 0 ? '+' : ''}{semitons} semitons)</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => mover(-1)}
              aria-label="Descer meio tom"
              className="w-9 h-9 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">remove</span>
            </button>
            <span className="w-14 text-center font-serif text-xl font-bold text-[#7A2332]">{tom}</span>
            <button
              onClick={() => mover(1)}
              aria-label="Subir meio tom"
              className="w-9 h-9 rounded-full border border-[#7A2332]/25 text-[#7A2332] flex items-center justify-center hover:bg-[#7A2332]/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
            </button>
          </div>
        </div>

        {/* Seletor de tom */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TONS.map((t) => (
            <button
              key={t}
              onClick={() => setTom(t)}
              className={`shrink-0 min-w-9 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                tom === t
                  ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                  : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
              }`}
            >
              {t}
            </button>
          ))}
          {semitons !== 0 && (
            <button
              onClick={() => setTom(cifraBase.tomOriginal)}
              className="shrink-0 ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7A2332] underline decoration-dotted cursor-pointer"
            >
              tom original
            </button>
          )}
        </div>

        {/* Campo harmônico */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C4A3E]">
            Campo harmônico
          </span>
          {acordes.map((a) => (
            <span key={a} className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#7A2332]/10 text-[#7A2332]">
              {a}
            </span>
          ))}
        </div>
      </header>

      {/* Cifra */}
      <div className="p-4 overflow-x-auto">
        <div className="font-mono text-[13px] sm:text-sm leading-6 min-w-max">
          {linhas.map((linha, i) => {
            const original = cifra.linhas[i];

            if (original.tipo === 'vazia') return <div key={i} className="h-4" />;

            if (original.tipo === 'secao') {
              return (
                <div key={i} className="mt-4 mb-1 font-sans text-xs font-bold uppercase tracking-wider text-[#C9A24A]">
                  {original.rotulo}
                </div>
              );
            }

            if (original.tipo === 'acordes') {
              return (
                <div key={i} className="relative h-6 mb-2">
                  {original.acordes.map((a) => (
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

            if (original.tipo === 'letra') {
              const temAcordes = original.acordes.length > 0;
              return (
                <div key={i} className={`relative whitespace-pre text-[#2D2118] ${temAcordes ? 'mt-6' : ''}`}>
                  {original.acordes.map((a) => (
                    <span
                      key={`${a.col}-${a.acorde}`}
                      style={{ left: `${a.col}ch` }}
                      className="absolute -top-5 text-[#7A2332] font-bold"
                    >
                      {a.acorde}
                    </span>
                  ))}
                  {original.texto}
                </div>
              );
            }

            return <div key={i} className="text-[#5C4A3E] italic">{linha.letra}</div>;
          })}
        </div>
      </div>

      {/* Importação */}
      <footer className="p-4 border-t border-[#7A2332]/10 bg-[#FFF9F2] flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={inputArquivo}
            type="file"
            accept=".txt,.docx,text/plain"
            className="hidden"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) void aoEscolherArquivo(arquivo);
            }}
          />
          <button
            onClick={() => inputArquivo.current?.click()}
            disabled={importando}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full bg-[#7A2332] text-[#FFF9F2] disabled:opacity-50 hover:brightness-110 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            {importando ? 'Lendo…' : 'Importar Word ou TXT'}
          </button>

          <button
            onClick={() => setMostrarTexto(!mostrarTexto)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">content_paste</span>
            Colar cifra
          </button>

          <span className="text-[11px] text-[#5C4A3E] ml-auto">
            Do Google Docs: <em>Arquivo → Fazer download → Texto sem formatação</em>
          </span>
        </div>

        {erroImport && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {erroImport}
          </p>
        )}

        {mostrarTexto && (
          <div className="flex flex-col gap-2">
            <textarea
              rows={8}
              value={textoColado}
              onChange={(e) => setTextoColado(e.target.value)}
              placeholder={'Cole aqui a cifra, com os acordes na linha de cima:\n\nG          C         G\nComo é bom a gente se encontrar'}
              className="w-full px-3 py-2 rounded-xl border border-[#7A2332]/20 bg-white font-mono text-xs text-[#2D2118] focus:outline-none focus:border-[#7A2332] resize-y whitespace-pre"
            />
            <button
              onClick={() => { if (textoColado.trim()) { carregarTexto(textoColado, 'colado'); setMostrarTexto(false); } }}
              disabled={!textoColado.trim()}
              className="self-end px-5 py-2 rounded-full text-sm font-bold bg-[#7A2332] text-[#FFF9F2] disabled:opacity-40 hover:brightness-110 transition cursor-pointer"
            >
              Carregar cifra
            </button>
          </div>
        )}

        <p className="text-[11px] text-[#5C4A3E]">
          A transposição altera <strong>apenas os acordes</strong>. A letra, o espaçamento e a
          posição de cada acorde sobre a sílaba permanecem exatamente como foram importados —
          o acorde guarda a coluna da letra, não um punhado de espaços.
        </p>
      </footer>
    </section>
  );
}
