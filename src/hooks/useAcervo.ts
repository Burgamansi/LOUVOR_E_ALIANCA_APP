import { useCallback, useEffect, useState } from 'react';
import { MISSAS } from '../data/missas';
import type { Missa } from '../data/missas';
import { mesclar } from '../lib/acervo/mesclar';
import type { MissaDaApi } from '../lib/acervo/mesclar';

/**
 * O acervo de missas, do banco quando dá e do bundle sempre.
 *
 * Começa já com o acervo embarcado — a tela desenha no primeiro quadro, sem
 * "carregando" e sem depender de rede. Quando o banco responde, o que ele tem
 * substitui o que era conhecido e o resto continua onde estava.
 *
 * `origem` existe para a tela poder ser honesta com quem está olhando: dizer
 * "isto veio do banco, sua equipe vê o mesmo" é diferente de deixar a pessoa
 * supondo. Enquanto o banco não responde — ou se ele falhar — a tela diz que
 * está mostrando o acervo do aplicativo.
 */
export type OrigemDoAcervo = 'embarcado' | 'banco' | 'falhou';

export function useAcervo() {
  const [missas, setMissas] = useState<Missa[]>(MISSAS);
  const [origem, setOrigem] = useState<OrigemDoAcervo>('embarcado');
  // Mudar este número refaz a busca. É como a tela pede o acervo de volta
  // depois de gravar uma troca de arquivo: sem isso, ela mostraria o que
  // buscou ao abrir, e a alteração recém-gravada só apareceria no F5.
  const [pedido, setPedido] = useState(0);

  const recarregar = useCallback(() => setPedido((n) => n + 1), []);

  useEffect(() => {
    // Uma requisição que ficou pendente quando a tela saiu não deve escrever
    // num componente que já não existe.
    const controle = new AbortController();

    (async () => {
      try {
        const resposta = await fetch('/api/acervo', { signal: controle.signal });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const corpo: unknown = await resposta.json();
        const lista = (corpo as { missas?: MissaDaApi[] })?.missas;
        if (!Array.isArray(lista)) throw new Error('resposta sem lista de missas');

        setMissas(mesclar(MISSAS, lista));
        setOrigem('banco');
      } catch (erro) {
        if (controle.signal.aborted) return;
        // Falhar aqui não é falhar para o usuário: o acervo embarcado já está
        // na tela e continua servindo. O estado muda só para a tela poder
        // dizer de onde veio o que está mostrando.
        console.warn('[acervo] banco indisponível, seguindo com o acervo do aplicativo:', erro);
        setOrigem('falhou');
      }
    })();

    return () => controle.abort();
  }, [pedido]);

  return { missas, origem, recarregar };
}
