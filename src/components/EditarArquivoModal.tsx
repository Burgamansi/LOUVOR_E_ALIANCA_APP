import { useEffect, useRef, useState } from 'react';
import type { ArquivoMissa, TipoArquivoMissa } from '../data/missas';
import { idDoDrive } from '../lib/preview';
import {
  validarArquivo, descreverAceitos, limiteLegivel,
  EXTENSOES_ARQUIVO_MISSA, LIMITE_ARQUIVO_BYTES,
} from '../lib/upload/validar';
import type { ResultadoValidacao } from '../lib/upload/validar';

const TIPOS: { valor: TipoArquivoMissa; rotulo: string; icone: string }[] = [
  { valor: 'pdf', rotulo: 'PDF', icone: 'picture_as_pdf' },
  { valor: 'docx', rotulo: 'Word', icone: 'description' },
  { valor: 'pptx', rotulo: 'PowerPoint', icone: 'slideshow' },
];

export type ModoEdicao = 'adicionar' | 'dados' | 'substituir';

interface EditarArquivoModalProps {
  aberto: boolean;
  modo: ModoEdicao;
  /** O arquivo sendo editado; nulo quando se está adicionando um novo. */
  arquivo: ArquivoMissa | null;
  tituloMissa: string;
  /** A gravação está em andamento — o botão mostra "Salvando…" e trava. */
  salvando: boolean;
  onFechar: () => void;
  onSalvar: (arquivo: ArquivoMissa) => void;
  onRemover?: () => void;
}

type Fonte = 'drive' | 'local';

const TITULO: Record<ModoEdicao, string> = {
  adicionar: 'Adicionar arquivo',
  dados: 'Editar dados do arquivo',
  substituir: 'Substituir arquivo',
};

/**
 * Adicionar, editar ou substituir um arquivo de uma celebração.
 *
 * Duas fontes convivem: o Google Drive (colar o link — o caminho que existe
 * hoje) e o arquivo do computador. A segunda está na tela com a validação
 * completa (tipo, tamanho, nome), mas **não envia**: o app não tem onde
 * guardar bytes — não há servidor de arquivos ligado. Em vez de fingir um
 * upload, a aba diz isso e aponta o caminho que funciona. Quando houver
 * armazenamento, é só a gravação que muda; a tela já está pronta.
 *
 * "Editar dados" mexe só em nome e tipo, sem tocar no arquivo.
 */
