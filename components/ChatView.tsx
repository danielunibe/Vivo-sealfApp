'use client';

import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import SectionCard from './ui/SectionCard';
import SectionHeader from './ui/SectionHeader';

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

interface ChatViewProps {
  theme: 'light' | 'dark';
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  sendChatMessage: (e: React.FormEvent) => void;
}

export default function ChatView({
  theme,
  messages,
  chatInput,
  setChatInput,
  sendChatMessage
}: ChatViewProps) {
  return (
    <SectionCard theme={theme} heightClass="h-[385px]">
      <SectionHeader
        theme={theme}
        title="Prospectos & Guía"
        description="Canal de comunicación directa de campo"
        icon={<MessageSquare className="w-4 h-4 text-[#FABB74]" />}
      />

      {/* Chat Stream with forced limit to prevent overflows */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-text scrollbar-none max-h-[220px]">
        {messages.map((m) => {
          const isUser = m.sender === 'Tú';
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] text-neutral-450 font-bold font-mono">{m.sender}</span>
                <span className="text-[7.5px] text-neutral-400 font-mono">{m.time}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-2xl text-[10px] max-w-[85%] leading-relaxed border ${
                isUser 
                  ? theme === 'light' 
                    ? 'bg-[#1C2C28] text-white border-transparent rounded-tr-none shadow-[xs]' 
                    : 'bg-emerald-600 text-white border-transparent rounded-tr-none shadow-[xs]'
                  : theme === 'light'
                    ? 'bg-neutral-50 text-[#1C2C28] border-neutral-150/80 rounded-tl-none'
                    : 'bg-[#131917]/70 text-neutral-200 border-neutral-800/60 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action message form inside the panel */}
      <form onSubmit={sendChatMessage} className="mt-2.5 border-t border-neutral-100/60 dark:border-neutral-850/60 pt-2 flex items-center gap-1.5 flex-shrink-0 select-none">
        <input
          type="text"
          placeholder="Responder al prospecto..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className={`flex-1 text-[10px] font-semibold py-1.5 px-3 rounded-xl focus:outline-hidden border transition-all ${
            theme === 'light'
              ? 'bg-neutral-50/50 border-neutral-200 text-[#1C2C28] focus:border-neutral-900 shadow-inner'
              : 'bg-[#131917]/50 border-neutral-850 text-[#E5EAE7] focus:border-emerald-500 shadow-inner'
          }`}
        />
        <button
          type="submit"
          className={`p-2 rounded-xl transition-all focus:outline-hidden cursor-pointer ${
            theme === 'light' 
              ? 'bg-[#1C2C28] text-white hover:bg-neutral-800' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </SectionCard>
  );
}
