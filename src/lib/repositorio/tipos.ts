// Onde os dados do ministério são guardados — por trás de uma interface.
//
// Hoje existe uma implementação só: localStorage (`local.ts`). O app não tem
// backend ligado — o Turso está modelado em db/ e as rotas /api existem, mas
// não há variável de ambiente na Vercel nem rota de escrita. Enquanto isso,
// o que se salva vale só neste aparelho, e a tela diz isso.
//
// A interface existe para que o dia em que o banco ligar seja uma troca de
// implementação (`api.ts` chamando /api/*), não uma reescrita de componente.
// Por isso tudo aqui é assíncrono, mesmo o localStorage sendo síncrono: o
// componente já está escrito para esperar — e o feedback "Salvo" só aparece
// depois que a promessa resolve, nunca antes.

export type StatusSalvamento = 'ocioso' | 'salvando' | 'salvo' | 'erro';

export interface Repositorio<T> {
  /** O valor guardado, ou null se nunca houve um. Nunca lança. */
  ler(): T | null;
  /** Persiste. Lança se não conseguir — é o erro que vira "Não foi possível salvar". */
  salvar(valor: T): Promise<void>;
  /** Apaga o valor guardado. */
  limpar(): Promise<void>;
  /** Onde este repositório grava — para a tela explicar o alcance do que salvou. */
  readonly alcance: 'aparelho' | 'ministerio';
}
