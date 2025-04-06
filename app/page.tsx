"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useTourStore from "./store/useTourStore";

export default function DiscoverPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 表单提交时的处理
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
      const response = await fetch(`/api/getTourismGuide?city=${city}&days=${days}`);
      const data = await response.json();

      if (response.ok && data.schedule) {
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

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/home.avif')" }}
    >
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />

      {/* 内容容器 */}
      <div className="relative z-10 text-center text-white px-6 py-8 md:px-16 md:py-12 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl max-w-4xl w-full mx-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-green-300 to-blue-500 bg-clip-text text-transparent">
        踏上新的旅程
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-gray-200 font-light tracking-wide">
        让每一步都留下 <span className="text-blue-300 font-medium">与众不同的回忆</span>
        </p>

        {/* 表单 */}
        <form
          onSubmit={fetchTourismGuide}
          className="bg-white/10 backdrop-blur-md rounded-full overflow-hidden flex flex-col md:flex-row gap-2 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <input
            type="text"
            placeholder="您想去哪里？"
            className="flex-1 py-4 px-6 text-gray-100 bg-transparent focus:outline-none placeholder:text-gray-300 md:border-r border-gray-300/20"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="城市名称"
            disabled={loading}
          />
          <select
            className="py-4 px-6 bg-transparent text-gray-100 focus:outline-none md:border-r border-gray-300/20"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="旅行天数"
            disabled={loading}
          >
            {[1, 2, 3].map((day) => (
              <option key={day} className="bg-gray-800 text-gray-100" value={day}>
                {day} 天
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 px-8 font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 flex items-center justify-center gap-2 rounded-r-full"
            disabled={loading}
            aria-live="polite"
          >
            {loading ? "加载中..." : "探索旅程"}
          </button>
        </form>

        {/* 错误提示 */}
        {error && <p className="mt-4 text-red-400">{error}</p>}

        {/* 推荐标签 */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["珠海", "北京", "广州", "上海"].map((tag) => (
            <span
              key={tag}
              onClick={() => !loading && setCity(tag)}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-gray-200 hover:bg-white/20 transition-colors cursor-pointer"
            >
              # {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}