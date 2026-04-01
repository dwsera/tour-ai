'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Clock, MapPin, Star, Share2, Printer,
  Download, Ticket, Train, Lightbulb, Sun, Heart,
  Navigation2, Calendar, MousePointer2, Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import useTourStore from '../store/useTourStore';

export default function TourResults() {
  const router = useRouter();
  const { tourismGuide, city } = useTourStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  const toggleFavorite = (name: string) => {
    const newFavs = new Set(favorites);
    favorites.has(name) ? newFavs.delete(name) : newFavs.add(name);
    setFavorites(newFavs);
  };

  // 辅助函数：根据描述匹配图标
  const getTransportIcon = (mode?: string) => {
    const m = mode || '';
    if (m.includes('徒步') || m.includes('步行')) return '🚶';
    if (m.includes('地铁')) return '🚇';
    if (m.includes('公交')) return '🚌';
    return '🚕';
  };

  const handleShare = async () => {
    const text = `${city || '旅行'} ${tourismGuide?.schedule.length}日行程\n${tourismGuide?.schedule.map((day, i) =>
      `Day${i + 1}: ${day.places.map(p => p.name).join(' → ')}`
    ).join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${city}旅行攻略`, text });
      } catch { }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      `═══════════════════════════════════`,
      `  ${city || '旅行'} · ${tourismGuide?.schedule.length}日行程攻略`,
      `═══════════════════════════════════`,
      ``,
    ];
    tourismGuide?.schedule.forEach((day, i) => {
      lines.push(`【Day ${i + 1}】`);
      day.places.forEach((p, j) => {
        lines.push(`  ${j + 1}. ${p.name}`);
        if (p.description) lines.push(`     ${p.description}`);
        if (p.visitDuration) lines.push(`     ⏱ ${p.visitDuration}`);
        if (p.ticketPrice) lines.push(`     🎫 ${p.ticketPrice}`);
        if (p.tips) lines.push(`     💡 ${p.tips}`);
        lines.push('');
      });
    });
    lines.push(`═══════════════════════════════════`);
    lines.push(`  Powered by AI · 仅供参考`);
    lines.push(`═══════════════════════════════════`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${city || '旅行攻略'}_${tourismGuide?.schedule.length}日行程.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!tourismGuide?.schedule?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-8xl mb-6">🗺️</motion.div>
        <p className="text-xl font-medium">暂无行程规划，开启你的第一场旅行吧</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFF] pb-20">
      {/* 1. 动态 Header 区域 */}
      <section className="relative h-[45vh] w-full flex items-center overflow-hidden bg-slate-900">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-[#FDFDFF]" />

        <div className="container relative mx-auto px-6 z-10">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-6">
              <Star size={12} className="fill-current" /> AI Tailored Itinerary
            </span>
            <h1 className="text-6xl font-black mb-6 tracking-tight leading-[1.1]">
              {city || '未知城市'}<span className="text-blue-500">.</span>
            </h1>
            <div className="flex gap-6 items-center text-slate-200">
              <div className="flex items-center gap-2 font-medium">
                <Calendar size={18} className="text-blue-400" />
                {tourismGuide.schedule.length} 天深度游
              </div>
              <div className="flex items-center gap-2 font-medium">
                <MapPin size={18} className="text-rose-400" />
                {tourismGuide.schedule.reduce((acc, day) => acc + day.places.length, 0)} 个打卡点
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20 max-w-6xl">
        {/* 2. 交互工具条 */}
        <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-wrap justify-between items-center mb-12 gap-4">
          <div className="flex gap-2">
            {tourismGuide.schedule.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedDayIndex(idx)}
                className={`px-6 py-2 rounded-2xl font-bold transition-all duration-300 ${expandedDayIndex === idx
                  ? 'bg-slate-900 text-white shadow-lg scale-105'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                DAY {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ToolButton icon={copied ? <Check size={18} /> : <Share2 size={18} />} label={copied ? "已复制" : "分享"} onClick={handleShare} />
            <ToolButton icon={<Printer size={18} />} label="打印" onClick={handlePrint} />
            <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200">
              <Download size={18} /> 下载攻略
            </button>
          </div>
        </div>

        {/* 3. 主行程列表 */}
        <div className="space-y-12 relative">
          {/* 左侧装饰性虚线 - 仅在桌面端显示 */}
          <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-dashed-gradient hidden lg:block" />

          <AnimatePresence mode="wait">
            <motion.div
              key={expandedDayIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 gap-8"
            >
              {tourismGuide.schedule[expandedDayIndex].places.map((place, pIdx) => (
                <motion.div key={pIdx} variants={itemVariants} className="group relative lg:pl-20">
                  {/* 时间轴节点 */}
                  <div className="absolute left-0 top-10 hidden lg:flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-md border-2 border-slate-900 flex items-center justify-center z-10 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                      <span className="text-xs font-black">{pIdx + 1}</span>
                    </div>
                  </div>

                  <Card className="overflow-hidden border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] bg-white">
                    <div className="flex flex-col md:flex-row">
                      {/* 景点图预览 */}
                      <div className="md:w-80 h-72 md:h-auto overflow-hidden relative">
                        <img
                          src={place.image}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={place.name}
                          onClick={() => setSelectedImage(place.image)}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {getTransportIcon(place.transportMode)} {place.transportMode || '推荐'}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(place.name)}
                          className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all ${favorites.has(place.name) ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-rose-500 hover:text-white'
                            }`}
                        >
                          <Heart size={18} fill={favorites.has(place.name) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* 内容详情 */}
                      <div className="flex-1 p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                              {place.name}
                              <MousePointer2 size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                              <MapPin size={14} /> 核心景区 · 步行可达
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-500 leading-relaxed text-lg">
                          {place.description}
                        </p>

                        {/* 数据面板 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-50">
                          <DataBox icon={<Clock size={16} className="text-orange-500" />} label="预计用时" value={place.visitDuration} />
                          <DataBox icon={<Ticket size={16} className="text-emerald-500" />} label="门票参考" value={place.ticketPrice} />
                          <DataBox icon={<Sun size={16} className="text-amber-500" />} label="最佳游览" value={place.bestTimeToVisit} />
                          <DataBox icon={<Train size={16} className="text-blue-500" />} label="通勤时长" value={place.commuteTime} />
                        </div>

                        {place.tips && (
                          <div className="bg-slate-50 p-5 rounded-2xl flex gap-4 items-start group-hover:bg-blue-50/50 transition-colors">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                              <Lightbulb size={20} className="text-amber-500" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pro Tip</span>
                              <p className="text-sm text-slate-600 font-medium leading-snug">{place.tips}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 图片放大 Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={selectedImage}
              className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .bg-dashed-gradient {
          background-image: linear-gradient(to bottom, #e2e8f0 50%, transparent 50%);
          background-size: 2px 20px;
        }
      `}</style>
    </main>
  );
}

// 抽离的小组件：工具按钮
function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all font-bold text-sm">
      {icon}
      {label}
    </button>
  );
}

// 抽离的小组件：数据方块
function DataBox({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
      </div>
      <p className="font-bold text-slate-700 text-sm">{value || '---'}</p>
    </div>
  );
}