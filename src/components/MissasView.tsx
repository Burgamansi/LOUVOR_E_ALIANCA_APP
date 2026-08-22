import { useMemo, useState } from 'react';
import {
  anosDoAcervo, mesesDoAno, anoDaMissa,
  missaMaisProxima, hojeIso, dataPorExtenso, mesDaMissa, tamanhoLegivel,
} from '../data/missas';
import type { ArquivoMissa, Missa } from '../data/missas';
import { VisualizadorDocumento } from './VisualizadorDocumento';
import { EditarArquivoModal } from './EditarArquivoModal';
import type { ModoEdicao } from './EditarArquivoModal';
import { StatusSalvamento } from './StatusSalvamento';
import { usePersistente } from '../hooks/usePersistente';
import { useAcervo } from '../hooks/useAcervo';

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
/** Download direto pelo Drive — o navegador baixa em vez de abrir o visualizador. */
const urlDeDownload = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

const ACAO = 'inline-flex items-center justify-center gap-1 h-9 px-2.5 rounded-full text-[11px] font-bold border transition cursor-pointer';
const ACAO_CLARA = `${ACAO} border-[#7A2332]/25 text-[#7A2332] bg-white hover:bg-[#7A2332]/10`;

/** Sem acento e em minúsculas — para "assunçao", "Assuncao" e "ASSUNÇÃO" acharem a mesma missa. */
const chave = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase();

const TODOS = 'todos';

interface MissasViewProps {
  /** Confirmação na tela do que acabou de acontecer — só depois de gravar. */
  onAviso: (texto: string, tipo?: 'ok' | 'apagou' | 'erro') => void;
}

