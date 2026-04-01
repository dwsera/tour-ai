"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Palette, History, Music, Mountain, Utensils,
  Building2, Trees, ShoppingBag, MapPin,
  Sparkles, Loader2, ChevronRight, Check,
  ArrowLeft, Search, Clock, Calendar
} from 'lucide-react';
import dynamic from "next/dynamic";
import useTourStore from '../store/useTourStore';

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, duration: 0.4 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const interests = [
  { id: "art", label: "艺术", icon: <Palette className="h-4 w-4" />, desc: "美术馆、创意园区" },
  { id: "history", label: "历史", icon: <History className="h-4 w-4" />, desc: "古建筑、文化遗址" },
  { id: "music", label: "音乐", icon: <Music className="h-4 w-4" />, desc: "演出、音乐厅" },
  { id: "sightseeing", label: "观光", icon: <Mountain className="h-4 w-4" />, desc: "自然风光、名胜" },
  { id: "food", label: "美食", icon: <Utensils className="h-4 w-4" />, desc: "特色餐厅、小吃街" },
  { id: "museum", label: "博物馆", icon: <Building2 className="h-4 w-4" />, desc: "科技馆、展览馆" },
  { id: "nature", label: "自然", icon: <Trees className="h-4 w-4" />, desc: "植物园、动物园" },
  { id: "shopping", label: "购物", icon: <ShoppingBag className="h-4 w-4" />, desc: "商业街、市集" },
];

const interestMap: Record<string, string> = {
  art: "艺术、美术馆、创意园区",
  history: "历史文化景点、古建筑、文化遗址",
  music: "音乐演出、音乐厅、演唱会",
  sightseeing: "自然风光、名胜古迹、观光",
  food: "美食体验、特色餐厅、小吃街",
  museum: "博物馆、科技馆、展览馆",
  nature: "自然风光、植物园、动物园",
  shopping: "购物、商业街、市集",
};

const cityImages: Record<string, string> = {
  "北京": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=2000",
  "上海": "https://images.unsplash.com/photo-1537531383496-7d3426c0b5d4?auto=format&fit=crop&q=80&w=2000",
  "广州": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=2000",
  "成都": "https://images.unsplash.com/photo-1590764258299-0f91fa7f95e1?auto=format&fit=crop&q=80&w=2000",
  "杭州": "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=2000",
  "西安": "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=2000",
  "重庆": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=2000",
  "深圳": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=2000",
  "南京": "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&q=80&w=2000",
  "武汉": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=2000",
  "厦门": "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&q=80&w=2000",
  "丽江": "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=2000",
  "三亚": "https://images.unsplash.com/photo-1537531383496-7d3426c0b5d4?auto=format&fit=crop&q=80&w=2000",
  "大理": "https://images.unsplash.com/photo-1590764258299-0f91fa7f95e1?auto=format&fit=crop&q=80&w=2000",
  "苏州": "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&q=80&w=2000",
  "青岛": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=2000",
  "长沙": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=2000",
  "天津": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=2000",
  "昆明": "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=2000",
  "桂林": "https://images.unsplash.com/photo-1537531383496-7d3426c0b5d4?auto=format&fit=crop&q=80&w=2000",
};

function getCityImage(cityName: string): string {
  for (const [key, url] of Object.entries(cityImages)) {
    if (cityName.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000";
}

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [days, setDays] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInterestToggle = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmCity = () => {
    if (!city.trim()) {
      setError("请先在地图上点击或输入一个城市");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    const keyword = selectedInterests
      .map(id => interestMap[id])
      .filter(Boolean)
      .join("、");

    try {
      const params = new URLSearchParams({
        city: city.trim(),
        days: days.toString(),
        keyword,
      });

      const response = await fetch(`/api/getTourismGuide?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.schedule) {
        useTourStore.getState().setCity(data.city || city.trim());
        useTourStore.getState().setTourismGuide({
          city: data.city || city.trim(),
          schedule: data.schedule,
        });
        router.push("/jg");
      } else {
        setError(data.message || "生成失败，请稍后重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (cityName: string) => setCity(cityName);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-map"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative h-screen w-full"
          >
            <div className="absolute inset-0 z-0">
              <Map onCitySelect={handleCitySelect} />
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-30">
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
                <div className="pl-3 text-slate-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="搜索或在地图上点击选择城市..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmCity()}
                  className="flex-1 bg-transparent border-none outline-none py-3 text-lg font-medium placeholder:text-slate-400"
                />
                <button
                  onClick={handleConfirmCity}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-200"
                >
                  去规划 <ChevronRight size={18} />
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-white/50 text-sm text-slate-500 font-medium">
                <MapPin size={14} className="inline mr-2 text-orange-500" />
                {city ? (
                  <span>已选择：<span className="text-slate-800 font-bold">{city}</span></span>
                ) : (
                  <span>点击地图或输入城市名称开始规划</span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-prefs"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center p-4 md:p-8 min-h-screen"
          >
            <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 h-[85vh]">

              <div className="relative w-full md:w-3/5 bg-slate-200 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img
                  src={getCityImage(city)}
                  alt={city}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="absolute top-8 left-8 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 text-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-white/30"
                >
                  <ArrowLeft size={18} /> 返回地图
                </button>

                <div className="absolute bottom-12 left-12 right-12 z-20">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
                        目的地
                      </span>
                      <div className="h-[1px] w-8 bg-white/30" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
                      {city}
                    </h1>
                    <div className="flex items-center gap-4 text-orange-200 font-medium text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-orange-400" />
                        {days} 天行程
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={16} className="text-orange-400" />
                        AI 智能定制
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="w-full md:w-2/5 flex flex-col bg-white">
                <div className="p-10 pb-4">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 leading-none tracking-tight">定制你的旅程</h2>
                  <p className="text-gray-400 text-sm">选择天数和兴趣偏好，AI 为你量身打造</p>
                </div>

                <div className="flex-1 overflow-y-auto p-10 pt-4 space-y-6 custom-scrollbar">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">旅行天数</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDays(d)}
                          disabled={loading}
                          className={`
                            flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2
                            ${days === d
                              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100'
                              : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <Clock size={14} className="inline mr-1.5" />
                          {d} 天
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">兴趣偏好 <span className="text-gray-300 font-normal lowercase">(可选)</span></label>
                      <span className="text-[10px] text-orange-600 font-black bg-orange-50 px-2 py-0.5 rounded-md">
                        已选 {selectedInterests.length}
                      </span>
                    </div>

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 gap-2.5"
                    >
                      {interests.map((item) => {
                        const isSelected = selectedInterests.includes(item.id);
                        return (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            onClick={() => !loading && handleInterestToggle(item.id)}
                            className={`
                              group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2
                              ${isSelected
                                ? 'bg-orange-50 border-orange-500 shadow-md shadow-orange-50'
                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                              }
                              ${loading ? 'opacity-50 pointer-events-none' : ''}
                            `}
                          >
                            <div className={`
                              p-2 rounded-lg transition-colors shrink-0
                              ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}
                            `}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}>{item.label}</h4>
                                {isSelected && <Check size={12} className="text-orange-500 shrink-0" />}
                              </div>
                              <p className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-orange-400' : 'text-gray-400'}`}>{item.desc}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>

                <div className="p-10 pt-4 border-t border-gray-50 bg-white space-y-3">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className={`
                      relative w-full py-4 rounded-2xl font-black text-sm tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-300
                      ${loading
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-200 active:scale-[0.98]'
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>AI 正在规划中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>生成行程方案</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}