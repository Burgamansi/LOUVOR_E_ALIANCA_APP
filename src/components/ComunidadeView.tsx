import React, { useState } from 'react';
import { Notice, ChatMessage, Musician, PastCelebration } from '../types';
import { MusicianFrequencyChart } from './MusicianFrequencyChart';

interface ComunidadeViewProps {
  notices: Notice[];
  messages: ChatMessage[];
  musicians: Musician[];
  pastCelebrations: PastCelebration[];
  onAddNotice: (notice: Notice) => void;
  onSendMessage: (text: string) => void;
  onOpenNewNoticeModal: () => void;
}

export const ComunidadeView: React.FC<ComunidadeViewProps> = ({
  notices,
  messages,
  musicians,
  pastCelebrations,
  onSendMessage,
  onOpenNewNoticeModal,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const choirSingerAvatar = "/integrantes/ana.jpg";
  const organistAvatar = "/integrantes/lucas.jpg";

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#7A2332] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest shadow-xl transition-all z-50 animate-bounce border border-[#C9A24A]/40">
          {toastMessage}
        </div>
      )}

      {/* Community Header & Stats */}
      <div className="px-5 mb-6 pt-2">
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#C9A24A] uppercase tracking-widest mb-1 font-bold">
              Comunhão & Vivência
            </span>
            <h2 className="font-serif text-3xl text-[#7A2332] font-bold">
              Comunidade Louvor & Aliança
            </h2>
          </div>

          <div className="flex -space-x-2">
            <img
              alt="Choir Member 1"
              className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
              src={choirSingerAvatar}
            />
            <img
              alt="Choir Member 2"
              className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
              src={organistAvatar}
            />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#C9A24A] flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              +12
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl flex flex-col gap-1 border border-[#7A2332]/15 shadow-xs">
            <span className="material-symbols-outlined text-[#C9A24A]">church</span>
            <span className="text-[10px] uppercase font-bold text-[#5C4A3E]">Próximo Ensaio</span>
            <span className="font-serif text-base text-[#7A2332] font-bold">Sáb, às 16h</span>
          </div>

          <div className="bg-white p-4 rounded-2xl flex flex-col gap-1 border border-[#7A2332]/15 shadow-xs">
            <span className="material-symbols-outlined text-[#C9A24A]">auto_stories</span>
            <span className="text-[10px] uppercase font-bold text-[#5C4A3E]">Liturgia do Dia</span>
            <span className="font-serif text-base text-[#7A2332] font-bold">Tempo Comum</span>
          </div>
        </div>
      </div>

      {/* Musician Attendance & Frequency Chart */}
      <div className="px-5 mb-8">
        <MusicianFrequencyChart
          musicians={musicians}
          pastCelebrations={pastCelebrations}
        />
      </div>

      {/* Mural (Notice Board) */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7A2332]">push_pin</span>
            <h3 className="font-serif text-xl text-[#7A2332] font-bold">Mural de Recados</h3>
          </div>

          <button
            onClick={onOpenNewNoticeModal}
            className="text-xs font-semibold text-[#7A2332] bg-[#FFF9F2] px-3.5 py-1.5 rounded-full border border-[#7A2332]/20 hover:bg-[#7A2332]/10 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Novo Recado
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {notices.map((notice) => (
            <div key={notice.id} className="relative group">
              <div className="relative bg-white p-5 rounded-2xl shadow-xs border-l-4 border-[#C9A24A] border-y border-r border-[#7A2332]/15 overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-[#5C4A3E] font-medium">
                    {notice.dateStr} {notice.tag ? `· ${notice.tag}` : ''}
                  </span>
                  <span className="material-symbols-outlined text-[#5C4A3E] text-sm">more_vert</span>
                </div>

                <h4 className="font-serif text-lg text-[#7A2332] mb-1 font-bold">
                  {notice.title}
                </h4>

                <p className="text-sm text-[#5C4A3E] leading-relaxed mb-4">
                  {notice.content}
                </p>

                <div className="flex items-center gap-2.5 pt-3 border-t border-[#7A2332]/10">
                  {notice.authorAvatar ? (
                    <img
                      alt={notice.authorName}
                      className="w-7 h-7 rounded-full object-cover shadow-xs"
                      src={notice.authorAvatar}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#7A2332] flex items-center justify-center text-[10px] text-white font-bold">
                      {notice.authorName.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#2D2118]">{notice.authorName}</span>
                    <span className="text-[10px] text-[#5C4A3E]">{notice.authorRole}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat do Ministério */}
      <div className="px-5 pb-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#7A2332]/15 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#7A2332]/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#7A2332] flex items-center justify-center text-white font-serif text-lg font-bold">
                  L
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#C9A24A] rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-serif text-base text-[#7A2332] font-bold leading-none">
                  Chat da Comunidade
                </h3>
                <span className="text-[11px] text-[#5C4A3E]">8 membros ativos</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#7A2332] cursor-pointer hover:opacity-80">
              forum
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex flex-col gap-3.5 max-h-80 overflow-y-auto mb-4 pr-1 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 max-w-[85%] ${
                  msg.isMe ? 'self-end' : 'self-start'
                }`}
              >
                <span
                  className={`text-[10px] font-bold tracking-tight ${
                    msg.isMe ? 'text-[#7A2332] text-right mr-2' : 'text-[#C9A24A] ml-2'
                  }`}
                >
                  {msg.senderName}
                </span>

                <div
                  className={`p-3.5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    msg.isMe
                      ? 'bg-[#7A2332] text-white rounded-tr-none'
                      : 'bg-[#FFF9F2] text-[#2D2118] rounded-tl-none border border-[#7A2332]/10'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>

                <span
                  className={`text-[9px] text-[#5C4A3E] ${
                    msg.isMe ? 'self-end mr-2' : 'self-start ml-2'
                  }`}
                >
                  {msg.timeStr}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="bg-[#FFF9F2] rounded-2xl p-1.5 flex items-center gap-2 border border-[#7A2332]/15">
            <button
              type="button"
              onClick={() => showToast('Anexar arquivo no chat')}
              className="w-9 h-9 flex items-center justify-center text-[#5C4A3E] hover:text-[#7A2332] cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#2D2118] px-1"
            />

            <button
              type="submit"
              className="w-10 h-10 bg-[#7A2332] rounded-xl flex items-center justify-center text-white hover:bg-[#4D1721] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Fixed Floating Action Button */}
      <button
        onClick={onOpenNewNoticeModal}
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-[#7A2332] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40 border-2 border-[#C9A24A] cursor-pointer hover:bg-[#4D1721]"
        title="Publicar novo recado"
      >
        <span className="material-symbols-outlined text-[30px]">edit_note</span>
      </button>
    </div>
  );
};
