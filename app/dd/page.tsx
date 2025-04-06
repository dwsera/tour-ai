"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // 用于获取 URL 参数
import { useXhsStore } from "@/app/store/useXhsStore";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import pLimit from "p-limit";
import { Suspense } from "react"; // 引入 Suspense

const AMAP_API_KEY = process.env.NEXT_PUBLIC_AMAP_API_KEY;
const MapComponent = dynamic(() => import("../../components/MapComponent"), { ssr: false });

interface Place {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface DayData {
  day: number;
  places: Place[];
}

// 将主要逻辑抽取到一个单独的组件
function XhsDdContent() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [placesWithCoordinates, setPlacesWithCoordinates] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const data = useXhsStore((state) => state.data);
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");

  let jsonBodyArray: DayData[] = [];
  let city: string = "珠海";
  let title: string = "加载中...";

  // 从 store 或数据库加载数据
  useEffect(() => {
    if (!data && noteId) {
      fetch(`/api/xhs/${noteId}`).then(async (res) => {
        const noteData = await res.json();
        if (noteData) useXhsStore.getState().setData(noteData);
      });
    }
  }, [noteId, data]);

  // 解析数据
  if (data?.jsonBody) {
    try {
      const parsedData = typeof data.jsonBody === "string" 
        ? JSON.parse(data.jsonBody.replace(/```json/g, "").replace(/```/g, "").trim()) 
        : data.jsonBody;
      city = parsedData.city || "珠海";
      jsonBodyArray = parsedData.data.map((item: { day: any; places: any[] }) => ({
        ...item,
        day: Number(item.day),
      }));
      title = data.title || "无标题";
    } catch (error) {
      console.error("JSON 解析错误:", error);
    }
  }

  const coordinatesCache: { [key: string]: [number, number] } = {};
  const limit = pLimit(3);

  async function getCoordinates(placeName: string, city: string, retries = 3): Promise<[number, number] | null> {
    const fullPlaceName = `${city}${placeName}`;
    if (coordinatesCache[fullPlaceName]) return coordinatesCache[fullPlaceName];

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(
          `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(fullPlaceName)}&key=${AMAP_API_KEY}`
        );
        const data = await response.json();
        if (data.status === "1" && data.geocodes && data.geocodes.length > 0) {
          const location = data.geocodes[0].location.split(",");
          const coords: [number, number] = [parseFloat(location[1]), parseFloat(location[0])];
          coordinatesCache[fullPlaceName] = coords;
          return coords;
        }
        throw new Error(`无法找到 ${fullPlaceName} 的经纬度`);
      } catch (error) {
        if (attempt === retries) return null;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  const handleDayClick = async (day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
    if (day === null) return;

    setIsLoading(true);
    const selectedDayData = jsonBodyArray.find((d) => d.day === day);
    const places = selectedDayData?.places || [];

    const updatedPlaces = await Promise.all(
      places.map((place) =>
        limit(async () => {
          const coords = await getCoordinates(place.name, city);
          return coords ? { ...place, latitude: coords[0], longitude: coords[1] } : place;
        })
      )
    );

    setPlacesWithCoordinates(updatedPlaces);
    setIsLoading(false);
  };

  useEffect(() => {
    if (jsonBodyArray.length > 0 && expandedDay === null) handleDayClick(1);
  }, [jsonBodyArray]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">{title}</h1>
          <div className="h-1 w-20 bg-indigo-600 rounded-full mx-auto mt-2"></div>
        </div>
        <div className="mb-8 rounded-xl shadow-md overflow-hidden">
          <MapComponent places={placesWithCoordinates} />
        </div>
        <div className="space-y-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {jsonBodyArray.map((dayData, index) => (
              <button
                key={`${dayData.day}-${index}`}
                className={`flex-shrink-0 px-6 py-3 rounded-lg transition-all duration-300 shadow-md ${
                  expandedDay === dayData.day ? "bg-indigo-600 text-white scale-105" : "bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105"
                }`}
                onClick={() => handleDayClick(dayData.day)}
              >
                <h2 className="text-lg font-bold">第 {dayData.day} 天</h2>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {expandedDay && (
              <motion.div
                key={expandedDay}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="ml-3 text-gray-600 text-lg">加载中...</span>
                    </div>
                  ) : placesWithCoordinates.length > 0 ? (
                    placesWithCoordinates.map((place, index) => (
                      <div
                        key={place.name || index}
                        className="flex items-start space-x-4 mb-6 last:mb-0 border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-indigo-600">{String.fromCharCode(65 + index)}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{place.name || "未命名地点"}</h3>
                          <p className="text-gray-600 mt-1">{place.description || "暂无描述"}</p>
                          {place.latitude && place.longitude ? (
                            <p className="text-gray-500 text-sm mt-1">坐标: ({place.latitude.toFixed(6)}, {place.longitude.toFixed(6)})</p>
                          ) : (
                            <p className="text-gray-500 text-sm mt-1">暂未获取到坐标</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">暂无行程</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// 默认导出的页面组件，包裹 Suspense
export default function XhsDd() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">加载中...</div>}>
      <XhsDdContent />
    </Suspense>
  );
}