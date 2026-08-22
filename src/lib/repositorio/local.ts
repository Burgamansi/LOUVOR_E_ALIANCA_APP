// Repositório em localStorage. Alcance: este aparelho.
//
// Dois cuidados que o `useLocal` antigo não tinha:
//
//  · falha de escrita é ERRO, não silêncio. Cota cheia e modo privado do
//    Safari lançam em `setItem`; engolir isso é mostrar "Salvo" para algo que
//    não foi salvo. Aqui a promessa rejeita e a tela diz que não salvou;
//  · a leitura confere que o que está lá é o que se espera (JSON válido);
//    JSON corrompido devolve null e o app parte do valor inicial.

import type { Repositorio } from './tipos';

type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function armazenamentoPadrao(): Armazenamento | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;   // acesso bloqueado (iframe sem permissão, política do navegador)
  }
}

export function repositorioLocal<T>(chave: string, armazenamento?: Armazenamento): Repositorio<T> {
  const obter = () => armazenamento ?? armazenamentoPadrao();

  return {
    alcance: 'aparelho',

    ler(): T | null {
      const st = obter();
      if (!st) return null;
      try {
        const bruto = st.getItem(chave);
        return bruto === null ? null : (JSON.parse(bruto) as T);
      } catch {
        return null;
      }
    },

    async salvar(valor: T): Promise<void> {
      const st = obter();
      if (!st) throw new Error('O armazenamento deste navegador não está disponível.');
      try {
        st.setItem(chave, JSON.stringify(valor));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(
          /quota|exceeded/i.test(msg)
            ? 'O armazenamento do navegador está cheio. Apague cifras antigas ou libere espaço.'
            : 'O navegador não deixou gravar (modo privado ou bloqueio de armazenamento).'
        );
      }
    },

    async limpar(): Promise<void> {
      const st = obter();
      if (!st) return;
      try { st.removeItem(chave); } catch { /* nada a fazer */ }
    },
  };
}
