import React, { useState, useEffect } from 'react';
import { Task, Category, Priority, CATEGORY_CONFIG, PRIORITY_CONFIG, VALID_INTERVAL_MINUTES } from '../types';
import { snapTo15Minutes } from '../utils/storage';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'date'>, taskId?: string) => void;
  initialTask?: Task | null;
  selectedDate: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('urgentImportant');
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setStartTime(snapTo15Minutes(initialTask.startTime));
      setEndTime(snapTo15Minutes(initialTask.endTime));
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setRecurringDays(initialTask.recurringDays || []);
    } else {
      setTitle('');
      setStartTime('08:00');
      setEndTime('09:00');
      setCategory('work');
      setPriority('urgentImportant');
      setRecurringDays([]);
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const generate15MinOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      const hStr = h.toString().padStart(2, '0');
      for (const mStr of VALID_INTERVAL_MINUTES) {
        options.push(`${hStr}:${mStr}`);
      }
    }
    return options;
  };

  const timeOptions = generate15MinOptions();

  const handleToggleDay = (dayIndex: number) => {
    if (recurringDays.includes(dayIndex)) {
      setRecurringDays(recurringDays.filter((d) => d !== dayIndex));
    } else {
      setRecurringDays([...recurringDays, dayIndex].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Vui lòng nhập tên công việc!');
      return;
    }

    const snappedStart = snapTo15Minutes(startTime);
    const snappedEnd = snapTo15Minutes(endTime);

    if (snappedStart >= snappedEnd) {
      setError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!');
      return;
    }

    onSave(
      {
        title: title.trim(),
        startTime: snappedStart,
        endTime: snappedEnd,
        category,
        priority,
        completed: initialTask ? initialTask.completed : false,
        recurringDays,
        actualStart: initialTask?.actualStart,
        actualEnd: initialTask?.actualEnd,
        actualDuration: initialTask?.actualDuration,
        delayReason: initialTask?.delayReason,
      },
      initialTask?.id
    );
    onClose();
  };

  const daysOfWeek = [
    { label: 'T2', value: 1 },
    { label: 'T3', value: 2 },
    { label: 'T4', value: 3 },
    { label: 'T5', value: 4 },
    { label: 'T6', value: 5 },
    { label: 'T7', value: 6 },
    { label: 'CN', value: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs overflow-y-auto font-jakarta">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl p-7 rounded-3xl border border-[#cce7f8] shadow-xl relative my-8 bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#cce7f8] mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-[#1b98e0] font-extrabold text-2xl">+</span>
            <span>{initialTask ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f0f8fd] text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Tên công việc *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên công việc"
              required
              className="w-full px-4 py-3 glass-input rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] transition-all font-semibold text-slate-800 border border-[#b8e1f7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#1b98e0]" />
                <span>Bắt đầu *</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] bg-white text-slate-900 font-bold cursor-pointer border border-[#b8e1f7]"
              >
                {timeOptions.map((t) => (
                  <option key={`start-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#1b98e0]" />
                <span>Kết thúc *</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1b98e0] bg-white text-slate-900 font-bold cursor-pointer border border-[#b8e1f7]"
              >
                {timeOptions.map((t) => (
                  <option key={`end-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Phân loại nhóm công việc *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((catKey) => {
                const conf = CATEGORY_CONFIG[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${conf.badgeBg} ring-2 ring-[#1b98e0] shadow-xs`
                        : 'bg-[#f0f8fd] text-slate-700 hover:bg-[#e0f2fe] border-[#cce7f8]'
                    }`}
                  >
                    <span className="text-base">{conf.emoji}</span>
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Mức độ ưu tiên *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((pKey) => {
                const pConf = PRIORITY_CONFIG[pKey];
                const isSelected = priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setPriority(pKey)}
                    className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                      isSelected
                        ? `${pConf.badgeClass} ring-2 ring-[#1b98e0] shadow-xs`
                        : 'bg-[#f0f8fd] text-slate-700 hover:bg-[#e0f2fe] border-[#cce7f8]'
                    }`}
                  >
                    {pConf.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[#1b98e0]" />
              <span>Thiết lập lặp lịch theo các ngày trong tuần</span>
            </label>
            <div className="flex items-center justify-between gap-2 bg-[#f0f8fd] p-2.5 rounded-2xl border border-[#cce7f8]">
              {daysOfWeek.map((day) => {
                const isSelected = recurringDays.includes(day.value);
                return (
                  <button
                    key={`day-${day.value}`}
                    type="button"
                    onClick={() => handleToggleDay(day.value)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#1b98e0] text-white shadow-xs scale-105'
                        : 'text-[#0c6296] hover:bg-[#e0f2fe] hover:text-[#063958]'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cce7f8]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] transition-all text-sm font-bold border border-[#b8e1f7]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#1b98e0] hover:bg-[#1585c5] text-white font-bold shadow-xs transition-all text-sm active:scale-95 border-none"
            >
              <span>Lưu Công Việc</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
