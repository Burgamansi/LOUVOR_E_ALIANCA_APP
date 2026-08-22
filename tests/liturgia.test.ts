import { describe, expect, it } from 'vitest';
import {
  tempoLiturgico, anoLiturgico, semanaDoTitulo, tipoDeCelebracao,
} from '../src/lib/liturgia/derivar';
import { MISSAS } from '../src/data/missas';

describe('tempo litúrgico lido do título', () => {
  it.each([
    ['1º Domingo do Advento', 'advento'],
    ['4º Domingo do Advento', 'advento'],
    ['3º Domingo do Advento — Gaudete', 'advento'],
    ['Natal do Senhor', 'natal'],
    ['Festa da Sagrada Família', 'natal'],
    ['Solenidade de Santa Maria, Mãe de Deus', 'natal'],
    ['Epifania do Senhor', 'natal'],
    ['Festa do Batismo do Senhor', 'natal'],
    ['1º Domingo da Quaresma', 'quaresma'],
    ['5º Domingo da Quaresma', 'quaresma'],
    ['Domingo da Páscoa da Ressurreição do Senhor', 'pascoa'],
    ['2º Domingo da Páscoa — da Divina Misericórdia', 'pascoa'],
    ['Ascensão do Senhor', 'pascoa'],
    ['Pentecostes', 'pascoa'],
    ['10º Domingo do Tempo Comum', 'tempo_comum'],
    ['Santíssima Trindade', 'tempo_comum'],
    ['Santíssimo Corpo e Sangue de Cristo', 'tempo_comum'],
    ['Nosso Senhor Jesus Cristo, Rei do Universo', 'tempo_comum'],
    ['Assunção de Nossa Senhora', 'tempo_comum'],
    ['Apresentação do Senhor', 'tempo_comum'],
  ])('%s → %s', (titulo, esperado) => {
    expect(tempoLiturgico(titulo)).toBe(esperado);
  });

  // Os dois casos em que um mapeamento ingênuo erra.
  it('Domingo de Ramos é quaresma, não páscoa — é o último domingo dela', () => {
    expect(tempoLiturgico('Domingo de Ramos da Paixão do Senhor')).toBe('quaresma');
  });

  it('Vigília Pascal é tríduo, não páscoa, apesar de "Pascal" no nome', () => {
    expect(tempoLiturgico('Vigília Pascal na Noite Santa')).toBe('triduo');
    expect(tempoLiturgico('Tríduo Pascal — Quinta e Sexta-feira Santa')).toBe('triduo');
  });
});

describe('ano litúrgico vira no Advento, não em 1º de janeiro', () => {
  it.each([
    ['2025-01-12', 'C'],
    ['2025-06-08', 'C'],
    ['2025-11-29', 'C'],   // véspera do Advento: ainda Ano C
    ['2025-11-30', 'A'],   // 1º Domingo do Advento de 2025: vira o Ano A
    ['2025-12-25', 'A'],
    ['2026-08-30', 'A'],
  ])('%s → Ano %s', (data, esperado) => {
    expect(anoLiturgico(data)).toBe(esperado);
  });
});

describe('número da semana', () => {
  it.each([
    ['10º Domingo do Tempo Comum', 10],
    ['1º Domingo do Advento', 1],
    ['22º Domingo do Tempo Comum', 22],
    ['2º Domingo da Páscoa — da Divina Misericórdia', 2],
  ])('%s → %i', (titulo, esperado) => {
    expect(semanaDoTitulo(titulo)).toBe(esperado);
  });

  it.each(['Pentecostes', 'Festa do Batismo do Senhor', 'Natal do Senhor'])(
    '%s não tem número', (titulo) => {
      expect(semanaDoTitulo(titulo)).toBeNull();
    }
  );
});

describe('tipo da celebração', () => {
  it('solenidade continua solenidade', () => {
    expect(tipoDeCelebracao('solenidade', 'Pentecostes')).toBe('solenidade');
  });
  it('domingo com número é domingo', () => {
    expect(tipoDeCelebracao('domingo', '10º Domingo do Tempo Comum')).toBe('domingo');
  });
  it('“domingo” sem número é Festa — é o que Batismo e Sagrada Família são', () => {
    expect(tipoDeCelebracao('domingo', 'Festa do Batismo do Senhor')).toBe('festa');
    expect(tipoDeCelebracao('domingo', 'Festa da Sagrada Família')).toBe('festa');
  });
});

describe('o acervo inteiro satisfaz o que o banco exige', () => {
  it('todo domingo tem número de semana — o banco recusa domingo sem ele', () => {
    const semSemana = MISSAS
      .filter((m) => tipoDeCelebracao(m.tipo, m.tituloLiturgico) === 'domingo')
      .filter((m) => semanaDoTitulo(m.tituloLiturgico) === null);
    expect(semSemana).toEqual([]);
  });

  it('todo tempo litúrgico derivado é um dos valores aceitos pelo banco', () => {
    const aceitos = ['advento', 'natal', 'quaresma', 'triduo', 'pascoa', 'tempo_comum'];
    for (const m of MISSAS) {
      expect(aceitos).toContain(tempoLiturgico(m.tituloLiturgico));
    }
  });

  it('nenhum slug repetido — o banco tem UNIQUE nele', () => {
    const slugs = MISSAS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('nenhuma missa tem dois arquivos do mesmo tipo — o banco tem UNIQUE (celebração, tipo, versão)', () => {
    for (const m of MISSAS) {
      const tipos = m.arquivos.map((a) => a.tipo);
      expect(new Set(tipos).size, `${m.slug}: ${tipos.join(', ')}`).toBe(tipos.length);
    }
  });

  it('o acervo tem o tamanho que a tela mostra hoje', () => {
    expect(MISSAS.length).toBe(82);
    expect(MISSAS.reduce((s, m) => s + m.arquivos.length, 0)).toBe(211);
  });
});
