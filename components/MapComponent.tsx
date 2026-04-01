import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Place {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface MapComponentProps {
  places: Place[];
  activeIndex?: number | null;
}

function ChangeView({ bounds, activePosition }: { bounds: L.LatLngBoundsExpression; activePosition: L.LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  useEffect(() => {
    if (activePosition) {
      map.panTo(activePosition, { animate: true, duration: 0.5 });
    }
  }, [activePosition, map]);
  return null;
}

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
  "#14b8a6", "#a855f7",
];

export default function MapComponent({ places, activeIndex }: MapComponentProps) {
  const validPlaces = places.filter(
    (place) => typeof place.latitude === "number" && typeof place.longitude === "number"
  );

  const activePosition = useMemo(() => {
    if (activeIndex === null || activeIndex === undefined) return null;
    const place = validPlaces[activeIndex];
    if (!place) return null;
    return [place.latitude!, place.longitude!] as L.LatLngExpression;
  }, [activeIndex, validPlaces]);

  if (validPlaces.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">暂无地点数据</p>
        </div>
      </div>
    );
  }

  const positions: L.LatLngExpression[] = validPlaces.map((place) => [
    place.latitude!,
    place.longitude!,
  ]);

  const bounds = L.latLngBounds(positions);

  return (
    <div className="h-[400px] w-full">
      <MapContainer className="h-full w-full" zoomControl={false}>
        <ChangeView bounds={bounds} activePosition={activePosition} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {validPlaces.length > 1 && (
          <Polyline
            positions={positions}
            color="#6366f1"
            weight={3}
            opacity={0.6}
            dashArray="8 6"
          />
        )}
        {validPlaces.map((place, index) => {
          const isActive = activeIndex === index;
          const color = COLORS[index % COLORS.length];
          return (
            <CircleMarker
              key={index}
              center={[place.latitude!, place.longitude!]}
              radius={isActive ? 12 : 8}
              pathOptions={{
                color: isActive ? "#4f46e5" : color,
                fillColor: isActive ? "#6366f1" : color,
                fillOpacity: isActive ? 1 : 0.85,
                weight: isActive ? 3 : 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent={isActive}>
                <div className="text-center">
                  <div className={`font-bold text-xs ${isActive ? "text-indigo-700" : ""}`}>
                    {index + 1}. {place.name || "未知地点"}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
