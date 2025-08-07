// src/app/chat/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse, fetchRecommendations } from '@/lib/api';
import type { Media, ChatHistoryMessage } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';

interface DisplayMessage {
  id: number; sender: 'user' | 'assistant'; prose?: string;
  recs?: Media[]; filters?: any; isLoadingRecs?: boolean;
}
interface QueryState {
  filters: any;
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
  // --- NEW STATE TO MANAGE PAGINATION ---
  const [lastQuery, setLastQuery] = useState<QueryState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // --- PAGINATION LOGIC ---
    if (trimmedInput.toLowerCase() === 'more' && lastQuery) {
      setIsLoading(true);
      const nextPage = lastQuery.page + 1;
      const { recs } = await fetchRecommendations(lastQuery.filters, lastQuery.lastUserPrompt, nextPage);
      const moreMessage: DisplayMessage = { id: messageIdCounter++, sender: 'assistant', recs: recs, filters: lastQuery.filters };
      setMessages(prev => [...prev, moreMessage]);
      setLastQuery({ ...lastQuery, page: nextPage });
      setInput('');
      setIsLoading(false);
      return;
    }
    // --- END PAGINATION LOGIC ---

    setIsLoading(true);
    const botMsgId = messageIdCounter++;
    setMessages(prev => [...prev, { id: messageIdCounter++, sender: 'user', prose: trimmedInput }]);
    const newApiHistory = [...apiHistory, { role: 'user', content: trimmedInput }];
    setApiHistory(newApiHistory);
    setInput('');

    try {
      const { prose, filters } = await getChatResponse(newApiHistory);
      setMessages(prev => [...prev, { id: botMsgId, sender: 'assistant', prose, recs: [], isLoadingRecs: true, filters }]);
      setIsLoading(false);

      const { recs } = await fetchRecommendations(filters, trimmedInput, 1);
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, recs: recs, isLoadingRecs: false } : msg));
      setLastQuery({ filters, lastUserPrompt: trimmedInput, page: 1 }); // Save the new query
      
      const botSummary = `My response: "${prose}". Recs: [${recs.map(r => r.title).join(", ")}]`;
      setApiHistory(prev => [...prev, { role: 'assistant', content: botSummary }]);
    } catch (error: any) {
      // ... (error handling is the same)
    }
  };
  const handleCardClick = (tmdbId: number) => {
    setSelectedMovieId(tmdbId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovieId(null);
  };

  return (
    <>
      <div className="mx-auto flex h-[80vh] max-w-4xl flex-col rounded-lg border border-text/20 bg-white/5 shadow-xl">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-gold text-navy' : 'bg-navy/50 text-text'}`}>
                  {msg.prose}
                  {msg.isLoadingRecs && <p className="mt-2 text-sm italic">Searching for recommendations...</p>}
                  
                  {msg.filters && !msg.isLoadingRecs && (
                    <div className="mt-4 rounded-md bg-black/30 p-2 text-xs text-white/70">
                      <p className="font-bold">AI Parser Output:</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(msg.filters, null, 2)}</pre>
                    </div>
                  )}

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
            {isLoading && ( <div className="flex justify-start"><div className="max-w-lg rounded-lg bg-navy/50 px-4 py-2 text-text/70"><i>Guru is thinking...</i></div></div> )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-text/20 p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            {/* --- THIS IS THE FIX --- */}
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