import React, { useEffect, useRef, useState } from "react";
import { Cpu, Send, User as UserIcon, Bot, Menu, Trash2, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearchParams } from "react-router-dom";
import { geminiService } from "../services/geminiApi";
import toast from "react-hot-toast";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

function generateTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "Chat Baru";
  return (
    firstUserMsg.content.split(" ").slice(0, 6).join(" ") +
    (firstUserMsg.content.split(" ").length > 6 ? "..." : "")
  );
}

const AiPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const quickActions: QuickAction[] = [
    {
      id: "book-recommendation",
      title: "Rekomendasi Buku",
      description: "Dapatkan rekomendasi buku sesuai minat Anda",
      icon: <BookOpen className="h-5 w-5" />,
      prompt: "Saya ingin rekomendasi buku yang bagus untuk dibaca. Saya suka genre"
    },
    {
      id: "book-summary",
      title: "Ringkasan Buku",
      description: "Minta ringkasan dari buku tertentu",
      icon: <Sparkles className="h-5 w-5" />,
      prompt: "Bisakah Anda memberikan ringkasan dari buku"
    },
    {
      id: "reading-tips",
      title: "Tips Membaca",
      description: "Dapatkan tips untuk meningkatkan kebiasaan membaca",
      icon: <Lightbulb className="h-5 w-5" />,
      prompt: "Berikan tips untuk meningkatkan kebiasaan membaca dan pemahaman"
    }
  ];

  // Load sessions from localStorage
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      handleInitialPrompt(promptParam);
      return;
    }

    const saved = localStorage.getItem("ai_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Convert string dates back to Date objects
          const sessionsWithDates = parsed.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setSessions(sessionsWithDates);
          setActiveSessionId(sessionsWithDates[0].id);
        } else {
          createNewSession();
        }
      } catch {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, [location, searchParams]);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("ai_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId]);

  const handleInitialPrompt = async (promptParam: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: generateTitle([{ role: "user", content: promptParam, timestamp: new Date() }]),
      messages: [],
      createdAt: new Date()
    };

    setSessions([newSession]);
    setActiveSessionId(newSession.id);
    
    // Clear the URL parameter
    setTimeout(() => {
      searchParams.delete("prompt");
      setSearchParams(searchParams, { replace: true });
    }, 0);

    // Send the initial message
    await sendMessage(promptParam, newSession.id);
  };

  const sendMessage = async (message: string, sessionId?: string) => {
    const targetSessionId = sessionId || activeSessionId;
    if (!targetSessionId) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      role: "ai",
      content: "Sedang mengetik...",
      timestamp: new Date(),
      isLoading: true
    };

    // Add user message and loading indicator
    setSessions(prev =>
      prev.map(session =>
        session.id === targetSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage, loadingMessage],
              title: session.messages.length === 0 ? generateTitle([userMessage]) : session.title
            }
          : session
      )
    );

    setIsLoading(true);

    try {
      // Get AI response using Gemini
      const aiResponse = await geminiService.generateResponse(message);
      
      const aiMessage: ChatMessage = {
        role: "ai",
        content: aiResponse,
        timestamp: new Date()
      };

      // Replace loading message with actual response
      setSessions(prev =>
        prev.map(session =>
          session.id === targetSessionId
            ? {
                ...session,
                messages: session.messages.slice(0, -1).concat(aiMessage)
              }
            : session
        )
      );

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: ChatMessage = {
        role: "ai",
        content: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        timestamp: new Date()
      };

      setSessions(prev =>
        prev.map(session =>
          session.id === targetSessionId
            ? {
                ...session,
                messages: session.messages.slice(0, -1).concat(errorMessage)
              }
            : session
        )
      );

      toast.error("Gagal mendapatkan respons AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !activeSessionId || isLoading) return;

    setInput("");
    await sendMessage(trimmed);
  };

  const handleQuickAction = async (action: QuickAction) => {
    setInput(action.prompt);
    // Auto-send the quick action
    if (activeSessionId) {
      await sendMessage(action.prompt);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "Chat Baru",
      messages: [],
      createdAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setShowHistory(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessionToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionToDelete);
        if (filtered.length === 0) {
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "Chat Baru",
            messages: [],
            createdAt: new Date()
          };
          setActiveSessionId(newSession.id);
          return [newSession];
        } else {
          if (activeSessionId === sessionToDelete) {
            setActiveSessionId(filtered[0].id);
          }
          return filtered;
        }
      });
    }
    setShowConfirm(false);
    setSessionToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSessionToDelete(null);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row text-gray-900 relative">
      {/* History Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out
        ${showHistory ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="font-bold text-xl tracking-tight">Riwayat Chat AI</span>
          <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">
            &times;
          </button>
        </div>
        <div className="px-6 py-4 border-b border-gray-100">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition"
            onClick={createNewSession}
          >
            + Chat Baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sessions.filter(s => s.messages.length > 0).length === 0 ? (
            <div className="text-gray-400 text-center mt-8">Belum ada riwayat chat</div>
          ) : (
            <ul className="space-y-2">
              {sessions.filter(s => s.messages.length > 0).map((session) => (
                <li
                  key={session.id}
                  className={`bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer transition-colors flex items-center justify-between gap-2 shadow-sm hover:bg-blue-50 ${
                    activeSessionId === session.id ? "ring-2 ring-blue-400 bg-blue-50" : ""
                  }`}
                >
                  <span
                    className="flex-1 truncate pr-2"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setShowHistory(false);
                    }}
                    title={session.title}
                  >
                    {session.title}
                  </span>
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-20"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">
              Apakah Anda yakin ingin menghapus chat ini?
            </div>
            <div className="flex gap-4 mt-2">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
              >
                Hapus
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-lg shadow transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-16 bg-white rounded-r-2xl shadow-md flex flex-col items-center py-6 gap-4 border-r border-gray-100 z-20">
        <div className="mb-8">
          <Cpu className="h-8 w-8 text-blue-600" />
        </div>
        <nav className="flex flex-col gap-6 flex-1">
          <button
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center justify-center"
            title="Menu"
            onClick={() => setShowHistory(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
        <div className="mt-auto mb-2">
          <UserIcon className="h-8 w-8 text-gray-400 rounded-full border border-gray-200 bg-white p-1" />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center min-h-screen px-2 sm:px-0 bg-gray-50 ml-16">
        <div className="w-full max-w-2xl flex flex-col flex-1 mx-auto">
          {/* Header */}
          <header className="pt-16 pb-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Smart Library AI Assistant
            </h1>
            <p className="text-center text-gray-600">
              Powered by Google Gemini - Tanyakan tentang buku, dapatkan rekomendasi, dan tips membaca
            </p>
          </header>

          {/* Chat Area */}
          <section className="flex-1 flex flex-col gap-6 overflow-y-auto pb-32">
            {(!activeSession || activeSession.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <Bot className="h-20 w-20 text-blue-200 mb-6" />
                <div className="text-2xl font-semibold text-gray-400 mb-6">
                  Mulai chat dengan AI Assistant
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                          {action.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
                
                <div className="text-gray-400 text-base text-center">
                  Atau ketik pertanyaan Anda di bawah ini
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {activeSession && activeSession.messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
                >
                  <div className="flex items-end gap-3 max-w-[90vw] sm:max-w-[70%]">
                    {msg.role === "ai" && (
                      <span className="flex-shrink-0">
                        <Bot className={`h-10 w-10 rounded-full p-2 ${
                          msg.isLoading ? "text-blue-400 bg-blue-50 animate-pulse" : "text-blue-600 bg-gray-100"
                        }`} />
                      </span>
                    )}
                    <div
                      className={`px-5 py-3 rounded-2xl text-base whitespace-pre-line break-words shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-2xl"
                          : msg.isLoading
                          ? "bg-gray-100 text-gray-500 rounded-bl-2xl border border-gray-200 animate-pulse"
                          : "bg-gray-100 text-gray-900 rounded-bl-2xl border border-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <span className="flex-shrink-0">
                        <UserIcon className="h-10 w-10 text-blue-600 bg-gray-100 rounded-full p-2" />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </section>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="w-full max-w-2xl flex items-end px-2 sm:px-0 py-6 bg-transparent fixed bottom-0 left-0 right-0 mx-auto z-20"
          style={{ background: "rgba(247,248,250,0.95)" }}
        >
          <div className="relative flex w-full">
            <input
              type="text"
              className="flex-1 bg-white text-gray-900 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-full px-6 py-4 placeholder-gray-400 text-base outline-none shadow-md transition-all duration-200"
              placeholder="Tulis pertanyaanmu di sini..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-full px-6 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">
                {isLoading ? "Mengirim..." : "Send"}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AiPage;