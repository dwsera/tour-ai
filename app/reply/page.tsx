"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plane, Send, Loader2, Trash2, Copy, RefreshCw,
  MapPin, Calendar, DollarSign, Utensils,
  Sparkles, Compass, MessageSquare,
  ChevronRight, CheckCircle, Bot, User
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

const quickQuestions = [
  { text: "推荐一个日本的旅行行程", emoji: "🇯🇵" },
  { text: "预算5000元的欧洲游怎么安排？", emoji: "🇪🇺" },
  { text: "云南7天旅游攻略", emoji: "🏔️" },
  { text: "第一次去泰国需要注意什么？", emoji: "🇹🇭" },
  { text: "带老人去北京旅游有什么建议？", emoji: "🏛️" },
  { text: "美食推荐：成都必吃的小吃", emoji: "🍜" },
];

const features = [
  { icon: MapPin, label: "景点推荐", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { icon: Calendar, label: "行程规划", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
  { icon: DollarSign, label: "预算建议", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
  { icon: Utensils, label: "美食搜罗", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
];

const MAX_MESSAGES = 100;
const STORAGE_KEY = "travelMessages";

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_MESSAGES);
    const json = JSON.stringify(trimmed);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
// 欢迎页动画
const welcomeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
} as const;

const welcomeItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14
    } as const
  }
} as const;

