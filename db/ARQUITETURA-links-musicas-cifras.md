# Links úteis, músicas e cifras — arquitetura e implementação

**15/08/2026 · Louvor & Aliança**
Responde aos três pontos pedidos: modelagem de dados, estratégia de thumbnails e
preview, e a lógica de parser e transposição.

O núcleo já está implementado e verificado — os trechos abaixo apontam para
arquivos reais no repositório, não para pseudocódigo.

---

## 1. Modelagem de dados

Migration `db/migrations/0003_links_musicas_cifras.sql`, sobre o schema Turso da
fase 2. Três princípios se repetem nas três frentes:

**Guardar o identificador, não o endereço.** `youtube_id` em vez da URL da capa,
`drive_file_id` em vez do link de preview. Endereço apodrece; identificador não.
A URL da capa em alta (`maxresdefault`) simplesmente não existe para todo vídeo —
gravá-la é plantar card quebrado para daqui a três meses.

**Guardar o original, calcular o resto.** A cifra é gravada no tom em que foi
escrita. A transposição acontece na renderização, nunca no banco. Uma verdade só,
sem cópias em Ré e em Mi divergindo com o tempo.

**A cifra é JSON com âncoras, não texto.** É isso que mantém o acorde sobre a
sílaba — a seção 3 explica por quê.

### Links e documentos — uma tabela, três abas

```sql
CREATE TABLE links (
  id, categoria CHECK IN ('sites','documentos','drive'),
  titulo, url, descricao, icone, imagem_url,
  drive_file_id, mime,
  preview_modo CHECK IN ('auto','drive','office','nativo','nenhum'),
  ordem, publico, ativo, criado_por, criado_em, atualizado_em
);
```

Uma tabela só, com `categoria` decidindo a aba (🌐 Sites · ✝️ Documentos
Religiosos · 📁 Google Drive). Três tabelas separadas dariam três CRUDs idênticos
e três telas para manter — e no dia em que um link precisar mudar de aba, viraria
migração de dados em vez de um `UPDATE`.

O `drive_file_id` é o que liga a linha ao preview sem download. O `preview_modo`
em `auto` resolve pelo tipo do arquivo; os outros valores forçam um visualizador
quando o automático erra.

`CHECK (url LIKE 'http://%' OR url LIKE 'https://%')` recusa na entrada o link
sem protocolo, que é o erro mais comum de quem cola de um e-mail.

### Músicas — colunas novas

```sql
ALTER TABLE musicas ADD COLUMN youtube_id            TEXT;
ALTER TABLE musicas ADD COLUMN capa_override_url     TEXT;
ALTER TABLE musicas ADD COLUMN momento_sugerido      TEXT;
ALTER TABLE musicas ADD COLUMN cifra_json            TEXT CHECK (json_valid(...));
ALTER TABLE musicas ADD COLUMN cifra_texto_original  TEXT;
ALTER TABLE musicas ADD COLUMN cifra_origem          TEXT;  -- docx|gdocs|txt|manual|colado
ALTER TABLE musicas ADD COLUMN cifra_revisada        INTEGER DEFAULT 0;
```

`cifra_texto_original` guarda o texto exatamente como veio do Word. Se o parser
classificar uma linha errado, dá para reimportar sem pedir o arquivo de novo — e
`cifra_revisada` marca quais já passaram por olho humano.

O `CHECK (json_valid(cifra_json))` é barato e evita a pior classe de bug desse
módulo: JSON meio gravado que só aparece quando o músico abre a cifra no altar.

### Propostas musicais

```sql
CREATE TABLE propostas_musicais (
  id, musica_id?, titulo, autor, youtube_id, momento_sugerido,
  celebracao_id?, proposto_por, comentario,
  status CHECK IN ('sugerida','em_analise','aprovada','recusada','arquivada'), criado_em
);
CREATE TABLE proposta_votos (proposta_id, pessoa_id, voto CHECK IN (-1,1), PRIMARY KEY (...));
```

