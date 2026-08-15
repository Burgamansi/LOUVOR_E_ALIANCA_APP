/**
 * Verificação do invariante que dá nome ao módulo:
 * transpor NUNCA altera a letra nem a posição das âncoras.
 *
 *   npx tsx scripts/verificar-cifras.ts
 */
import { analisarCifra, ehLinhaDeAcordes } from '../src/lib/cifras/parser';
import { transporCifra, renderizar, campoHarmonico } from '../src/lib/cifras/render';
import { TONS } from '../src/lib/cifras/acordes';

const ORIGINAL = [
  '[Intro]',
  'G   D/F#  Em   C',
  '',
  'G          C         G',
  'Como é bom a gente se encontrar',
  '       D7                    G',
  'Neste lugar onde o amor de Deus reluz',
  'E a paz que vem de Ti nos faz cantar',
  '   Bb        F/A      Gm7      Cm',
  'Senhor, aqui estamos para Te louvar',
].join('\n');

let falhas = 0;
const ok = (cond: boolean, msg: string) => {
  console.log(`${cond ? '  ok  ' : ' FALHA'} ${msg}`);
  if (!cond) falhas++;
};

console.log('\n── classificação de linhas ──');
ok(ehLinhaDeAcordes('G          C         G'), 'linha esparsa de fundamentais é acorde');
ok(ehLinhaDeAcordes('   Bb        F/A      Gm7      Cm'), 'linha com naipes e baixo é acorde');
ok(!ehLinhaDeAcordes('E a paz que vem de Ti nos faz cantar'),
   'letra começando com "E" NÃO é confundida com acorde');
ok(!ehLinhaDeAcordes('Como é bom a gente se encontrar'), 'letra comum não é acorde');

const cifra = analisarCifra(ORIGINAL, 'G', 'txt');

console.log('\n── estrutura ──');
const letras = cifra.linhas.filter(l => l.tipo === 'letra');
ok(letras.length === 4, `4 linhas de letra reconhecidas (achou ${letras.length})`);
ok(cifra.linhas.some(l => l.tipo === 'secao'), 'seção [Intro] reconhecida');
ok(cifra.linhas.some(l => l.tipo === 'acordes'), 'linha de intro sem letra vira linha de acordes');

console.log('\n── invariante: letra e âncoras intactas em TODOS os 12 tons ──');
const letrasOriginais = letras.map(l => (l as any).texto as string);
const ancorasOriginais = letras.map(l => (l as any).acordes.map((a: any) => a.col).join(','));

for (const tom of TONS) {
  const t = transporCifra(cifra, tom);
  const tl = t.linhas.filter(l => l.tipo === 'letra');
  const textosIguais = tl.every((l, i) => (l as any).texto === letrasOriginais[i]);
  const ancorasIguais = tl.every((l, i) =>
    (l as any).acordes.map((a: any) => a.col).join(',') === ancorasOriginais[i]);
  ok(textosIguais && ancorasIguais, `tom ${tom}: letra byte a byte igual e âncoras na mesma coluna`);
}

console.log('\n── grafia enarmônica segue o tom de destino ──');
const emAb = campoHarmonico(transporCifra(cifra, 'Ab')).join(' ');
const emD  = campoHarmonico(transporCifra(cifra, 'D')).join(' ');
ok(/b/.test(emAb) && !/#/.test(emAb), `em Ab sai com bemol: ${emAb}`);
ok(/#/.test(emD), `em D sai com sustenido: ${emD}`);

console.log('\n── render em Ab (o caso que quebrava: C→Db cresce, Bb→B encolhe) ──');
for (const l of renderizar(transporCifra(cifra, 'Ab'))) {
  if (l.acordes !== null) console.log('  ' + l.acordes);
  if (l.letra !== null) console.log('  ' + l.letra);
}

console.log('\n── acorde sobre a sílaba certa ──');
const linhaComo = cifra.linhas.find(
  l => l.tipo === 'letra' && (l as any).texto.startsWith('Como')) as any;
ok(linhaComo.acordes[0].col === 0, 'G cai no "C" de "Como"');
ok(linhaComo.texto[linhaComo.acordes[1].col] === 'a',
   `C cai no "a" de "a gente" (coluna ${linhaComo.acordes[1].col})`);

console.log(falhas === 0 ? '\n✓ tudo certo\n' : `\n✗ ${falhas} falha(s)\n`);
process.exit(falhas === 0 ? 0 : 1);