// 消息气泡动画
const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    } as const
  }
} as const;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setMessages(loadMessages());
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingIndex]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const streamChat = useCallback(
    async (chatMessages: Message[], assistantIndex: number) => {
      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`请求失败，状态码: ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.content;
                if (content) {
                  fullContent += content;
                  setMessages((prev) => {
                    const next = [...prev];
                    if (next[assistantIndex]) {
                      next[assistantIndex] = { ...next[assistantIndex], content: fullContent };
                    }
                    return next;
                  });
                }
              } catch {
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setMessages((prev) => {
          const next = [...prev];
          if (next[assistantIndex]) {
            next[assistantIndex] = { ...next[assistantIndex], content: "⚠️ AI 访问失败，请稍后再试。" };
          }
          return next;
        });
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent, overrideInput?: string) => {
      if (e) e.preventDefault();
      const text = (overrideInput || input).trim();
      if (!text || loading) return;

      const userMessage: Message = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      const assistantIndex = newMessages.length;
      setStreamingIndex(assistantIndex);
      setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: Date.now() }]);

      await streamChat(newMessages, assistantIndex);

      setLoading(false);
      setStreamingIndex(null);
    },
    [input, messages, loading, streamChat]
  );

  const handleQuickQuestion = (question: string) => {
    if (loading) return;
    handleSubmit(undefined, question);
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (loading || index === 0) return;
    abortRef.current?.abort();

    const previousMessages = messages.slice(0, index);
    setMessages(previousMessages);
    setLoading(true);
    setStreamingIndex(index);

    const assistantIndex = index;
    setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: Date.now() }]);

    await streamChat(previousMessages, assistantIndex);

    setLoading(false);
    setStreamingIndex(null);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-orange-50/30 text-slate-900 font-sans selection:bg-orange-100">
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="welcome"
                  variants={welcomeVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  className="py-10 lg:py-16"
                >
                  <motion.div variants={welcomeItem} className="text-center mb-10">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute w-24 h-24 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[36px] rotate-6 opacity-20 blur-sm" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[32px] flex items-center justify-center shadow-xl shadow-orange-200/60">
                        <Plane className="w-10 h-10 text-white -rotate-12" />
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                      准备好去哪了吗？
                    </h2>
                    <p className="text-slate-400 font-medium text-sm max-w-md mx-auto">
                      我是你的专属旅行 AI 助手，告诉我你的目的地、预算或偏好，为你量身定制旅行方案。
                    </p>
                  </motion.div>

                  <motion.div variants={welcomeItem} className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
                    {quickQuestions.slice(0, 3).map((q, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickQuestion(q.text)}
                        className="relative p-5 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:shadow-lg hover:shadow-orange-100/50 hover:border-orange-200/60 transition-all text-left group overflow-hidden"
                      >
                        <div className="absolute top-3 right-3 text-2xl opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform">
                          {q.emoji}
                        </div>
                        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="text-sm font-bold text-slate-700 pr-8 leading-snug">{q.text}</div>
                      </motion.button>
                    ))}
                  </motion.div>

                  <motion.div variants={welcomeItem} className="max-w-xl mx-auto mb-10">
                    <div className="grid grid-cols-4 gap-2">
                      {features.map((f, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -2 }}
                          className={`${f.bg} ${f.border} border p-3.5 rounded-2xl text-center cursor-default transition-all hover:shadow-sm`}
                        >
                          <f.icon className={`w-5 h-5 ${f.color} mx-auto mb-1.5`} />
                          <div className="text-[11px] font-bold text-slate-600">{f.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={welcomeItem} className="max-w-xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> 快速探索 <Sparkles className="w-3 h-3" />
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleQuickQuestion(q.text)}
                          className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-orange-600 bg-white hover:bg-orange-50 rounded-xl border border-slate-100 hover:border-orange-200/60 transition-all group flex items-center gap-1.5 shadow-sm hover:shadow-md"
                        >
                          <span>{q.emoji}</span>
                          <span>{q.text}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-orange-400" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="chat" className="space-y-5">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {message.role === "user" ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shadow-md shadow-orange-200/50">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className={`max-w-[80%] lg:max-w-[75%] group`}>
                        <div className={`flex items-center gap-2 mb-1.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <span className="text-[10px] font-semibold text-slate-300">
                            {message.role === "user" ? "你" : "AI 助手"} · {formatTimestamp(message.timestamp)}
                          </span>
                          {message.role === "assistant" && message.content && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopy(message.content, index)}
                                className="p-1 rounded-md text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                              >
                                {copiedIndex === index ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRegenerate(index)}
                                className="p-1 rounded-md text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div
                          className={`
                            relative text-sm leading-relaxed
                            ${message.role === "user"
                              ? "bg-gradient-to-br from-rose-400 to-orange-400 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-lg shadow-orange-200/40"
                              : "bg-white border border-slate-100/80 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm hover:shadow-md transition-shadow"}
                          `}
                        >
                          {message.content ? (
                            <div className={`max-w-none prose-p:leading-relaxed prose-li:my-1 prose-img:rounded-xl prose-code:bg-slate-100 prose-code:p-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-headings:font-bold prose-headings:my-2 prose-strong:text-slate-900 ${message.role === "user" ? "prose-invert" : "prose prose-slate"}`}>
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 py-1">
                              <div className="flex gap-1">
                                <motion.div
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                  className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                  className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                  className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                                />
                              </div>
                              <span className="text-slate-400 text-xs font-medium">思考中...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={scrollRef} className="h-2" />
          </div>
        </div>

        <div className="p-4 lg:px-8 lg:pb-6 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-3"
              >
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-500 bg-white/60 hover:bg-rose-50 rounded-lg border border-slate-100 hover:border-rose-200 transition-all backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  清空对话
                </button>
              </motion.div>
            )}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/60 shadow-xl shadow-slate-200/30">
              <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-1.5">
                <div className="flex-1 flex items-center px-3">
                  <Compass className="w-4 h-4 text-slate-300 mr-2.5 flex-shrink-0" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={loading ? "AI 正在全力以赴..." : "描述你的旅行梦想..."}
                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 placeholder:text-slate-300 text-sm py-3 font-medium"
                    disabled={loading}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={loading || !input.trim() ? {} : { scale: 1.05 }}
                  whileTap={loading || !input.trim() ? {} : { scale: 0.95 }}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                    ${loading || !input.trim()
                      ? "bg-slate-100 text-slate-300"
                      : "bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg shadow-orange-200/50"}
                  `}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}