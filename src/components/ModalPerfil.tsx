import { useEffect, useState } from 'react';
import { formatarBR, linkWhatsApp, paraE164BR } from '../lib/whatsapp';

export interface PerfilMinisterio {
  nome: string;
  apelido?: string;
  papel: string;
  foto?: string;
  whatsappE164?: string | null;
  whatsappPublico: boolean;
}

interface ModalPerfilProps {
  aberto: boolean;
  onFechar: () => void;
  perfil: PerfilMinisterio;
  onSalvar: (p: PerfilMinisterio) => void;
}

/**
 * Cadastro do WhatsApp do integrante.
 *
 * O número é gravado em E.164 (`+5511987654321`), normalizado na saída do
 * campo — a máscara serve só para a leitura. Máscara guardada quebra no
 * primeiro DDD diferente.
 *
 * `whatsappPublico` nasce desmarcado: número pessoal é dado pessoal e não deve
 * ir para a página pública sem alguém decidir por isso.
 */
export function ModalPerfil({ aberto, onFechar, perfil, onSalvar }: ModalPerfilProps) {
  const [rascunho, setRascunho] = useState<PerfilMinisterio>(perfil);
  const [digitado, setDigitado] = useState(perfil.whatsappE164 ? formatarBR(perfil.whatsappE164) : '');

  useEffect(() => {
    if (aberto) {
      setRascunho(perfil);
      setDigitado(perfil.whatsappE164 ? formatarBR(perfil.whatsappE164) : '');
    }
  }, [aberto, perfil]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const e164 = paraE164BR(digitado);
  const numeroInvalido = digitado.trim().length > 0 && e164 === null;

  const salvar = () => {
    onSalvar({ ...rascunho, whatsappE164: e164 });
    onFechar();
  };

  const campo = 'w-full px-3 py-2 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Meu perfil"
    >
      <div
        className="w-full sm:max-w-md bg-[#FFF9F2] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#C9A24A]/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-4 py-3 bg-[#4D1721] text-[#FFF9F2]">
          <span className="material-symbols-outlined text-[#C9A24A]">account_circle</span>
          <h3 className="font-serif text-base font-bold flex-1">Meu perfil</h3>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="p-4 flex flex-col gap-3.5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            {rascunho.foto && (
              <img src={rascunho.foto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A24A]" />
            )}
            <div className="min-w-0">
              <p className="font-serif text-[#7A2332] font-bold">{rascunho.apelido || rascunho.nome}</p>
              <p className="text-xs text-[#5C4A3E]">{rascunho.papel}</p>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#5C4A3E]">Como quer ser chamado</span>
            <input
              className={campo}
              value={rascunho.apelido ?? ''}
              onChange={(e) => setRascunho({ ...rascunho, apelido: e.target.value })}
              placeholder="Aninha"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#5C4A3E]">WhatsApp</span>
            <input
              className={campo}
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              onBlur={() => { if (e164) setDigitado(formatarBR(e164)); }}
              placeholder="(11) 98765-4321"
              inputMode="tel"
              autoComplete="tel"
            />
            {numeroInvalido && (
              <span className="text-[11px] text-red-700">
                Número incompleto. Use DDD + número, com 10 ou 11 dígitos.
              </span>
            )}
            {e164 && (
              <span className="text-[11px] text-[#5C4A3E]">
                Será gravado como <code className="font-mono">{e164}</code>
              </span>
            )}
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#7A2332]/15 cursor-pointer">
            <input
              type="checkbox"
              checked={rascunho.whatsappPublico}
              onChange={(e) => setRascunho({ ...rascunho, whatsappPublico: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-[#7A2332]"
            />
            <span className="text-xs text-[#5C4A3E]">
              <strong className="text-[#2D2118] block">Mostrar meu número na página pública</strong>
              Desmarcado, ele fica visível só para quem está logado no ministério. A página
              pública continua usando o WhatsApp do ministério.
            </span>
          </label>

          {e164 && (
            <a
              href={linkWhatsApp(e164, 'Teste do meu contato no app do Louvor & Aliança.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:brightness-95 transition"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Testar meu link
            </a>
          )}
        </div>

        <footer className="flex items-center gap-2 justify-end p-4 border-t border-[#7A2332]/10">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded-full text-sm font-semibold text-[#5C4A3E] hover:bg-black/5 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={numeroInvalido}
            className="px-5 py-2 rounded-full text-sm font-bold bg-[#7A2332] text-[#FFF9F2] disabled:opacity-40 hover:brightness-110 transition cursor-pointer"
          >
            Salvar
          </button>
        </footer>
      </div>
    </div>
  );
}
