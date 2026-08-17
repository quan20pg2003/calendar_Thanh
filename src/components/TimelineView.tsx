import React, { useState } from 'react';
import { Task, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types';
import { Clock, CheckCircle, Edit2, Trash2, Repeat, AlertCircle, Lock } from 'lucide-react';
import { snapTo15Minutes } from '../utils/storage';
import { RescheduleReasonModal } from './RescheduleReasonModal';

interface TimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
  onTaskDropUpdate: (taskId: string, newStart: string, newEnd: string, delayReason?: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onTaskDropUpdate,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Drag & drop reason modal state
  const [pendingDrop, setPendingDrop] = useState<{
    task: Task;
    newStart: string;
    newEnd: string;
  } | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const HOUR_HEIGHT = 120;

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map((num) => parseInt(num, 10));
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToTime = (totalMinutes: number): string => {
    let normalized = Math.max(0, Math.min(1439, totalMinutes));
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    // Disable drag if task is already completed (Done)
    if (task.completed) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredHour(hour);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setHoveredHour(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return; // Do not update completed tasks

    const originalDuration = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
    const duration = originalDuration > 0 ? originalDuration : 60;

    const newStartMinutes = hour * 60;
    const newStart = snapTo15Minutes(minutesToTime(newStartMinutes));
    const newEnd = snapTo15Minutes(minutesToTime(timeToMinutes(newStart) + duration));

    // If new time is exact same as old time, no reason needed
    if (newStart === task.startTime && newEnd === task.endTime) {
      setDraggedTaskId(null);
      return;
    }

    // Trigger reason prompt modal before changing time!
    setPendingDrop({
      task,
      newStart,
      newEnd,
    });
    setDraggedTaskId(null);
  };

  const handleConfirmRescheduleReason = (reason: string) => {
    if (!pendingDrop) return;
    onTaskDropUpdate(pendingDrop.task.id, pendingDrop.newStart, pendingDrop.newEnd, reason);
    setPendingDrop(null);
  };

  return (
    <div className="rounded-2xl p-6 border border-[#cce7f8] shadow-sm bg-white font-jakarta">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#cce7f8]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1b98e0]" />
            <span>Lịch Trình 24h Trong Ngày</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Kéo và thả các thẻ công việc vào mốc giờ tương ứng để đổi lịch (hệ thống sẽ yêu cầu nhập lý do thay đổi).
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#0c6296] font-bold">
          <div className="flex items-center gap-1.5 bg-[#f0f8fd] px-3 py-1 rounded-full border border-[#cce7f8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b98e0]" />
            <span>Khung mốc 15 phút</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline Grid Container */}
      <div className="relative overflow-y-auto max-h-[750px] pr-2 rounded-xl bg-[#f0f8fd]/50 p-4 border border-[#cce7f8]">
        {hours.map((hour) => {
          const hourStr = hour.toString().padStart(2, '0') + ':00';
          const isHovered = hoveredHour === hour;

          return (
            <div
              key={hour}
              onDragOver={(e) => handleDragOver(e, hour)}
              onDragLeave={() => setHoveredHour(null)}
              onDrop={(e) => handleDrop(e, hour)}
              className={`relative border-t border-[#cce7f8] min-h-[120px] transition-colors ${
                isHovered ? 'bg-[#d8eefc]' : 'hover:bg-[#eaf5fc]'
              }`}
            >
              {/* Hour Label */}
              <div className="absolute left-2 top-2 z-10 font-mono text-xs font-bold text-[#0c6296] bg-white px-2 py-0.5 rounded border border-[#b8e1f7] shadow-xs">
                {hourStr}
              </div>

              {/* 15-min Sub-grids */}
              <div className="h-full flex flex-col justify-between pointer-events-none opacity-30 py-6 px-16">
                <div className="border-b border-dashed border-[#a3d8f7]" />
                <div className="border-b border-dashed border-[#85cdfa]" />
                <div className="border-b border-dashed border-[#a3d8f7]" />
              </div>
            </div>
          );
        })}

        {/* Render Task Cards Over Timeline Grid */}
        <div className="absolute inset-0 pt-4 px-4 pointer-events-none">
          {tasks.map((task) => {
            const startMins = timeToMinutes(task.startTime);
            const endMins = timeToMinutes(task.endTime);
            const durationMins = Math.max(30, endMins - startMins);

            const topPx = (startMins / 60) * HOUR_HEIGHT;
            const heightPx = (durationMins / 60) * HOUR_HEIGHT;

            const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.work;
            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.neither;

            return (
              <div
                key={task.id}
                draggable={!task.completed}
                onDragStart={(e) => handleDragStart(e, task)}
                style={{
                  top: `${topPx + 16}px`,
                  height: `${Math.max(80, heightPx - 8)}px`,
                  left: '100px',
                  right: '16px',
                }}
                className={`absolute pointer-events-auto rounded-xl p-4 transition-all shadow-xs border flex flex-col justify-between ${
                  category.bgClass
                } ${category.borderClass} ${
                  task.completed
                    ? 'opacity-65 grayscale-[15%] cursor-not-allowed select-none bg-slate-50/80 border-slate-200'
                    : 'cursor-grab active:cursor-grabbing hover:scale-[1.002] hover:shadow-md hover:z-30'
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-extrabold text-sm md:text-base ${category.textClass} ${
                            task.completed ? 'line-through opacity-70 text-slate-600' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.completed && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-slate-300">
                            <Lock className="w-3 h-3 text-slate-500" />
                            Đã khóa vị trí
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-[#0c6296] bg-white px-2 py-0.5 rounded border border-[#b8e1f7] flex items-center gap-1 shadow-xs">
                          <Clock className="w-3 h-3 text-[#1b98e0]" />
                          {task.startTime} - {task.endTime}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md ${category.badgeBg}`}>
                          {category.label}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md ${priority.badgeClass}`}>
                          {priority.label}
                        </span>
                        {task.recurringDays && task.recurringDays.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#e6f4fc] text-[#0c6296] border border-[#b8e1f7] flex items-center gap-1 font-bold">
                            <Repeat className="w-3 h-3 text-[#1b98e0]" /> Lặp lại
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Action Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#cce7f8] shadow-xs">
                    <button
                      onClick={() => onToggleComplete(task)}
                      title={task.completed ? 'Mở lại công việc (Chưa xong)' : 'Đánh dấu hoàn thành (Khóa di chuyển)'}
                      className={`p-1.5 rounded-md transition-all ${
                        task.completed
                          ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                          : 'hover:bg-[#f0f8fd] text-slate-600 hover:text-[#0c6296]'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditTask(task)}
                      title="Chỉnh sửa công việc"
                      className="p-1.5 rounded-md hover:bg-[#f0f8fd] text-slate-600 hover:text-[#0c6296] transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="Xóa công việc"
                      className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actual Time Info / Delay Reason if tracked */}
                {(task.actualStart || task.delayReason) && (
                  <div className="mt-2 pt-2 border-t border-[#cce7f8] text-[11px] text-slate-800 flex flex-wrap items-center gap-3 font-semibold">
                    {task.actualStart && (
                      <span className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ⏱️ Thực tế: {task.actualStart} - {task.actualEnd || '?'} ({task.actualDuration || 0} phút)
                      </span>
                    )}
                    {task.delayReason && (
                      <span className="text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Lý do đổi lịch: {task.delayReason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reschedule Reason Modal Prompt */}
      <RescheduleReasonModal
        isOpen={!!pendingDrop}
        onClose={() => setPendingDrop(null)}
        onConfirm={handleConfirmRescheduleReason}
        task={pendingDrop?.task || null}
        proposedStart={pendingDrop?.newStart || ''}
        proposedEnd={pendingDrop?.newEnd || ''}
      />
    </div>
  );
};
