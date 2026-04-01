"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Mail, Send, Loader2,
  CheckCircle2, AlertCircle, MessageSquare, Building2, Sparkles, Globe
} from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      showToast("error", "请填写所有字段");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "请输入有效的邮箱地址");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        showToast("success", "反馈已发送，我们会尽快回复");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "发送失败");
      }
    } catch {
      showToast("error", "网络错误，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  // 动画配置
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gray-50 selection:bg-orange-100">
      {/* 浅色背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-100/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header 区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold tracking-widest uppercase mb-4">
             Contact Us
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 tracking-tighter mb-4">
            期待您的 <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">回响</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg font-light">
            无论是功能建议、商务合作还是技术反馈，我们的团队都随时待命，为您提供支持。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 左侧：联系信息 */}
          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4 space-y-6"
          >
            <motion.div variants={itemVars} className="bg-white backdrop-blur-xl rounded-[2rem] border border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow shadow-orange-200">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">Tour-Ai</h3>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">Next-Gen Travel Intelligence</p>
                </div>
              </div>

              <div className="space-y-8">
                <ContactItem icon={<MapPin />} color="text-rose-500" bg="bg-rose-50" label="地理位置" value="中国 · 广州市" />
                <ContactItem icon={<Phone />} color="text-emerald-500" bg="bg-emerald-50" label="热线电话" value="+86 400-888-9999" />
                <ContactItem icon={<Mail />} color="text-amber-500" bg="bg-amber-50" label="官方邮箱" value="hello@travel-ai.com" />
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden group">
              <Globe className="absolute -right-10 -bottom-10 w-40 h-40 text-white/10 group-hover:text-white/20 transition-all duration-700 rotate-12 group-hover:rotate-0" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-orange-100" />
                  <h3 className="text-lg font-bold">响应时间</h3>
                </div>
                <div className="space-y-2 text-orange-50 font-medium">
                  <p>工作日：09:00 - 18:00</p>
                  <p>节假日：10:00 - 16:00</p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 text-xs text-orange-100 leading-relaxed">
                  我们的 AI 助手 24/7 在线，人工客服将在上述时段，人工客服将在上述时段内优先处理您的邮件。
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 右侧：反馈表单 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-white backdrop-blur-2xl rounded-[2.5rem] border border-gray-200 p-8 md:p-12 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 blur-[60px] rounded-full" />
              
              <h3 className="text-2xl font-black text-gray-800 mb-10 tracking-tight flex items-center gap-3">
                发送信息 <div className="h-px w-12 bg-orange-200" />
              </h3>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="您的姓名" placeholder="如何称呼您？" value={name} onChange={setName} />
                  <InputField label="您的邮箱" type="email" placeholder="example@domain.com" value={email} onChange={setEmail} />
                </div>

                <InputField label="反馈主题" placeholder="您想聊聊什么？" value={subject} onChange={setSubject} />

                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 mb-2.5 block uppercase tracking-[0.2em] group-focus-within:text-orange-500 transition-colors">反馈内容</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="请详细描述您的问题、建议或合作意向..."
                    rows={6}
                    maxLength={1000}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all resize-none placeholder:text-gray-400"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{message.length}/1000</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={sending || !name || !email || !subject || !message}
                  className="w-full py-5 bg-gradient-to-r from-orange-400 to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>正在投递...</span>
                    </>
                  ) : (
                    <>
                      <span>立即提交反馈</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 提示通知 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`fixed bottom-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 font-bold ${
              toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

// 辅助组件：联系条目
const ContactItem = ({ icon, color, bg, label, value }: any) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500`}>
      <span className={`${color} w-5 h-5 flex items-center justify-center`}>{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-gray-700 font-bold mt-0.5">{value}</p>
    </div>
  </div>
);

// 辅助组件：输入框
const InputField = ({ label, type = "text", placeholder, value, onChange }: any) => (
  <div className="group">
    <label className="text-[10px] font-black text-gray-400 mb-2.5 block uppercase tracking-[0.2em] group-focus-within:text-orange-500 transition-colors">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all placeholder:text-gray-400"
    />
  </div>
);

export default Contact;