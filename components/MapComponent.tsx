import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Place {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface MapComponentProps {
  places: Place[];
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] }); // 添加一些内边距，让标记点不贴着边缘
    }
  }, [bounds, map]);
  return null;
}

export default function MapComponent({ places }: MapComponentProps) {
  // 过滤出有效地点（经纬度都存在的地点）
  const validPlaces = places.filter(
    (place) => typeof place.latitude === "number" && typeof place.longitude === "number"
  );

  // 如果没有有效地点，则返回空组件
  if (validPlaces.length === 0) {
    return <div className="h-[600px] w-full rounded-xl bg-gray-200 flex items-center justify-center">暂无地点数据</div>;
  }

  // 创建一个包含所有景点的 LatLngExpression 数组
  const positions: L.LatLngExpression[] = validPlaces.map((place) => [
    place.latitude!,
    place.longitude!,
  ]);

  // 计算边界框（Bounding Box）
  const bounds = L.latLngBounds(positions);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-md">
      <MapContainer className="h-full w-full">
        {/* 动态调整地图视图 */}
        <ChangeView bounds={bounds} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validPlaces.map((place, index) => (
          <Marker
            key={index}
            position={[place.latitude!, place.longitude!]}
            icon={markerIcon}
          >
            <Popup>{place.name || "未知地点"}</Popup>
          </Marker>
        ))}
        {/* 绘制连接所有景点的线 */}
        {validPlaces.length > 1 && (
          <Polyline positions={positions} color="blue" />
        )}
      </MapContainer>
    </div>
  );
}