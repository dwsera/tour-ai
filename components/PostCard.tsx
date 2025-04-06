import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PostCardProps {
  name: string;
  address: string;
  photoUrl: string;
  description?: string;
  rating?: number | string;
  openingHours?: string;
  weather?: string;   // 天气
  visitDuration?: string;  // 建议游玩时间
  transportation?: string; // 交通方式
  ticketInfo?: string; // 门票信息
}

export default function PostCard({ 
  name, 
  address, 
  photoUrl, 
  description, 
  rating, 
  openingHours, 
  weather, 
  visitDuration, 
  transportation, 
  ticketInfo 
}: PostCardProps) {
  return (
    <Card className="w-full shadow-md rounded-lg overflow-hidden flex flex-col md:flex-row">
      {/* 左侧图片 */}
      <div className="md:w-1/3 w-full">
        <img src={photoUrl|| "暂无图片"} alt={name} className="w-full h-48 md:h-full object-cover" />
      </div>

      {/* 右侧内容 */}
      <div className="md:w-2/3 w-full flex flex-col">
        <CardHeader className="p-4 bg-gray-100">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-600">{address}</p>
        </CardHeader>

        <CardContent className="p-4 space-y-2 flex-grow">
          <p className="text-gray-700">{description || "暂无介绍"}</p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            <p>⭐ 评分: {rating || "暂无评分"}</p>
            <p>🕒 营业时间: {openingHours || "全天开放"}</p>
            <p>☁️ 天气: {weather || "未知"}</p>
            <p>⏳ 建议游玩: {visitDuration || "1-2 小时"}</p>
            <p>🚗 交通: {transportation || "暂无信息"}</p>
            <p>🎟️ 门票: {ticketInfo || "暂无信息"}</p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
