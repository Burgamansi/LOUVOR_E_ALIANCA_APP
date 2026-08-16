import { useEffect, useState } from 'react';
import type { ArquivoMissa, TipoArquivoMissa } from '../data/missas';
import { idDoDrive } from '../lib/preview';

const TIPOS: { valor: TipoArquivoMissa; rotulo: string; icone: string }[] = [
  { valor: 'pdf', rotulo: 'PDF', icone: 'picture_as_pdf' },
  { valor: 'docx', rotulo: 'Word', icone: 'description' },
  { valor: 'pptx', rotulo: 'PowerPoint', icone: 'slideshow' },
];

interface EditarArquivoModalProps {
  aberto: boolean;
  /** O arquivo sendo trocado; nulo quando se está adicionando um novo. */
  arquivo: ArquivoMissa | null;
  tituloMissa: string;
  onFechar: () => void;
  onSalvar: (arquivo: ArquivoMissa) => void;
  onRemover?: () => void;
}

/**
 * Trocar ou acrescentar um arquivo de uma celebração.
 *
 * O que este modal NÃO faz é enviar arquivo: o app não tem servidor, e o
 * acervo mora no Google Drive. O fluxo real é outro, e a tela diz isso em vez
 * de fingir um botão de upload que não teria para onde gravar:
 *
 *  - mudou o conteúdo e é o mesmo arquivo do Drive → não precisa vir aqui. O
 *    app aponta pelo id, então a versão nova aparece sozinha.
 *  - subiu um arquivo NOVO no Drive → é aqui que se cola o link dele.
 */
export function EditarArquivoModal({
  aberto, arquivo, tituloMissa, onFechar, onSalvar, onRemover,
}: EditarArquivoModalProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoArquivoMissa>('pdf');
  const [link, setLink] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    setNome(arquivo?.nomeExibicao ?? '');
    setTipo(arquivo?.tipo ?? 'pdf');
    setLink(arquivo ? `https://drive.google.com/file/d/${arquivo.driveFileId}/view` : '');
    setErro(null);
  }, [aberto, arquivo]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const idAtual = idDoDrive(link);

  const salvar = () => {
    const id = idDoDrive(link);
    if (!id) {
      setErro('Não reconheci um arquivo do Drive nesse endereço. Abra o arquivo no Drive, toque em “Compartilhar → Copiar link” e cole aqui.');
      return;
    }
    if (!nome.trim()) {
      setErro('Dê um nome ao arquivo — é o que aparece no cartão da missa.');
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

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#FFF9F2] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-[#7A2332]/20 shadow-2xl max-h-[92vh] flex flex-col">
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[#7A2332]/15">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-bold text-[#7A2332] truncate">
              {arquivo ? 'Trocar arquivo' : 'Adicionar arquivo'}
            </h3>
            <p className="text-[11px] text-[#5C4A3E] truncate">{tituloMissa}</p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 w-9 h-9 rounded-full bg-white border border-[#7A2332]/20 text-[#5C4A3E] flex items-center justify-center hover:text-[#7A2332] cursor-pointer"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {arquivo && (
            <div className="flex items-start gap-2 bg-[#C9A24A]/15 border border-[#C9A24A]/40 rounded-xl px-3 py-2.5">
              <span aria-hidden className="material-symbols-outlined text-[#7A2332] text-base shrink-0">
                lightbulb
              </span>
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
              onChange={(e) => setNome(e.target.value)}
              placeholder="Roteiro, Texto de trabalho, Projeção…"
              className="px-3 py-2.5 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">Tipo</span>
            <div className="grid grid-cols-3 gap-2">
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

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C4A3E]">
              Link do arquivo no Drive
            </span>
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

          {idAtual && (
            <a
              href={`https://drive.google.com/file/d/${idAtual}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#7A2332]/25 text-[#7A2332] text-xs font-bold hover:bg-[#7A2332]/5 transition"
            >
              <span aria-hidden className="material-symbols-outlined text-lg">open_in_new</span>
              Abrir no Drive para editar
            </a>
          )}

          {erro && (
            <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              {erro}
            </p>
          )}
        </div>

        <footer className="shrink-0 flex items-center justify-between gap-2 px-5 py-3.5 border-t border-[#7A2332]/15 bg-white/60">
          {onRemover ? (
            <button
              onClick={onRemover}
              className="text-xs font-bold text-[#5C4A3E] hover:text-red-700 px-3 py-2 rounded-full cursor-pointer flex items-center gap-1"
            >
              <span aria-hidden className="material-symbols-outlined text-base">delete</span>
              Remover
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <button
              onClick={onFechar}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5C4A3E] hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="px-6 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
