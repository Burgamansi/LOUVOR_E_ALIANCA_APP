-- ============================================================================
-- Louvor & Aliança — links úteis, propostas musicais e cifras
-- 0003_links_musicas_cifras.sql
--
-- Três princípios que se repetem nas três tabelas:
--
--  1. Guardar o IDENTIFICADOR, não o endereço. `youtube_id` em vez da URL da
--     capa; `drive_file_id` em vez do link de preview. Endereço muda e
--     apodrece; identificador não.
--  2. Guardar o ORIGINAL, calcular o resto. A cifra é gravada no tom em que
--     foi escrita; a transposição acontece na renderização. Uma verdade só.
--  3. A cifra é JSON com âncoras, não texto. É o que impede o acorde de sair
--     de cima da sílaba quando 'C' vira 'C#'.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ─── Links úteis e documentos ───────────────────────────────────────────────
-- Uma tabela só, com `categoria` decidindo a aba. Três tabelas separadas
-- dariam três CRUDs iguais e três telas para manter.
CREATE TABLE links (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  categoria     TEXT NOT NULL CHECK (categoria IN ('sites','documentos','drive')),
  titulo        TEXT NOT NULL,
  url           TEXT NOT NULL,
  descricao     TEXT,
  icone         TEXT,                       -- nome do Material Symbol
  imagem_url    TEXT,                       -- miniatura opcional do card

  -- Preenchido quando o link é do Drive. É o que liga a linha ao preview
  -- nativo (`https://drive.google.com/file/d/<id>/preview`) sem download.
  drive_file_id TEXT,
  mime          TEXT,

  -- 'auto' resolve pelo tipo do arquivo; os outros forçam um visualizador.
  preview_modo  TEXT NOT NULL DEFAULT 'auto'
                  CHECK (preview_modo IN ('auto','drive','office','nativo','nenhum')),

  ordem         INTEGER NOT NULL DEFAULT 0,
  publico       INTEGER NOT NULL DEFAULT 1 CHECK (publico IN (0,1)),
  ativo         INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
  criado_por    TEXT REFERENCES pessoas(id),
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),

  CHECK (url LIKE 'http://%' OR url LIKE 'https://%')
);

CREATE INDEX idx_links_aba ON links (categoria, ativo, ordem);

CREATE TRIGGER trg_links_touch AFTER UPDATE ON links
BEGIN
  UPDATE links SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;

-- ─── Músicas: capa do YouTube e cifra ───────────────────────────────────────
-- `youtube_id` (11 caracteres), nunca a URL da capa: a `maxresdefault` não
-- existe para todo vídeo, e uma URL gravada vira card quebrado. A capa é
-- derivada do id na renderização, com queda automática de resolução.
ALTER TABLE musicas ADD COLUMN youtube_id TEXT;
ALTER TABLE musicas ADD COLUMN capa_override_url TEXT;   -- só quando a do YouTube não serve
ALTER TABLE musicas ADD COLUMN momento_sugerido TEXT;
ALTER TABLE musicas ADD COLUMN observacoes TEXT;

-- A cifra estruturada. Formato em src/lib/cifras/tipos.ts:
--   { versao, tomOriginal, linhas: [{ tipo:'letra', texto, acordes:[{col,acorde}] }, ...] }
-- `col` é o índice do caractere da letra sobre o qual o acorde cai. Transpor
-- troca só a string do acorde: `texto` e `col` nunca são tocados, e é por isso
-- que o alinhamento sobrevive a qualquer tom.
ALTER TABLE musicas ADD COLUMN cifra_json TEXT
  CHECK (cifra_json IS NULL OR json_valid(cifra_json));

-- O texto como veio do Word/Docs/TXT. Guardado para auditoria: se o parser
-- errar a classificação de uma linha, dá para reimportar sem pedir o arquivo
-- de volta.
ALTER TABLE musicas ADD COLUMN cifra_texto_original TEXT;
ALTER TABLE musicas ADD COLUMN cifra_origem TEXT
  CHECK (cifra_origem IS NULL OR cifra_origem IN ('docx','gdocs','txt','manual','colado'));
ALTER TABLE musicas ADD COLUMN cifra_revisada INTEGER NOT NULL DEFAULT 0
  CHECK (cifra_revisada IN (0,1));

CREATE INDEX idx_musicas_youtube ON musicas (youtube_id);

-- ─── Propostas musicais ─────────────────────────────────────────────────────
-- O grid de cards de sugestões. Separado de `musicas` de propósito: proposta é
-- conversa do ministério e pode nem virar música; música é acervo.
CREATE TABLE propostas_musicais (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  musica_id        TEXT REFERENCES musicas(id) ON DELETE SET NULL,
  titulo           TEXT NOT NULL,
  autor            TEXT,
  youtube_id       TEXT,
  momento_sugerido TEXT CHECK (momento_sugerido IS NULL OR momento_sugerido IN (
                     'entrada','ato_penitencial','gloria','salmo','aclamacao','sequencia',
                     'ofertorio','santo','pai_nosso','cordeiro','comunhao','pos_comunhao',
                     'final','adoracao','outro')),
  celebracao_id    TEXT REFERENCES celebracoes(id) ON DELETE SET NULL,
  proposto_por     TEXT REFERENCES pessoas(id),
  comentario       TEXT,
  status           TEXT NOT NULL DEFAULT 'sugerida'
                     CHECK (status IN ('sugerida','em_analise','aprovada','recusada','arquivada')),
  criado_em        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_propostas_status ON propostas_musicais (status, criado_em DESC);

CREATE TABLE proposta_votos (
  proposta_id TEXT NOT NULL REFERENCES propostas_musicais(id) ON DELETE CASCADE,
  pessoa_id   TEXT NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  voto        INTEGER NOT NULL CHECK (voto IN (-1, 1)),
  criado_em   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (proposta_id, pessoa_id)
);

-- ─── Views ──────────────────────────────────────────────────────────────────
CREATE VIEW v_links_publicos AS
SELECT categoria, titulo, url, descricao, icone, imagem_url,
       drive_file_id, mime, preview_modo, ordem
FROM links
WHERE ativo = 1 AND publico = 1
ORDER BY categoria, ordem, titulo;

CREATE VIEW v_propostas AS
SELECT p.id, p.titulo, p.autor, p.youtube_id, p.momento_sugerido, p.status,
       p.comentario, p.criado_em,
       COALESCE(pe.apelido, pe.nome) AS proposto_por_nome,
       c.slug                        AS celebracao_slug,
       COALESCE(SUM(v.voto), 0)      AS votos
FROM propostas_musicais p
LEFT JOIN pessoas      pe ON pe.id = p.proposto_por
LEFT JOIN celebracoes  c  ON c.id  = p.celebracao_id
LEFT JOIN proposta_votos v ON v.proposta_id = p.id
GROUP BY p.id
ORDER BY p.criado_em DESC;
