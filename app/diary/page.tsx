"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MapPin, Calendar, Trash2, Edit3, X, Loader2,
  Smile, Meh, Frown, Heart, Sun, CloudRain, Star,
  CheckCircle2, AlertCircle, BookOpen, ChevronDown
} from "lucide-react";

const moods = [
  { value: "开心", emoji: "😊", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "感动", emoji: "🥹", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "平静", emoji: "😌", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "兴奋", emoji: "🤩", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "疲惫", emoji: "😴", color: "bg-gray-50 text-gray-700 border-gray-200" },
  { value: "惊喜", emoji: "😲", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const moodIcons: Record<string, string> = {
  "开心": "😊",
  "感动": "🥹",
  "平静": "😌",
  "兴奋": "🤩",
  "疲惫": "😴",
  "惊喜": "😲",
};

interface Diary {
  id: string;
  title: string;
  content: string;
  city: string;
  date: string;
  mood: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
    } as const,
  },
} as const;

export default function DiaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    city: "",
    date: new Date().toISOString().split("T")[0],
    mood: "开心",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDiaries();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const fetchDiaries = async () => {
    try {
      const res = await fetch("/api/diary");
      if (res.ok) {
        const data = await res.json();
        setDiaries(Array.isArray(data) ? data : []);
      }
    } catch {
      setDiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", city: "", date: new Date().toISOString().split("T")[0], mood: "开心" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (diary: Diary) => {
    setForm({
      title: diary.title,
      content: diary.content,
      city: diary.city,
      date: diary.date.split("T")[0],
      mood: diary.mood,
    });
    setEditingId(diary.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.city.trim() || !form.date) {
      showToast("error", "请填写完整信息");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? "/api/diary" : "/api/diary";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...form }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast("success", editingId ? "日记已更新" : "日记已创建");
        resetForm();
        fetchDiaries();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "保存失败");
      }
    } catch {
      showToast("error", "网络异常");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/diary?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "日记已删除");
        setDiaries((prev) => prev.filter((d) => d.id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        showToast("error", "删除失败");
      }
    } catch {
      showToast("error", "网络异常");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${month}月${day}日 周${weekdays[d.getDay()]}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <BookOpen size={28} className="text-amber-500" />
              旅行日记
            </h1>
            <p className="text-gray-400 text-sm mt-1">记录旅途中的每一刻美好</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-200"
          >
            <Plus size={18} />
            写日记
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900">
                    {editingId ? "编辑日记" : "写一篇新日记"}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="给这篇日记起个标题..."
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 bg-transparent border-none outline-none"
                />

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                    <MapPin size={16} className="text-rose-400" />
                    <input
                      type="text"
                      placeholder="城市"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      className="bg-transparent border-none outline-none text-sm text-gray-700 w-24 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                    <Calendar size={16} className="text-blue-400" />
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      className="bg-transparent border-none outline-none text-sm text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">心情</label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setForm((p) => ({ ...p, mood: m.value }))}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                          form.mood === m.value
                            ? m.color + " shadow-sm"
                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {m.emoji} {m.value}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="今天发生了什么有趣的事？"
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-gray-50 rounded-2xl p-4 text-gray-700 text-sm leading-relaxed border-none outline-none resize-none focus:ring-2 focus:ring-amber-200 placeholder:text-gray-400"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editingId ? "更新" : "发布"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {diaries.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">📝</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">还没有日记</h3>
            <p className="text-gray-300 text-sm">开始记录你的第一篇旅行日记吧</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {diaries.map((diary) => {
              const isExpanded = expandedId === diary.id;

              return (
                <motion.div
                  key={diary.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : diary.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{moodIcons[diary.mood] || "😊"}</span>
                          <h3 className="text-lg font-bold text-gray-800 truncate">{diary.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-rose-400" />
                            {diary.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-blue-400" />
                            {formatDate(diary.date)}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-50 rounded-md text-gray-500 font-medium">
                            {diary.mood}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-300 transition-transform duration-200 shrink-0 mt-1 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {!isExpanded && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                        {diary.content}
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {diary.content}
                          </p>

                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(diary); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Edit3 size={13} /> 编辑
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(diary.id); }}
                              disabled={deletingId === diary.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === diary.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              删除
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-3 font-bold text-sm ${
              toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
