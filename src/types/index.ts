export type Category = 'work' | 'study' | 'health' | 'entertainment' | 'sleep' | 'dining';

export type Priority = 'urgentImportant' | 'importantNotUrgent' | 'urgentNotImportant' | 'neither';

export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm (00, 15, 30, 45)
  endTime: string;   // HH:mm (00, 15, 30, 45)
  category: Category;
  priority: Priority;
  completed: boolean;
  recurringDays?: number[]; // [1, 3, 5] (Mon, Wed, Fri)
  date: string; // YYYY-MM-DD
  actualStart?: string;
  actualEnd?: string;
  actualDuration?: number; // minutes
  delayReason?: string;
}

export interface User {
  username: string;
  name: string;
  avatar: string;
  role: string;
}

export type ViewMode = 'timeline' | 'week' | 'list';
export type FilterMode = 'all' | 'completed' | 'incomplete';

// Clean Blue (#1b98e0) & White Theme Category Configuration
export const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; color: string; bgClass: string; borderClass: string; badgeBg: string; textClass: string }> = {
  work: { 
    label: 'Công việc', 
    emoji: '💼', 
    color: '#1b98e0', 
    bgClass: 'bg-white hover:bg-[#f0f8fd]', 
    borderClass: 'border-[#cce7f8] shadow-xs', 
    badgeBg: 'bg-[#e6f4fc] text-[#0c6296] font-semibold border border-[#b8e1f7]', 
    textClass: 'text-slate-900 font-bold' 
  },
  study: { 
    label: 'Học tập', 
    emoji: '📚', 
    color: '#1b98e0', 
    bgClass: 'bg-white hover:bg-[#f0f8fd]', 
    borderClass: 'border-[#cce7f8] shadow-xs', 
    badgeBg: 'bg-[#e6f4fc] text-[#0c6296] font-semibold border border-[#b8e1f7]', 
    textClass: 'text-slate-900 font-bold' 
  },
  health: { 
    label: 'Sức khỏe', 
    emoji: '🌿', 
    color: '#059669', 
    bgClass: 'bg-white hover:bg-[#f0f9f6]', 
    borderClass: 'border-emerald-200 shadow-xs', 
    badgeBg: 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200', 
    textClass: 'text-slate-900 font-bold' 
  },
  entertainment: { 
    label: 'Giải trí', 
    emoji: '🎨', 
    color: '#d97706', 
    bgClass: 'bg-white hover:bg-[#fffdfa]', 
    borderClass: 'border-amber-200 shadow-xs', 
    badgeBg: 'bg-amber-50 text-amber-800 font-semibold border border-amber-200', 
    textClass: 'text-slate-900 font-bold' 
  },
  sleep: { 
    label: 'Giấc ngủ', 
    emoji: '🌙', 
    color: '#1b98e0', 
    bgClass: 'bg-white hover:bg-[#f0f8fd]', 
    borderClass: 'border-[#cce7f8] shadow-xs', 
    badgeBg: 'bg-[#e6f4fc] text-[#0c6296] font-semibold border border-[#b8e1f7]', 
    textClass: 'text-slate-900 font-bold' 
  },
  dining: { 
    label: 'Ăn uống', 
    emoji: '☕', 
    color: '#ea580c', 
    bgClass: 'bg-white hover:bg-[#fffaf7]', 
    borderClass: 'border-orange-200 shadow-xs', 
    badgeBg: 'bg-orange-50 text-orange-800 font-semibold border border-orange-200', 
    textClass: 'text-slate-900 font-bold' 
  },
};

// Clean Blue & White Priority Badges
export const PRIORITY_CONFIG: Record<Priority, { label: string; badgeClass: string }> = {
  urgentImportant: { label: 'Quan trọng & Khẩn cấp', badgeClass: 'bg-rose-50 text-rose-700 font-bold border border-rose-200' },
  importantNotUrgent: { label: 'Quan trọng không khẩn cấp', badgeClass: 'bg-[#e6f4fc] text-[#0c6296] font-semibold border border-[#b8e1f7]' },
  urgentNotImportant: { label: 'Khẩn cấp không quan trọng', badgeClass: 'bg-[#e6f4fc] text-[#0c6296] font-semibold border border-[#b8e1f7]' },
  neither: { label: 'Không quan trọng, không khẩn cấp', badgeClass: 'bg-slate-50 text-slate-600 font-medium border border-slate-200' },
};

export const VALID_INTERVAL_MINUTES = ['00', '15', '30', '45'];
