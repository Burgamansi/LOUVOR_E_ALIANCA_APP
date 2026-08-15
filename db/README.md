# Banco de dados — Louvor & Aliança

Turso (libSQL, dialeto SQLite). Os arquivos pesados **não** vivem aqui: o
`.pptx` de 65–79 MB de cada missa continua no Google Drive e o banco guarda o
`drive_file_id`.

```
db/
  migrations/0001_init.sql   estrutura
  seed/0002_seed.sql         configuração, local, 5 integrantes,
                             13 celebrações de junho a agosto de 2026
```

## Aplicar

```bash
turso db shell <nome-do-banco> < db/migrations/0001_init.sql
turso db shell <nome-do-banco> < db/seed/0002_seed.sql
```

Conferir:

```bash
turso db shell <nome-do-banco> "SELECT data, titulo_exibicao FROM v_agenda_publica;"
```

Devem sair 12 missas — a de 16/08 fica de fora de propósito: é rascunho, porque
não existe pasta dela no Drive.

## Variáveis de ambiente

```
TURSO_DATABASE_URL=libsql://<seu-banco>.turso.io
TURSO_AUTH_TOKEN=<token>
```

**Sem o prefixo `VITE_`, e isso é proposital.** Qualquer variável `VITE_*` é
embutida no bundle e fica legível em "ver código-fonte". O Turso não tem Row
Level Security: quem tem o token tem o banco inteiro, para ler e para escrever.
Um token no bundle de uma página pública é o banco aberto para a internet.

Por isso o front-end **nunca** fala com o Turso direto. Ele chama `/api/*`, que
roda como função serverless na Vercel, onde o token fica no servidor. Configure
as duas variáveis em **Vercel → Settings → Environment Variables**, e localmente
em `.env.local` (que já está no `.gitignore`).

## Rotas

| Rota | O que devolve |
|---|---|
| `GET /api/agenda` | as missas publicadas, em ordem de data — alimenta a Agenda por Missas |
| `GET /api/agenda?de=&ate=` | recorte por período |
| `GET /api/missa/[slug]` | a missa, o repertório na ordem litúrgica e os arquivos públicos |

O `slug` da URL é o mesmo do banco e o mesmo do nome do arquivo:
`2026-08-02-18-domingo-tempo-comum`.

## O que ainda precisa ser preenchido

No `0002_seed.sql`, marcado com `TODO`:

1. **Local** — o app diz "Santuário Paroquial Nossa Senhora da Aliança", a capa
   oficial diz "Paróquia Nossa Senhora de Fátima". Falta o correto e o endereço
   completo com CEP, que vão para a página pública e para o link do mapa.
2. **`config('whatsapp_ministerio')`** — o número do botão da página pública.
3. **`pessoas.whatsapp_e164`** — os cinco números. Nascem com
   `whatsapp_publico = 0`: número pessoal só aparece para quem está logado.

## Achados do calendário de 2026

As datas não vieram do nome das pastas do Drive; foram calculadas do calendário
litúrgico (Ano A, contado a partir de Cristo Rei em 22/11/2026) e conferidas
contra o conteúdo de cada pasta. Dois resultados:

- **O 13º Domingo não está faltando.** 29/06/2026 cai numa segunda; a Solenidade
  de São Pedro e São Paulo foi antecipada para domingo 28/06 e o substituiu.
- **O 20º Domingo (16/08) não tem pasta no Drive.** Está no banco como rascunho.

E três missas não têm `.pptx` no Drive, só PDF e DOCX: 19º (09/08), 21º (23/08)
e 22º (30/08).
