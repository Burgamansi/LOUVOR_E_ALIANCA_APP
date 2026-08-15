// WhatsApp — o número é guardado no banco em E.164 (`+5511987654321`),
// só dígitos com o '+'. Nunca a máscara, nunca a URL pronta.
//
// Máscara não é dado, é formatação: no primeiro número de outro DDD, ou colado
// com espaço, a máscara guardada quebra o link. Guardando E.164, a URL se monta
// aqui e sempre funciona.

/** Monta o link do WhatsApp a partir de um número E.164, com mensagem opcional. */
export function linkWhatsApp(e164: string, mensagem?: string): string {
  const numero = e164.replace(/\D/g, '');
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
  return `https://wa.me/${numero}${texto}`;
}

/**
 * Normaliza o que a pessoa digitou para E.164 brasileiro.
 * Aceita '(11) 98765-4321', '11987654321', '+55 11 98765-4321'.
 * Devolve null se não for um número plausível — melhor recusar na entrada do
 * que gravar lixo que só vai aparecer quando alguém clicar no botão.
 */
export function paraE164BR(entrada: string): string | null {
  const d = entrada.replace(/\D/g, '');
  if (d.length === 11 || d.length === 10) return `+55${d}`;          // DDD + número
  if (d.length === 13 && d.startsWith('55')) return `+${d}`;         // já com país
  if (d.length === 12 && d.startsWith('55')) return `+${d}`;         // fixo com país
  return null;
}

/** Exibição amigável: +5511987654321 → (11) 98765-4321 */
export function formatarBR(e164: string): string {
  const d = e164.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return e164;
}
