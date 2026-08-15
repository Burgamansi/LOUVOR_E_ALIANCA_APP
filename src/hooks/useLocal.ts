import { useCallback, useEffect, useState } from 'react';

/**
 * Estado que sobrevive ao fechar o app.
 *
 * O músico ajusta a velocidade do scroll uma vez e não quer reajustar toda
 * missa. Mesma coisa para o tom em que a equipe canta e para "já vi as boas
 * vindas". Tudo isso é preferência de aparelho, não dado do ministério — o
 * lugar certo é o localStorage, não o banco.
 */
export function useLocal<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    if (typeof window === 'undefined') return inicial;
    try {
      const bruto = window.localStorage.getItem(chave);
      return bruto === null ? inicial : (JSON.parse(bruto) as T);
    } catch {
      return inicial;      // JSON corrompido ou storage bloqueado
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
    } catch { /* modo privado / cota cheia: seguir sem persistir */ }
  }, [chave, valor]);

  const limpar = useCallback(() => {
    try { window.localStorage.removeItem(chave); } catch { /* idem */ }
    setValor(inicial);
  }, [chave, inicial]);

  return [valor, setValor, limpar] as const;
}
