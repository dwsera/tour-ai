'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useTourStore from '../store/useTourStore';

export default function TourResults() {
  const { tourismGuide, city } = useTourStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number>(0);

  const toggleDayExpansion = (index: number) => {
    setExpandedDayIndex(expandedDayIndex === index ? -1 : index);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg text-white">
        <h1 className="text-3xl font-bold text-center">{city || '未知城市'} 旅行指南</h1>
      </div>

      {tourismGuide?.schedule?.length ? (
        tourismGuide.schedule.map((day, dayIndex) => (
          <Card
            key={dayIndex}
            className="shadow-md hover:shadow-lg transition-shadow border-none rounded-xl mb-6"
          >
            <CardHeader
              className="bg-blue-50 p-4 cursor-pointer flex items-center justify-between"
              onClick={() => toggleDayExpansion(dayIndex)}
            >
              <h2 className="text-xl font-semibold text-gray-800">第 {day.day} 天</h2>
              <span className="text-blue-500">
                {expandedDayIndex === dayIndex ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </span>
            </CardHeader>

            {expandedDayIndex === dayIndex && (
              <CardContent className="p-6 bg-gray-50">
                {day.places.length > 0 ? (
                  day.places.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
                    >
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(place.image)}
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg text-gray-800">{place.name}</h3>
                        <p className="text-sm text-gray-600">{place.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">暂无景点安排</p>
                )}
              </CardContent>
            )}
          </Card>
        ))
      ) : (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl shadow-inner">
          <p className="text-lg font-medium">暂无行程规划</p>
          <p className="text-sm mt-2">请返回首页选择城市并生成行程计划</p>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="放大图片"
            className="max-w-full max-h-[90vh] rounded-lg"
          />
        </div>
      )}
    </main>
  );
}