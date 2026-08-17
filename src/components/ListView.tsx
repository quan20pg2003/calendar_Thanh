import React from 'react';
import { Task, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types';
import { Clock, CheckCircle, Edit2, Trash2, Repeat, AlertCircle } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
}) => {
  return (
    <div className="rounded-2xl p-6 border border-[#cce7f8] shadow-sm bg-white font-vietnam">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#cce7f8]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📋 Danh Sách Nhanh Công Việc</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Hiển thị danh sách tổng hợp công việc trong ngày theo mốc thời gian.
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#0c6296] bg-[#e6f4fc] px-3 py-1 rounded-full border border-[#b8e1f7]">
          Tổng số: {tasks.length} công việc
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#cce7f8] text-[#0c6296]/80 text-sm font-semibold bg-[#f0f8fd]/50">
          Chưa có công việc nào trong danh sách.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.work;
            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.neither;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  category.bgClass
                } ${category.borderClass} ${
                  task.completed ? 'opacity-60 grayscale-[20%]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleComplete(task)}
                    className={`mt-1 p-1.5 rounded-xl transition-all ${
                      task.completed
                        ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                        : 'hover:bg-white text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>

                  <div>
                    <h4
                      className={`font-extrabold text-base text-slate-900 ${
                        task.completed ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="font-mono text-xs text-[#0c6296] bg-white px-2.5 py-0.5 rounded-md border border-[#b8e1f7] flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#1b98e0]" />
                        {task.startTime} - {task.endTime}
                      </span>

                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${category.badgeBg}`}>
                        {category.emoji} {category.label}
                      </span>

                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${priority.badgeClass}`}>
                        {priority.label}
                      </span>

                      {task.recurringDays && task.recurringDays.length > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e6f4fc] text-[#0c6296] border border-[#b8e1f7] flex items-center gap-1 font-bold">
                          <Repeat className="w-3 h-3 text-[#1b98e0]" /> Lặp lại
                        </span>
                      )}
                    </div>

                    {(task.actualStart || task.delayReason) && (
                      <div className="mt-2 text-xs text-slate-800 flex flex-wrap items-center gap-3 font-semibold">
                        {task.actualStart && (
                          <span className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ⏱️ Thực tế: {task.actualStart} - {task.actualEnd || '?'} ({task.actualDuration || 0} phút)
                          </span>
                        )}
                        {task.delayReason && (
                          <span className="text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Trì hoãn: {task.delayReason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-2 rounded-xl bg-white hover:bg-[#f0f8fd] text-[#0c6296] border border-[#b8e1f7] shadow-xs transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