Separado de `musicas` de propósito: **proposta é conversa, música é acervo.**
Uma sugestão pode nunca virar música, e misturar as duas enche a biblioteca de
coisa que ninguém cantou. Quando a proposta é aprovada, `musica_id` liga as duas.

Views prontas: `v_links_publicos` e `v_propostas` (esta já traz o nome de quem
propôs e a soma dos votos).

---

## 2. Thumbnails do YouTube e preview de documentos

### Capas — nenhum backend, nenhuma chave de API

`src/lib/youtube.ts`. As URLs de thumbnail do YouTube são públicas e derivadas do
id: guardando `youtube_id`, a capa sai de graça, sem chamada de API, sem chave e
sem custo de serverless.

```ts
idDoYouTube(url)   // cobre watch?v=, youtu.be, /embed/, /shorts/, /live/, /v/
capaDoYouTube(id, 'maxres')  // https://i.ytimg.com/vi/<id>/maxresdefault.jpg
CADEIA_CAPAS       // ['maxres', 'sd', 'hq']
```

**A queda de resolução é obrigatória.** `maxresdefault` (1280×720) e `sddefault`
não existem para todo vídeo — vídeo antigo ou gravado em baixa não tem. Já
`hqdefault` (480×360) existe sempre. No card:

```tsx
const [nivel, setNivel] = useState(0);
<img
  src={capaDoYouTube(musica.youtube_id, CADEIA_CAPAS[nivel])}
  onError={() => setNivel(n => Math.min(n + 1, CADEIA_CAPAS.length - 1))}
  loading="lazy" alt={`Capa de ${musica.titulo}`}
/>
```

Sem isso, o grid fica com buracos justamente nas músicas mais antigas — que num
ministério de igreja são a maioria.

**Quando vale um backend:** só se você quiser o **título e a duração** oficiais
para preencher o formulário sozinho. Aí entra uma rota `/api/youtube?url=…` que
chama o oEmbed público (`https://www.youtube.com/oembed?url=…&format=json`,
também sem chave) e grava título e autor **uma vez**, na hora de cadastrar. Não
faça isso na renderização: seriam N chamadas externas para desenhar um grid.

`urlDeEmbed()` usa `youtube-nocookie.com` por padrão — é o mesmo player sem os
cookies de rastreio, o que importa numa página pública de paróquia.

Compartilhar no WhatsApp reaproveita o que já existe: `linkWhatsApp()` de
`src/lib/whatsapp.ts`, com o link do vídeo na mensagem.

### Preview de documentos — três caminhos, escolhidos pelo arquivo

`src/lib/preview.ts`. Não existe um visualizador que sirva para tudo; a escolha é
técnica, não de preferência:

| Situação | Visualizador | Por quê |
|---|---|---|
| Arquivo no Drive/Docs/Sheets/Slides | `https://drive.google.com/file/d/<id>/preview` | é o único que enxerga arquivo do Drive; renderiza PDF, DOCX e PPTX nativamente |
| Office servido do **nosso** domínio | `view.officeapps.live.com/op/embed.aspx?src=…` | precisa baixar o arquivo pela internet pública |
| PDF do nosso domínio | `<iframe src={url}>` | visualizador nativo do navegador: zero terceiros, zero latência |

**O Office Online Viewer não funciona com link do Drive.** Ele busca o arquivo
pela URL, e o Drive devolve uma página HTML, não o `.docx`. Como os materiais das
missas moram no Drive, o caminho real para eles é sempre o preview do Drive — que
felizmente já renderiza Office muito bem.

**Requisito operacional que costuma passar batido:** o arquivo precisa estar
compartilhado como *"qualquer pessoa com o link"*. Sem isso o visitante da página
pública vê a tela de login do Google, não o documento. Vale conferir isso na hora
de cadastrar o link — e é um bom candidato a validação automática no formulário.

`atributosDoIframe()` já entrega o `sandbox` correto: `allow-same-origin` só
quando o visualizador exige (Drive e Office), nunca no PDF nativo, mais
`referrerPolicy: 'no-referrer'` e `loading: 'lazy'`.

