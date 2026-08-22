import { describe, expect, it } from 'vitest';
import { repositorioLocal } from '../src/lib/repositorio/local';

/** localStorage de mentira: o suficiente para ler, gravar e falhar de propósito. */
function armazenamentoFalso(opcoes: { falhar?: 'quota' | 'bloqueado' } = {}) {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (opcoes.falhar === 'quota') throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      if (opcoes.falhar === 'bloqueado') throw new Error('SecurityError');
      dados.set(k, v);
    },
    removeItem: (k: string) => { dados.delete(k); },
  };
}

describe('repositório local', () => {
  it('grava e lê de volta o mesmo valor', async () => {
    const st = armazenamentoFalso();
    const repo = repositorioLocal<{ a: number }>('x', st);
    expect(repo.ler()).toBeNull();
    await repo.salvar({ a: 1 });
    expect(repo.ler()).toEqual({ a: 1 });
    expect(st.dados.get('x')).toBe('{"a":1}');
  });

  it('JSON corrompido devolve null em vez de quebrar', () => {
    const st = armazenamentoFalso();
    st.dados.set('x', '{nope');
    expect(repositorioLocal('x', st).ler()).toBeNull();
  });

  it('cota cheia vira erro explicado — nunca "Salvo" falso', async () => {
    const repo = repositorioLocal('x', armazenamentoFalso({ falhar: 'quota' }));
    await expect(repo.salvar(1)).rejects.toThrow(/cheio/);
  });

  it('armazenamento bloqueado vira erro explicado', async () => {
    const repo = repositorioLocal('x', armazenamentoFalso({ falhar: 'bloqueado' }));
    await expect(repo.salvar(1)).rejects.toThrow(/não deixou gravar/);
  });

  it('limpar apaga e a leitura seguinte é null', async () => {
    const st = armazenamentoFalso();
    const repo = repositorioLocal('x', st);
    await repo.salvar('v');
    await repo.limpar();
    expect(repo.ler()).toBeNull();
  });

  it('declara o alcance: este aparelho', () => {
    expect(repositorioLocal('x', armazenamentoFalso()).alcance).toBe('aparelho');
  });
});