export function MissasView({ onAviso }: MissasViewProps) {
  const hoje = useMemo(() => hojeIso(), []);

  // O acervo: embarcado no primeiro quadro, do banco quando ele responder.
  const { missas: acervo, origem } = useAcervo();

  const anos = useMemo(() => anosDoAcervo(acervo), [acervo]);

  // O ano de hoje, se o acervo tiver; senão o mais recente que tiver.
  const anoInicial = useMemo(() => {
    const atual = Number(hoje.slice(0, 4));
    return anos.includes(atual) ? atual : anos[0];
  }, [hoje, anos]);

  const [ano, setAno] = useState<number>(anoInicial);
  const [mes, setMes] = useState<string>(TODOS);
  const [busca, setBusca] = useState('');
  const [preview, setPreview] = useState<{ titulo: string; sub: string; id: string } | null>(null);

  /**
   * Arquivos trocados ou acrescentados neste aparelho, por slug de missa.
   *
   * O acervo de missas.ts é o mapeamento do Drive, feito uma vez. Quando um
   * arquivo passa a ser outro — foi refeito e subiu com id novo — a pessoa
   * precisa poder apontar o app para ele sem esperar um deploy.
   *
   * Fica no localStorage porque não há banco: vale só neste aparelho, e a tela
   * diz isso. Sem esse aviso alguém troca o roteiro no celular, vai para a
   * missa achando que a equipe está vendo o mesmo, e não está.
   */
  const arquivos = usePersistente<Record<string, ArquivoMissa[]>>(
    'la:missas-arquivos', {}, { automatico: false }
  );
  const arquivosLocais = arquivos.valor;
  const [editando, setEditando] = useState<
    { missa: Missa; arquivo: ArquivoMissa | null; indice: number; modo: ModoEdicao } | null
  >(null);
  const [removendo, setRemovendo] = useState<string | null>(null);   // `${slug}:${indice}`

  const arquivosDe = (missa: Missa) => arquivosLocais[missa.slug] ?? missa.arquivos;
  const foiAlterada = (missa: Missa) => arquivosLocais[missa.slug] !== undefined;

  /**
   * Grava a lista de arquivos de uma missa e só confirma depois de gravar.
   * Devolve se deu certo — quem chama decide a mensagem.
   */
  const gravarArquivos = async (missa: Missa, lista: ArquivoMissa[]): Promise<boolean> => {
    const ok = await arquivos.salvar({ ...arquivosLocais, [missa.slug]: lista });
    if (!ok) onAviso(arquivos.erro ?? 'Não foi possível salvar', 'erro');
    return ok;
  };

  const voltarAoOriginal = async (missa: Missa) => {
    const copia = { ...arquivosLocais };
    delete copia[missa.slug];
    const ok = await arquivos.salvar(copia);
    onAviso(ok ? 'Arquivos originais restaurados' : arquivos.erro ?? 'Não foi possível restaurar', ok ? 'ok' : 'erro');
  };

  const removerArquivo = async (missa: Missa, indice: number) => {
    const atual = arquivosDe(missa);
    const ok = await gravarArquivos(missa, atual.filter((_, i) => i !== indice));
    setRemovendo(null);
    if (ok) onAviso('Arquivo removido desta missa', 'apagou');
  };

  const salvarEdicao = async (novo: ArquivoMissa) => {
    if (!editando) return;
    const { missa, indice, modo } = editando;
    const atual = arquivosDe(missa);
    const lista = indice < 0 ? [...atual, novo] : atual.map((a, i) => (i === indice ? novo : a));
    const ok = await gravarArquivos(missa, lista);
    if (!ok) return;
    setEditando(null);
    onAviso(
      modo === 'adicionar'
        ? 'Arquivo adicionado e salvo com sucesso'
        : modo === 'dados'
          ? 'Dados do arquivo atualizados e salvos'
          : 'Arquivo atualizado e salvo com sucesso'
    );
  };

  // Abre sozinha a celebração de hoje — ou a mais próxima dela.
  const [aberta, setAberta] = useState<string | null>(
    () => missaMaisProxima(hojeIso(), acervo)?.slug ?? null
  );

  const meses = useMemo(() => mesesDoAno(ano, acervo), [ano, acervo]);

  const lista = useMemo(() => {
    const termo = chave(busca.trim());
    return acervo.filter((m) => {
      if (anoDaMissa(m.data) !== ano) return false;
      if (mes !== TODOS && mesDaMissa(m.data) !== mes) return false;
      if (!termo) return true;
      return (
        chave(m.tituloLiturgico).includes(termo) ||
        chave(m.tituloExibicao).includes(termo) ||
        chave(dataPorExtenso(m.data)).includes(termo)
      );
    });
  }, [ano, mes, busca, acervo]);

  const arquivosNaLista = useMemo(
    () => lista.reduce((soma, m) => soma + arquivosDe(m).length, 0),
    [lista]
  );

  const trocarAno = (novo: number) => {
    setAno(novo);
    setMes(TODOS);
    // Ao trocar de ano, abre a celebração daquele ano mais próxima de hoje,
    // em vez de deixar todos os cards fechados numa lista de quarenta.
    const doAno = acervo.filter((m) => anoDaMissa(m.data) === novo);
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
        {anos.map((a) => (
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

        {/* De onde veio o que está na tela. Sem isto, quem olha não tem como
            saber se está vendo o acervo do ministério ou a cópia que veio
            dentro do aplicativo — e a diferença importa quando alguém corrige
            um arquivo e quer saber se a equipe já está vendo. */}
        {origem === 'banco' && (
          <span
            title="Acervo do ministério: todo mundo vê o mesmo"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full whitespace-nowrap"
          >
            <span aria-hidden className="material-symbols-outlined text-sm">cloud_done</span>
            Acervo do ministério
          </span>
        )}
        {origem === 'falhou' && (
          <span
            title="Não deu para falar com o servidor. Estas são as missas que vieram dentro do aplicativo — funcionam, mas podem não ter as correções mais recentes."
            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full whitespace-nowrap"
          >
            <span aria-hidden className="material-symbols-outlined text-sm">cloud_off</span>
            Acervo do aplicativo
          </span>
        )}
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
                          {arquivosDe(missa).length} arquivo{arquivosDe(missa).length === 1 ? '' : 's'}
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

                    {arquivosDe(missa).length === 0 ? (
                      <p className="text-sm text-[#5C4A3E] italic">
                        Nenhum arquivo cadastrado para esta celebração.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {arquivosDe(missa).map((arq, iArq) => (
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
                                  {/* Um arquivo trocado aqui não tem tamanho: ele
                                      vem da varredura do Drive. Melhor omitir do
                                      que anunciar "0 KB". */}
                                  {ROTULO[arq.tipo]}
                                  {arq.tamanhoBytes > 0 && ` · ${tamanhoLegivel(arq.tamanhoBytes)}`}
                                </p>
                              </div>
                            </div>

                            {/* Ações com nome e tooltip — nada escondido só num ícone. */}
                            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`Ações de ${arq.nomeExibicao}`}>
                              <button
                                onClick={() =>
                                  setPreview({
                                    titulo: `${missa.tituloLiturgico} — ${arq.nomeExibicao}`,
                                    sub: arq.tamanhoBytes > 0
                                      ? `${ROTULO[arq.tipo]} · ${tamanhoLegivel(arq.tamanhoBytes)}`
                                      : ROTULO[arq.tipo],
                                    id: arq.driveFileId,
                                  })
                                }
                                aria-label={`Ver ${arq.nomeExibicao}`}
                                title="Ver aqui mesmo, sem baixar"
                                className={`${ACAO} border-[#7A2332] bg-[#7A2332] text-[#FFF9F2] hover:brightness-110`}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">visibility</span>
                                Ver
                              </button>
                              <button
                                onClick={() => setEditando({ missa, arquivo: arq, indice: iArq, modo: 'dados' })}
                                aria-label={`Editar nome e tipo de ${arq.nomeExibicao}`}
                                title="Editar nome e tipo"
                                className={ACAO_CLARA}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">edit</span>
                                Editar dados
                              </button>
                              <button
                                onClick={() => setEditando({ missa, arquivo: arq, indice: iArq, modo: 'substituir' })}
                                aria-label={`Substituir o arquivo ${arq.nomeExibicao}`}
                                title="Substituir por outro arquivo (Drive ou computador)"
                                className={ACAO_CLARA}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">swap_horiz</span>
                                Substituir
                              </button>
                              <a
                                href={urlDeDownload(arq.driveFileId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Baixar ${arq.nomeExibicao}`}
                                title="Baixar o arquivo"
                                className={ACAO_CLARA}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">download</span>
                                Download
                              </a>
                              <a
                                href={urlDoDrive(arq.driveFileId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Abrir ${arq.nomeExibicao} no Google Drive`}
                                title="Abrir no Google Drive"
                                className={ACAO_CLARA}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">open_in_new</span>
                                Drive
                              </a>
                              <button
                                onClick={() => {
                                  const chave = `${missa.slug}:${iArq}`;
                                  if (removendo === chave) void removerArquivo(missa, iArq);
                                  else setRemovendo(chave);
                                }}
                                onBlur={() => setRemovendo((r) => (r === `${missa.slug}:${iArq}` ? null : r))}
                                aria-label={removendo === `${missa.slug}:${iArq}` ? `Confirmar a remoção de ${arq.nomeExibicao}` : `Remover ${arq.nomeExibicao} desta missa`}
                                title="Remover desta missa"
                                className={`${ACAO} ${
                                  removendo === `${missa.slug}:${iArq}`
                                    ? 'border-red-600 bg-red-600 text-white'
                                    : 'border-[#7A2332]/25 text-[#5C4A3E] bg-white hover:text-red-700 hover:border-red-300'
                                }`}
                              >
                                <span aria-hidden className="material-symbols-outlined text-sm">delete</span>
                                {removendo === `${missa.slug}:${iArq}` ? 'Remover?' : 'Remover'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Trocar arquivo e acrescentar arquivo. O acervo veio da
                        varredura do Drive; quando um documento e refeito e sobe
                        com id novo, a pessoa aponta o app para ele aqui, sem
                        esperar um deploy. */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setEditando({ missa, arquivo: null, indice: -1, modo: 'adicionar' })}
                        title="Adicionar um arquivo do Drive ou do computador"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border border-dashed border-[#7A2332]/30 text-[#7A2332] hover:bg-[#7A2332]/5 transition cursor-pointer"
                      >
                        <span aria-hidden className="material-symbols-outlined text-base">add</span>
                        Adicionar arquivo
                      </button>

                      <StatusSalvamento status={arquivos.status} erro={arquivos.erro} textoSalvo="Salvo" />

                      {foiAlterada(missa) && (
                        <>
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#C9A24A]/20 text-[#7A2332]"
                            title="Estas alterações estão gravadas só neste aparelho; a equipe não as vê ainda."
                          >
                            <span aria-hidden className="material-symbols-outlined text-sm">smartphone</span>
                            alterado neste aparelho
                          </span>
                          <button
                            onClick={() => void voltarAoOriginal(missa)}
                            className="text-[11px] font-bold text-[#5C4A3E] hover:text-[#7A2332] underline decoration-dotted cursor-pointer"
                          >
                            voltar ao original
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <EditarArquivoModal
        aberto={editando !== null}
        modo={editando?.modo ?? 'adicionar'}
        arquivo={editando?.arquivo ?? null}
        tituloMissa={editando ? `${editando.missa.tituloLiturgico} · ${dataPorExtenso(editando.missa.data)}` : ''}
        salvando={arquivos.status === 'salvando'}
        onFechar={() => setEditando(null)}
        onSalvar={(novo) => void salvarEdicao(novo)}
        onRemover={
          editando?.arquivo
            ? () => {
                const { missa, indice } = editando;
                void removerArquivo(missa, indice).then(() => setEditando(null));
              }
            : undefined
        }
      />

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