export function EditarArquivoModal({
  aberto, modo, arquivo, tituloMissa, salvando, onFechar, onSalvar, onRemover,
}: EditarArquivoModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoArquivoMissa>('pdf');
  const [fonte, setFonte] = useState<Fonte>('drive');
  const [link, setLink] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [arquivoLocal, setArquivoLocal] = useState<{ nome: string; tamanho: number; validacao: ResultadoValidacao } | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) return;
    setNome(arquivo?.nomeExibicao ?? '');
    setTipo(arquivo?.tipo ?? 'pdf');
    setFonte('drive');
    setLink(arquivo && modo !== 'substituir' ? `https://drive.google.com/file/d/${arquivo.driveFileId}/view` : '');
    setErro(null);
    setArquivoLocal(null);
    setConfirmandoRemocao(false);
  }, [aberto, arquivo, modo]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape' && !salvando) onFechar(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar, salvando]);

  if (!aberto) return null;

  const editandoSoDados = modo === 'dados';
  const idAtual = editandoSoDados ? arquivo?.driveFileId ?? null : idDoDrive(link);

  const receberLocal = (f: File) => {
    const validacao = validarArquivo(f, { extensoes: EXTENSOES_ARQUIVO_MISSA, limiteBytes: LIMITE_ARQUIVO_BYTES });
    setArquivoLocal({ nome: validacao.nome, tamanho: f.size, validacao });
    if (validacao.ok && !nome.trim()) setNome(validacao.nome.replace(/\.[^.]+$/, ''));
    if (validacao.ok) {
      const ext = validacao.extensao;
      if (ext === 'pdf') setTipo('pdf');
      else if (ext === 'doc' || ext === 'docx') setTipo('docx');
      else if (ext === 'ppt' || ext === 'pptx') setTipo('pptx');
    }
    if (inputArquivo.current) inputArquivo.current.value = '';
  };

  const salvar = () => {
    if (!nome.trim()) {
      setErro('Dê um nome ao arquivo — é o que aparece no cartão da missa.');
      return;
    }

    if (editandoSoDados && arquivo) {
      onSalvar({ ...arquivo, tipo, nomeExibicao: nome.trim() });
      return;
    }

    if (fonte === 'local') {
      setErro('O envio do computador ainda não está disponível — veja a explicação acima. Use o link do Drive.');
      return;
    }

    const id = idDoDrive(link);
    if (!id) {
      setErro('Não reconheci um arquivo do Drive nesse endereço. Abra o arquivo no Drive, toque em “Compartilhar → Copiar link” e cole aqui.');
      return;
    }
    onSalvar({
      tipo,
      driveFileId: id,
      nomeExibicao: nome.trim(),
      // O tamanho vem do Drive na varredura; num arquivo trocado aqui não
      // temos como saber, e 0 faz o cartão omitir a linha em vez de mentir.
      tamanhoBytes: id === arquivo?.driveFileId ? arquivo.tamanhoBytes : 0,
    });
  };

  const podeSalvar = !salvando && (editandoSoDados || fonte === 'drive');

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-arquivo-titulo"
        className="bg-[#FFF9F2] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-[#7A2332]/20 shadow-2xl max-h-[92vh] flex flex-col"
      >
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[#7A2332]/15">
          <div className="min-w-0">
            <h3 id="editar-arquivo-titulo" className="font-serif text-lg font-bold text-[#7A2332] truncate">{TITULO[modo]}</h3>
            <p className="text-[11px] text-[#5C4A3E] truncate">{tituloMissa}</p>
          </div>
          <button
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#7A2332]/20 text-[#5C4A3E] flex items-center justify-center hover:text-[#7A2332] cursor-pointer disabled:opacity-40"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {modo === 'substituir' && (
            <div className="flex items-start gap-2 bg-[#C9A24A]/15 border border-[#C9A24A]/40 rounded-xl px-3 py-2.5">
              <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-base shrink-0">lightbulb</span>
              <p className="text-xs text-[#7A2332] leading-relaxed">
                Se você só corrigiu o conteúdo <strong>do mesmo arquivo</strong> no Drive, não precisa
                mexer aqui — o app aponta para o arquivo, então a versão nova já aparece.
                Esta tela é para quando o arquivo passou a ser <strong>outro</strong>.
              </p>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Nome</span>
            <input
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErro(null); }}
              placeholder="Roteiro, Texto de trabalho, Projeção…"
              className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Tipo</span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo do arquivo">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  onClick={() => setTipo(t.valor)}
                  aria-pressed={tipo === t.valor}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    tipo === t.valor
                      ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                      : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
                  }`}
                >
                  <span aria-hidden className="material-symbols-outlined text-lg">{t.icone}</span>
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>

          {!editandoSoDados && (
            <>
              {/* Fonte: Drive ou computador */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">De onde vem o arquivo</span>
                <div role="tablist" aria-label="Fonte do arquivo" className="flex rounded-xl border border-[#7A2332]/20 overflow-hidden">
                  {([
                    { v: 'drive', r: 'Google Drive', i: 'cloud' },
                    { v: 'local', r: 'Arquivo do computador', i: 'computer' },
                  ] as { v: Fonte; r: string; i: string }[]).map((o) => (
                    <button
                      key={o.v}
                      role="tab"
                      aria-selected={fonte === o.v}
                      onClick={() => { setFonte(o.v); setErro(null); }}
                      className={`flex-1 px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        fonte === o.v ? 'bg-[#7A2332] text-[#FFF9F2]' : 'bg-white text-[#5C4A3E] hover:bg-[#7A2332]/5'
                      }`}
                    >
                      <span aria-hidden className="material-symbols-outlined text-base">{o.i}</span>
                      {o.r}
                    </button>
                  ))}
                </div>
              </div>

              {fonte === 'drive' ? (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Link do arquivo no Drive</span>
                    <input
                      value={link}
                      onChange={(e) => { setLink(e.target.value); setErro(null); }}
                      placeholder="https://drive.google.com/file/d/…"
                      className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-xs font-mono text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
                    />
                    <span className="text-[10px] text-[#5C4A3E] leading-relaxed">
                      No Drive: <strong>Compartilhar → Copiar link</strong>. Marque{' '}
                      <em>“qualquer pessoa com o link”</em>, senão a equipe abre e vê uma tela de permissão.
                    </span>
                  </label>

                  <a
                    href={idAtual ? `https://drive.google.com/file/d/${idAtual}/view` : 'https://drive.google.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#7A2332]/25 text-[#7A2332] text-xs font-bold hover:bg-[#7A2332]/5 transition"
                  >
                    <span aria-hidden className="material-symbols-outlined text-lg">open_in_new</span>
                    {idAtual ? 'Abrir este arquivo no Drive' : 'Abrir o Drive'}
                  </a>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    ref={inputArquivo}
                    type="file"
                    accept={EXTENSOES_ARQUIVO_MISSA.map((e) => `.${e}`).join(',')}
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) receberLocal(f); }}
                  />
                  <button
                    onClick={() => inputArquivo.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#7A2332]/30 text-[#7A2332] text-sm font-bold hover:bg-[#7A2332]/5 transition cursor-pointer"
                  >
                    <span aria-hidden className="material-symbols-outlined text-lg">upload_file</span>
                    Selecionar arquivo
                  </button>
                  <p className="text-[10px] text-[#5C4A3E]">
                    Aceita {descreverAceitos(EXTENSOES_ARQUIVO_MISSA)} até {limiteLegivel(LIMITE_ARQUIVO_BYTES)}.
                  </p>

                  {arquivoLocal && (
                    <div
                      role={arquivoLocal.validacao.ok ? 'status' : 'alert'}
                      className={`rounded-xl border px-3 py-2.5 text-xs flex items-start gap-2 ${
                        arquivoLocal.validacao.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <span aria-hidden className="material-symbols-outlined text-base shrink-0">
                        {arquivoLocal.validacao.ok ? 'check_circle' : 'error'}
                      </span>
                      <span>
                        <strong>{arquivoLocal.nome}</strong> · {limiteLegivel(arquivoLocal.tamanho)}
                        {arquivoLocal.validacao.ok ? ' — arquivo válido.' : ` — ${arquivoLocal.validacao.erro}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2.5">
                    <span aria-hidden className="material-symbols-outlined text-amber-700 text-base shrink-0">info</span>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>O envio do computador ainda não está disponível.</strong> O app não tem
                      onde guardar o arquivo — não há servidor de arquivos ligado. Por enquanto, suba o
                      arquivo no Google Drive e cole o link na outra aba. Quando o armazenamento estiver
                      ligado, este botão passa a enviar de verdade.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {erro && (
            <p role="alert" className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              {erro}
            </p>
          )}
        </div>

        <footer className="shrink-0 flex items-center justify-between gap-2 px-5 py-3.5 border-t border-[#7A2332]/15 bg-white/60">
          {onRemover ? (
            <button
              onClick={() => {
                if (confirmandoRemocao) onRemover();
                else setConfirmandoRemocao(true);
              }}
              onBlur={() => setConfirmandoRemocao(false)}
              disabled={salvando}
              aria-label={confirmandoRemocao ? 'Confirmar a remoção do arquivo' : 'Remover o arquivo desta missa'}
              className={`text-xs font-bold px-3 py-2 rounded-full cursor-pointer flex items-center gap-1 transition disabled:opacity-40 ${
                confirmandoRemocao ? 'bg-red-600 text-white' : 'text-[#5C4A3E] hover:text-red-700'
              }`}
            >
              <span aria-hidden className="material-symbols-outlined text-base">delete</span>
              {confirmandoRemocao ? 'Remover? Toque de novo' : 'Remover'}
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <button
              onClick={onFechar}
              disabled={salvando}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5C4A3E] hover:bg-black/5 cursor-pointer disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!podeSalvar}
              className="px-6 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {salvando && <span aria-hidden className="material-symbols-outlined text-base animate-spin">progress_activity</span>}
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
