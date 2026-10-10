import { ChartColumn, House, Library } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/insights', label: 'Insights', icon: ChartColumn, end: false },
];