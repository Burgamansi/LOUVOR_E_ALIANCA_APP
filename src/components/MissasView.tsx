import { useMemo, useState } from 'react';
import { MISSAS, dataPorExtenso, mesDaMissa, tamanhoLegivel } from '../data/missas';
import type { ArquivoMissa, Missa } from '../data/missas';
import { VisualizadorDocumento } from './VisualizadorDocumento';

const ICONE: Record<ArquivoMissa['tipo'], string> = {
  pdf: 'picture_as_pdf',
  docx: 'description',
  pptx: 'slideshow',
};

const ROTULO: Record<ArquivoMissa['tipo'], string> = {
  pdf: 'PDF',
  docx: 'Word',
  pptx: 'PowerPoint',
};

const CORES: Record<Missa['cor'], { fundo: string; texto: string; ponto: string }> = {
  verde:    { fundo: 'bg-emerald-50',  texto: 'text-emerald-800', ponto: 'bg-emerald-500' },
  vermelho: { fundo: 'bg-red-50',      texto: 'text-red-800',     ponto: 'bg-red-500' },
  branco:   { fundo: 'bg-stone-50',    texto: 'text-stone-700',   ponto: 'bg-stone-300' },
  roxo:     { fundo: 'bg-purple-50',   texto: 'text-purple-800',  ponto: 'bg-purple-500' },
  rosa:     { fundo: 'bg-pink-50',     texto: 'text-pink-800',    ponto: 'bg-pink-400' },
};

const MESES_FILTRO = ['todos', 'junho', 'julho', 'agosto'] as const;

const urlDoDrive = (id: string) => `https://drive.google.com/file/d/${id}/view`;

export function MissasView() {
  const [mes, setMes] = useState<(typeof MESES_FILTRO)[number]>('todos');
  const [aberta, setAberta] = useState<string | null>(MISSAS[MISSAS.length - 1]?.slug ?? null);
  const [preview, setPreview] = useState<{ titulo: string; sub: string; id: string } | null>(null);

  const lista = useMemo(
    () => (mes === 'todos' ? MISSAS : MISSAS.filter((m) => mesDaMissa(m.data) === mes)),
    [mes]
  );

  const totalArquivos = useMemo(
    () => MISSAS.reduce((soma, m) => soma + m.arquivos.length, 0),
    []
  );

  return (
    <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-5">
      <header className="pt-2 mb-6">
        <span className="text-xs text-[#C9A24A] uppercase tracking-[0.2em] font-bold">
          Agenda por Missas
        </span>
        <h2 className="font-serif text-3xl text-[#7A2332] font-bold">Missas e Materiais</h2>
        <p className="text-sm text-[#5C4A3E] max-w-[95%] mt-1">
          Junho, julho e agosto de 2026 — Ano A. Roteiro, texto de trabalho e projeção de cada
          celebração, com visualização rápida sem baixar nada.
        </p>
      </header>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {MESES_FILTRO.map((m) => (
          <button
            key={m}
            onClick={() => setMes(m)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer border ${
              mes === m
                ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            {m}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#5C4A3E] bg-white px-3 py-1 rounded-full border border-[#7A2332]/15">
          {MISSAS.length} missas · {totalArquivos} arquivos
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {lista.map((missa) => {
          const expandida = aberta === missa.slug;
          const cor = CORES[missa.cor];
          const rascunho = missa.status === 'rascunho';

          return (
            <article
              key={missa.slug}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition ${
                rascunho ? 'border-dashed border-[#7A2332]/25' : 'border-[#7A2332]/15'
              }`}
            >
              <button
                onClick={() => setAberta(expandida ? null : missa.slug)}
                className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-[#FFF9F2] transition"
                aria-expanded={expandida}
              >
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${cor.fundo}`}>
                  <span className={`text-base font-bold leading-none ${cor.texto}`}>
                    {missa.data.slice(8, 10)}
                  </span>
                  <span className={`text-[9px] uppercase ${cor.texto}`}>
                    {mesDaMissa(missa.data).slice(0, 3)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[#7A2332] font-bold text-base leading-snug">
                    {missa.tituloLiturgico}
                  </h3>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    {dataPorExtenso(missa.data)} · {missa.hora}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cor.fundo} ${cor.texto}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cor.ponto}`} />
                      {missa.cor === 'vermelho' ? 'Vermelho' : 'Verde'}
                    </span>
                    {missa.tipo === 'solenidade' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C9A24A]/20 text-[#7A2332]">
                        Solenidade
                      </span>
                    )}
                    {rascunho ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Rascunho · sem material
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5C4A3E]">
                        {missa.arquivos.length} arquivo{missa.arquivos.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`material-symbols-outlined text-[#C9A24A] transition-transform shrink-0 ${expandida ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {expandida && (
                <div className="px-4 pb-4 pt-1 border-t border-[#7A2332]/10 bg-[#FFF9F2]/60">
                  <p className="text-[11px] text-[#5C4A3E] mb-3 font-mono break-all">
                    /missas/{missa.slug}
                  </p>

                  {missa.observacao && (
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                      {missa.observacao}
                    </p>
                  )}

                  {missa.arquivos.length === 0 ? (
                    <p className="text-sm text-[#5C4A3E] italic">
                      Nenhum arquivo cadastrado para esta celebração.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {missa.arquivos.map((arq) => (
                        <div
                          key={arq.driveFileId}
                          className="flex flex-col gap-2 bg-white rounded-xl border border-[#7A2332]/15 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#7A2332]">
                              {ICONE[arq.tipo]}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#2D2118] truncate">
                                {arq.nomeExibicao}
                              </p>
                              <p className="text-[10px] text-[#5C4A3E]">
                                {ROTULO[arq.tipo]} · {tamanhoLegivel(arq.tamanhoBytes)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setPreview({
                                  titulo: `${missa.tituloLiturgico} — ${arq.nomeExibicao}`,
                                  sub: `${ROTULO[arq.tipo]} · ${tamanhoLegivel(arq.tamanhoBytes)}`,
                                  id: arq.driveFileId,
                                })
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#7A2332] text-[#FFF9F2] hover:brightness-110 transition cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Ver
                            </button>
                            <a
                              href={urlDoDrive(arq.driveFileId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Abrir ${arq.nomeExibicao} no Drive`}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <VisualizadorDocumento
        aberto={preview !== null}
        onFechar={() => setPreview(null)}
        titulo={preview?.titulo ?? ''}
        subtitulo={preview?.sub}
        url={preview ? urlDoDrive(preview.id) : ''}
        driveFileId={preview?.id}
      />
    </div>
  );
}
