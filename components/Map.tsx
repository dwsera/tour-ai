"use client";

import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import dynamic from "next/dynamic";

// 修复默认标记图标问题
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  onCitySelect: (cityName: string) => void;
}

const provincialCapitals = [
  { name: "北京", lat: 39.9042, lng: 116.4074 },
  { name: "天津", lat: 39.0842, lng: 117.1274 },
  { name: "上海", lat: 31.2304, lng: 121.4737 },
  { name: "重庆", lat: 29.5630, lng: 106.5516 },
  { name: "石家庄", lat: 38.0428, lng: 114.5149 },
  { name: "太原", lat: 37.8706, lng: 112.5489 },
  { name: "沈阳", lat: 41.8057, lng: 123.4315 },
  { name: "长春", lat: 43.8171, lng: 125.3235 },
  { name: "哈尔滨", lat: 45.8038, lng: 126.5350 },
  { name: "南京", lat: 32.0603, lng: 118.7969 },
  { name: "杭州", lat: 30.2741, lng: 120.1551 },
  { name: "合肥", lat: 31.8206, lng: 117.2272 },
  { name: "福州", lat: 26.0745, lng: 119.2965 },
  { name: "南昌", lat: 28.6820, lng: 115.8579 },
  { name: "济南", lat: 36.6512, lng: 116.9972 },
  { name: "郑州", lat: 34.7466, lng: 113.6253 },
  { name: "武汉", lat: 30.5928, lng: 114.3055 },
  { name: "长沙", lat: 28.2282, lng: 112.9388 },
  { name: "广州", lat: 23.1291, lng: 113.2644 },
  { name: "深圳", lat: 22.5431, lng: 114.0579 },
  { name: "南宁", lat: 22.8170, lng: 108.3665 },
  { name: "海口", lat: 20.0440, lng: 110.1999 },
  { name: "成都", lat: 30.5728, lng: 104.0668 },
  { name: "贵阳", lat: 26.6470, lng: 106.6302 },
  { name: "昆明", lat: 25.0389, lng: 102.7183 },
  { name: "拉萨", lat: 29.6500, lng: 91.1000 },
  { name: "西安", lat: 34.3416, lng: 108.9398 },
  { name: "兰州", lat: 36.0611, lng: 103.8343 },
  { name: "西宁", lat: 36.6171, lng: 101.7782 },
  { name: "银川", lat: 38.4872, lng: 106.2309 },
  { name: "乌鲁木齐", lat: 43.8256, lng: 87.6168 },
  { name: "呼和浩特", lat: 40.8424, lng: 111.7490 },
  { name: "香港", lat: 22.3193, lng: 114.1694 },
  { name: "澳门", lat: 22.1987, lng: 113.5439 },
  { name: "台北", lat: 25.0330, lng: 121.5654 },
  { name: "三亚", lat: 18.2528, lng: 109.5120 },
  { name: "大理", lat: 25.6065, lng: 100.2679 },
  { name: "丽江", lat: 26.8721, lng: 100.2299 },
  { name: "桂林", lat: 25.2736, lng: 110.2907 },
  { name: "苏州", lat: 31.2990, lng: 120.5853 },
  { name: "厦门", lat: 24.4798, lng: 118.0894 },
  { name: "青岛", lat: 36.0671, lng: 120.3826 },
  { name: "大连", lat: 38.9140, lng: 121.6147 },
  { name: "洛阳", lat: 34.6197, lng: 112.4540 },
  { name: "敦煌", lat: 40.1421, lng: 94.6618 },
];

function MapEvents({ onCitySelect }: MapProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const key = process.env.NEXT_PUBLIC_AMAP_API_KEY;
        const location = `${lng.toFixed(6)},${lat.toFixed(6)}`;
        const url = `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${location}&extensions=base`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "1" && data.regeocode) {
          const city = String(data.regeocode.addressComponent?.city || "");
          const province = String(data.regeocode.addressComponent?.province || "");
          const district = String(data.regeocode.addressComponent?.district || "");

          let cityName = city;
          if (!cityName || cityName.length === 0) {
            cityName = province.replace(/(省|市|自治区|特别行政区)$/, "") || district;
          }

          if (cityName) {
            onCitySelect(cityName);
          } else {
            onCitySelect("请点击城市区域");
          }
        } else {
          onCitySelect("请点击城市区域");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        onCitySelect("无法获取城市信息");
      }
    },
  });
  return null;
}

const Map = dynamic(() => Promise.resolve(({ onCitySelect }: MapProps) => {
  return (
    <MapContainer
      center={[39.9042, 116.4074]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {provincialCapitals.map((capital) => (
        <Marker
          key={capital.name}
          position={[capital.lat, capital.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onCitySelect(capital.name),
          }}
        >
          <Popup>{capital.name}</Popup>
        </Marker>
      ))}
      <MapEvents onCitySelect={onCitySelect} />
    </MapContainer>
  );
}), { ssr: false });

export default Map;