-- ============================================================================
-- Louvor & Aliança — seed inicial
-- 0002_seed.sql
--
-- Contém: configuração, o local, os 5 integrantes e as 13 celebrações de
-- junho a agosto de 2026, com os arquivos apontando para o Google Drive.
--
-- Nada aqui foi digitado a partir do nome das pastas do Drive. Datas e títulos
-- vêm do calendário litúrgico de 2026 (Ano A), contado a partir do 34º Domingo
-- — Cristo Rei, 22/11/2026 — e conferido contra o conteúdo de cada pasta.
--
-- ATENÇÃO — três campos precisam da sua confirmação, marcados com «TODO»:
--   1. o nome e o endereço completo do local
--   2. o WhatsApp do ministério (o do botão da página pública)
--   3. os WhatsApps individuais, que nascem privados
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ─── Configuração ───────────────────────────────────────────────────────────
INSERT INTO config (chave, valor, nota) VALUES
  ('whatsapp_ministerio', '',      'TODO — E.164, ex: +5511987654321. É o número do botão público.'),
  ('missa_padrao_hora',   '09:00', 'Valor padrão ao cadastrar uma celebração nova.'),
  ('drive_pasta_missas',  '1L9grg1Ky-RKjl4BC7GPE0gi_5y0eKMUa', 'Pasta MISSAS_2026 no Drive.'),
  ('ano_liturgico_atual', 'A',     '2026 é Ano A. Vira para B no 1º Domingo do Advento, 29/11/2026.');

-- ─── Local ──────────────────────────────────────────────────────────────────
-- TODO: o app hoje diz "Santuário Paroquial Nossa Senhora da Aliança" e a capa
-- oficial diz "Paróquia Nossa Senhora de Fátima". Usei o da capa. Confirme o
-- correto e preencha o endereço — é ele que vai para a página pública e para o
-- link do mapa.
INSERT INTO locais (id, nome, logradouro, numero, bairro, cidade, uf, cep, maps_url, observacoes)
VALUES ('loc-fatima', 'Paróquia Nossa Senhora de Fátima',
        NULL, NULL, NULL, NULL, NULL, NULL, NULL,
        'TODO: confirmar nome oficial e preencher endereço completo com CEP.');

-- ─── Integrantes ────────────────────────────────────────────────────────────
-- Cinco pessoas. "Carla & Marcos" não entra: saiu da equipe.
-- Ana Maria é "Aninha" em toda a aplicação, e o papel dela é Pré-coordenação.
INSERT INTO pessoas (id, nome, apelido, papel, foto_url, ordem, ativo, whatsapp_e164, whatsapp_publico) VALUES
  ('p-rogerio', 'Rogério Marcos', NULL,     'Coordenação, violão e voz',            '/integrantes/rogerio.jpg', 1, 1, NULL, 0),
  ('p-joao',    'João Vítor',     NULL,     'Violão, voz e arranjos',               '/integrantes/joao.jpg',    2, 1, NULL, 0),
  ('p-ana',     'Ana Maria',      'Aninha', 'Pré-coordenação, vocal solo e salmo',  '/integrantes/ana.jpg',     3, 1, NULL, 0),
  ('p-lucas',   'Lucas Creato',   NULL,     'Teclado e contrabaixo',                '/integrantes/lucas.jpg',   4, 1, NULL, 0),
  ('p-edson',   'Edson Silva',    NULL,     'Percussão leve e cajón',               '/integrantes/edson.jpg',   5, 1, NULL, 0);
-- TODO: preencher whatsapp_e164 de cada um. Nascem com whatsapp_publico = 0:
-- número pessoal só aparece para quem está logado no ministério.

-- ─── Celebrações — junho a agosto de 2026 ───────────────────────────────────
INSERT INTO celebracoes
  (id, slug, data, hora, local_id, tipo, tempo, ano_liturgico, semana,
   titulo_liturgico, titulo_personalizado, titulo_exibicao, cor, status, publica, observacoes)
