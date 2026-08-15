import { useMemo, useState } from 'react';
import {
  MISSAS, MISSAS_POR_DATA, ANOS_DO_ACERVO, mesesDoAno, anoDaMissa,
  missaMaisProxima, hojeIso, dataPorExtenso, mesDaMissa, tamanhoLegivel,
} from '../data/missas';
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

const CORES: Record<Missa['cor'], { fundo: string; texto: string; ponto: string; nome: string }> = {
  verde:    { fundo: 'bg-emerald-50', texto: 'text-emerald-800', ponto: 'bg-emerald-500', nome: 'Verde' },
  vermelho: { fundo: 'bg-red-50',     texto: 'text-red-800',     ponto: 'bg-red-500',     nome: 'Vermelho' },
  branco:   { fundo: 'bg-stone-50',   texto: 'text-stone-700',   ponto: 'bg-stone-300',   nome: 'Branco' },
  roxo:     { fundo: 'bg-purple-50',  texto: 'text-purple-800',  ponto: 'bg-purple-500',  nome: 'Roxo' },
  rosa:     { fundo: 'bg-pink-50',    texto: 'text-pink-800',    ponto: 'bg-pink-400',    nome: 'Rosa' },
};

const urlDoDrive = (id: string) => `https://drive.google.com/file/d/${id}/view`;

/** Sem acento e em minúsculas — para "assunçao", "Assuncao" e "ASSUNÇÃO" acharem a mesma missa. */
const chave = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase();

const TODOS = 'todos';

export function MissasView() {
  const hoje = useMemo(() => hojeIso(), []);

  // O ano de hoje, se o acervo tiver; senão o mais recente que tiver.
  const anoInicial = useMemo(() => {
    const atual = Number(hoje.slice(0, 4));
    return ANOS_DO_ACERVO.includes(atual) ? atual : ANOS_DO_ACERVO[0];
  }, [hoje]);

  const [ano, setAno] = useState<number>(anoInicial);
  const [mes, setMes] = useState<string>(TODOS);
  const [busca, setBusca] = useState('');
  const [preview, setPreview] = useState<{ titulo: string; sub: string; id: string } | null>(null);

  // Abre sozinha a celebração de hoje — ou a mais próxima dela.
  const [aberta, setAberta] = useState<string | null>(
    () => missaMaisProxima(hojeIso())?.slug ?? null
  );

  const meses = useMemo(() => mesesDoAno(ano), [ano]);

  const lista = useMemo(() => {
    const termo = chave(busca.trim());
    return MISSAS_POR_DATA.filter((m) => {
      if (anoDaMissa(m.data) !== ano) return false;
      if (mes !== TODOS && mesDaMissa(m.data) !== mes) return false;
      if (!termo) return true;
      return (
        chave(m.tituloLiturgico).includes(termo) ||
        chave(m.tituloExibicao).includes(termo) ||
        chave(dataPorExtenso(m.data)).includes(termo)
      );
    });
  }, [ano, mes, busca]);

  const arquivosNaLista = useMemo(
    () => lista.reduce((soma, m) => soma + m.arquivos.length, 0),
    [lista]
  );

  const trocarAno = (novo: number) => {
    setAno(novo);
    setMes(TODOS);
    // Ao trocar de ano, abre a celebração daquele ano mais próxima de hoje,
    // em vez de deixar todos os cards fechados numa lista de quarenta.
    const doAno = MISSAS.filter((m) => anoDaMissa(m.data) === novo);
    setAberta(missaMaisProxima(hoje, doAno)?.slug ?? null);
  };

  return (
    <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-5">
      <header className="pt-2 mb-5">
        <span className="text-xs text-[#C9A24A] uppercase tracking-[0.2em] font-bold">
          Agenda por Missas
        </span>
        <h2 className="font-serif text-3xl text-[#7A2332] font-bold">Missas e Materiais</h2>
        <p className="text-sm text-[#5C4A3E] max-w-[95%] mt-1">
          O roteiro, o texto de trabalho e a projeção de cada celebração — abertos aqui mesmo,
          sem baixar nada.
        </p>
      </header>

      {/* Ano primeiro, mês depois. Com dois anos no acervo, um filtro só de mês
          misturaria junho de 2025 com junho de 2026 no mesmo botão. */}
      <div className="flex items-center gap-2 mb-3" role="group" aria-label="Ano">
        {ANOS_DO_ACERVO.map((a) => (
          <button
            key={a}
            onClick={() => trocarAno(a)}
            aria-pressed={ano === a}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition cursor-pointer border ${
              ano === a
                ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            {a}
          </button>
        ))}

        <label className="ml-auto relative flex-1 max-w-[240px]">
          <span className="sr-only">Buscar celebração</span>
          <span
            aria-hidden
            className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A2332]/60 text-lg pointer-events-none"
          >
            search
          </span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar celebração"
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-white border border-[#7A2332]/20 text-[#2D2118] placeholder:text-[#5C4A3E]/60 focus:outline-none focus:border-[#7A2332]/60"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[TODOS, ...meses].map((m) => (
          <button
            key={m}
            onClick={() => setMes(m)}
            aria-pressed={mes === m}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer border ${
              mes === m
                ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            {m}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#5C4A3E] bg-white px-3 py-1 rounded-full border border-[#7A2332]/15 whitespace-nowrap">
          {lista.length} {lista.length === 1 ? 'missa' : 'missas'} ·{' '}
          {arquivosNaLista} {arquivosNaLista === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-[#5C4A3E] bg-white border border-dashed border-[#7A2332]/25 rounded-2xl px-4 py-8 text-center">
          Nenhuma celebração encontrada
          {busca.trim() ? <> para “{busca.trim()}”</> : null} em {ano}.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((missa) => {
            const expandida = aberta === missa.slug;
            const cor = CORES[missa.cor];
            const rascunho = missa.status === 'rascunho';
            const eHoje = missa.data === hoje;

            return (
              <article
                key={missa.slug}
                className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition ${
                  eHoje
                    ? 'border-[#C9A24A] ring-1 ring-[#C9A24A]/40'
                    : rascunho
                      ? 'border-dashed border-[#7A2332]/25'
                      : 'border-[#7A2332]/15'
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
                      {eHoje && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A24A] text-[#2D2118]">
                          Hoje
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cor.fundo} ${cor.texto}`}>
                        <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${cor.ponto}`} />
                        {cor.nome}
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

                  <span
                    aria-hidden
                    className={`material-symbols-outlined text-[#C9A24A] transition-transform shrink-0 ${expandida ? 'rotate-180' : ''}`}
                  >
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
                              <span aria-hidden className="material-symbols-outlined text-[#7A2332]">
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
                                <span aria-hidden className="material-symbols-outlined text-sm">visibility</span>
                                Ver
                              </button>
                              <a
                                href={urlDoDrive(arq.driveFileId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Abrir ${arq.nomeExibicao} no Drive`}
                                className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition"
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">open_in_new</span>
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
      )}

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
