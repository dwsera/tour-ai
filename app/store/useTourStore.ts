import { create } from 'zustand';

// 定义每个景点的类型
interface Place {
  name: string;
  description: string;
  image: string;
}

// 定义每一天的行程
interface DayPlan {
  day: number;
  places: Place[];
}

// 定义整个旅游指南的类型
interface TourismGuide {
  city: string;
  schedule: DayPlan[];
}

type TourStore = {
  tourismGuide: TourismGuide | null;
  city: string;
  setTourismGuide: (guide: TourismGuide) => void;
  setCity: (city: string) => void;
};

const useTourStore = create<TourStore>((set) => ({
  tourismGuide: null,
  city: '',
  setTourismGuide: (guide) => set({ tourismGuide: guide }),
  setCity: (city) => set({ city }),
}));

export default useTourStore;