VALUES
  ('c-2026-06-07', '2026-06-07-10-domingo-tempo-comum', '2026-06-07', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 10,
   '10º Domingo do Tempo Comum', NULL, 'Missa das 9h — 10º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-06-14', '2026-06-14-11-domingo-tempo-comum', '2026-06-14', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 11,
   '11º Domingo do Tempo Comum', NULL, 'Missa das 9h — 11º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-06-21', '2026-06-21-12-domingo-tempo-comum', '2026-06-21', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 12,
   '12º Domingo do Tempo Comum', NULL, 'Missa das 9h — 12º Domingo do Tempo Comum',
   'verde', 'publicada', 1,
   'A pasta "12Dom_TempoComum_AnoC_2025" no Drive é sobra de 2025 e foi ignorada.'),

  -- 29/06/2026 cai numa segunda-feira; a solenidade foi antecipada para o
  -- domingo 28/06 e substituiu o 13º Domingo do Tempo Comum. Por isso `semana`
  -- é NULL — não há buraco na agenda.
  ('c-2026-06-28', '2026-06-28-solenidade-sao-pedro-e-sao-paulo', '2026-06-28', '09:00', 'loc-fatima',
   'solenidade', 'tempo_comum', 'A', NULL,
   'Solenidade de São Pedro e São Paulo', 'Solenidade de São Pedro e São Paulo',
   'Missa das 9h — Solenidade de São Pedro e São Paulo',
   'vermelho', 'publicada', 1,
   'Substitui o 13º Domingo do Tempo Comum. Material do Drive ainda marcado "AnoC" (2025).'),

  ('c-2026-07-05', '2026-07-05-14-domingo-tempo-comum', '2026-07-05', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 14,
   '14º Domingo do Tempo Comum', NULL, 'Missa das 9h — 14º Domingo do Tempo Comum',
   'verde', 'publicada', 1, 'Pasta no Drive está nomeada "- cópia".'),

  ('c-2026-07-12', '2026-07-12-15-domingo-tempo-comum', '2026-07-12', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 15,
   '15º Domingo do Tempo Comum', NULL, 'Missa das 9h — 15º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-07-19', '2026-07-19-16-domingo-tempo-comum', '2026-07-19', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 16,
   '16º Domingo do Tempo Comum', NULL, 'Missa das 9h — 16º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-07-26', '2026-07-26-17-domingo-tempo-comum', '2026-07-26', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 17,
   '17º Domingo do Tempo Comum', NULL, 'Missa das 9h — 17º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-08-02', '2026-08-02-18-domingo-tempo-comum', '2026-08-02', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 18,
   '18º Domingo do Tempo Comum', NULL, 'Missa das 9h — 18º Domingo do Tempo Comum',
   'verde', 'publicada', 1, NULL),

  ('c-2026-08-09', '2026-08-09-19-domingo-tempo-comum', '2026-08-09', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 19,
   '19º Domingo do Tempo Comum', NULL, 'Missa das 9h — 19º Domingo do Tempo Comum',
   'verde', 'publicada', 1, 'Sem .pptx no Drive — só PDF e DOCX.'),

  -- Não existe pasta no Drive para este domingo. Entra como rascunho para não
  -- sumir da agenda interna, mas não vai para a página pública.
  ('c-2026-08-16', '2026-08-16-20-domingo-tempo-comum', '2026-08-16', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 20,
   '20º Domingo do Tempo Comum', NULL, 'Missa das 9h — 20º Domingo do Tempo Comum',
   'verde', 'rascunho', 0, 'SEM MATERIAL: não há pasta no Drive para 16/08/2026.'),

  ('c-2026-08-23', '2026-08-23-21-domingo-tempo-comum', '2026-08-23', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 21,
   '21º Domingo do Tempo Comum', NULL, 'Missa das 9h — 21º Domingo do Tempo Comum',
   'verde', 'publicada', 1, 'Sem .pptx no Drive — só PDF e DOCX.'),

  ('c-2026-08-30', '2026-08-30-22-domingo-tempo-comum', '2026-08-30', '09:00', 'loc-fatima',
   'domingo', 'tempo_comum', 'A', 22,
   '22º Domingo do Tempo Comum', NULL, 'Missa das 9h — 22º Domingo do Tempo Comum',
   'verde', 'publicada', 1, 'Sem .pptx no Drive — só PDF e DOCX.');

