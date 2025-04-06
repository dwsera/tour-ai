"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, History, Music, Moon, Mountain, Utensils, Building2, Trees, ShoppingBag, Activity } from "lucide-react";
import useStore from '../store/useTourStore';
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion"; // 添加动画库
import useTourStore from "../store/useTourStore";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// 动画变体
const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("1");
  const [city, setCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const interests = [
    { id: "art", label: "艺术", icon: <Palette className="h-4 w-4" /> },
    { id: "history", label: "历史", icon: <History className="h-4 w-4" /> },
    { id: "music", label: "音乐", icon: <Music className="h-4 w-4" /> },
    { id: "sightseeing", label: "观光", icon: <Mountain className="h-4 w-4" /> },
    { id: "food", label: "美食", icon: <Utensils className="h-4 w-4" /> },
    { id: "museum", label: "博物馆", icon: <Building2 className="h-4 w-4" /> },
    { id: "nature", label: "自然公园", icon: <Trees className="h-4 w-4" /> },
    { id: "shopping", label: "购物", icon: <ShoppingBag className="h-4 w-4" /> },
  ];

  const handleCitySelect = (cityName: string) => setCity(cityName);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    // Ensure a default keyword if none is selected
    const keyword = selectedInterests.length > 0 ? selectedInterests.join(",") : "博物馆\文化\艺术\历史\商场\图书馆等各式各样景点";

    try {
      const response = await fetch(`/api/getTourismGuide?city=${city}&keyword=${keyword}&days=1`);
      const data = await response.json();

      if (response.ok && data.schedule) {
        useTourStore.getState().setCity(data.city || ''); // 设置城市
        useTourStore.getState().setTourismGuide({
          city: data.city || '',
          schedule: data.schedule,
        });
        router.push('/jg');
      } else {
        setError(data.message || '获取攻略失败');
      }
    } catch (err) {
      setError('获取旅游攻略失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="flex h-[calc(100vh-3rem)] rounded-xl shadow-2xl overflow-hidden">
        {/* 地图区域 */}
        <div className="w-3/5 relative">
          <Map onCitySelect={handleCitySelect} />
          <div className="absolute top-4 left-20 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
            <h1 className="text-xl font-bold text-gray-800">点击地图选您的旅行目的地</h1>
          </div>
        </div>

        {/* 表单区域 */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-2/5"
        >
          <Card className="h-full border-none bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 space-y-8">
              {/* 城市选择 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  规划您的旅程
                </h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="输入或在地图上选择城市"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />

                </div>
              </div>

              {/* 兴趣选择 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">选择兴趣</h2>
                <div className="grid grid-cols-2 gap-4">
                  {interests.map((interest) => (
                    <motion.div
                      key={interest.id}
                      whileHover={{ scale: 1.03 }}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedInterests.includes(interest.id)
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                        } border`}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <Checkbox
                        id={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={interest.id}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 w-full"
                      >
                        {interest.icon}
                        {interest.label}
                      </label>
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 italic">
                  已选: {selectedInterests.length > 0 ? selectedInterests.join(", ") : "未选择"}
                </div>
              </div>

              {/* 创建按钮和错误信息 */}
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  size="lg"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" className="opacity-25" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      生成中...
                    </span>
                  ) : (
                    "创建我的旅程"
                  )}
                </Button>
              </motion.div>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 p-2 rounded"
                >
                  {error}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}