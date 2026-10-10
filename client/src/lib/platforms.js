import { Code, FileText, Image as ImageIcon, Link2, MessageSquare, Play } from 'lucide-react';

// Full class names (not built dynamically) so Tailwind can detect them
export const PLATFORM_META = {
  youtube: { label: 'YouTube', badge: 'bg-red-600 text-white' },
  instagram: { label: 'Instagram', badge: 'bg-pink-600 text-white' },
  facebook: { label: 'Facebook', badge: 'bg-blue-600 text-white' },
  twitter: { label: 'X / Twitter', badge: 'bg-neutral-900 text-white' },
  github: { label: 'GitHub', badge: 'bg-neutral-800 text-white' },
  linkedin: { label: 'LinkedIn', badge: 'bg-sky-700 text-white' },
  reddit: { label: 'Reddit', badge: 'bg-orange-600 text-white' },
  tiktok: { label: 'TikTok', badge: 'bg-fuchsia-700 text-white' },
  medium: { label: 'Medium', badge: 'bg-neutral-700 text-white' },
  other: { label: 'Web', badge: 'bg-neutral-600 text-white' },
};

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_META).map(([value, { label }]) => ({
  value,
  label,
}));

export const CONTENT_ICONS = {
  video: Play,
  image: ImageIcon,
  post: MessageSquare,
  article: FileText,
  repo: Code,
  other: Link2,
};

export const OPEN_LABEL = {
  video: 'Watch',
  image: 'View',
  article: 'Read',
  repo: 'Open repo',
  post: 'Open',
  other: 'Open',
};