import { describe, expect, it } from 'vitest';
import { dividirEmCantos, lerCabecalhoDeMomento } from '../src/lib/cifras/cantos';

const MISSA = [
  'ENTRADA',
  'G          C         G',
  'Como é bom a gente se encontrar',
  '',
  'ATO PENITENCIAL — Senhor que viestes salvar',
  'Am        E7        Am',
  'Senhor, que viestes salvar os corações',
  '',
  'GLÓRIA',
  'D        A        D',
  'Glória a Deus nas alturas',
  '',
  'OFERTÓRIO: A mesa santa',
  'C      F      G',
  'A mesa santa que preparamos',
  '',
  'CANTO: PAEZINHOS',
  'E   A   B7',
  'Pãezinhos, pãezinhos',
  '',
  'FINAL',
  'G   D   G',
  'Ide em paz',
].join('\n');

describe('cabeçalho de momento', () => {
  it.each([
    ['ENTRADA', 'ENTRADA', ''],
    ['Ofertório: Segue-me', 'OFERTÓRIO', 'Segue-me'],
    ['COMUNHÃO 2', 'COMUNHÃO', ''],
    ['1 - Santo', 'SANTO', ''],
    ['CANTO: GLÓRIA A DEUS - Opção 02', 'GLÓRIA', 'GLÓRIA A DEUS - Opção 02'],
    ['Canto final', 'FINAL', ''],
  ])('%s → %s / "%s"', (linha, momento, resto) => {
    expect(lerCabecalhoDeMomento(linha)).toEqual({ momento, resto });
  });

  it('verso que contém o nome do momento NÃO é cabeçalho', () => {
    expect(lerCabecalhoDeMomento('Santo é o Senhor Deus do universo')).toBeNull();
  });
  it('linha de acordes não é cabeçalho', () => {
    expect(lerCabecalhoDeMomento('G  D  Em  C')).toBeNull();
  });
  it('[Final] entre colchetes é seção da música, não momento', () => {
    expect(lerCabecalhoDeMomento('[Final]')).toBeNull();
  });
});

describe('documento com várias músicas', () => {
  const cantos = dividirEmCantos(MISSA);

  it('encontra os seis cantos na ordem do arquivo', () => {
    expect(cantos.map((c) => c.momento)).toEqual([
      'ENTRADA', 'ATO PENITENCIAL', 'GLÓRIA', 'OFERTÓRIO', null, 'FINAL',
    ]);
  });

  it('título vem do cabeçalho quando há, senão do primeiro verso', () => {
    expect(cantos[0].titulo).toBe('Como é bom a gente se encontrar');
    expect(cantos[1].titulo).toBe('Senhor que viestes salvar');
    expect(cantos[3].titulo).toBe('A mesa santa');
    expect(cantos[4].titulo).toBe('PAEZINHOS');
  });

  it('cada canto tem o seu próprio tom', () => {
    expect(cantos.map((c) => c.tomSugerido)).toEqual(['G', 'Am', 'D', 'G', 'B', 'G']);
  });

  it('a linha do cabeçalho não entra no corpo', () => {
    expect(cantos[2].texto.split('\n')[0]).toBe('D        A        D');
  });

  it('confiança alta quando veio de rótulo', () => {
    expect(cantos.every((c) => c.confianca === 'alta')).toBe(true);
  });

  it('arquivo de uma música só volta como um canto', () => {
    const um = dividirEmCantos('G   C\nComo é bom');
    expect(um).toHaveLength(1);
    expect(um[0].momento).toBeNull();
  });
});