---

## 3. Cifras — parser e transposição

Esta é a parte que você marcou como prioridade, e é onde a decisão de modelagem
decide o resultado.

### Por que texto não funciona

O formato natural parece ser guardar o bloco de texto e transpor com regex — é o
que `src/utils/chordTransposer.ts` faz hoje. O problema é aritmético:

```
G          C         G          →  transpõe para Láb
Como é bom a gente se encontrar
```

`C` vira `Db`: um caractere a mais. `Bb` vira `A`: um a menos. A linha de acordes
muda de comprimento e **tudo o que vem depois desliza**. O acorde deixa de cair
sobre a sílaba, o tempo se perde, e a cifra fica inutilizável exatamente na hora
em que alguém está de pé no altar. Não é um bug do regex — é uma consequência de
guardar posição como espaço em branco.

### O modelo: âncora por caractere

`src/lib/cifras/tipos.ts`. Cada acorde é uma **âncora**: um índice de caractere
dentro da linha de letra.

```ts
type Ancora = { col: number; acorde: string };

type LinhaCifra =
  | { tipo: 'letra';   texto: string; acordes: Ancora[] }
  | { tipo: 'acordes'; acordes: Ancora[] }      // intro, solo
  | { tipo: 'secao';   rotulo: string }         // [Refrão]
  | { tipo: 'texto';   texto: string }
  | { tipo: 'vazia' };
```

```json
{ "tipo": "letra",
  "texto": "Como é bom a gente se encontrar",
  "acordes": [ {"col": 0, "acorde": "G"}, {"col": 11, "acorde": "C"} ] }
```

Transpor percorre só o array `acordes` e troca a string. **`texto` e `col` nunca
são tocados — não por disciplina, mas porque a função de transposição não tem
acesso a eles.** A restrição crítica do pedido deixa de ser algo a testar e passa
a ser uma propriedade do formato.

### Renderização — duas saídas, uma verdade

`src/lib/cifras/render.ts`:

- **Monoespaçada** (`renderizar()`): reconstrói a linha de acordes a partir das
  âncoras, para copiar, imprimir e exportar. Se dois acordes fossem se sobrepor,
  o segundo é empurrado o mínimo — a única concessão possível, e ela mexe só na
  linha de acordes.
- **Na tela**: cada acorde posicionado em `left: {col}ch` sobre a letra, em fonte
  monoespaçada. Aqui a largura do acorde não empurra nada — `C` e `C#` ancoram no
  mesmo ponto. É o alinhamento exato, e é o modo que o app deve usar.

```tsx
<div className="relative font-mono whitespace-pre leading-[2.4]">
  {linha.acordes.map(a => (
    <span key={a.col}
          className="absolute -top-5 text-[#7A2332] font-bold"
          style={{ left: `${a.col}ch` }}>{a.acorde}</span>
  ))}
  {linha.texto}
</div>
```

Fonte monoespaçada é requisito, não estética: `1ch` só é uma coluna previsível se
todo caractere tiver a mesma largura.

Em tela estreita, em vez de rolagem horizontal, o mesmo JSON rende um modo
**inline** (`Como é bom [C]a gente…`) sem tocar em nada do resto.

### O parser

`src/lib/cifras/parser.ts` roda **uma vez**, na importação. Depois disso a verdade
é o JSON.

Classifica cada linha em acordes / letra / seção / vazia e emparelha: linha de
acordes seguida de letra vira uma linha `letra` com as âncoras nas colunas onde os
acordes estavam. Sem letra depois (intro, solo), vira linha `acordes`.

**A armadilha é o português.** "A" e "E" são palavras *e* são notas. A linha

```
E a paz que vem de Ti nos faz cantar
```

passa em qualquer teste do tipo "todos os tokens são acordes". Então a decisão usa
três sinais somados:

1. todo token é acorde ou símbolo de compasso (`| % :| N.C.`);
2. um token com alteração, naipe ou baixo (`Am`, `D7`, `F#`, `C/G`) é prova forte;
3. linha só de fundamentais nuas exige o **desenho esparso** da linha de acordes —
   densidade de caracteres abaixo de 45%. `G      D      Em` passa; `E a paz` não.

