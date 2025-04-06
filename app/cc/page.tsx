"use client";

import { useSession } from "next-auth/react";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useTourStore from "../store/useTourStore";
import { Trash2 } from "lucide-react";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const Home = () => {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [xhsNotes, setXhsNotes] = useState<any[]>([]); // 新增状态：存储小红书笔记
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setTourismGuide, setCity } = useTourStore();

  // 获取用户的行程数据
  const fetchItineraries = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/itinerary/list?userId=${session.user.id}`);
      if (!response.ok) throw new Error("获取行程数据失败");

      const data = await response.json();
      setItineraries(data);
    } catch (error) {
      console.error("获取行程数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户的小红书笔记数据
  const fetchXhsNotes = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/xhs/list?userId=${session.user.id}`);
      if (!response.ok) throw new Error("获取小红书笔记失败");

      const data = await response.json();
      setXhsNotes(data);
    } catch (error) {
      console.error("获取小红书笔记失败:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchItineraries();
      fetchXhsNotes(); // 同时获取小红书笔记
    }
  }, [status]);

  // 删除行程
  const deleteItinerary = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("确定要删除这个行程吗？")) return;

    try {
      const response = await fetch(`/api/itinerary/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("删除行程失败");
      setItineraries((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("删除行程失败:", error);
      alert("删除行程失败，请稍后重试");
    }
  };

  // 删除小红书笔记
  const deleteXhsNote = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("确定要删除这个小红书笔记吗？")) return;

    try {
      const response = await fetch(`/api/xhs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除小红书笔记失败");
      setXhsNotes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("删除小红书笔记失败:", error);
      alert("删除小红书笔记失败，请稍后重试");
    }
  };

  // 点击行程卡片跳转到详情页
  const goToDetail = (itinerary: any) => {
    setTourismGuide({ city: itinerary.city, schedule: itinerary.schedule });
    setCity(itinerary.city);
    router.push("/jg");
  };

  // 点击小红书笔记跳转到详情页
  const goToXhsDetail = (xhsNote: any) => {
    router.push(`/dd?noteId=${xhsNote.id}`); // 跳转到小红书详情页
  };

  return (
    <div className="container mx-auto p-5">
      {/* 用户信息区块 */}
      {session && session.user ? (
        <div className="flex justify-center w-full mb-8">
          <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center">
              <img
                src="/1.jpg"
                alt="用户头像"
                className="w-20 h-20 rounded-full border-2 border-white shadow-lg mr-4"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{session.user.username || "未登录"}</h1>
                <p className="text-sm text-gray-500 mt-1">邮箱：{session.user.email || "未登录"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p></p>
      )}

      {/* 我的行程 */}
      <h1 className="text-3xl font-bold">景点推荐</h1>
      {loading ? (
        <p className="text-center text-gray-500 mt-8">加载行程数据中...</p>
      ) : itineraries.length > 0 ? (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="p-4">
          {itineraries.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden bg-white shadow-lg mb-6 cursor-pointer"
              onClick={() => goToDetail(item)}
            >
              <img
                src={
                  item.schedule?.[0]?.places?.[0]?.image ||
                  "https://images.unsplash.com/photo-1532009324734-20a7a5813719?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
                }
                alt={item.city}
                className="w-full h-auto transform transition-transform duration-300 hover:scale-105"
              />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{item.city}</h2>
                  <button
                    onClick={(event) => deleteItinerary(item.id, event)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="删除行程"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{item.schedule?.length || 0} 天行程</span>
                  <span>创建于 {new Date(item.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      ) : (
        <p className="text-center text-gray-500 mt-8">暂无行程数据</p>
      )}

      {/* 小红书行程 */}
      <h1 className="text-3xl font-bold mt-12">我的小红书行程</h1>
      {loading ? (
        <p className="text-center text-gray-500 mt-8">加载小红书笔记中...</p>
      ) : xhsNotes.length > 0 ? (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="p-4">
          {xhsNotes.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden bg-white shadow-lg mb-6 cursor-pointer"
              onClick={() => goToXhsDetail(item)}
            >
              <img
                src={
                  item.images?.[0] ||
                  "https://images.unsplash.com/photo-1532009324734-20a7a5813719?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
                }
                alt={item.title}
                className="w-full h-auto transform transition-transform duration-300 hover:scale-105"
              />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                  <button
                    onClick={(event) => deleteXhsNote(item.id, event)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="删除小红书笔记"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{item.jsonBody?.data?.length || 0} 天行程</span>
                  <span>创建于 {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      ) : (
        <p className="text-center text-gray-500 mt-8">暂无小红书行程数据</p>
      )}
    </div>
  );
};

export default Home;