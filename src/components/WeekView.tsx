import React from 'react';
import { Task, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types';
import { Calendar as CalendarIcon, Clock, CheckCircle, Repeat } from 'lucide-react';

interface WeekViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
  onEditTask,
  onToggleComplete,
}) => {
  const getWeekDays = (currDateStr: string) => {
    const curr = new Date(currDateStr + 'T00:00:00');
    const dayOfWeek = curr.getDay(); // 0 is Sun
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      days.push({
        dateStr: isoStr,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: isoStr === new Date().toISOString().split('T')[0],
        isSelected: isoStr === selectedDate,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="rounded-2xl p-6 border border-[#cce7f8] shadow-sm bg-white font-vietnam">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#cce7f8]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#1b98e0]" />
            <span>Kế Hoạch Lịch Trình Tuần</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Tổng quan 7 ngày trong tuần, bấm vào từng ngày để xem lịch chi tiết.
          </p>
        </div>
      </div>

      {/* 7 Days Bar */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
              day.isSelected
                ? 'bg-[#1b98e0] border-[#1582c2] text-white shadow-sm scale-105 font-bold'
                : day.isToday
                ? 'bg-[#e6f4fc] border-[#b8e1f7] text-[#0c6296] font-extrabold hover:bg-[#d8eefc]'
                : 'glass-card text-slate-700 hover:bg-[#f0f8fd] border-[#cce7f8] font-semibold'
            }`}
          >
            <span className="text-[11px] font-extrabold tracking-wider uppercase opacity-90">
              {day.dayName}
            </span>
            <span className="text-xl font-extrabold font-mono">{day.dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Selected Date Tasks Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-[#0c6296] uppercase tracking-wider mb-2">
          Danh sách công việc ngày chọn ({selectedDate}):
        </h3>

        {tasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-[#cce7f8] text-[#0c6296]/80 text-sm font-semibold bg-[#f0f8fd]/50">
            Chưa có công việc nào được lên lịch cho ngày này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.work;
              const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.neither;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border backdrop-blur-md transition-all flex items-start justify-between gap-3 ${
                    category.bgClass
                  } ${category.borderClass} ${
                    task.completed ? 'opacity-60 grayscale-[20%]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleComplete(task)}
                      className={`mt-0.5 p-1 rounded-lg transition-all ${
                        task.completed
                          ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                          : 'hover:bg-white text-slate-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <div>
                      <h4
                        className={`font-extrabold text-sm text-slate-900 ${
                          task.completed ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="font-mono text-xs text-[#0c6296] bg-white px-2 py-0.5 rounded border border-[#b8e1f7] flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3 text-[#1b98e0]" />
                          {task.startTime} - {task.endTime}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${category.badgeBg}`}>
                          {category.emoji} {category.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${priority.badgeClass}`}>
                          {priority.label}
                        </span>
                        {task.recurringDays && task.recurringDays.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6f4fc] text-[#0c6296] border border-[#b8e1f7] flex items-center gap-1 font-bold">
                            <Repeat className="w-2.5 h-2.5 text-[#1b98e0]" /> Lặp lại
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditTask(task)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-[#f0f8fd] text-[#0c6296] font-bold border border-[#b8e1f7] shadow-xs transition-all"
                  >
                    Sửa
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
