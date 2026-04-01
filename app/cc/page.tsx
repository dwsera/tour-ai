"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useTourStore from "../store/useTourStore";
import { useXhsStore } from "@/app/store/useXhsStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, MapPin, Calendar, Route, Plus,
  Loader2, Sparkles, BookOpen, Compass,
  AlertCircle, CheckCircle2, ChevronRight, Hash,
  LayoutGrid
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const DEFAULT_ITINERARY_IMG = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600";
const DEFAULT_XHS_IMG = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600";

function getItineraryImage(item: any): string {
  try {
    const schedule = typeof item.schedule === "string" ? JSON.parse(item.schedule) : item.schedule;
    if (Array.isArray(schedule)) {
      for (const day of schedule) {
        if (Array.isArray(day.places)) {
          for (const place of day.places) {
            if (place.image && typeof place.image === "string" && place.image.startsWith("http")) {
              return place.image;
            }
          }
        }
      }
    }
  } catch { }
  return DEFAULT_ITINERARY_IMG;
}

function getXhsImage(note: any): string {
  const images = Array.isArray(note.images) ? note.images : [];
  if (images.length > 0 && typeof images[0] === "string" && images[0].startsWith("http")) {
    return images[0];
  }
  return DEFAULT_XHS_IMG;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "";
  }
}

export default function MyCollection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setTourismGuide, setCity } = useTourStore();
  const { setData: setXhsData } = useXhsStore();

  const [itineraries, setItineraries] = useState<any[]>([]);
  const [xhsNotes, setXhsNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      Promise.all([fetchItineraries(), fetchXhsNotes()]).finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const fetchItineraries = async () => {
    try {
      const res = await fetch(`/api/itinerary/list?userId=${session!.user!.id}`);
      if (res.ok) {
        const data = await res.json();
        setItineraries(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("获取行程数据失败:", error);
    }
  };

  const fetchXhsNotes = async () => {
    try {
      const res = await fetch(`/api/xhs/list?userId=${session!.user!.id}`);
      if (res.ok) {
        const data = await res.json();
        setXhsNotes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("获取笔记数据失败:", error);
    }
  };

  const handleDeleteItinerary = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/itinerary/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItineraries((prev) => prev.filter((i) => i.id !== id));
        showToast("success", "行程已删除");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "删除失败");
      }
    } catch {
      showToast("error", "网络异常");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteXhs = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/xhs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setXhsNotes((prev) => prev.filter((n) => n.id !== id));
        showToast("success", "笔记已删除");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "删除失败");
      }
    } catch {
      showToast("error", "网络异常");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewItinerary = (item: any) => {
    try {
      const schedule = typeof item.schedule === "string" ? JSON.parse(item.schedule) : item.schedule;
      setTourismGuide({ city: item.city, schedule });
      setCity(item.city);
    } catch { }
    router.push("/jg");
  };

  const handleViewXhs = (item: any) => {
    setXhsData(item);
    router.push("/dd");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[32px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-orange-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-rose-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl backdrop-blur-md border ${toast.type === "success"
                  ? "bg-emerald-500/90 border-emerald-400 text-white"
                  : "bg-red-500/90 border-red-400 text-white"
                }`}
            >
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 mb-12 border border-slate-200/60 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white transition-transform hover:rotate-3 duration-500">
                <img src="/1.jpg" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  你好, {session?.user?.username || "Explorer"}
                </h2>
                <span className="px-3 py-1 bg-gradient-to-br from-rose-400 to-orange-400 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  高级会员
                </span>
              </div>
              <p className="text-slate-500 font-medium mb-4">今天想去哪里发现灵感？</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-slate-700">LV.12 资深向导</span>
                </div>
                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-slate-700">
                    探索 {new Set(itineraries.map((i) => i.city)).size} 座城市
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-gradient-to-br from-rose-400 to-orange-400 p-6 rounded-[32px] text-center text-white shadow-xl shadow-orange-100">
                <div className="text-3xl font-black mb-1">{itineraries.length}</div>
                <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">AI 行程</div>
              </div>
              <div className="bg-slate-200 p-6 rounded-[32px] text-center border border-slate-100 shadow-sm">
                <div className="text-3xl font-black mb-1 text-slate-900">{xhsNotes.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">解析笔记</div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                <LayoutGrid className="text-orange-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">我的行程</h3>
                <p className="text-sm text-slate-400 font-medium italic">Your Future Journeys</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/create")}
              className="group flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-black text-xs tracking-widest uppercase">新增行程</span>
            </motion.button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {itineraries.map((item) => {
              const schedule = typeof item.schedule === "string" ? JSON.parse(item.schedule) : item.schedule;
              const days = Array.isArray(schedule) ? schedule.length : 0;
              return (
                <CollectionCard
                  key={item.id}
                  title={`探索 ${item.city}`}
                  subtitle={item.city}
                  badge="AI 行程"
                  image={getItineraryImage(item)}
                  footerLeft={`${days} 天行程`}
                  footerRight="查看详情"
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDeleteItinerary(item.id);
                  }}
                  isDeleting={deletingId === item.id}
                  onClick={() => handleViewItinerary(item)}
                  accent="orange"
                />
              );
            })}
            {itineraries.length === 0 && <EmptyState text="开启你的第一场 AI 冒险之旅吧" color="orange" />}
          </motion.div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                <Sparkles className="text-rose-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">灵感笔记</h3>
                <p className="text-sm text-slate-400 font-medium italic">Social Media Collection</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/xhs")}
              className="group flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-black text-xs tracking-widest uppercase">解析笔记</span>
            </motion.button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {xhsNotes.map((item) => (
              <CollectionCard
                key={item.id}
                title={item.title}
                subtitle="解析笔记"
                badge="小红书"
                accent="rose"
                image={getXhsImage(item)}
                footerLeft={formatDate(item.createdAt)}
                footerRight="结构化详情"
                onDelete={(e) => {
                  e.stopPropagation();
                  handleDeleteXhs(item.id);
                }}
                isDeleting={deletingId === item.id}
                onClick={() => handleViewXhs(item)}
              />
            ))}
            {xhsNotes.length === 0 && <EmptyState text="复制小红书链接，一键生成攻略" color="rose" />}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function CollectionCard({
  title,
  subtitle,
  badge,
  image,
  footerLeft,
  footerRight,
  onClick,
  onDelete,
  isDeleting,
  accent = "orange",
}: {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  footerLeft: string;
  footerRight: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
  accent?: "orange" | "rose";
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-60 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
            {badge}
          </span>
          <button
            onClick={onDelete}
            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white/70 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1 uppercase tracking-wider">
            <MapPin className="w-3 h-3" /> {subtitle}
          </div>
          <h4 className="text-xl font-black text-white line-clamp-1">{title}</h4>
        </div>
      </div>

      <div className="p-6 flex items-center justify-between border-t border-slate-50">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{footerLeft}</span>
        <div
          className={`flex items-center gap-1.5 text-xs font-black transition-colors ${accent === "rose" ? "group-hover:text-rose-600" : "group-hover:text-orange-600"
            }`}
        >
          {footerRight} <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ text, color = "orange" }: { text: string; color?: string }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px]">
      <div
        className={`w-16 h-16 rounded-2xl ${color === "rose" ? "bg-rose-50 text-rose-300" : "bg-orange-50 text-orange-300"
          } flex items-center justify-center mb-4 opacity-50`}
      >
        <Route className="w-8 h-8" />
      </div>
      <p className="text-slate-400 font-bold text-sm tracking-wide">{text}</p>
    </div>
  );
}