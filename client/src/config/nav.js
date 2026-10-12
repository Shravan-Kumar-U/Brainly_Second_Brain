import { ChartColumn, House, Layers, Library, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/collections', label: 'Collections', icon: Layers, end: false },
  { to: '/insights', label: 'Insights', icon: ChartColumn, end: false },
  // Phones reach Settings from the top bar instead, keeping the bottom bar a clean 2 + 2
  { to: '/settings', label: 'Settings', icon: Settings, end: false, mobile: false },
];