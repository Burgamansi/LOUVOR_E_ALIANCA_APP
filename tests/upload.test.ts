import { describe, expect, it } from 'vitest';
import {
  validarArquivo, sanitizarNome, extensaoDe, descreverAceitos,
  EXTENSOES_CIFRA, EXTENSOES_ARQUIVO_MISSA, LIMITE_CIFRA_BYTES, LIMITE_ARQUIVO_BYTES,
} from '../src/lib/upload/validar';

const cifra = { extensoes: EXTENSOES_CIFRA, limiteBytes: LIMITE_CIFRA_BYTES };
const missa = { extensoes: EXTENSOES_ARQUIVO_MISSA, limiteBytes: LIMITE_ARQUIVO_BYTES };

describe('tipo permitido', () => {
  it.each([
    ['cifra.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['cifra.txt', 'text/plain'],
    ['cifra.pdf', 'application/pdf'],
    ['foto.jpg', 'image/jpeg'],
    ['foto.jpeg', 'image/jpeg'],
    ['foto.png', 'image/png'],
    ['foto.webp', 'image/webp'],
    ['MAIUSCULA.PDF', 'application/pdf'],
  ])('%s (%s) é aceito na importação de cifra', (name, type) => {
    const r = validarArquivo({ name, type, size: 1000 }, cifra);
    expect(r.ok).toBe(true);
    expect(r.erro).toBe('');
  });

  it('MIME vazio é aceito quando a extensão está na lista (Windows com .webp)', () => {
    expect(validarArquivo({ name: 'foto.webp', type: '', size: 10 }, cifra).ok).toBe(true);
  });

  it('arquivo de missa aceita Office e imagem', () => {
    for (const name of ['roteiro.pdf', 'texto.doc', 'texto.docx', 'proj.ppt', 'proj.pptx', 'capa.png']) {
      expect(validarArquivo({ name, type: '', size: 10 }, missa).ok).toBe(true);
    }
  });
});

describe('tipo inválido', () => {
  it.each(['virus.exe', 'planilha.xlsx', 'script.js', 'semextensao', 'a.html', 'cifra.doc'])(
    '%s é recusado na importação de cifra', (name) => {
      const r = validarArquivo({ name, type: '', size: 10 }, cifra);
      expect(r.ok).toBe(false);
      expect(r.erro).toMatch(/não é aceito/);
    }
  );

  it('MIME que não bate com a extensão é recusado', () => {
    const r = validarArquivo({ name: 'cifra.pdf', type: 'application/x-msdownload', size: 10 }, cifra);
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/não corresponde à extensão/);
  });

  it('extensão disfarçada no meio do nome não engana', () => {
    expect(validarArquivo({ name: 'cifra.pdf.exe', type: '', size: 10 }, cifra).ok).toBe(false);
  });
});

describe('tamanho', () => {
  it('arquivo vazio é recusado', () => {
    expect(validarArquivo({ name: 'a.txt', type: 'text/plain', size: 0 }, cifra).erro).toMatch(/vazio/);
  });
  it('acima do limite é recusado com os dois tamanhos na mensagem', () => {
    const r = validarArquivo({ name: 'a.pdf', type: 'application/pdf', size: LIMITE_CIFRA_BYTES + 1 }, cifra);
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/20 MB/);
  });
  it('exatamente no limite passa', () => {
    expect(validarArquivo({ name: 'a.pdf', type: 'application/pdf', size: LIMITE_CIFRA_BYTES }, cifra).ok).toBe(true);
  });
});

describe('nome do arquivo', () => {
  it('remove caminho e impede travessia de diretório', () => {
    expect(sanitizarNome('../../etc/passwd')).toBe('etc passwd');
    expect(sanitizarNome('C:\\Users\\x\\cifra.docx')).toBe('C Users x cifra.docx');
    expect(sanitizarNome('..\\..\\cifra.pdf')).toBe('cifra.pdf');
    expect(sanitizarNome('cifra..pdf')).toBe('cifra.pdf');
  });
  it('remove caracteres de controle e proibidos', () => {
    expect(sanitizarNome('ci\u0000fra<1>:"x"|?*.txt')).toBe('cifra1x.txt');
  });
  it('nome vazio vira "arquivo"', () => {
    expect(sanitizarNome('   ')).toBe('arquivo');
    expect(sanitizarNome('...')).toBe('arquivo');
  });
  it('limita o comprimento preservando a extensão', () => {
    const longo = `${'a'.repeat(300)}.docx`;
    const s = sanitizarNome(longo);
    expect(s.length).toBeLessThanOrEqual(120);
    expect(s.endsWith('.docx')).toBe(true);
  });
  it('o resultado da validação já traz o nome saneado', () => {
    const r = validarArquivo({ name: '../x/Missa 23-08.pdf', type: 'application/pdf', size: 5 }, cifra);
    expect(r.nome).toBe('x Missa 23-08.pdf');
    expect(extensaoDe(r.nome)).toBe('pdf');
  });
});

describe('descrição dos tipos aceitos', () => {
  it('lê bem em português', () => {
    expect(descreverAceitos(EXTENSOES_CIFRA)).toBe('Word (.docx), texto (.txt), PDF ou imagem (JPG, JPEG, PNG, WEBP)');
    expect(descreverAceitos(EXTENSOES_ARQUIVO_MISSA)).toBe(
      'Word (.doc, .docx), PDF, PowerPoint (.ppt, .pptx) ou imagem (JPG, JPEG, PNG, WEBP)'
    );
  });
});
