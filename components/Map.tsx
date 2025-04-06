"use client";

import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet";
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
  // 其他省会城市数据
];

function MapEvents({ onCitySelect }: MapProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();

        const cityName = data.address.city || "";
        if (!cityName) {
          onCitySelect("请点击城市区域");
          return;
        }

        onCitySelect(cityName);
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
        />
      ))}
      <MapEvents onCitySelect={onCitySelect} />
    </MapContainer>
  );
}), { ssr: false });

export default Map;