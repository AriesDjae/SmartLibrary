import React, { useEffect, useRef, useState } from "react";
import { Cpu, Send, User as UserIcon, Bot, Menu, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearchParams } from "react-router-dom";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Persistent: load dari localStorage saat mount
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setSessions((prev) => {
        const isDuplicate = prev.some(
          (s) =>
            s.title === generateTitle([{ role: "user" as "user", content: promptParam }]) &&
            s.messages.length > 0 &&
            s.messages[0].role === "user" &&
            s.messages[0].content === promptParam
        );
        if (!isDuplicate) {
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: generateTitle([{ role: "user" as "user", content: promptParam }]),
            messages: [
              { role: "user" as "user", content: promptParam },
              { role: "ai" as "ai", content: `Ini adalah jawaban AI untuk: \"${promptParam}\"` },
            ],
          };
          setActiveSessionId(newSession.id);
          return [newSession, ...prev];
        } else {
          // Jika sudah ada, langsung aktifkan session tersebut
          const existing = prev.find(
            (s) =>
              s.title === generateTitle([{ role: "user" as "user", content: promptParam }]) &&
              s.messages.length > 0 &&
              s.messages[0].role === "user" &&
              s.messages[0].content === promptParam
          );
          if (existing) setActiveSessionId(existing.id);
          return prev;
        }
      });
      setTimeout(() => {
        searchParams.delete("prompt");
        setSearchParams(searchParams, { replace: true });
      }, 0);
      return;
    }
    const saved = localStorage.getItem("ai_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        } else {
          const newSession: ChatSession = { id: Date.now().toString(), title: "Chat Baru", messages: [] };
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      } catch {
        const newSession: ChatSession = { id: Date.now().toString(), title: "Chat Baru", messages: [] };
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } else {
      const newSession: ChatSession = { id: Date.now().toString(), title: "Chat Baru", messages: [] };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, [location, searchParams]);
  // Persistent: simpan ke localStorage setiap sessions berubah
  useEffect(() => {
    localStorage.setItem("ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId]);

  // Handle send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !activeSessionId) return;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [
                ...session.messages,
                { role: "user" as "user", content: trimmed },
                { role: "ai" as "ai", content: `Ini adalah jawaban AI untuk: "${trimmed}"` },
              ],
              title:
                session.messages.length === 0
                  ? generateTitle([
                      { role: "user" as "user", content: trimmed },
                    ])
                  : session.title,
            }
          : session
      )
    );
    setInput("");
  };

  // Sidebar menu click
  const handleSidebarMenuClick = () => setShowHistory(true);

  // Ambil sesi aktif
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Buat sesi baru
  const createNewSession = () => {
    const newSession: ChatSession = { id: Date.now().toString(), title: "Chat Baru", messages: [] };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setShowHistory(false);
  };

  // Hapus session dengan konfirmasi
  const handleDeleteSession = (id: string) => {
    setSessionToDelete(id);
    setShowConfirm(true);
  };
  const confirmDelete = () => {
    if (sessionToDelete) {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionToDelete);
        if (filtered.length === 0) {
          // Jika setelah hapus jadi kosong, buat session baru
          const newSession: ChatSession = { id: Date.now().toString(), title: "Chat Baru", messages: [] };
          setActiveSessionId(newSession.id);
          return [newSession];
        } else {
          if (activeSessionId === sessionToDelete) {
            setTimeout(() => {
              const next = filtered[0];
              setActiveSessionId(next ? next.id : null);
            }, 0);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row text-gray-900 relative">
      {/* Slide-in History Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out
        ${showHistory ? "translate-x-0" : "-translate-x-full"}`}
        style={{ boxShadow: showHistory ? '2px 0 16px rgba(0,0,0,0.08)' : undefined }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="font-bold text-xl tracking-tight">Riwayat Chat AI</span>
          <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-center">
            <button
              className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition mb-4"
              onClick={createNewSession}
            >
              + Chat Baru
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sessions.length === 0 || (sessions.length === 1 && sessions[0].messages.length === 0) ? (
            <div className="text-gray-400 text-center mt-8 select-none">Belum ada riwayat chat</div>
          ) : (
            <ul className="space-y-2">
              {sessions.filter(s => s.messages.length > 0).map((item) => (
                <li
                  key={item.id}
                  className={`bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate cursor-pointer transition-colors flex items-center justify-between gap-2 shadow-sm hover:bg-blue-50 ${activeSessionId === item.id ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
                  title={item.title}
                >
                  <span
                    className="flex-1 truncate pr-2"
                    onClick={() => { setActiveSessionId(item.id); setShowHistory(false); }}
                  >
                    {item.title}
                  </span>
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                    title="Hapus riwayat ini"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(item.id);
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
      {/* Overlay saat history terbuka */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-20"
          onClick={() => setShowHistory(false)}
        />
      )}
      {/* Modal Konfirmasi Hapus */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">Apakah Anda yakin ingin menghapus chat ini?</div>
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
            onClick={handleSidebarMenuClick}
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
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">What can I help with?</h1>
          </header>
          {/* Chat Area */}
          <section className="flex-1 flex flex-col gap-6 overflow-y-auto pb-32">
            {(!activeSession || activeSession.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <Bot className="h-20 w-20 text-blue-200 mb-6" />
                <div className="text-2xl font-semibold text-gray-400 mb-2">Mulai chat dengan AI</div>
                <div className="text-gray-400 text-base">Tanyakan apa saja tentang buku, penulis, atau topik perpustakaan!</div>
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
                  <div className={`flex items-end gap-3 max-w-[90vw] sm:max-w-[70%]`}>
                    {msg.role === "ai" && (
                      <span className="flex-shrink-0">
                        <Bot className="h-10 w-10 text-blue-600 bg-gray-100 rounded-full p-2" />
                      </span>
                    )}
                    <div
                      className={`px-5 py-3 rounded-2xl text-base whitespace-pre-line break-words shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-2xl"
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
              autoFocus
              style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ boxShadow: '0 4px 16px 0 rgba(37,99,235,0.10)' }}
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AiPage;