"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useXhsStore } from "@/app/store/useXhsStore";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import pLimit from "p-limit";
import { Suspense } from "react";
import {
  MapPin, ArrowLeft, Navigation, Loader2, Calendar, Route,
  Clock, Utensils, ShoppingBag, Landmark, TreePine, Coffee,
  Hotel, Car, Eye, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, Camera, Footprints, X, ChevronLeft, ChevronRight,
  Image as ImageIcon, Plus, Trash2, Pencil
} from "lucide-react";

const AMAP_API_KEY = process.env.NEXT_PUBLIC_AMAP_API_KEY;
const MapComponent = dynamic(() => import("../../components/MapComponent"), { ssr: false });

interface Place {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  duration?: string;
  tips?: string | null;
}

interface DayData {
  day: number;
  places: Place[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string; gradient: string }> = {
  "观光": { icon: Eye, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "观光", gradient: "from-blue-500 to-cyan-500" },
  "美食": { icon: Utensils, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "美食", gradient: "from-orange-500 to-red-500" },
  "购物": { icon: ShoppingBag, color: "text-pink-600", bg: "bg-pink-50 border-pink-200", label: "购物", gradient: "from-pink-500 to-rose-500" },
  "文化": { icon: Landmark, color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "文化", gradient: "from-purple-500 to-violet-500" },
  "自然": { icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "自然", gradient: "from-emerald-500 to-teal-500" },
  "休闲": { icon: Coffee, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "休闲", gradient: "from-amber-500 to-yellow-500" },
  "住宿": { icon: Hotel, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", label: "住宿", gradient: "from-indigo-500 to-blue-500" },
  "交通": { icon: Car, color: "text-gray-600", bg: "bg-gray-50 border-gray-200", label: "交通", gradient: "from-gray-500 to-slate-500" },
};

const DEFAULT_TYPE = { icon: MapPin, color: "text-gray-500", bg: "bg-gray-50 border-gray-200", label: "景点", gradient: "from-gray-400 to-gray-500" };

function ImageGallery({ images }: { images: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const proxiedImages = images.map((img) => `/api/image-proxy?url=${encodeURIComponent(img)}`);

  const goPrev = () => setCurrent((p) => (p > 0 ? p - 1 : images.length - 1));
  const goNext = () => setCurrent((p) => (p < images.length - 1 ? p + 1 : 0));

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {proxiedImages.slice(0, 6).map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden cursor-pointer group relative"
            onClick={() => { setCurrent(i); setIsOpen(true); }}
          >
            <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
        {images.length > 6 && (
          <div
            className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => { setCurrent(6); setIsOpen(true); }}
          >
            <span className="text-gray-500 text-sm font-medium">+{images.length - 6}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.img
              key={current}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={proxiedImages[current]}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 text-white/60 text-sm">
              {current + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function XhsDdContent() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [placesWithCoordinates, setPlacesWithCoordinates] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [activePlaceIndex, setActivePlaceIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", type: "观光", description: "", duration: "", tips: "" });
  const data = useXhsStore((state) => state.data);
  const searchParams = useSearchParams();
  const router = useRouter();
  const noteId = searchParams.get("noteId");

  const [jsonBodyArray, setJsonBodyArray] = useState<DayData[]>([]);
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("加载中...");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (data) {
      setIsPageLoading(false);
    } else if (noteId) {
      fetch(`/api/xhs/${noteId}`)
        .then(async (res) => {
          const noteData = await res.json();
          if (noteData) useXhsStore.getState().setData(noteData);
        })
        .catch(() => {})
        .finally(() => setIsPageLoading(false));
    } else {
      setIsPageLoading(false);
    }
  }, [noteId, data]);

  useEffect(() => {
    if (!data?.jsonBody || initializedRef.current) return;
    try {
      const parsedData =
        typeof data.jsonBody === "string"
          ? JSON.parse(data.jsonBody.replace(/```json/g, "").replace(/```/g, "").trim())
          : data.jsonBody;
      setCity(parsedData.city || "");
      setSummary(parsedData.summary || "");
      setJsonBodyArray(
        parsedData.data.map((item: { day: any; places: any[] }) => ({
          ...item,
          day: Number(item.day),
        }))
      );
      setTitle(data.title || "无标题");
      setBody(data.body || "");
      setImages(data.images || []);
      initializedRef.current = true;
    } catch (error) {
      console.error("JSON 解析错误:", error);
    }
  }, [data]);

  const coordinatesCache: { [key: string]: [number, number] } = {};
  const limit = pLimit(3);

  async function getCoordinates(
    placeName: string,
    cityName: string,
    retries = 3
  ): Promise<[number, number] | null> {
    const fullPlaceName = `${cityName}${placeName}`;
    if (coordinatesCache[fullPlaceName]) return coordinatesCache[fullPlaceName];

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(
          `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(fullPlaceName)}&key=${AMAP_API_KEY}`
        );
        const resData = await response.json();
        if (resData.status === "1" && resData.geocodes && resData.geocodes.length > 0) {
          const location = resData.geocodes[0].location.split(",");
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

  const handleDayClick = useCallback(
    async (day: number) => {
      setExpandedDay((prev) => (prev === day ? null : day));
      setActivePlaceIndex(null);
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
    },
    [jsonBodyArray, city]
  );

  const openAddModal = () => {
    setEditingIndex(null);
    setFormData({ name: "", type: "观光", description: "", duration: "", tips: "" });
    setShowAddModal(true);
  };

  const openEditModal = (index: number) => {
    const place = placesWithCoordinates[index];
    setEditingIndex(index);
    setFormData({
      name: place.name,
      type: place.type || "观光",
      description: place.description || "",
      duration: place.duration || "",
      tips: place.tips || "",
    });
    setShowAddModal(true);
  };

  const handleSubmitPlace = async () => {
    if (!formData.name.trim()) return;

    if (editingIndex !== null) {
      const updatedPlace: Place = {
        ...placesWithCoordinates[editingIndex],
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        duration: formData.duration.trim() || undefined,
        tips: formData.tips.trim() || null,
      };

      const oldName = placesWithCoordinates[editingIndex].name;
      if (oldName !== updatedPlace.name) {
        const coords = await getCoordinates(updatedPlace.name, city);
        if (coords) {
          updatedPlace.latitude = coords[0];
          updatedPlace.longitude = coords[1];
        } else {
          updatedPlace.latitude = undefined;
          updatedPlace.longitude = undefined;
        }
      }

      setJsonBodyArray((prev) =>
        prev.map((d) =>
          d.day === expandedDay
            ? { ...d, places: d.places.map((p, i) => (i === editingIndex ? updatedPlace : p)) }
            : d
        )
      );
      setPlacesWithCoordinates((prev) => prev.map((p, i) => (i === editingIndex ? updatedPlace : p)));
    } else {
      const place: Place = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        duration: formData.duration.trim() || undefined,
        tips: formData.tips.trim() || null,
      };

      const coords = await getCoordinates(place.name, city);
      if (coords) {
        place.latitude = coords[0];
        place.longitude = coords[1];
      }

      setJsonBodyArray((prev) =>
        prev.map((d) =>
          d.day === expandedDay ? { ...d, places: [...d.places, place] } : d
        )
      );
      setPlacesWithCoordinates((prev) => [...prev, place]);
    }

    setFormData({ name: "", type: "观光", description: "", duration: "", tips: "" });
    setEditingIndex(null);
    setShowAddModal(false);
  };

  const handleDeletePlace = (index: number) => {
    setJsonBodyArray((prev) =>
      prev.map((d) =>
        d.day === expandedDay
          ? { ...d, places: d.places.filter((_, i) => i !== index) }
          : d
      )
    );
    setPlacesWithCoordinates((prev) => prev.filter((_, i) => i !== index));
    if (activePlaceIndex === index) setActivePlaceIndex(null);
    else if (activePlaceIndex !== null && activePlaceIndex > index) setActivePlaceIndex((p) => (p ?? 1) - 1);
  };

  useEffect(() => {
    if (jsonBodyArray.length > 0 && expandedDay === null) {
      handleDayClick(1);
    }
  }, [jsonBodyArray]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">加载行程数据...</p>
        </div>
      </div>
    );
  }

  if (!data?.jsonBody || jsonBodyArray.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Route className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无行程数据</h2>
          <p className="text-gray-500 mb-6">该笔记可能尚未解析或数据已丢失</p>
          <button
            onClick={() => router.push("/xhs")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            去解析笔记
          </button>
        </div>
      </div>
    );
  }

  const totalPlaces = jsonBodyArray.reduce((sum, d) => sum + d.places.length, 0);
  const typeStats: Record<string, number> = {};
  jsonBodyArray.forEach((d) => {
    d.places.forEach((p) => {
      const t = p.type || "观光";
      typeStats[t] = (typeStats[t] || 0) + 1;
    });
  });
  const topTypes = Object.entries(typeStats).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const heroImage = images?.[0]
    ? `/api/image-proxy?url=${encodeURIComponent(images[0])}`
    : null;

  const currentDayData = jsonBodyArray.find((d) => d.day === expandedDay);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-gray-700 transition-colors mb-4 group z-10 relative"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">返回</span>
        </button>

        {heroImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden mb-8 h-48 sm:h-64 lg:h-72"
          >
            <img src={heroImage} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {city && (
                    <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      {city}
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {jsonBodyArray.length} 天
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                    <Footprints className="w-3.5 h-3.5 mr-1.5" />
                    {totalPlaces} 个景点
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                  {title}
                </h1>
                {summary && (
                  <p className="text-white/80 text-sm sm:text-base mt-2 drop-shadow">{summary}</p>
                )}
              </motion.div>
            </div>
            {images.length > 1 && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white text-xs border border-white/20">
                <Camera className="w-3.5 h-3.5" />
                {images.length} 张图片
              </div>
            )}
          </motion.div>
        )}

        {!heroImage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {city && (
                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {city}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {jsonBodyArray.length} 天
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                {totalPlaces} 个景点
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            {summary && (
              <p className="text-gray-500 mt-2 text-base">{summary}</p>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {topTypes.map(([type, count]) => {
            const config = TYPE_CONFIG[type] || DEFAULT_TYPE;
            const Icon = config.icon;
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border ${config.bg}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color} bg-white/80`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{config.label}</p>
                  <p className="text-lg font-bold text-gray-800">{count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <ImageGallery images={images} />
          </motion.div>
        )}

        {body && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                原文笔记
              </div>
              {showOriginal ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {showOriginal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {body}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
              {jsonBodyArray.map((dayData, index) => {
                const firstPlace = dayData.places?.[0];
                const dayType = firstPlace?.type ? TYPE_CONFIG[firstPlace.type] : null;
                return (
                  <motion.button
                    key={`${dayData.day}-${index}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDayClick(dayData.day)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left min-w-[90px] ${
                      expandedDay === dayData.day
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm border border-gray-100"
                    }`}
                  >
                    <span className="font-bold">Day {dayData.day}</span>
                    <span className="block text-xs mt-0.5 opacity-70">{dayData.places.length} 个景点</span>
                  </motion.button>
                );
              })}
            </div>

            {currentDayData && expandedDay !== null && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Day {expandedDay} 概览</h3>
                    <p className="text-indigo-600/70 text-xs mt-0.5">
                      {currentDayData.places.length} 个景点
                      {currentDayData.places.some((p) => p.duration) && (
                        <span className="ml-2">
                          {currentDayData.places
                            .filter((p) => p.duration)
                            .map((p) => p.duration)
                            .join(" + ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {currentDayData.places.slice(0, 5).map((p, i) => {
                      const tc = TYPE_CONFIG[p.type || ""] || DEFAULT_TYPE;
                      return (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${tc.bg}`}
                          title={p.name}
                        >
                          <tc.icon className={`w-3 h-3 ${tc.color}`} />
                        </div>
                      );
                    })}
                    {currentDayData.places.length > 5 && (
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-medium">
                        +{currentDayData.places.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {expandedDay !== null && (
                <motion.div
                  key={expandedDay}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {isLoading ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                      <span className="text-gray-500">正在获取景点坐标...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-[23px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-indigo-300 via-indigo-100 to-transparent rounded-full" />
                      <div className="space-y-4">
                        {placesWithCoordinates.map((place, index) => {
                          const typeConfig = TYPE_CONFIG[place.type || ""] || DEFAULT_TYPE;
                          const TypeIcon = typeConfig.icon;
                          const isActive = activePlaceIndex === index;
                          const gaodeUrl = place.latitude && place.longitude
                            ? `https://uri.amap.com/marker?position=${place.longitude},${place.latitude}&name=${encodeURIComponent(place.name)}`
                            : null;

                          return (
                            <motion.div
                              key={place.name || index}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: index * 0.06 }}
                              onMouseEnter={() => setActivePlaceIndex(index)}
                              onMouseLeave={() => setActivePlaceIndex(null)}
                              className={`relative flex items-start gap-4 bg-white rounded-2xl p-5 transition-all duration-200 border cursor-pointer group ${
                                isActive
                                  ? "shadow-lg shadow-indigo-100 border-indigo-200 scale-[1.01]"
                                  : "shadow-sm hover:shadow-md border-gray-100"
                              }`}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(index); }}
                                className="absolute top-3 right-10 p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                                style={{ opacity: isActive ? 1 : undefined }}
                                title="编辑景点"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePlace(index); }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                style={{ opacity: isActive ? 1 : undefined }}
                                title="删除景点"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex flex-col items-center flex-shrink-0 z-10">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-all duration-200 ${
                                  isActive
                                    ? `bg-gradient-to-br ${typeConfig.gradient} text-white shadow-indigo-200 scale-110`
                                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                                }`}>
                                  {index + 1}
                                </div>
                                <div className={`w-2 h-2 rounded-full mt-2 transition-colors ${
                                  isActive ? "bg-indigo-400" : "bg-gray-200"
                                }`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <h3 className="font-bold text-gray-800 text-[15px]">{place.name || "未命名地点"}</h3>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${typeConfig.bg} ${typeConfig.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeConfig.label}
                                  </span>
                                  {place.latitude && place.longitude && (
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                  )}
                                </div>

                                {place.description && (
                                  <p className="text-gray-500 text-sm leading-relaxed mb-2">{place.description}</p>
                                )}

                                <div className="flex items-center gap-3 flex-wrap">
                                  {place.duration && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                      <Clock className="w-3 h-3" />
                                      {place.duration}
                                    </span>
                                  )}
                                  {place.tips && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                      <Sparkles className="w-3 h-3" />
                                      {place.tips}
                                    </span>
                                  )}
                                  {gaodeUrl && (
                                    <a
                                      href={gaodeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      导航
                                    </a>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {expandedDay !== null && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={openAddModal}
                className="w-full py-3 mt-4 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-500 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加景点
              </motion.button>
            )}
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="sticky top-6 rounded-2xl shadow-sm overflow-hidden border border-gray-100 bg-white">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-indigo-500" />
                  路线地图
                </span>
                {expandedDay !== null && (
                  <span className="text-xs text-gray-400">Day {expandedDay}</span>
                )}
              </div>
              <MapComponent
                places={placesWithCoordinates}
                activeIndex={activePlaceIndex}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-400 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            行程由 AI 智能解析生成，仅供参考
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{editingIndex !== null ? "编辑景点" : "添加景点"}</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">景点名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="例如：故宫博物院"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmitPlace(); }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">类型</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setFormData((p) => ({ ...p, type: key }))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            formData.type === key
                              ? `${config.bg} ${config.color} ring-2 ring-indigo-200`
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="景点简介（选填）"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">建议时长</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                      placeholder="例如：2小时"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">小贴士</label>
                    <input
                      type="text"
                      value={formData.tips}
                      onChange={(e) => setFormData((p) => ({ ...p, tips: e.target.value }))}
                      placeholder="例如：需提前预约"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitPlace}
                    disabled={!formData.name.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-200/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {editingIndex !== null ? "保存" : "添加"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function XhsDd() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <XhsDdContent />
    </Suspense>
  );
}
