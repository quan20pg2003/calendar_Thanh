import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { snapTo15Minutes } from '../utils/storage';
import { motion } from 'framer-motion';

interface ActualTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actualData: {
    actualStart: string;
    actualEnd: string;
    actualDuration: number;
    delayReason?: string;
  }) => void;
  task: Task | null;
}

export const ActualTimeModal: React.FC<ActualTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
}) => {
  const [actualStart, setActualStart] = useState('');
  const [actualEnd, setActualEnd] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setActualStart(snapTo15Minutes(task.startTime));
      setActualEnd(snapTo15Minutes(task.endTime));
      setDelayReason(task.delayReason || '');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const calculateMinutes = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const t1 = h1 * 60 + m1;
    const t2 = h2 * 60 + m2;
    return Math.max(0, t2 - t1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const duration = calculateMinutes(actualStart, actualEnd);
    if (duration <= 0 && actualStart >= actualEnd) {
      setError('Thời gian kết thúc thực tế phải diễn ra sau thời gian bắt đầu!');
      return;
    }

    onConfirm({
      actualStart,
      actualEnd,
      actualDuration: duration,
      delayReason: delayReason.trim() || undefined,
    });
    onClose();
  };

  const durationMinutes = calculateMinutes(actualStart, actualEnd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs font-jakarta">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg p-6 rounded-2xl border border-[#cce7f8] shadow-xl relative bg-white text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#cce7f8] mb-4">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Ghi Nhận Thời Gian Thực Tế Và Hoàn Thành</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f0f8fd] text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#f0f8fd] rounded-xl border border-[#b8e1f7] mb-5 space-y-1 text-xs">
          <div className="font-bold text-slate-900 text-sm">{task.title}</div>
          <div className="text-[#0c6296] font-medium flex items-center gap-1 pt-1">
            <Clock className="w-3.5 h-3.5 text-[#1b98e0]" />
            <span>Khung giờ dự kiến đăng ký: {task.startTime} đến {task.endTime}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Bắt đầu thực tế *
              </label>
              <input
                type="time"
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-[#f0f8fd] text-slate-900 border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kết thúc thực tế *
              </label>
              <input
                type="time"
                value={actualEnd}
                onChange={(e) => setActualEnd(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-[#f0f8fd] text-slate-900 border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0]"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Tổng thời gian thực hiện:</span>
            <span className="text-sm font-extrabold text-emerald-800">{durationMinutes} phút</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Lý do trì hoãn hoặc ghi chú thực hiện
            </label>
            <textarea
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="Nhập lý do nếu thực hiện trễ hơn dự kiến"
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-[#f0f8fd] text-slate-800 border border-[#b8e1f7] focus:ring-2 focus:ring-[#1b98e0]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cce7f8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#f0f8fd] hover:bg-[#e0f2fe] text-[#0c6296] transition-all text-xs font-bold border border-[#b8e1f7]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all text-xs active:scale-95 border-none"
            >
              Xác Nhận Hoàn Thành
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