Verificado (`npx tsx scripts/verificar-cifras.ts`):

```
── classificação de linhas ──
  ok   linha esparsa de fundamentais é acorde
  ok   linha com naipes e baixo é acorde
  ok   letra começando com "E" NÃO é confundida com acorde
```

O reconhecimento de acorde cobre a notação de cifra brasileira: `m`, `maj`, `dim`,
`aug`, `sus`, `add`, `º`, `ø`, `Δ`, tensões entre parênteses e baixo invertido.

### Grafia enarmônica pelo tom de destino

`Ab` e `G#` são a mesma tecla e leituras muito diferentes. Em Láb, músico de igreja
lê `Ab/Db/Eb`; escrever `G#/C#/D#` é tecnicamente correto e praticamente ilegível.
A grafia sai do **tom de destino**, não de uma preferência global:

```
em Ab sai com bemol:    Ab  Eb/G  Fm  Db  Eb7  B  Gb/Bb  Abm7  Dbm
em D  sai com sustenido: D  A/C#  Bm  G   A7   F  C/E    Dm7   Gm
```

### O invariante, verificado

`scripts/verificar-cifras.ts` transpõe a mesma cifra para **os 12 tons** e checa,
em cada um, que toda linha de letra continua byte a byte idêntica e que toda
âncora continua na mesma coluna:

```
── invariante: letra e âncoras intactas em TODOS os 12 tons ──
  ok   tom C:  letra byte a byte igual e âncoras na mesma coluna
  ok   tom C#: ...
  … (12 tons)
── acorde sobre a sílaba certa ──
  ok   G cai no "C" de "Como"
  ok   C cai no "a" de "a gente" (coluna 11)
```

Rode com `npx tsx scripts/verificar-cifras.ts`. Ele já pegou um bug de verdade
durante a implementação: `prefereBemol('D')` devolvia `true` porque o código
concatenava `'m'` para testar o tom menor e transformava Ré maior em Ré menor —
`D/F#` saía como `A/Db`. Sem os 12 tons no teste, isso chegaria em produção.

### Importação de Word e Google Docs

O parser recebe **texto plano**; a conversão acontece antes:

| Origem | Como chegar ao texto |
|---|---|
| `.txt` | direto |
| `.docx` | `mammoth.extractRawText()` no servidor — preserva quebras de linha, que é tudo o que importa aqui |
| Google Docs | exportar como `text/plain` pela API, ou o usuário cola o conteúdo |
| Colado da área de transferência | direto — é o caminho mais usado na prática |

Uma ressalva honesta: **cifra em Word costuma vir em fonte proporcional**, e aí o
alinhamento visual do arquivo original já está errado antes de nós. O parser usa a
contagem de caracteres, que é o que o autor de fato digitou — normalmente melhor
que o alinhamento aparente. Ainda assim, `cifra_revisada` existe para isso: toda
cifra importada nasce como `0` e vira `1` depois que alguém confere na tela.

Tabulações viram quatro espaços na entrada. Um `\t` que o navegador renderiza com
largura variável destruiria a coluna.

---

## O que falta para fechar o módulo

O núcleo lógico está pronto e testado. Falta a camada visível:

1. **Telas do admin** — CRUD de links (3 abas), formulário de música com colagem
   de link do YouTube e preview da capa, editor de cifra com correção manual de
   classificação de linha.
2. **`CifrasView` migrada** para o novo modelo — hoje ela usa
   `src/utils/chordTransposer.ts`, o transpositor de regex sobre texto. Ele sai
   quando a última tela migrar.
3. **Rotas** `/api/links`, `/api/musicas`, `/api/propostas` (leitura pública) e as
   de escrita atrás de autenticação.
4. **Importador `.docx`** — a rota que recebe o arquivo e chama `mammoth` +
   `analisarCifra()`.

Diga por onde começar e eu sigo.
