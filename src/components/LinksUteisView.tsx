import { useMemo, useState } from 'react';
import { ABAS, LINKS_INICIAIS } from '../data/linksIniciais';
import type { CategoriaLink, LinkUtil } from '../data/linksIniciais';
import { idDoDrive } from '../lib/preview';
import { VisualizadorDocumento } from './VisualizadorDocumento';

const vazio = (categoria: CategoriaLink): LinkUtil => ({
  id: '', categoria, titulo: '', url: '', descricao: '', icone: 'link',
});

/**
 * Painel de Links Úteis — as três abas pedidas, com CRUD e pré-visualização.
 *
 * O `drive_file_id` é deduzido da URL colada, não digitado: quem cadastra cola
 * o link do Drive e o preview passa a funcionar sozinho.
 */
export function LinksUteisView() {
  const [links, setLinks] = useState<LinkUtil[]>(LINKS_INICIAIS);
  const [aba, setAba] = useState<CategoriaLink>('sites');
  const [modoAdmin, setModoAdmin] = useState(false);
  const [editando, setEditando] = useState<LinkUtil | null>(null);
  const [preview, setPreview] = useState<LinkUtil | null>(null);

  const daAba = useMemo(() => links.filter((l) => l.categoria === aba), [links, aba]);
  const abaAtual = ABAS.find((a) => a.id === aba)!;

  const salvar = (link: LinkUtil) => {
    const driveFileId = idDoDrive(link.url);
    const normalizado: LinkUtil = { ...link, driveFileId };
    setLinks((atuais) =>
      link.id
        ? atuais.map((l) => (l.id === link.id ? normalizado : l))
        : [...atuais, { ...normalizado, id: `l-${Date.now()}` }]
    );
    setEditando(null);
  };

  const excluir = (id: string) => setLinks((atuais) => atuais.filter((l) => l.id !== id));

  return (
    <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-5">
      <header className="pt-2 mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="text-xs text-[#C9A24A] uppercase tracking-[0.2em] font-bold">
            Painel do Ministério
          </span>
          <h2 className="font-serif text-3xl text-[#7A2332] font-bold">Links Úteis</h2>
          <p className="text-sm text-[#5C4A3E] mt-1">{abaAtual.descricao}</p>
        </div>
        <button
          onClick={() => { setModoAdmin(!modoAdmin); setEditando(null); }}
          className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full border transition cursor-pointer ${
            modoAdmin
              ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
              : 'bg-white text-[#7A2332] border-[#7A2332]/25 hover:border-[#7A2332]/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {modoAdmin ? 'lock_open' : 'settings'}
          </span>
          {modoAdmin ? 'Editando' : 'Administrar'}
        </button>
      </header>

      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => { setAba(a.id); setEditando(null); }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
              aba === a.id
                ? 'bg-[#7A2332] text-[#FFF9F2] border-[#7A2332]'
                : 'bg-white text-[#5C4A3E] border-[#7A2332]/20 hover:border-[#7A2332]/50'
            }`}
          >
            <span aria-hidden>{a.emoji}</span>
            {a.rotulo}
            <span className={`text-[10px] ${aba === a.id ? 'text-[#C9A24A]' : 'text-[#5C4A3E]/70'}`}>
              {links.filter((l) => l.categoria === a.id).length}
            </span>
          </button>
        ))}
      </div>

      {modoAdmin && !editando && (
        <button
          onClick={() => setEditando(vazio(aba))}
          className="mb-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-[#7A2332]/30 text-[#7A2332] text-sm font-bold hover:bg-[#7A2332]/5 transition cursor-pointer"
        >
          <span className="material-symbols-outlined">add_link</span>
          Adicionar link em “{abaAtual.rotulo}”
        </button>
      )}

      {editando && (
        <FormularioLink
          valor={editando}
          onMudar={setEditando}
          onSalvar={() => salvar(editando)}
          onCancelar={() => setEditando(null)}
        />
      )}

      <div className="flex flex-col gap-2.5">
        {daAba.length === 0 && !editando && (
          <p className="text-sm text-[#5C4A3E] italic py-8 text-center">
            Nenhum link nesta aba ainda.
          </p>
        )}

        {daAba.map((link) => {
          const temPreview = Boolean(link.driveFileId ?? idDoDrive(link.url)) ||
                             /\.pdf($|\?)/i.test(link.url);
          return (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#7A2332]/15 shadow-xs hover:border-[#7A2332]/35 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{link.icone || 'link'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-serif text-[#7A2332] font-bold text-sm leading-snug">
                  {link.titulo}
                </p>
                {link.descricao && (
                  <p className="text-xs text-[#5C4A3E] line-clamp-1">{link.descricao}</p>
                )}
                <p className="text-[10px] text-[#5C4A3E]/70 truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {temPreview && (
                  <button
                    onClick={() => setPreview(link)}
                    aria-label={`Pré-visualizar ${link.titulo}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#7A2332] text-[#FFF9F2] hover:brightness-110 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                  </button>
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${link.titulo}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>

                {modoAdmin && (
                  <>
                    <button
                      onClick={() => setEditando(link)}
                      aria-label={`Editar ${link.titulo}`}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => excluir(link.id)}
                      aria-label={`Excluir ${link.titulo}`}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-red-300 text-red-700 hover:bg-red-50 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <VisualizadorDocumento
        aberto={preview !== null}
        onFechar={() => setPreview(null)}
        titulo={preview?.titulo ?? ''}
        subtitulo={preview?.descricao}
        url={preview?.url ?? ''}
        driveFileId={preview?.driveFileId ?? (preview ? idDoDrive(preview.url) : null)}
      />
    </div>
  );
}

interface FormularioLinkProps {
  valor: LinkUtil;
  onMudar: (l: LinkUtil) => void;
  onSalvar: () => void;
  onCancelar: () => void;
}

function FormularioLink({ valor, onMudar, onSalvar, onCancelar }: FormularioLinkProps) {
  const urlValida = /^https?:\/\/.+/.test(valor.url);
  const podeSalvar = valor.titulo.trim().length > 0 && urlValida;
  const driveDetectado = idDoDrive(valor.url);

  const campo = 'w-full px-3 py-2 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]';

  return (
    <div className="mb-4 p-4 bg-[#FFF9F2] rounded-2xl border border-[#C9A24A]/40 flex flex-col gap-3">
      <h3 className="font-serif text-[#7A2332] font-bold">
        {valor.id ? 'Editar link' : 'Novo link'}
      </h3>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-[#5C4A3E]">Título</span>
        <input
          className={campo}
          value={valor.titulo}
          onChange={(e) => onMudar({ ...valor, titulo: e.target.value })}
          placeholder="Catecismo da Igreja Católica"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-[#5C4A3E]">URL de destino</span>
        <input
          className={campo}
          value={valor.url}
          onChange={(e) => onMudar({ ...valor, url: e.target.value })}
          placeholder="https://…"
          inputMode="url"
        />
        {valor.url && !urlValida && (
          <span className="text-[11px] text-red-700">O endereço precisa começar com http:// ou https://</span>
        )}
        {driveDetectado && (
          <span className="text-[11px] text-emerald-800">
            Arquivo do Drive reconhecido — a pré-visualização vai funcionar.
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#5C4A3E]">Categoria</span>
          <select
            className={campo}
            value={valor.categoria}
            onChange={(e) => onMudar({ ...valor, categoria: e.target.value as CategoriaLink })}
          >
            {ABAS.map((a) => (
              <option key={a.id} value={a.id}>{a.emoji} {a.rotulo}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#5C4A3E]">Ícone (opcional)</span>
          <input
            className={campo}
            value={valor.icone ?? ''}
            onChange={(e) => onMudar({ ...valor, icone: e.target.value })}
            placeholder="menu_book"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-[#5C4A3E]">Descrição</span>
        <textarea
          className={`${campo} resize-none`}
          rows={2}
          value={valor.descricao ?? ''}
          onChange={(e) => onMudar({ ...valor, descricao: e.target.value })}
          placeholder="Uma linha sobre para que serve este link."
        />
      </label>

      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancelar}
          className="px-4 py-2 rounded-full text-sm font-semibold text-[#5C4A3E] hover:bg-black/5 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={onSalvar}
          disabled={!podeSalvar}
          className="px-5 py-2 rounded-full text-sm font-bold bg-[#7A2332] text-[#FFF9F2] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
