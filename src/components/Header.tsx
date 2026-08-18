import React, { useState, useEffect, useRef } from 'react';
import { User, ViewMode, FilterMode, Task } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Timer,
  LogOut,
  CheckCircle2,
  ListFilter,
  Layers,
  BookOpen,
  Settings,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterMode: FilterMode;
  onFilterModeChange: (filter: FilterMode) => void;
  tasks: Task[];
  onOpenAddTask: () => void;
  onOpenPomodoro: () => void;
  onOpenNotebookLM: () => void;
  onOpenAccountModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  filterMode,
  onFilterModeChange,
  tasks,
  onOpenAddTask,
  onOpenPomodoro,
  onOpenNotebookLM,
  onOpenAccountModal,
}) => {
  const [time, setTime] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('vi-VN', { hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dayName}, ${dd}/${mm}/${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="rounded-2xl p-6 shadow-sm border border-[#cce7f8] bg-white font-jakarta">
      <div className="space-y-6">
        {/* Top Row: Title, Date, Live Clock, User Profile & Avatar Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-[#f0f8fd] transition-all group border border-transparent hover:border-[#b8e1f7]"
                title="Quản lý tài khoản"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1b98e0] flex items-center justify-center text-2xl shadow-sm text-white font-bold border border-[#1582c2] group-hover:scale-105 transition-all">
                  {user.avatar}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1 group-hover:text-[#1b98e0] transition-colors">
                    <span>{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#1b98e0]" />
                  </div>
                  <div className="text-[11px] text-[#0c6296] font-semibold">@{user.username}</div>
                </div>
              </button>

              {/* Profile Dropdown Popup Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute left-0 mt-2 w-64 p-3 bg-white rounded-2xl shadow-xl border border-[#cce7f8] z-50 space-y-2 text-slate-800"
                  >
                    <div className="p-3 bg-[#f0f8fd] rounded-xl border border-[#b8e1f7] flex items-center gap-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{user.name}</div>
                        <div className="text-[11px] text-[#0c6296] font-mono font-bold">@{user.username}</div>
                        <span className="inline-block mt-1 text-[10px] bg-[#1b98e0] text-white font-bold px-2 py-0.5 rounded">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenAccountModal();
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-[#f0f8fd] text-slate-800 hover:text-[#1b98e0] font-bold text-xs flex items-center gap-2.5 transition-all text-left"
                      >
                        <Settings className="w-4 h-4 text-[#1b98e0]" />
                        <span>⚙️ Quản Lý Tài Khoản</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-2.5 transition-all text-left border border-rose-200"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>🚪 Đăng Xuất Khoải Hệ Thống</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  ChronoPulse - Lịch Biểu Cá Nhân
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4fc] text-[#0c6296] border border-[#b8e1f7]">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-600 text-xs md:text-sm mt-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#0c6296]">
                  <CalendarIcon className="w-4 h-4 text-[#1b98e0]" />
                  {formatDateString(selectedDate)}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[#0c6296] font-bold bg-[#f0f8fd] px-2.5 py-0.5 rounded-lg border border-[#cce7f8]">
                  <Clock className="w-4 h-4 text-[#1b98e0]" />
                  {time}
                </span>
              </div>
            </div>
          </div>

          {/* Date Picker & Account Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#f0f8fd] px-3 py-1.5 rounded-xl border border-[#cce7f8]">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-xs text-[#0c6296] font-bold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={onOpenAccountModal}
              className="px-3 py-2 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] border border-[#b8e1f7] transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Quản lý tài khoản"
            >
              <Settings className="w-4 h-4 text-[#1b98e0]" />
              <span className="hidden md:inline">Quản Lý Tài Khoản</span>
            </button>
          </div>
        </div>

        {/* Middle Row: Progress Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-xl flex flex-col justify-between border border-[#cce7f8] bg-[#f8fcff]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Tiến Độ Công Việc Hôm Nay</span>
              </div>
              <span className="text-sm font-extrabold text-[#0c6296]">
                {completedTasks} trên {totalTasks} công việc • {progressPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#e6f4fc] rounded-full overflow-hidden p-0.5 border border-[#b8e1f7]">
              <div
                className="h-full bg-[#1b98e0] rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onOpenAddTask}
              className="flex-1 py-3 px-4 bg-[#1b98e0] hover:bg-[#1585c5] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm active:scale-95 border-none"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm Công Việc</span>
            </button>

            <button
              onClick={onOpenPomodoro}
              className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
              title="Chế độ tập trung Pomodoro 25 phút"
            >
              <Timer className="w-5 h-5 text-amber-600" />
              <span className="hidden sm:inline">Pomodoro</span>
            </button>

            <button
              onClick={onOpenNotebookLM}
              className="py-3 px-3 bg-[#e6f4fc] hover:bg-[#d4edfa] text-[#0c6296] font-bold rounded-xl border border-[#b8e1f7] transition-all flex items-center justify-center gap-1.5 text-sm active:scale-95"
              title="Google NotebookLM MCP Reader"
            >
              <BookOpen className="w-5 h-5 text-[#1b98e0]" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#cce7f8]">
          <div className="flex items-center gap-1 bg-[#f0f8fd] p-1.5 rounded-xl border border-[#cce7f8]">
            <button
              onClick={() => onViewModeChange('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'timeline'
                  ? 'bg-[#1b98e0] text-white shadow-xs font-extrabold'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Lịch 24h</span>
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-[#1b98e0] text-white shadow-xs font-extrabold'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch Tuần</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#1b98e0] text-white shadow-xs font-extrabold'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#f0f8fd] p-1.5 rounded-xl border border-[#cce7f8] text-xs font-medium">
            <span className="text-[#0c6296] px-2 flex items-center gap-1 font-bold">
              <ListFilter className="w-3.5 h-3.5 text-[#1b98e0]" />
              <span>Lọc:</span>
            </span>
            <button
              onClick={() => onFilterModeChange('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-[#1b98e0] text-[#ffffff] font-extrabold shadow-xs'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => onFilterModeChange('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'completed'
                  ? 'bg-emerald-600 text-[#ffffff] font-bold shadow-xs'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => onFilterModeChange('incomplete')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'incomplete'
                  ? 'bg-amber-600 text-[#ffffff] font-bold shadow-xs'
                  : 'text-[#0c6296] hover:text-[#063958]'
              }`}
            >
              Chưa xong
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
