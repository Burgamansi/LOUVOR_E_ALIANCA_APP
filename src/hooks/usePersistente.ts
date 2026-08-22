import { useCallback, useEffect, useRef, useState } from 'react';
import { repositorioLocal } from '../lib/repositorio/local';
import type { Repositorio, StatusSalvamento } from '../lib/repositorio/tipos';

/**
 * Estado que persiste, com o status da persistência à vista.
 *
 * É o sucessor do `useLocal`. A diferença que importa: o `useLocal` gravava
 * em silêncio e nunca dizia se tinha gravado. Aqui cada gravação passa por
 * `salvando → salvo | erro`, e a tela mostra isso — "Salvo" só aparece
 * depois que o repositório confirmou.
 *
 * Dois modos:
 *  · `automatico: true` (padrão) — toda mudança de valor é gravada. Serve
 *    para preferências e listas que a pessoa edita aos poucos (repertório,
 *    favoritos);
 *  · `automatico: false` — `setValor` muda só a tela; grava quem chamar
 *    `salvar()`. Serve para o tom da cifra, que se ajusta no ensaio e se
 *    guarda de propósito com o botão Salvar.
 *
 * `sujo` diz se há mudança não gravada — no modo manual é o que acende o
 * botão Salvar.
 */
export function usePersistente<T>(
  chave: string,
  inicial: T,
  opcoes: { automatico?: boolean; repositorio?: Repositorio<T> } = {}
) {
  const { automatico = true } = opcoes;
  const repo = useRef<Repositorio<T>>(opcoes.repositorio ?? repositorioLocal<T>(chave));

  const [valor, setValorInterno] = useState<T>(() => repo.current.ler() ?? inicial);
  const [salvo, setSalvo] = useState<T>(valor);
  // Espelho do valor atual para `salvar()` ler sem depender do ciclo de render.
  const valorRef = useRef(valor);
  valorRef.current = valor;
  const [status, setStatus] = useState<StatusSalvamento>('ocioso');
  const [erro, setErro] = useState<string | null>(null);

  // Gravação com número de sequência: se duas gravações se cruzarem, só a
  // última decide o status. Sem isto, um "salvo" atrasado apagaria um "erro".
  const sequencia = useRef(0);
  const temporizador = useRef<number | null>(null);

  const gravar = useCallback(async (v: T): Promise<boolean> => {
    const minha = ++sequencia.current;
    setStatus('salvando');
    setErro(null);
    try {
      await repo.current.salvar(v);
      if (minha !== sequencia.current) return true;
      setSalvo(v);
      setStatus('salvo');
      // "Salvo" some sozinho depois de um tempo; "erro" fica até a próxima tentativa.
      if (temporizador.current) window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => setStatus((s) => (s === 'salvo' ? 'ocioso' : s)), 2500);
      return true;
    } catch (e) {
      if (minha !== sequencia.current) return false;
      setStatus('erro');
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
      return false;
    }
  }, []);

  useEffect(() => () => { if (temporizador.current) window.clearTimeout(temporizador.current); }, []);

  // Modo automático: grava a cada mudança. O primeiro render não grava — o
  // valor acabou de ser lido de lá.
  const primeiro = useRef(true);
  useEffect(() => {
    if (!automatico) return;
    if (primeiro.current) { primeiro.current = false; return; }
    void gravar(valor);
  }, [valor, automatico, gravar]);

  const setValor = useCallback((novo: T | ((atual: T) => T)) => {
    setValorInterno((atual) => (typeof novo === 'function' ? (novo as (a: T) => T)(atual) : novo));
  }, []);

  /** Grava o valor atual (ou o valor dado, que também passa a ser o atual). */
  const salvar = useCallback(async (explicito?: T): Promise<boolean> => {
    let alvo: T;
    if (explicito !== undefined) {
      alvo = explicito;
      valorRef.current = explicito;
      setValorInterno(explicito);
    } else {
      alvo = valorRef.current;
    }
    return gravar(alvo);
  }, [gravar]);

  /** Descarta a mudança não gravada e volta ao último valor salvo. */
  const descartar = useCallback(() => setValorInterno(salvo), [salvo]);

  const limpar = useCallback(async () => {
    await repo.current.limpar();
    setValorInterno(inicial);
    setSalvo(inicial);
    setStatus('ocioso');
  }, [inicial]);

  const sujo = valor !== salvo;

  return {
    valor, setValor, salvar, descartar, limpar,
    status, erro, sujo,
    alcance: repo.current.alcance,
  };
}
