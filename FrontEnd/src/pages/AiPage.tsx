import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Send, History, User as UserIcon, Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
}

function generateTitle(messages: ChatMessage[]): string {
  // Ambil 6 kata pertama dari pertanyaan user pertama
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'Chat Baru';
  return firstUserMsg.content.split(' ').slice(0, 6).join(' ') + (firstUserMsg.content.split(' ').length > 6 ? '...' : '');
}

const AiPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPrompt = params.get('prompt');

  // History per sesi (dummy, tidak persistent)
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Jika ada prompt dari query string, buat sesi chat baru
  useEffect(() => {
    if (initialPrompt) {
      const newMessages = [
        { role: 'user' as const, content: initialPrompt },
        { role: 'ai' as const, content: `Ini adalah jawaban AI untuk: "${initialPrompt}"` }
      ];
      const newId = Date.now().toString();
      const newHistory: ChatHistoryItem = {
        id: newId,
        title: generateTitle(newMessages),
        messages: newMessages
      };
      setHistory(prev => [newHistory, ...prev]);
      setSelectedChatId(newId);
      setMessages(newMessages);
    }
    // eslint-disable-next-line
  }, [initialPrompt]);

  // Handle send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMessages = [
      ...messages,
      { role: 'user' as const, content: trimmed },
      { role: 'ai' as const, content: `Ini adalah jawaban AI untuk: "${trimmed}"` }
    ];
    setMessages(newMessages);
    setInput('');
    // Update history
    if (selectedChatId) {
      setHistory(prev => prev.map(h => h.id === selectedChatId ? { ...h, messages: newMessages, title: generateTitle(newMessages) } : h));
    } else {
      // Chat baru
      const newId = Date.now().toString();
      const newHistory: ChatHistoryItem = {
        id: newId,
        title: generateTitle(newMessages),
        messages: newMessages
      };
      setHistory(prev => [newHistory, ...prev]);
      setSelectedChatId(newId);
    }
  };

  // Pilih history
  const handleSelectHistory = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setSelectedChatId(id);
      setMessages(item.messages);
    }
  };

  // Chat baru
  const handleNewChat = () => {
    setSelectedChatId('');
    setMessages([]);
    setInput('');
  };

  // Judul/topik chat aktif
  const activeTitle = history.find(h => h.id === selectedChatId)?.title || 'Percakapan AI';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto pt-8 flex-1 flex flex-col max-w-6xl w-full">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="h-7 w-7 text-primary-700" />
          <h1 className="text-3xl font-bold">AI Assistant</h1>
        </div>
        <div className="flex flex-1 gap-6">
          {/* Sidebar History */}
          <aside className="w-72 bg-gradient-to-b from-primary-50 to-white rounded-xl shadow border border-gray-100 p-4 flex flex-col h-[600px] max-h-[70vh] min-w-[200px]">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-primary-700" />
              <span className="font-semibold text-primary-800">Riwayat Chat</span>
            </div>
            <button onClick={handleNewChat} className="btn-outline w-full mb-3 text-sm">+ Chat Baru</button>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 && <div className="text-gray-400 text-sm text-center mt-8">Belum ada riwayat</div>}
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedChatId === item.id ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </aside>
          {/* Chat Main */}
          <section className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2 px-2">
              <Bot className="h-6 w-6 text-primary-700" />
              <span className="font-semibold text-lg text-primary-900">{activeTitle}</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 px-0 sm:px-6 py-4 flex flex-col relative" style={{paddingBottom: '90px', minHeight: 400}}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <Bot className="h-16 w-16 text-primary-200 mb-4" />
                  <div className="text-gray-400 text-lg font-semibold mb-2">Mulai chat dengan AI</div>
                  <div className="text-gray-400 text-sm">Tanyakan apa saja tentang buku, penulis, atau topik perpustakaan!</div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${idx === messages.length-1 ? '' : 'mb-3'}`}>
                  <div className={`flex items-end gap-2 max-w-[85%]`}>
                    {msg.role === 'ai' && (
                      <span className="flex-shrink-0"><Bot className="h-7 w-7 text-primary-400" /></span>
                    )}
                    <div className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-line break-words shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-700 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md border border-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <span className="flex-shrink-0"><UserIcon className="h-7 w-7 text-primary-400" /></span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Sticky input at bottom */}
            <form onSubmit={handleSend} className="w-full flex gap-2 px-2 sm:px-0 py-4 bg-gray-50 sticky bottom-0 z-10 mb-8" style={{marginTop: '-90px'}}>
              <input
                type="text"
                className="input flex-1 min-w-0"
                placeholder="Tulis pertanyaan Anda di sini..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary flex items-center gap-2 px-5">
                <Send className="h-5 w-5" />
                Kirim
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AiPage; 