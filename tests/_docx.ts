// Monta um .docx mínimo em memória, sem dependência externa.
//
// Um .docx é um ZIP com alguns XMLs. Para o teste basta o método "store"
// (sem compressão) — só precisamos do cabeçalho de cada entrada com CRC-32
// e do diretório central no fim.

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function zip(entradas: { nome: string; dados: Uint8Array }[]): Uint8Array {
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let deslocamento = 0;
  const enc = new TextEncoder();

  const u16 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const u32 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  const junta = (...xs: Uint8Array[]) => {
    const total = xs.reduce((s, x) => s + x.length, 0);
    const saida = new Uint8Array(total);
    let p = 0;
    for (const x of xs) { saida.set(x, p); p += x.length; }
    return saida;
  };

  for (const { nome, dados } of entradas) {
    const nomeBytes = enc.encode(nome);
    const crc = crc32(dados);
    const local = junta(
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(dados.length), u32(dados.length), u16(nomeBytes.length), u16(0),
      nomeBytes, dados
    );
    central.push(junta(
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(dados.length), u32(dados.length), u16(nomeBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(deslocamento), nomeBytes
    ));
    partes.push(local);
    deslocamento += local.length;
  }

  const dirCentral = junta(...central);
  const fim = junta(
    u32(0x06054b50), u16(0), u16(0), u16(entradas.length), u16(entradas.length),
    u32(dirCentral.length), u32(deslocamento), u16(0)
  );
  return junta(...partes, dirCentral, fim);
}

/** PNG 1×1 válido (vermelho). */
export const PNG_1X1 = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0)
);

export type Bloco =
  | { tipo: 'texto'; linhas: string[] }
  | { tipo: 'imagem' }
  | { tipo: 'tabela'; linhas: string[][] };

const escapar = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Um parágrafo do Word; espaços preservados com xml:space="preserve". */
const paragrafo = (texto: string) =>
  `<w:p><w:r><w:t xml:space="preserve">${escapar(texto)}</w:t></w:r></w:p>`;

const imagem = (n: number) =>
  `<w:p><w:r><w:drawing><wp:inline><wp:docPr id="${n}" name="Imagem ${n}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:blipFill><a:blip r:embed="rId${n + 10}"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

const tabela = (linhas: string[][]) =>
  `<w:tbl>${linhas.map((l) => `<w:tr>${l.map((c) => `<w:tc>${paragrafo(c)}</w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>`;

/** Gera os bytes de um .docx com os blocos na ordem dada. */
export function montarDocx(blocos: Bloco[]): ArrayBuffer {
  const enc = new TextEncoder();
  let nImagens = 0;
  const corpo = blocos.map((b) => {
    if (b.tipo === 'texto') return b.linhas.map(paragrafo).join('');
    if (b.tipo === 'tabela') return tabela(b.linhas);
    nImagens++;
    return imagem(nImagens);
  }).join('');

  const documento =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"` +
    ` xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<w:body>${corpo}</w:body></w:document>`;

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    Array.from({ length: nImagens }, (_, i) =>
      `<Relationship Id="rId${i + 11}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.png"/>`
    ).join('') +
    `</Relationships>`;

  const tipos =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Default Extension="png" ContentType="image/png"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;

  const raiz =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const entradas = [
    { nome: '[Content_Types].xml', dados: enc.encode(tipos) },
    { nome: '_rels/.rels', dados: enc.encode(raiz) },
    { nome: 'word/document.xml', dados: enc.encode(documento) },
    { nome: 'word/_rels/document.xml.rels', dados: enc.encode(rels) },
    ...Array.from({ length: nImagens }, (_, i) => ({ nome: `word/media/image${i + 1}.png`, dados: PNG_1X1 })),
  ];

  const bytes = zip(entradas);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
