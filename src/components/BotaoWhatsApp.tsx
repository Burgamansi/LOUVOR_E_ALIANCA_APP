import { linkWhatsApp } from '../lib/whatsapp';

interface BotaoWhatsAppProps {
  /** Número em E.164, como vem do banco: '+5511987654321'. */
  e164?: string | null;
  /** Mensagem já preenchida na conversa. Sem ela a pessoa abre um chat em branco e desiste. */
  mensagem?: string;
  rotulo?: string;
  variante?: 'solido' | 'discreto';
  className?: string;
}

/**
 * Botão de WhatsApp.
 *
 * Não renderiza nada se não houver número — é o comportamento certo para a
 * página pública, onde o número pessoal do integrante só aparece se ele marcou
 * `whatsapp_publico`. O botão da página pública usa o número do ministério,
 * guardado em config('whatsapp_ministerio').
 */
export function BotaoWhatsApp({
  e164,
  mensagem,
  rotulo = 'Falar no WhatsApp',
  variante = 'solido',
  className = '',
}: BotaoWhatsAppProps) {
  if (!e164) return null;

  const base =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ' +
    'transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-[#25D366]';

  const estilo =
    variante === 'solido'
      ? 'bg-[#25D366] text-white shadow-sm hover:brightness-95'
      : 'border border-[#25D366]/60 text-[#128C7E] hover:bg-[#25D366]/10';

  return (
    <a
      href={linkWhatsApp(e164, mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={rotulo}
      className={`${base} ${estilo} ${className}`}
    >
      <IconeWhatsApp className="h-4 w-4" />
      {rotulo}
    </a>
  );
}

function IconeWhatsApp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}
