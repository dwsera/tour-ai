"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useTourStore from "./store/useTourStore";
import {
  Search, MapPin, Clock, TrendingUp, ArrowRight, History, Plane
} from "lucide-react";

const keywords = [
  { label: "历史文化景点", emoji: "🏛️" },
  { label: "自然风光", emoji: "🏔️" },
  { label: "现代地标", emoji: "🏙️" },
  { label: "特色街区", emoji: "🏮" },
  { label: "美食体验", emoji: "🍜" },
  { label: "博物馆", emoji: "🎨" },
  { label: "公园", emoji: "🌳" },
  { label: "古镇", emoji: "🏘️" },
];

const popularCities = [
  { name: "北京", desc: "千年古都，历史文化名城", emoji: "🏯" },
  { name: "上海", desc: "魔都，现代都市风情", emoji: "🌃" },
  { name: "广州", desc: "美食之都，岭南文化", emoji: "🥟" },
  { name: "深圳", desc: "创新之城，科技前沿", emoji: "💡" },
  { name: "成都", desc: "天府之国，休闲之都", emoji: "🐼" },
  { name: "杭州", desc: "人间天堂，西湖美景", emoji: "🌸" },
  { name: "西安", desc: "十三朝古都", emoji: "⚔️" },
  { name: "重庆", desc: "山城，火锅之都", emoji: "🌶️" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } },
};

export default function DiscoverPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [days, setDays] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (cityName: string) => {
    const newHistory = [cityName, ...searchHistory.filter(c => c !== cityName)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const fetchTourismGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!city.trim()) {
      setError("请输入城市名称");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        city: city,
        days: days.toString(),
      });

      if (keyword.trim()) {
        params.append('keyword', keyword);
      }

      const response = await fetch(`/api/getTourismGuide?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.schedule) {
        saveToHistory(city);
        useTourStore.getState().setCity(data.city || "");
        useTourStore.getState().setTourismGuide({
          city: data.city || "",
          schedule: data.schedule,
        });
        router.push("/jg");
      } else {
        setError(data.message || "获取攻略失败");
      }
    } catch (err) {
      setError("获取旅游攻略失败，请稍后重试");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed scale-105"
        style={{ backgroundImage: "url('/home.avif')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 py-10 md:px-14 md:py-12 w-full max-w-4xl mx-4"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[28px] rotate-6 opacity-20 blur-sm" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[24px] flex items-center justify-center shadow-xl shadow-rose-500/30">
              <Plane className="w-8 h-8 text-white -rotate-12" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-rose-200 via-white to-orange-200 bg-clip-text text-transparent">
              踏上新的旅程
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-normal leading-relaxed">
            让每一步都留下{" "}
            <span className="text-orange-300 font-semibold">与众不同的回忆</span>
          </p>
          <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">
            AI 智能规划 · 量身定制专属旅行攻略
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={fetchTourismGuide} className="space-y-5">
          <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="您想去哪里？"
                  className="w-full py-4 pl-11 pr-4 text-white bg-transparent focus:outline-none placeholder:text-gray-400 text-sm font-medium border-b md:border-b-0 md:border-r border-white/[0.08]"
                  value={city ?? ""}
                  onChange={(e) => setCity(e.target.value ?? "")}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2 px-4 py-3 md:border-r border-white/[0.08]">
                <Clock className="text-gray-400" size={16} />
                <select
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-sm font-medium"
                  value={days ?? 1}
                  onChange={(e) => setDays(Number(e.target.value ?? "1"))}
                  disabled={loading}
                >
                  {[1, 2, 3].map((day) => (
                    <option key={day} className="bg-gray-900 text-white" value={day}>
                      {day} 天
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="bg-gradient-to-br from-rose-400 to-orange-400 text-white py-4 px-8 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    生成中...
                  </>
                ) : (
                  <>
                    探索旅程
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {keywords.map((kw) => (
              <motion.button
                key={kw.label}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setKeyword(keyword === kw.label ? "" : kw.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  keyword === kw.label
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-transparent"
                    : "bg-white/10 text-gray-200 hover:bg-white/15 hover:text-white border border-white/10"
                }`}
              >
                <span>{kw.emoji}</span>
                {kw.label}
              </motion.button>
            ))}
          </div>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {searchHistory.length > 0 && (
          <motion.div variants={itemVariants} className="mt-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <History size={14} className="text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">最近搜索</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {searchHistory.map((cityName) => (
                <motion.button
                  key={cityName}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCityClick(cityName)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-gray-200 hover:bg-white/15 hover:text-white transition-all border border-white/10"
                >
                  <MapPin size={12} />
                  {cityName}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp size={14} className="text-amber-400" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">热门目的地</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCities.map((cityInfo) => (
              <motion.button
                key={cityInfo.name}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCityClick(cityInfo.name)}
                className="group p-4 rounded-2xl bg-white/[0.07] backdrop-blur-sm hover:bg-white/[0.12] transition-all duration-300 text-left border border-white/10 hover:border-white/20"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cityInfo.emoji}</div>
                <div className="font-semibold text-white text-sm mb-0.5">{cityInfo.name}</div>
                <p className="text-[11px] text-gray-300 leading-snug">{cityInfo.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
              <span>AI 智能推荐</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-300 rounded-full" />
              <span>个性化定制</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-300 rounded-full" />
              <span>实时更新</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}