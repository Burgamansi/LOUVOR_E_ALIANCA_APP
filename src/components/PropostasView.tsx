import { useState } from 'react';
import { CADEIA_CAPAS, capaDoYouTube, idDoYouTube, urlDeEmbed, urlDoVideo } from '../lib/youtube';
import { linkWhatsApp } from '../lib/whatsapp';

interface Proposta {
  id: string;
  titulo: string;
  autor?: string;
  youtubeId: string;
  momento?: string;
  propostoPor: string;
  comentario?: string;
}

const MOMENTOS = [
  'Entrada', 'Ato Penitencial', 'Glória', 'Salmo', 'Aclamação', 'Ofertório',
  'Santo', 'Cordeiro', 'Comunhão', 'Pós-Comunhão', 'Final',
];

const INICIAIS: Proposta[] = [
  { id: 'p1', titulo: 'Como É Bom A Gente Se Encontrar', autor: 'Pe. Zezinho',
    youtubeId: 'Xc0bJNPUS0k', momento: 'Entrada', propostoPor: 'Rogério',
    comentario: 'Entrada festiva, acolhe bem as famílias.' },
  { id: 'p2', titulo: 'Maria de Nazaré', autor: 'Pe. Zezinho',
    youtubeId: '9tVvHKMFVfY', momento: 'Comunhão', propostoPor: 'Aninha' },
  { id: 'p3', titulo: 'Eu Navegarei', autor: 'Tradicional',
    youtubeId: 'yZS3EbEwvVg', momento: 'Final', propostoPor: 'João Vítor',
    comentario: 'Boa para encerrar com a assembleia cantando junto.' },
];

/** Capa com queda de resolução: maxres não existe para todo vídeo. */
function CapaYouTube({ id, alt }: { id: string; alt: string }) {
  const [nivel, setNivel] = useState(0);
  return (
    <img
      src={capaDoYouTube(id, CADEIA_CAPAS[nivel])}
      onError={() => setNivel((n) => Math.min(n + 1, CADEIA_CAPAS.length - 1))}
      alt={alt}
      loading="lazy"
      className="w-full aspect-video object-cover bg-[#2D2118]"
    />
  );
}

export function PropostasView() {
  const [propostas, setPropostas] = useState<Proposta[]>(INICIAIS);
  const [tocando, setTocando] = useState<string | null>(null);
  const [novoLink, setNovoLink] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoMomento, setNovoMomento] = useState('');

  const idDetectado = idDoYouTube(novoLink);
  const podeAdicionar = Boolean(idDetectado) && novoTitulo.trim().length > 0;

  const adicionar = () => {
    if (!idDetectado || !novoTitulo.trim()) return;
    setPropostas((atuais) => [
      { id: `p-${Date.now()}`, titulo: novoTitulo.trim(), youtubeId: idDetectado,
        momento: novoMomento || undefined, propostoPor: 'Você' },
      ...atuais,
    ]);
    setNovoLink(''); setNovoTitulo(''); setNovoMomento('');
  };

  const campo = 'w-full px-3 py-2 rounded-xl border border-[#7A2332]/20 bg-white text-sm text-[#2D2118] focus:outline-none focus:border-[#7A2332]';

  return (
    <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-5">
      <header className="pt-2 mb-5">
        <span className="text-xs text-[#C9A24A] uppercase tracking-[0.2em] font-bold">
          Compartilhamento
        </span>
        <h2 className="font-serif text-3xl text-[#7A2332] font-bold">Propostas Musicais</h2>
        <p className="text-sm text-[#5C4A3E] mt-1">
          Cole o link do YouTube e a capa vem sozinha. Quem sugeriu, para que momento, e o
          vídeo tocando aqui mesmo.
        </p>
      </header>

      {/* Formulário */}
      <div className="mb-6 p-4 bg-[#FFF9F2] rounded-2xl border border-[#C9A24A]/40 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#5C4A3E]">Link do YouTube</span>
          <input
            className={campo}
            value={novoLink}
            onChange={(e) => setNovoLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…  ou  https://youtu.be/…"
            inputMode="url"
          />
          {novoLink && !idDetectado && (
            <span className="text-[11px] text-red-700">
              Não reconheci um vídeo nesse endereço.
            </span>
          )}
        </label>

        {idDetectado && (
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#7A2332]/15">
            <img
              src={capaDoYouTube(idDetectado, 'mq')}
              alt=""
              className="w-24 aspect-video object-cover rounded-lg bg-[#2D2118]"
            />
            <div className="text-xs text-[#5C4A3E]">
              <p className="font-bold text-[#7A2332]">Capa encontrada</p>
              <p className="font-mono text-[10px]">{idDetectado}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#5C4A3E]">Título da música</span>
            <input className={campo} value={novoTitulo}
                   onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Como É Bom A Gente Se Encontrar" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#5C4A3E]">Momento sugerido</span>
            <select className={campo} value={novoMomento} onChange={(e) => setNovoMomento(e.target.value)}>
              <option value="">Sem momento definido</option>
              {MOMENTOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>

        <button
          onClick={adicionar}
          disabled={!podeAdicionar}
          className="self-end px-5 py-2 rounded-full text-sm font-bold bg-[#7A2332] text-[#FFF9F2] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer"
        >
          Compartilhar proposta
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {propostas.map((p) => (
          <article key={p.id} className="bg-white rounded-2xl border border-[#7A2332]/15 shadow-xs overflow-hidden flex flex-col">
            <div className="relative">
              {tocando === p.id ? (
                <iframe
                  src={`${urlDeEmbed(p.youtubeId)}&autoplay=1`}
                  title={p.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video border-0 bg-black"
                />
              ) : (
                <button
                  onClick={() => setTocando(p.id)}
                  aria-label={`Reproduzir ${p.titulo}`}
                  className="block w-full relative group cursor-pointer"
                >
                  <CapaYouTube id={p.youtubeId} alt={`Capa de ${p.titulo}`} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition">
                    <span className="w-14 h-14 rounded-full bg-[#7A2332]/90 text-[#FFF9F2] flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </span>
                  </span>
                  {p.momento && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-[#C9A24A] text-[#2D2118]">
                      {p.momento}
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-2 flex-1">
              <div className="flex-1">
                <h3 className="font-serif text-[#7A2332] font-bold leading-snug">{p.titulo}</h3>
                {p.autor && <p className="text-xs text-[#5C4A3E]">{p.autor}</p>}
                {p.comentario && (
                  <p className="text-xs text-[#5C4A3E] mt-1.5 italic">“{p.comentario}”</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#7A2332]/10">
                <span className="text-[11px] text-[#5C4A3E] flex-1 truncate">
                  por <strong className="text-[#7A2332]">{p.propostoPor}</strong>
                </span>

                <a
                  href={linkWhatsApp('+5500000000000',
                    `Proposta para a missa: ${p.titulo}${p.momento ? ` (${p.momento})` : ''} — ${urlDoVideo(p.youtubeId)}`)}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Compartilhar no WhatsApp"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:brightness-95 transition"
                >
                  <IconeZap className="w-4 h-4" />
                </a>
                <a
                  href={urlDoVideo(p.youtubeId)}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Abrir no YouTube"
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-[#7A2332]/25 text-[#7A2332] hover:bg-[#7A2332]/10 transition"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function IconeZap({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}
