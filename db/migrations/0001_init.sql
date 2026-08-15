-- ============================================================================
-- Louvor & Aliança — schema inicial (Turso / libSQL · dialeto SQLite)
-- 0001_init.sql
--
-- Princípio central: o nome da missa nunca é digitado à mão. Ele é derivado de
-- campos estruturados (data, tipo, semana, tempo litúrgico) e o `slug` é a
-- única chave que aparece na URL pública, no banco e no nome dos arquivos.
--
-- Arquivos: nada de binário aqui. Os materiais (pptx/pdf/docx) continuam no
-- Google Drive; a tabela `arquivos` guarda o `drive_file_id`. Se um dia migrar
-- para um storage próprio, basta preencher `url_propria` e virar `origem`.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ─── Locais ─────────────────────────────────────────────────────────────────
-- O endereço mora aqui, não na celebração. A missa de todo domingo é no mesmo
-- lugar; repetir o endereço em cada linha é o que faz a página pública
-- divergir da agenda.
CREATE TABLE locais (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  nome         TEXT NOT NULL,
  logradouro   TEXT,
  numero       TEXT,
  complemento  TEXT,
  bairro       TEXT,
  cidade       TEXT,
  uf           TEXT CHECK (uf IS NULL OR length(uf) = 2),
  cep          TEXT CHECK (cep IS NULL OR cep GLOB '[0-9]*' AND length(cep) = 8),
  latitude     REAL,
  longitude    REAL,
  maps_url     TEXT,
  observacoes  TEXT,
  criado_em    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Pessoas ────────────────────────────────────────────────────────────────
-- whatsapp_e164: SEMPRE em formato internacional, só dígitos com o '+'.
-- Nunca a máscara '(11) 98765-4321', nunca a URL 'wa.me/...'. A URL é montada
-- na renderização; máscara guardada quebra no primeiro DDD diferente.
CREATE TABLE pessoas (
  id                 TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  nome               TEXT NOT NULL,
  apelido            TEXT,
  papel              TEXT,
  foto_url           TEXT,
  email              TEXT,
  auth_user_id       TEXT,
  whatsapp_e164      TEXT,
  whatsapp_publico   INTEGER NOT NULL DEFAULT 0 CHECK (whatsapp_publico IN (0,1)),
  whatsapp_opt_in_em TEXT,
  ordem              INTEGER NOT NULL DEFAULT 0,
  ativo              INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
  criado_em          TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (whatsapp_e164 IS NULL OR
         (substr(whatsapp_e164,1,1) = '+' AND length(whatsapp_e164) BETWEEN 9 AND 16))
);

-- ─── Celebrações ────────────────────────────────────────────────────────────
CREATE TABLE celebracoes (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug                 TEXT NOT NULL UNIQUE,
  data                 TEXT NOT NULL CHECK (data GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  hora                 TEXT NOT NULL DEFAULT '09:00' CHECK (hora GLOB '[0-9][0-9]:[0-9][0-9]'),
  local_id             TEXT REFERENCES locais(id),

  tipo                 TEXT NOT NULL DEFAULT 'domingo'
                         CHECK (tipo IN ('domingo','solenidade','festa','memoria','especial')),
  tempo                TEXT NOT NULL
                         CHECK (tempo IN ('advento','natal','quaresma','triduo','pascoa','tempo_comum')),
  -- Calculado da data, nunca digitado. 2026 = Ano A (o ciclo virou no
  -- 1º Domingo do Advento de 2025). É isto que impede repetir o 'AnoC' que
  -- ficou nas pastas do Drive.
  ano_liturgico        TEXT NOT NULL CHECK (ano_liturgico IN ('A','B','C')),
  semana               INTEGER,

  titulo_liturgico     TEXT NOT NULL,   -- gerado: '18º Domingo do Tempo Comum'
  titulo_personalizado TEXT,            -- sobrescreve, para solenidades
  titulo_exibicao      TEXT NOT NULL,   -- 'Missa das 9h — 18º Domingo do Tempo Comum'

  cor                  TEXT NOT NULL DEFAULT 'verde'
                         CHECK (cor IN ('verde','branco','roxo','vermelho','rosa')),
  capa_url             TEXT,
  status               TEXT NOT NULL DEFAULT 'rascunho'
                         CHECK (status IN ('rascunho','publicada','arquivada')),
  publica              INTEGER NOT NULL DEFAULT 0 CHECK (publica IN (0,1)),
  observacoes          TEXT,
  criado_em            TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em        TEXT NOT NULL DEFAULT (datetime('now')),

  -- Não existem duas missas no mesmo dia e horário.
  UNIQUE (data, hora),
  -- Domingo do Tempo Comum tem número de semana; solenidade não tem.
  CHECK ((tipo = 'domingo' AND semana IS NOT NULL) OR tipo <> 'domingo')
);

CREATE INDEX idx_celebracoes_data     ON celebracoes (data DESC);
CREATE INDEX idx_celebracoes_agenda   ON celebracoes (status, publica, data DESC);

CREATE TRIGGER trg_celebracoes_touch AFTER UPDATE ON celebracoes
BEGIN
  UPDATE celebracoes SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;

-- ─── Músicas e repertório ───────────────────────────────────────────────────
CREATE TABLE musicas (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug         TEXT NOT NULL UNIQUE,
  titulo       TEXT NOT NULL,
  autor        TEXT,
  tom_original TEXT,
  letra        TEXT,
  cifra        TEXT,
  youtube_url  TEXT,
  criado_em    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Momentos batem com os nomes dos slides que já existem nas pastas do Drive
-- (canto de entrada, ato penitencial, Glória, Salmo, aclamação, ...).
CREATE TABLE repertorio (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  celebracao_id  TEXT NOT NULL REFERENCES celebracoes(id) ON DELETE CASCADE,
  musica_id      TEXT NOT NULL REFERENCES musicas(id),
  momento        TEXT NOT NULL CHECK (momento IN (
                   'entrada','ato_penitencial','gloria','salmo','aclamacao','sequencia',
                   'ofertorio','santo','pai_nosso','cordeiro','comunhao','pos_comunhao',
                   'final','adoracao','outro')),
  ordem          INTEGER NOT NULL,
  tom_execucao   TEXT,
  responsavel_id TEXT REFERENCES pessoas(id),
  status         TEXT NOT NULL DEFAULT 'a_confirmar'
                   CHECK (status IN ('a_confirmar','em_ensaio','ensaiado','pronto')),
  observacao     TEXT,
  UNIQUE (celebracao_id, ordem)
);

-- ─── Escala ─────────────────────────────────────────────────────────────────
CREATE TABLE escalas (
  celebracao_id TEXT NOT NULL REFERENCES celebracoes(id) ON DELETE CASCADE,
  pessoa_id     TEXT NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  funcao        TEXT,
  confirmado    INTEGER NOT NULL DEFAULT 0 CHECK (confirmado IN (0,1)),
  confirmado_em TEXT,
  PRIMARY KEY (celebracao_id, pessoa_id)
);

-- ─── Arquivos ───────────────────────────────────────────────────────────────
-- nome_exibicao  = o nome bonito, com acento e travessão, que o usuário lê
-- nome_arquivo   = o normalizado, sem acento e sem espaço, que vai na URL
-- Os dois nunca se misturam. É exatamente essa separação que falta no Drive
-- hoje ('17º Domingo do Tempo  Comum - Ano A' com espaço duplo).
CREATE TABLE arquivos (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  celebracao_id TEXT NOT NULL REFERENCES celebracoes(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL CHECK (tipo IN ('pptx','pdf','docx','capa','audio','video','outro')),
  origem        TEXT NOT NULL DEFAULT 'drive' CHECK (origem IN ('drive','url')),
  drive_file_id TEXT,
  url_propria   TEXT,
  nome_exibicao TEXT NOT NULL,
  nome_arquivo  TEXT NOT NULL,
  mime          TEXT,
  tamanho_bytes INTEGER,
  versao        INTEGER NOT NULL DEFAULT 1,
  publico       INTEGER NOT NULL DEFAULT 0 CHECK (publico IN (0,1)),
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK ((origem = 'drive' AND drive_file_id IS NOT NULL)
      OR (origem = 'url'   AND url_propria   IS NOT NULL)),
  UNIQUE (celebracao_id, tipo, versao)
);

CREATE INDEX idx_arquivos_celebracao ON arquivos (celebracao_id, tipo);

-- ─── Recados e mensagens ────────────────────────────────────────────────────
CREATE TABLE recados (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  autor_id  TEXT REFERENCES pessoas(id),
  titulo    TEXT NOT NULL,
  conteudo  TEXT NOT NULL,
  tag       TEXT,
  urgente   INTEGER NOT NULL DEFAULT 0 CHECK (urgente IN (0,1)),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE mensagens (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  autor_id  TEXT REFERENCES pessoas(id),
  conteudo  TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Configuração ───────────────────────────────────────────────────────────
CREATE TABLE config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  nota  TEXT
);

-- ─── Views de leitura ───────────────────────────────────────────────────────
-- A agenda pública e a página de cada missa leem daqui. O `slug` é o mesmo
-- identificador do banco, da URL e do nome do arquivo.
CREATE VIEW v_agenda_publica AS
SELECT
  c.slug,
  c.data,
  c.hora,
  c.titulo_exibicao,
  c.titulo_liturgico,
  c.tipo,
  c.tempo,
  c.ano_liturgico,
  c.cor,
  c.capa_url,
  l.nome        AS local_nome,
  l.bairro      AS local_bairro,
  l.cidade      AS local_cidade,
  l.maps_url    AS local_maps_url
FROM celebracoes c
LEFT JOIN locais l ON l.id = c.local_id
WHERE c.publica = 1 AND c.status = 'publicada'
ORDER BY c.data, c.hora;

CREATE VIEW v_arquivos_publicos AS
SELECT
  c.slug AS celebracao_slug,
  a.tipo,
  a.nome_exibicao,
  a.nome_arquivo,
  a.tamanho_bytes,
  CASE a.origem
    WHEN 'drive' THEN 'https://drive.google.com/file/d/' || a.drive_file_id || '/view'
    ELSE a.url_propria
  END AS url
FROM arquivos a
JOIN celebracoes c ON c.id = a.celebracao_id
WHERE a.publico = 1 AND c.publica = 1 AND c.status = 'publicada';
