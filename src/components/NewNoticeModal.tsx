import React, { useState } from 'react';
import { Notice } from '../types';

interface NewNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotice: (notice: Notice) => void;
}

export const NewNoticeModal: React.FC<NewNoticeModalProps> = ({
  isOpen,
  onClose,
  onAddNotice,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Aviso');
  const [authorName, setAuthorName] = useState('Você');
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      dateStr: 'Hoje',
      tag: isUrgent ? 'Urgente' : tag,
      title: title.trim(),
      content: content.trim(),
      authorName: authorName.trim() || 'Você',
      authorRole: 'Ministério Litúrgico',
      isUrgent,
    };

    onAddNotice(newNotice);
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#7A2332]/20 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#7A2332]/15 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7A2332]">edit_note</span>
            <h3 className="font-serif text-lg text-[#7A2332] font-bold">Novo Recado no Mural</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#7A2332] hover:bg-[#7A2332]/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5C4A3E] uppercase tracking-wider mb-1">
              Título do Recado
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ensaio do Ministério Louvor & Aliança"
              required
              className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl p-3 text-sm text-[#2D2118] outline-none focus:border-[#7A2332]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C4A3E] uppercase tracking-wider mb-1">
              Mensagem / Orientação
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Digite os detalhes para os membros do ministério..."
              required
              className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl p-3 text-sm text-[#2D2118] outline-none focus:border-[#7A2332] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C4A3E] uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl p-2.5 text-sm text-[#2D2118] outline-none"
              >
                <option value="Aviso">Aviso</option>
                <option value="Partituras">Partituras</option>
                <option value="Ensaio">Ensaio</option>
                <option value="Social">Social</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4A3E] uppercase tracking-wider mb-1">
                Autor
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#FFF9F2] border border-[#7A2332]/20 rounded-xl p-2.5 text-sm text-[#2D2118] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 accent-[#7A2332] cursor-pointer"
            />
            <label htmlFor="urgent" className="text-xs font-semibold text-[#2D2118] cursor-pointer">
              Marcar como Urgente (Destacar no topo)
            </label>
          </div>

          <div className="pt-3 border-t border-[#7A2332]/15 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FFF9F2] text-[#7A2332] border border-[#7A2332]/20 rounded-xl text-xs font-bold hover:bg-[#7A2332]/10 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#7A2332] text-white rounded-xl text-xs font-bold hover:bg-[#4D1721] cursor-pointer shadow-sm"
            >
              Publicar Recado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
