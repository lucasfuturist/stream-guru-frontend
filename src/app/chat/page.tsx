// src/app/chat/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse, fetchRecommendations } from '@/lib/api';
import type { Media, ChatHistoryMessage, AIParsedFilters } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';

interface DisplayMessage {
  id: number;
  sender: 'user' | 'assistant';
  prose?: string;
  recs?: Media[];
  isLoadingRecs?: boolean;
}
interface QueryState {
  filters: AIParsedFilters;
  lastUserPrompt: string;
  page: number;
}
let messageIdCounter = 0;

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { id: messageIdCounter++, sender: 'assistant', prose: "Hi! I'm StreamGuru. Ask me for a recommendation..." }
  ]);
  const [apiHistory, setApiHistory] = useState<ChatHistoryMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [lastQuery, setLastQuery] = useState<QueryState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (trimmedInput.toLowerCase() === 'more' && lastQuery) {
      setIsLoading(true);
      const nextPage = lastQuery.page + 1;
      const { recs } = await fetchRecommendations(lastQuery.filters, lastQuery.lastUserPrompt, nextPage);
      setMessages(prev => [...prev, { id: messageIdCounter++, sender: 'assistant', recs: recs }]);
      setLastQuery({ ...lastQuery, page: nextPage });
      setInput('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const botMsgId = messageIdCounter++;
    setMessages(prev => [...prev, { id: messageIdCounter++, sender: 'user', prose: trimmedInput }]);
    const newUserMessage: ChatHistoryMessage = { role: 'user', content: trimmedInput };
    const newApiHistory = [...apiHistory, newUserMessage];
    setApiHistory(newApiHistory);
    setInput('');

    try {
      const { prose, filters } = await getChatResponse(newApiHistory);
      setMessages(prev => [...prev, { id: botMsgId, sender: 'assistant', prose, recs: [], isLoadingRecs: true }]);
      setIsLoading(false);
      const { recs } = await fetchRecommendations(filters, trimmedInput, 1);
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, recs: recs, isLoadingRecs: false } : msg));
      setLastQuery({ filters, lastUserPrompt: trimmedInput, page: 1 });
      const botSummary = `My response: "${prose}". Recs: [${recs.map(r => r.title).join(", ")}]`;
      const newAssistantMessage: ChatHistoryMessage = { role: 'assistant', content: botSummary };
      setApiHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      const err = error as Error;
      setMessages(prev => [...prev.filter(m => m.id !== botMsgId), { id: botMsgId, sender: 'assistant', prose: `Sorry, an error occurred: ${err.message}` }]);
      setIsLoading(false);
    }
  };

  const handleCardClick = (tmdbId: number) => { setSelectedMovieId(tmdbId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedMovieId(null); };

  return (
    <>
      <div className="mx-auto flex h-[80vh] max-w-4xl flex-col rounded-lg border border-text/20 bg-white/5 shadow-xl">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-gold text-navy' : 'bg-navy/50 text-text'}`}>
                  {msg.prose && <p>{msg.prose}</p>}
                  {msg.isLoadingRecs && <p className="mt-2 text-sm italic">Searching for recommendations...</p>}
                  {!msg.isLoadingRecs && msg.recs && msg.recs.length === 0 && <p className="mt-2 text-sm italic">I couldn&apos;t find any matches for that. Try something else!</p>}
                  {msg.recs && msg.recs.length > 0 && (
                    <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                      {msg.recs.map(rec => (
                        <div key={rec.tmdb_id} className="w-32 flex-shrink-0" onClick={() => handleCardClick(rec.tmdb_id)}>
                           <MovieCard movie={rec} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && !messages.some(m => m.isLoadingRecs) && ( <div className="flex justify-start"><div className="max-w-lg rounded-lg bg-navy/50 px-4 py-2 text-text/70"><i>Guru is thinking...</i></div></div> )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-text/20 p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask for a recommendation..." className="flex-1 rounded-lg border border-text/30 bg-bg px-4 py-2 text-text focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50" disabled={isLoading} />
            <button type="submit" className="rounded-lg bg-gold px-6 py-2 font-semibold text-navy transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" disabled={isLoading || !input.trim()}>Send</button>
          </form>
        </div>
      </div>
      {isModalOpen && selectedMovieId && ( <MovieModal tmdbId={selectedMovieId} onClose={handleCloseModal} /> )}
    </>
  );
};
export default ChatPage;