"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane, Send, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 在客户端加载时读取 localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("travelMessages");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    }
  }, []);

  // 每次 messages 更新时保存到 localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("travelMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userMessage: Message = { role: "user", content: input.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        });

        if (!response.ok) {
          throw new Error(`请求失败，状态码: ${response.status}`);
        }

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response || "⚠️ AI 目前无法提供建议，请稍后再试。",
          },
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ AI 访问失败，请稍后再试。" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 ">
            <Plane className="h-8 w-8 text-blue-500 dark:text-teal-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              AI 旅行助手
            </h1>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> 清空聊天
          </Button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto flex-1 px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 flex flex-col h-[75vh]">
            {/* 聊天区域 */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {/* 欢迎消息 */}
                {!messages.length && !loading && (
                  <div className="text-center text-gray-600 dark:text-gray-300 py-8 animate-fade-in">
                    <Plane className="h-12 w-12 mx-auto text-blue-400 dark:text-teal-300 mb-4" />
                    <p className="text-lg font-medium">欢迎使用 AI 旅行助手！</p>
                    <p className="mt-2">
                      试试问我：“推荐一个日本的旅行行程” 或 “预算5000元的欧洲游怎么安排？”
                    </p>
                  </div>
                )}
                {/* 消息列表 */}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-slide-up`}
                  >
                    <div
                      className={`rounded-xl px-4 py-3 max-w-[75%] shadow-sm transition-all ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="leading-relaxed">{children}</p>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {/* 加载状态 */}
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="rounded-xl bg-gray-200 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-200">
                        正在为您规划行程...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的旅行问题..."
                className="flex-1 rounded-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 dark:focus:ring-teal-500 transition-all"
                disabled={loading}
              />
              <Button
                type="submit"
                className="rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-teal-500 dark:hover:bg-teal-600 text-white transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}