-- ─── Arquivos ───────────────────────────────────────────────────────────────
-- Todos no Google Drive. `nome_exibicao` é o nome bonito que o usuário lê;
-- `nome_arquivo` é o normalizado, sem acento nem espaço, que vai na URL.
-- PDF é público (é o que abre na página da missa); DOCX e PPTX são internos.
INSERT INTO arquivos (celebracao_id, tipo, origem, drive_file_id, nome_exibicao, nome_arquivo, mime, tamanho_bytes, publico) VALUES
  -- 10º Domingo — 07/06
  ('c-2026-06-07','pdf','drive','1-rJ6jWpNFDxrx7z28_IS43P9V9n4SH_n','10º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',353625,1),
  ('c-2026-06-07','docx','drive','1x86LuTS5bPJOVFWbJ3RWrSQAnW68h2IO','10º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',4224768,0),
  ('c-2026-06-07','pptx','drive','1Xd6pJAA7Gv44I69-nCehOtPy67ykbzuJ','10º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',64870973,0),

  -- 11º Domingo — 14/06
  ('c-2026-06-14','pdf','drive','1_noCa99XssS8UaDEsFsu8dPiSrE5TVzN','11º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',353625,1),
  ('c-2026-06-14','docx','drive','1BPGcyqn5PuL6ksNkLaQ4Xz9uPsmiHKaI','11º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',362641,0),
  ('c-2026-06-14','pptx','drive','1kxVgKrc5WqyYCW5LeqU_QrSQfxwGQN8k','11º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',67933755,0),

  -- 12º Domingo — 21/06
  ('c-2026-06-21','pdf','drive','1mX9YZwtrlqCdw_Tdqu_Eswe34rOLvO0Z','12º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',353625,1),
  ('c-2026-06-21','docx','drive','1g-t1_fIzCoPwXRxSJ1wZ7e-PBMli-KNl','12º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',362641,0),
  ('c-2026-06-21','pptx','drive','1OUo_s3yvPTi9_I6uwBrPcY4VtbTKAmuH','12º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',65407594,0),

  -- Solenidade de São Pedro e São Paulo — 28/06
  ('c-2026-06-28','pdf','drive','11AVNe8PMt3G8comohitl7rs9MkRF9jn8','Solenidade de São Pedro e São Paulo — Roteiro','roteiro.pdf','application/pdf',305951,1),
  ('c-2026-06-28','docx','drive','1ANZpu3cXaVgHVJ5Vu9kQmB4DpBzrKq4s','Solenidade de São Pedro e São Paulo — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',376347,0),
  ('c-2026-06-28','pptx','drive','1bnVW6cXRHymRqZPAx-KoNfGetZLSG3br','Solenidade de São Pedro e São Paulo — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',52629116,0),

  -- 14º Domingo — 05/07
  ('c-2026-07-05','pdf','drive','1xdAaNezxtIydm8nRf8RSEgWebFlG7NDn','14º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',241108,1),
  ('c-2026-07-05','docx','drive','1d4uRxMrR3Q9XK1_vSnB5fH2_-BOXLM5A','14º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',360297,0),
  ('c-2026-07-05','pptx','drive','1dgZ18BMBhklrIZeUiVGIVD8e2FC4g9Ej','14º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',79008656,0),

  -- 15º Domingo — 12/07
  ('c-2026-07-12','pdf','drive','1s-LLInE7xKPEbHarkdLmh9sf_gH_9uUv','15º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',346734,1),
  ('c-2026-07-12','docx','drive','1EomC7ObtC85v4hn1HP2Z_ZJs3hPcH8rz','15º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',360457,0),
  ('c-2026-07-12','pptx','drive','1xxbC0msdsdyGlGoAbCaFyoEWmFT00Tdh','15º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',78816611,0),

  -- 16º Domingo — 19/07
  ('c-2026-07-19','pdf','drive','1tDZtwCCd1DF0JQtgHlWOqcp2Pvj12Vov','16º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',346734,1),
  ('c-2026-07-19','docx','drive','1hKN2nD5Bf05QbGRj3onbDcSJah70l70g','16º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',360457,0),
  ('c-2026-07-19','pptx','drive','1u1LCBUb2x1SZFnWpqlYFuiuYWbkb9z-w','16º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',77920690,0),

  -- 17º Domingo — 26/07
  ('c-2026-07-26','pdf','drive','1MWzM2CnNTU1UD92tPMN-dbr2ucoAJwj3','17º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',346734,1),
  ('c-2026-07-26','docx','drive','1_kl92pF7a99JCPwGwqMyrjusKqk11_S4','17º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',360457,0),
  ('c-2026-07-26','pptx','drive','1XsI-rPFAVaYXKH3NY17gcO0y5F-6Dufm','17º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',78698305,0),

  -- 18º Domingo — 02/08
  ('c-2026-08-02','pdf','drive','1megn_p1fkwHjSO9zF3Yi9aZTmYDDQInx','18º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',284478,1),
  ('c-2026-08-02','docx','drive','19Kz2HDYO-OnoE3fL-GmjB8B84pueGKwk','18º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',983212,0),
  ('c-2026-08-02','pptx','drive','19CpGfc4MUFVjr47gWkOFjGK0L0THDOyO','18º Domingo do Tempo Comum — Projeção','projecao.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation',71791236,0),

  -- 19º Domingo — 09/08 (sem pptx)
  ('c-2026-08-09','pdf','drive','1NLHdXtFjsR4O2zA-e7vVIIGE6iuwo8iz','19º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',247638,1),
  ('c-2026-08-09','docx','drive','1MQAJXsh_m-0V8AOFSEVuiVAhTZlQW2kr','19º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',199446,0),

  -- 21º Domingo — 23/08 (sem pptx)
  ('c-2026-08-23','pdf','drive','1-BbhceqhbLoOX0YijE1tE09bQYkRceSy','21º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',319973,1),
  ('c-2026-08-23','docx','drive','1M7-I799F6Hlw0XgZr69EiRaGX0FdCT3l','21º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',195238,0),

  -- 22º Domingo — 30/08 (sem pptx)
  ('c-2026-08-30','pdf','drive','1fWFTP9pk8U5tWOZFFpiNL1NCKIVHHPOt','22º Domingo do Tempo Comum — Roteiro','roteiro.pdf','application/pdf',319973,1),
  ('c-2026-08-30','docx','drive','1aOM-bkRNrscw--TgMVy8rkenWSPAom-I','22º Domingo do Tempo Comum — Texto de trabalho','roteiro.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',195238,0);

-- ─── Escala padrão ──────────────────────────────────────────────────────────
-- Os 5 integrantes em todas as celebrações publicadas, ainda não confirmados.
INSERT INTO escalas (celebracao_id, pessoa_id, funcao, confirmado)
SELECT c.id, p.id, p.papel, 0
FROM celebracoes c CROSS JOIN pessoas p
WHERE c.status = 'publicada' AND p.ativo = 1;
