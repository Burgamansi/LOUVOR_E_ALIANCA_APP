import { useState } from 'react';
import type { TabType } from '../types';
import { linkGrupoWhatsApp } from '../lib/whatsapp';

interface BoasVindasProps {
  aberto: boolean;
  onFechar: () => void;
  onIrPara: (aba: TabType) => void;
  /** Convite do grupo da equipe, se houver. */
  grupo?: string | null;
  nomeGrupo?: string;
}

/**
 * Primeiro acesso.
 *
 * O app tem oito áreas e nenhuma delas se explica sozinha por um ícone de 22 px
 * numa barra que rola. Quem recebe o link no grupo do WhatsApp abre, vê a
 * programação, e vai embora achando que o app é uma agenda — as cifras, as
 * propostas e a galeria nunca são descobertas.
 *
 * São três telas porque três é o que se lê antes de a paciência acabar: o que é
 * isto, o que tem aqui dentro, por onde começar. A segunda é a que importa e é
 * a única obrigatória de fato — as outras duas emolduram.
 *
 * O mapa não é decorativo: cada cartão é um botão que leva à área. Quem
 * entendeu na leitura já entra pelo lugar certo, e quem não entendeu ao menos
 * viu o nome uma vez.
 */
export function BoasVindas({ aberto, onFechar, onIrPara, grupo, nomeGrupo }: BoasVindasProps) {
  const [passo, setPasso] = useState(0);

  if (!aberto) return null;

  const areas: { tab: TabType; icone: string; titulo: string; texto: string }[] = [
    { tab: 'programacao', icone: 'event_note', titulo: 'Programação',
      texto: 'A próxima celebração: quem toca, o que se canta e em que ordem.' },
    { tab: 'cifras', icone: 'music_note', titulo: 'Cifras',
      texto: 'O repertório com cifra, mudança de tom e rolagem automática para tocar.' },
    { tab: 'missas', icone: 'event_available', titulo: 'Missas & Arquivos',
      texto: 'O roteiro de cada missa e os documentos, abertos aqui mesmo.' },
    { tab: 'propostas', icone: 'queue_music', titulo: 'Propostas',
      texto: 'Sugestões de música da equipe para montar o repertório junto.' },
    { tab: 'links', icone: 'link', titulo: 'Links Úteis',
      texto: 'Liturgia diária, documentos da Igreja e a pasta do Drive.' },
    { tab: 'drive', icone: 'auto_stories', titulo: 'Biblioteca',
      texto: 'O acervo do ministério: partituras, áudios e materiais de estudo.' },
    { tab: 'midia', icone: 'photo_camera', titulo: 'Galeria',
      texto: 'As fotos e os vídeos das celebrações que já passaram.' },
    { tab: 'comunidade', icone: 'diversity_3', titulo: 'Comunidade',
      texto: 'Avisos da coordenação, pedidos de oração e recados da equipe.' },
  ];

  const irPara = (aba: TabType) => { onIrPara(aba); onFechar(); };
  const linkDoGrupo = linkGrupoWhatsApp(grupo);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-[#2D2118]/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border border-[#C9A24A]/40 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Passos */}
        <div className="shrink-0 flex items-center gap-2 px-5 pt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= passo ? 'bg-[#7A2332]' : 'bg-[#7A2332]/15'
              }`}
            />
          ))}
          <button
            onClick={onFechar}
            className="ml-2 text-[11px] font-bold text-[#5C4A3E] hover:text-[#7A2332] cursor-pointer shrink-0"
          >
            Pular
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {passo === 0 && (
            <div className="text-center flex flex-col items-center gap-3 py-4">
              <div className="w-20 h-20 rounded-full bg-[#7A2332] flex items-center justify-center ring-2 ring-[#C9A24A] shadow-md">
                <span aria-hidden className="material-symbols-outlined text-4xl text-[#C9A24A]">church</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#C9A24A]">
                  Ministério Louvor &amp; Aliança
                </p>
                <h2 className="font-serif text-3xl font-bold text-[#7A2332] mt-1">
                  Bem-vindo ao app da equipe
                </h2>
              </div>
              <p className="text-sm text-[#5C4A3E] max-w-md leading-relaxed">
                Aqui fica tudo o que a equipe precisa para servir na missa: a escala da próxima
                celebração, o repertório com as cifras prontas para tocar e os arquivos de cada
                domingo. Sem instalar nada — é só guardar este endereço.
              </p>
              <p className="text-xs text-[#5C4A3E] bg-white border border-[#7A2332]/15 rounded-2xl px-4 py-3 max-w-md">
                <strong className="text-[#7A2332]">Dica:</strong> no celular, toque em “compartilhar” e
                depois em <em>“Adicionar à tela de início”</em>. O app passa a abrir como qualquer outro.
              </p>
            </div>
          )}

          {passo === 1 && (
            <div className="flex flex-col gap-3">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold text-[#7A2332]">O que tem aqui dentro</h2>
                <p className="text-xs text-[#5C4A3E] mt-1">Toque em qualquer área para ir direto.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {areas.map((a) => (
                  <button
                    key={a.tab}
                    onClick={() => irPara(a.tab)}
                    className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-[#7A2332]/15 hover:border-[#7A2332]/45 hover:bg-[#7A2332]/5 transition text-left cursor-pointer"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center">
                      <span aria-hidden className="material-symbols-outlined text-lg">{a.icone}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-sm font-bold text-[#7A2332]">{a.titulo}</span>
                      <span className="block text-[11px] text-[#5C4A3E] leading-snug">{a.texto}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {passo === 2 && (
            <div className="flex flex-col gap-3 py-2">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold text-[#7A2332]">Por onde começar</h2>
                <p className="text-xs text-[#5C4A3E] mt-1">Três coisas e você já está servindo com a equipe.</p>
              </div>

              <ol className="flex flex-col gap-2">
                {[
                  { n: 1, titulo: 'Confirme sua presença', texto: 'Na Programação, diga se você toca na próxima missa.', tab: 'programacao' as TabType, icone: 'how_to_reg' },
                  { n: 2, titulo: 'Abra o repertório', texto: 'Nas Cifras, mude o tom e ligue a rolagem automática para ensaiar.', tab: 'cifras' as TabType, icone: 'music_note' },
                  { n: 3, titulo: 'Fale com a equipe', texto: 'Combinados, trocas de escala e avisos do dia a dia.', tab: 'comunidade' as TabType, icone: 'forum' },
                ].map((p) => (
                  <li key={p.n}>
                    <button
                      onClick={() => irPara(p.tab)}
                      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#7A2332]/15 hover:border-[#7A2332]/45 transition text-left cursor-pointer"
                    >
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#C9A24A]/20 text-[#7A2332] font-bold flex items-center justify-center text-sm">
                        {p.n}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#7A2332]">{p.titulo}</span>
                        <span className="block text-[11px] text-[#5C4A3E]">{p.texto}</span>
                      </span>
                      <span aria-hidden className="material-symbols-outlined text-[#7A2332]">chevron_right</span>
                    </button>
                  </li>
                ))}
              </ol>

              {linkDoGrupo && (
                <a
                  href={linkDoGrupo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm shadow-sm hover:brightness-95 transition"
                >
                  <span aria-hidden className="material-symbols-outlined">group_add</span>
                  <span className="flex-1 min-w-0">
                    <span className="block">Entrar no grupo da equipe</span>
                    <span className="block text-[11px] font-normal opacity-90 truncate">
                      {nomeGrupo ?? 'WhatsApp'}
                    </span>
                  </span>
                  <span aria-hidden className="material-symbols-outlined">open_in_new</span>
                </a>
              )}
            </div>
          )}
        </div>

        <footer className="shrink-0 flex items-center justify-between gap-3 px-5 py-3.5 border-t border-[#7A2332]/15 bg-white/60">
          <button
            onClick={() => setPasso((p) => Math.max(p - 1, 0))}
            disabled={passo === 0}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#5C4A3E] disabled:opacity-0 hover:bg-black/5 cursor-pointer"
          >
            Voltar
          </button>

          <button
            onClick={() => (passo === 2 ? onFechar() : setPasso((p) => p + 1))}
            className="px-6 py-2.5 rounded-full bg-[#7A2332] text-[#FFF9F2] text-sm font-bold hover:brightness-110 transition cursor-pointer"
          >
            {passo === 2 ? 'Começar' : 'Continuar'}
          </button>
        </footer>
      </div>
    </div>
  );
}
